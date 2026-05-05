import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';

const LABELS: Record<string, string> = {
    'support_services': 'Услуги',
    'support_service': 'Услуга',
    'support_request': 'Заявка',
    'kb': 'База знаний',
    'login': 'Авторизация',
    'register': 'Регистрация',
};

const HOME = { path: '/', label: 'Главная' };

function Breadcrumbs() {
    const { pathname } = useLocation();
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) return null;

    const crumbs: { path: string; label: string }[] = [HOME];

    let currentPath = '';
    for (const seg of segments) {
        currentPath = `${currentPath}/${seg}`.replace(/\/+/g, '/');
        let fallback: string;
        try { fallback = decodeURIComponent(seg); } catch { fallback = seg; }
        const isId = /^\d+$/.test(seg);
        const label = LABELS[seg] ?? (isId ? `#${seg}` : fallback);
        crumbs.push({ path: currentPath, label });
    }

    return (
        <Breadcrumb className="px-3 pt-2 mb-0" style={{ fontSize: '0.9rem' }}>
            {crumbs.map((crumb, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                    <Breadcrumb.Item
                        key={crumb.path}
                        active={isLast}
                        linkAs={isLast ? undefined : Link}
                        linkProps={isLast ? undefined : { to: crumb.path }}
                    >
                        {crumb.label}
                    </Breadcrumb.Item>
                );
            })}
        </Breadcrumb>
    );
}

export default Breadcrumbs;
