import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServicePage from './pages/ServicePage';
import RequestPage from './pages/RequestPage';
import KBSearchPage from './pages/KBSearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RequestsListPage from './pages/RequestsListPage';
import NotFoundPage from './pages/NotFoundPage';
import ForbiddenPage from './pages/ForbiddenPage';

function App() {
    return (
        <BrowserRouter>
            <AppNavbar />
            <Breadcrumbs />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/support_services" element={<ServicesPage />} />
                <Route path="/support_service/:id" element={<ServicePage />} />
                <Route path="/support_request/:id" element={<RequestPage />} />
                <Route path="/support_requests" element={<RequestsListPage />} />
                <Route path="/kb" element={<KBSearchPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/403" element={<ForbiddenPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

