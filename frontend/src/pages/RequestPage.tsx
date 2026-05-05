import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner, Alert } from 'react-bootstrap';
import type { AppDispatch, RootState } from '../store';
import {
    fetchRequest,
    updateRequest,
    formRequest,
    deleteRequest,
    deleteLineFromRequest,
    updateLine,
    clearRequest,
} from '../slices/requestSlice';

function RequestPage() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { currentRequest, loading, error } = useSelector(
        (state: RootState) => state.request
    );

    const [room, setRoom] = useState('');
    const [comments, setComments] = useState<Record<number, string>>({});

    // Fix #4 — раздельные loading-стейты для каждой кнопки
    const [saving, setSaving] = useState(false);
    const [forming, setForming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    // Fix #3 — loading для удаления строки и обновления comment
    const [deletingLine, setDeletingLine] = useState<number | null>(null);
    const [updatingComment, setUpdatingComment] = useState<number | null>(null);

    // Fix #5 — отображение ошибок операций
    const [actionError, setActionError] = useState<string | null>(null);

    const anyActionLoading = saving || forming || deleting;

    // Безопасный парсинг id из URL + очистка при невалидном
    useEffect(() => {
        const ridFromUrl = Number(id);
        if (!Number.isFinite(ridFromUrl) || ridFromUrl <= 0) {
            dispatch(clearRequest());
            return;
        }
        dispatch(fetchRequest(ridFromUrl));
    }, [dispatch, id]);

    // Синхронизация room и comments при загрузке данных
    useEffect(() => {
        if (currentRequest) {
            setRoom(currentRequest.room ?? '');
            const cmap: Record<number, string> = {};
            currentRequest.lines?.forEach((line) => {
                if (line.service_id != null) {
                    cmap[line.service_id] = line.comment ?? '';
                }
            });
            setComments(cmap);
        }
    }, [currentRequest]);

    // Fix #1 — бэкенд отдаёт 'draft', не 'черновик'
    const isDraft = currentRequest?.status === 'draft';
    const rid = currentRequest?.id;

    // Маппинг статуса для отображения
    const statusLabel: Record<string, string> = {
        draft: 'Черновик',
        formed: 'Сформирован',
        completed: 'Завершён',
        rejected: 'Отклонён',
    };

    // --- Обработчики ---
    const handleSave = async () => {
        if (!rid) return;
        setActionError(null);
        setSaving(true);
        const result = await dispatch(updateRequest({ rid, data: { room } }));
        setSaving(false);
        if (updateRequest.rejected.match(result)) {
            setActionError(result.payload as string);
        }
    };

    const handleForm = async () => {
        if (!rid) return;
        setActionError(null);
        setForming(true);
        const result = await dispatch(formRequest(rid));
        setForming(false);
        if (formRequest.fulfilled.match(result)) {
            dispatch(fetchRequest(rid));
        } else if (formRequest.rejected.match(result)) {
            setActionError(result.payload as string);
        }
    };

    const handleDelete = async () => {
        if (!rid) return;
        setActionError(null);
        setDeleting(true);
        const result = await dispatch(deleteRequest(rid));
        setDeleting(false);
        if (deleteRequest.fulfilled.match(result)) {
            navigate('/support_services');
        } else if (deleteRequest.rejected.match(result)) {
            setActionError(result.payload as string);
        }
    };

    const handleDeleteLine = async (serviceId: number) => {
        if (!rid) return;
        setActionError(null);
        setDeletingLine(serviceId);
        const result = await dispatch(deleteLineFromRequest({ rid, serviceId }));
        setDeletingLine(null);
        if (deleteLineFromRequest.rejected.match(result)) {
            setActionError(result.payload as string);
        }
    };

    const handleCommentBlur = async (serviceId: number) => {
        if (!rid) return;
        const comment = comments[serviceId] ?? '';
        setActionError(null);
        setUpdatingComment(serviceId);
        const result = await dispatch(updateLine({ rid, serviceId, comment }));
        setUpdatingComment(null);
        if (updateLine.rejected.match(result)) {
            setActionError(result.payload as string);
        }
    };

    const formatDate = (d?: string | null) => {
        if (!d) return '—';
        try {
            return new Date(d).toLocaleString('ru-RU');
        } catch {
            return d;
        }
    };

    // --- Рендер ---
    if (loading) {
        return (
            <div className="space" style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spinner animation="border" />
                <p style={{ marginTop: 12 }}>Загрузка заявки…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space">
                <div className="cards-header">
                    <p className="cards-question">Ошибка</p>
                </div>
                <div className="cards-divider"></div>
                <p style={{ padding: 20, color: '#c00' }}>{error}</p>
            </div>
        );
    }

    if (!currentRequest) {
        return (
            <div className="space">
                <div className="cards-header">
                    <p className="cards-question">Заявка не найдена</p>
                </div>
            </div>
        );
    }

    const lines = currentRequest.lines ?? [];

    return (
        <div className="space">
            <div className="cards-header">
                <p className="cards-question">
                    Заявка #{currentRequest.id}
                </p>
            </div>

            <div className="cards-divider"></div>

            {/* Fix #5 — алерт при ошибке операции */}
            {actionError && (
                <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setActionError(null)}
                    style={{ margin: '0 16px' }}
                >
                    {actionError}
                </Alert>
            )}

            <section className="cards-surface">
                <section className="request-wrap req">
                    <div className="req-form">
                        {/* ===== Мета-данные ===== */}
                        <div className="req__box">
                            <div className="request-head">
                                <dl className="req-meta">
                                    <dt>ID заявки:</dt>
                                    <dd>{currentRequest.id}</dd>

                                    <dt>Статус:</dt>
                                    <dd>
                                        {statusLabel[currentRequest.status ?? ''] ??
                                            currentRequest.status}
                                    </dd>

                                    <dt>Дата создания:</dt>
                                    <dd>{formatDate(currentRequest.created_at)}</dd>

                                    <dt>Создатель:</dt>
                                    <dd>{currentRequest.requester ?? '—'}</dd>

                                    <dt>Дата формирования:</dt>
                                    <dd>{formatDate(currentRequest.requested_at)}</dd>

                                    <dt>Дата завершения:</dt>
                                    <dd>{formatDate(currentRequest.finished_at)}</dd>

                                    <dt>Инженер:</dt>
                                    <dd>{currentRequest.engineer ?? '—'}</dd>

                                    <dt>Помещение:</dt>
                                    <dd>
                                        {isDraft ? (
                                            <input
                                                type="text"
                                                className="req-room-input"
                                                value={room}
                                                onChange={(e) => setRoom(e.target.value)}
                                                placeholder="Помещение"
                                            />
                                        ) : (
                                            currentRequest.room || '—'
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>

                        {/* ===== Список услуг ===== */}
                        {lines.length > 0 && (
                            <div className="req__list">
                                {lines.map((line) => {
                                    const sid = line.service_id!;
                                    const isLineDeleting = deletingLine === sid;
                                    const isCommentUpdating = updatingComment === sid;
                                    return (
                                        <article
                                            className="req-line"
                                            key={line.id ?? sid}
                                            style={{
                                                opacity: isLineDeleting ? 0.5 : 1,
                                            }}
                                        >
                                            <div className="req-line__img">
                                                {line.img_url ? (
                                                    <img
                                                        src={line.img_url}
                                                        alt={line.service_name}
                                                    />
                                                ) : (
                                                    <span className="req-line__img-empty">
                                                        нет фото
                                                    </span>
                                                )}
                                            </div>

                                            <div className="req-line__main">
                                                <div className="req-line__title">
                                                    {line.service_name}
                                                </div>
                                            </div>

                                            <div className="req-line__eta">
                                                {line.eta || '—'}
                                            </div>

                                            <div className="req-line__comment">
                                                {isDraft ? (
                                                    <input
                                                        type="text"
                                                        className="req-line__input"
                                                        value={comments[sid] ?? ''}
                                                        onChange={(e) =>
                                                            setComments((prev) => ({
                                                                ...prev,
                                                                [sid]: e.target.value,
                                                            }))
                                                        }
                                                        onBlur={() => handleCommentBlur(sid)}
                                                        placeholder="Комментарий"
                                                        disabled={isCommentUpdating}
                                                        style={{
                                                            opacity: isCommentUpdating
                                                                ? 0.6
                                                                : 1,
                                                        }}
                                                    />
                                                ) : (
                                                    line.comment || '—'
                                                )}
                                            </div>

                                            {isDraft && (
                                                <button
                                                    type="button"
                                                    className="req-line__remove"
                                                    title="Удалить услугу из заявки"
                                                    onClick={() => handleDeleteLine(sid)}
                                                    disabled={
                                                        isLineDeleting || deletingLine !== null
                                                    }
                                                >
                                                    {isLineDeleting ? (
                                                        <Spinner
                                                            animation="border"
                                                            size="sm"
                                                        />
                                                    ) : (
                                                        '\u00D7'
                                                    )}
                                                </button>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                        {lines.length === 0 && (
                            <p style={{ padding: '16px 0', color: '#888' }}>
                                В заявке нет услуг.
                            </p>
                        )}

                        {/* ===== Кнопки (только в черновике) ===== */}
                        {isDraft && (
                            <div className="req__actions">
                                <button
                                    type="button"
                                    className="btn btn--outline card__action-btn"
                                    onClick={handleSave}
                                    disabled={anyActionLoading}
                                >
                                    {saving ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        'Сохранить'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn--primary card__action-btn"
                                    onClick={handleForm}
                                    disabled={anyActionLoading}
                                >
                                    {forming ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        'Оформить заявку'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn--outline btn--danger-outline card__action-btn"
                                    onClick={handleDelete}
                                    disabled={anyActionLoading}
                                >
                                    {deleting ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        'Удалить заявку'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </section>
        </div>
    );
}

export default RequestPage;
