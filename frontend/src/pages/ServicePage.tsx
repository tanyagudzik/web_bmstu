import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Card, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { addServiceToRequest, fetchCart } from '../slices/requestSlice';
import { api } from '../api';
import type { SupportService } from '../api/Api';
import { services as SERVICES_MOCK } from '../mocks/services';

const DEFAULT_IMG = '/default-image.png';

function ServicePage() {
    const { id } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated } = useSelector((state: RootState) => state.user);

    const [service, setService] = useState<SupportService | null>(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api.supportService
            .supportServiceRead(id)
            .then((res) => setService(res.data))
            .catch(() => {
                // Fallback на моки (требование ЛР6)
                const mock = SERVICES_MOCK.find((s) => s.id === Number(id));
                if (mock) {
                    setService({
                        id: mock.id,
                        title: mock.title,
                        description: mock.desc,
                        eta: mock.eta,
                        img_url: mock.img || null,
                    } as unknown as SupportService);
                }
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleAdd = async () => {
        if (!service?.id || adding) return;
        setAdding(true);
        setAddError(null);
        try {
            await dispatch(addServiceToRequest(service.id)).unwrap();
            dispatch(fetchCart());
        } catch (e) {
            console.error('Ошибка добавления услуги:', e);
            setAddError((typeof e === 'string' ? e : null) || 'Не удалось добавить услугу');
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (!service) {
        return (
            <div className="space">
                <div className="cards-header">
                    <p className="cards-question">Выбранная услуга</p>
                </div>
                <div className="cards-divider" />
                <section className="cards-surface">
                    <p>Услуга не найдена.</p>
                </section>
            </div>
        );
    }

    return (
        <div className="space">
            <div className="cards-header">
                <p className="cards-question">Выбранная услуга</p>
            </div>
            <div className="cards-divider" />
            <section className="cards-surface">
                <Card className="p-3" style={{ maxWidth: 700 }}>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                        <Card.Img
                            src={service.img_url || DEFAULT_IMG}
                            alt={service.title}
                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }}
                            style={{ width: 160, height: 160, objectFit: 'contain' }}
                        />
                        <div>
                            <h2>{service.title}</h2>
                            <p>{service.description ?? ''}</p>
                            {service.eta ? <p><strong>ETA:</strong> {service.eta}</p> : null}

                            {addError && (
                                <Alert variant="danger" className="mt-2 mb-2 py-2 px-3">
                                    {addError}
                                </Alert>
                            )}

                            {isAuthenticated && (
                                <Button
                                    variant="primary"
                                    onClick={handleAdd}
                                    disabled={adding}
                                >
                                    {adding ? (
                                        <>
                                            <Spinner animation="border" size="sm" />{' '}
                                            Добавление…
                                        </>
                                    ) : (
                                        'Добавить в заявку'
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    );
}

export default ServicePage;
