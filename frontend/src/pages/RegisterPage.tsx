import React, { useState } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import { registerUserAsync } from '../slices/userSlice';

function RegisterPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '', username: '' });
    const error = useSelector((state: RootState) => state.user.error);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password || !formData.username) return;
        setSubmitting(true);
        const result = await dispatch(registerUserAsync(formData));
        if (registerUserAsync.fulfilled.match(result)) {
            navigate('/login');
        }
        setSubmitting(false);
    };

    return (
        <Container style={{ maxWidth: 440, marginTop: 80 }}>
            <Card className="p-4 shadow-sm">
                <h2 className="text-center mb-4">Регистрация</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label>Имя пользователя</Form.Label>
                        <Form.Control
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="Введите имя"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Введите email"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Введите пароль"
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100" disabled={submitting}>
                        {submitting ? 'Регистрация…' : 'Зарегистрироваться'}
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <span>Уже есть аккаунт? </span>
                    <Link to="/login">Войти</Link>
                </div>
            </Card>
        </Container>
    );
}

export default RegisterPage;
