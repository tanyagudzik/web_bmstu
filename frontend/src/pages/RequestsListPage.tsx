import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Spinner } from 'react-bootstrap';
import type { AppDispatch, RootState } from '../store';
import {
    getRequestsList,
    setStatusFilter,
    setDateFrom,
    setDateTo,
    setCreatorFilter,
} from '../slices/requestsListSlice';
import { finishRequest, rejectRequest } from '../slices/requestSlice';

const STATUS_LABELS: Record<string, string> = {
    draft: 'Черновик',
    formed: 'Сформирован',
    finished: 'Завершён',
    rejected: 'Отклонён',
};

const STATUS_OPTIONS = [
    { value: '', label: 'Все' },
    { value: 'draft', label: 'Черновик' },
    { value: 'formed', label: 'Сформирован' },
    { value: 'finished', label: 'Завершён' },
    { value: 'rejected', label: 'Отклонён' },
];

const POLL_INTERVAL = 7000;

function RequestsListPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { requests, loading, error, statusFilter, dateFrom, dateTo, creatorFilter } =
        useSelector((state: RootState) => state.requestsList);
    const { isStaff } = useSelector((state: RootState) => state.user);

    /** ID заявки, над которой сейчас выполняется модераторское действие */
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    /** Собрать параметры бэкенд-фильтров */
    const buildParams = useCallback(() => {
        const p: { status?: string; date_from?: string; date_to?: string } = {};
        if (statusFilter) p.status = statusFilter;
        if (dateFrom) p.date_from = dateFrom;
        if (dateTo) p.date_to = dateTo;
        return p;
    }, [statusFilter, dateFrom, dateTo]);

    /** Загрузка списка */
    const load = useCallback(() => {
        dispatch(getRequestsList(buildParams()));
    }, [dispatch, buildParams]);

    /* Первичная загрузка + перезагрузка при смене фильтров */
    useEffect(() => {
        load();
    }, [load]);

    /* Short polling — стабильный interval без лишних пересозданий */
    useEffect(() => {
        const id = setInterval(load, POLL_INTERVAL);
        return () => clearInterval(id);
    }, [load]);

    /** Модератор: завершить (с race guard) */
    const handleFinish = async (rid: number) => {
        if (actionLoadingId !== null) return;
        setActionLoadingId(rid);
        try {
            await dispatch(finishRequest(rid)).unwrap();
            load();
        } catch {
            /* ошибка уже в requestSlice.error */
        } finally {
            setActionLoadingId(null);
        }
    };

    /** Модератор: отклонить (с race guard) */
    const handleReject = async (rid: number) => {
        if (actionLoadingId !== null) return;
        setActionLoadingId(rid);
        try {
            await dispatch(rejectRequest(rid)).unwrap();
            load();
        } catch {
            /* ошибка уже в requestSlice.error */
        } finally {
            setActionLoadingId(null);
        }
    };

    /** Фронтенд-фильтр по создателю + отсев записей без id (мемоизация) */
    const filtered = useMemo(
        () =>
            (creatorFilter
                ? requests.filter((r) =>
                      (r.requester ?? '').toLowerCase().includes(creatorFilter.toLowerCase()),
                  )
                : requests
            ).filter((r) => r.id != null),
        [requests, creatorFilter],
    );

    const fmtDate = (d?: string | null) => {
        if (!d) return '—';
        try {
            return new Date(d).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return d;
        }
    };

    /** Клик по строке — игнорируем если клик по кнопке */
    const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>, id: number) => {
        if ((e.target as HTMLElement).closest('button')) return;
        navigate(`/support_request/${id}`);
    };

    return (
        <div className="space" style={{ paddingTop: 16, paddingBottom: 32 }}>
            <h2 style={{ marginBottom: 16 }}>Заявки</h2>

            {/* ===== Фильтры ===== */}
            <div className="reqs-filters">
                <label className="reqs-filter">
                    <span className="reqs-filter__label">Статус</span>
                    <select
                        className="reqs-filter__select"
                        value={statusFilter}
                        onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="reqs-filter">
                    <span className="reqs-filter__label">Дата от</span>
                    <input
                        type="date"
                        className="reqs-filter__input"
                        value={dateFrom}
                        onChange={(e) => dispatch(setDateFrom(e.target.value))}
                    />
                </label>

                <label className="reqs-filter">
                    <span className="reqs-filter__label">Дата до</span>
                    <input
                        type="date"
                        className="reqs-filter__input"
                        value={dateTo}
                        onChange={(e) => dispatch(setDateTo(e.target.value))}
                    />
                </label>

                <label className="reqs-filter">
                    <span className="reqs-filter__label">Создатель</span>
                    <input
                        type="text"
                        className="reqs-filter__input"
                        placeholder="email или имя"
                        value={creatorFilter}
                        onChange={(e) => dispatch(setCreatorFilter(e.target.value))}
                    />
                </label>
            </div>

            {/* ===== Ошибка с кнопкой «Повторить» ===== */}
            {error && (
                <Alert variant="danger" className="mb-3">
                    {error}
                    <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-3"
                        onClick={load}
                    >
                        Повторить
                    </Button>
                </Alert>
            )}

            {/* ===== Таблица ===== */}
            {loading && requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : filtered.length === 0 ? (
                <p style={{ color: '#666', marginTop: 12 }}>Заявок не найдено</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="reqs-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Статус</th>
                                <th>Создатель</th>
                                <th>Дата создания</th>
                                <th>Дата формирования</th>
                                <th>Услуг (OK)</th>
                                {isStaff && <th>Действия</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr
                                    key={r.id}
                                    className="reqs-table__row"
                                    onClick={(e) => handleRowClick(e, r.id!)}
                                >
                                    <td>{r.id}</td>
                                    <td>
                                        <span
                                            className={`reqs-status reqs-status--${r.status ?? 'draft'}`}
                                        >
                                            {STATUS_LABELS[r.status ?? 'draft'] ?? r.status}
                                        </span>
                                    </td>
                                    <td>{r.requester ?? '—'}</td>
                                    <td>{fmtDate(r.created_at)}</td>
                                    <td>{fmtDate(r.requested_at)}</td>
                                    <td>{r.count_ok ?? '—'}</td>
                                    {isStaff && (
                                        <td>
                                            {r.status === 'formed' && (
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button
                                                        className="btn btn--primary"
                                                        style={{ fontSize: 12, padding: '4px 10px' }}
                                                        disabled={actionLoadingId !== null}
                                                        onClick={() => handleFinish(r.id!)}
                                                    >
                                                        {actionLoadingId === r.id ? '...' : 'Завершить'}
                                                    </button>
                                                    <button
                                                        className="btn btn--danger-outline"
                                                        style={{ fontSize: 12, padding: '4px 10px' }}
                                                        disabled={actionLoadingId !== null}
                                                        onClick={() => handleReject(r.id!)}
                                                    >
                                                        {actionLoadingId === r.id ? '...' : 'Отклонить'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default RequestsListPage;
