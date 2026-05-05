import { Link, useNavigate } from 'react-router-dom';
import { Button, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { logoutUserAsync } from '../slices/userSlice';
import { clearRequest } from '../slices/requestSlice';
import { setSearchValue } from '../slices/servicesSlice';
import { clearRequestsList } from '../slices/requestsListSlice';

function AppNavbar() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { isAuthenticated, email, isStaff } = useSelector((state: RootState) => state.user);
    const { draftId, draftCount } = useSelector((state: RootState) => state.request);

    const handleLogout = async () => {
        await dispatch(logoutUserAsync());
        dispatch(clearRequest());
        dispatch(clearRequestsList());
        dispatch(setSearchValue(''));
        navigate('/support_services');
    };

    return (
        <header className="site-topbar">
            <div className="topbar-left">
                <Link to="/" className="site-topbar__home">
                    <img
                        src="/img/home.png"
                        alt="На главную"
                        className="site-topbar__home-icon"
                    />
                </Link>
            </div>

            <h1 className="site-topbar__title">Удаленная поддержка</h1>

            <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Link to="/support_services" style={{ color: 'white', textDecoration: 'none' }}>
                    Услуги
                </Link>
                <Link to="/support_requests" style={{ color: 'white', textDecoration: 'none' }}>
                    Заявки
                </Link>
                <Link to="/kb" style={{ color: 'white', textDecoration: 'none' }}>
                    База знаний
                </Link>
            </nav>

            <div className="auth-box" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {/* Иконка корзины — ЛР7 */}
                {isAuthenticated && (
                    <Button
                        variant={draftId ? 'outline-light' : 'outline-secondary'}
                        size="sm"
                        disabled={!draftId}
                        onClick={() => draftId && navigate(`/support_request/${draftId}`)}
                        style={{ position: 'relative' }}
                    >
                        <img
                            src="/img/mobile.png"
                            alt="Текущий запрос"
                            style={{ width: 20, height: 20 }}
                        />
                        {draftId && draftCount > 0 && (
                            <Badge
                                bg="danger"
                                pill
                                style={{ position: 'absolute', top: -6, right: -6, fontSize: '0.65rem' }}
                            >
                                {draftCount}
                            </Badge>
                        )}
                    </Button>
                )}

                {/* Email + роль */}
                {isAuthenticated && (
                    <span style={{ color: 'white', fontSize: '0.85rem' }}>
                        {email}{isStaff ? ' (модератор)' : ''}
                    </span>
                )}

                {/* Войти / Выйти — ЛР7, шаг 3 по методичке */}
                {!isAuthenticated ? (
                    <Link to="/login">
                        <Button variant="primary" size="sm">Войти</Button>
                    </Link>
                ) : (
                    <Button variant="outline-light" size="sm" onClick={handleLogout}>
                        Выйти
                    </Button>
                )}
            </div>
        </header>
    );
}

export default AppNavbar;
