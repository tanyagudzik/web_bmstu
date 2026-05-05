import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { getServicesList, setSearchValue } from '../slices/servicesSlice';
import { addServiceToRequest, fetchCart } from '../slices/requestSlice';

const DEFAULT_IMG = '/default-image.png';

function ServicesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { searchValue, services, loading } = useSelector((state: RootState) => state.services);
    const { isAuthenticated } = useSelector((state: RootState) => state.user);
    const { draftId, draftCount } = useSelector((state: RootState) => state.request);

    const [etaFilter, setEtaFilter] = useState('');

    useEffect(() => {
        dispatch(getServicesList());
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [dispatch, isAuthenticated]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(getServicesList());
    };

    const handleAdd = async (serviceId: number | undefined) => {
        if (!serviceId) return;
        await dispatch(addServiceToRequest(serviceId));
        dispatch(fetchCart());
    };

    const filtered = etaFilter
        ? services.filter((s) => (s.eta ?? '').toLowerCase().includes(etaFilter.toLowerCase()))
        : services;

    return (
        <div className="space">
            <div className="cards-header">
                <p className="cards-question">
                    Какой вид услуги наиболее актуален для вашего запроса?
                </p>

                {isAuthenticated && (
                    <Link
                        to={draftId ? `/support_request/${draftId}` : '#'}
                        className={`tag-alert ${!draftId ? 'tag-alert--disabled' : ''}`}
                        aria-label="Текущий запрос"
                        onClick={(e) => { if (!draftId) e.preventDefault(); }}
                    >
                        <img className="tag-alert__icon" src="/img/mobile.png" alt="Текущий запрос" />
                        <span className="tag-alert__text">Текущий запрос</span>
                        <span className="tag-alert__count">{draftCount}</span>
                    </Link>
                )}
            </div>

            <div className="cards-divider" />

            <section className="cards-surface">
                <form className="searchbar" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Найти услугу…"
                        value={searchValue}
                        onChange={(e) => dispatch(setSearchValue(e.target.value))}
                    />
                    <input
                        type="text"
                        placeholder="Фильтр по ETA…"
                        value={etaFilter}
                        onChange={(e) => setEtaFilter(e.target.value)}
                        style={{ maxWidth: 200 }}
                    />
                    <button type="submit" className="btn btn--primary" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Поиск'}
                    </button>
                </form>

                {!loading && searchValue && filtered.length === 0 && (
                    <p className="searchbar__empty">По запросу ничего не найдено.</p>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <div className="container">
                        {filtered.map((item) => (
                            <div className="card" key={item.id}>
                                <div className="card__header">
                                    <img
                                        src={item.img_url || DEFAULT_IMG}
                                        className="card__icon"
                                        alt={item.title}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = DEFAULT_IMG;
                                        }}
                                    />
                                    <div className="card__headtexts">
                                        <p className="card__title">{item.title}</p>
                                    </div>
                                </div>

                                <div className="card__footer">
                                    <span className="card__eta">{item.eta ?? ''}</span>

                                    <div className="card__actions">
                                        <Link
                                            to={`/support_service/${item.id}`}
                                            className="btn btn--outline card__action-btn"
                                        >
                                            Подробнее
                                        </Link>

                                        {isAuthenticated && (
                                            <button
                                                type="button"
                                                className="btn btn--primary card__action-btn"
                                                onClick={() => handleAdd(item.id)}
                                            >
                                                Добавить в заявку
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default ServicesPage;
