import { Link } from 'react-router-dom'

function AppNavbar() {
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
        <Link to="/kb" style={{ color: 'white', textDecoration: 'none' }}>
          База знаний
        </Link>
      </nav>

      <div className="auth-box">
        <button type="button" className="btn-blue">
          Войти
        </button>
      </div>
    </header>
  )
}

export default AppNavbar