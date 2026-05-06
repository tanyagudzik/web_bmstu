import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <div className="space" style={{ textAlign: 'center', padding: '80px 20px' }}>
            <h1 style={{ fontSize: 72, marginBottom: 8, color: '#ccc' }}>404</h1>
            <p style={{ fontSize: 20, marginBottom: 24 }}>Страница не найдена</p>
            <Link to="/" className="btn btn--primary">
                На главную
            </Link>
        </div>
    );
}

export default NotFoundPage;
