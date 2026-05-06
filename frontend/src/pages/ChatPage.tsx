/**
 * ChatPage — страница RAG-чата с мультиагентным конвейером.
 *
 * По методичке ЛР9: ModelLoader, ChatWindow, InputArea.
 * Расширено RAG-связкой: запрос → /api/kb/search → контекст → WebLLM.
 *
 * Источники: [8] WebLLM, [13] Multi-agent Onboarding, [23] ChaITeA
 */
import { useState, useRef, useEffect } from 'react';
import type { FC, KeyboardEvent } from 'react';
import { Button, Spinner, ProgressBar, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { addMessage, updateLastMessage, setFaithful, setSources, clearChat } from '../slices/chatSlice';
import type { ChatMessage } from '../slices/chatSlice';
import useWebLLM from '../hooks/useWebLLM';
import { runRAGPipeline } from '../hooks/ragPipeline';

/* ─────────── sub-components ─────────── */

const ModelLoader: FC<{ progress: number; text: string }> = ({ progress, text }) => (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ padding: '80px 20px' }}>
        <h4 className="mb-3">Загрузка модели…</h4>
        <ProgressBar
            now={progress * 100}
            label={`${Math.round(progress * 100)}%`}
            animated
            striped
            style={{ width: '100%', maxWidth: 420, height: 24 }}
        />
        <p className="text-muted mt-3 mb-1" style={{ fontSize: '0.9rem' }}>{text}</p>
        <p className="text-muted" style={{ fontSize: '0.8rem' }}>
            Модель загружается один раз и кэшируется в браузере
        </p>
    </div>
);

const AgentStatus: FC = () => {
    const { currentAgent, timings } = useSelector((s: RootState) => s.agent);
    if (currentAgent === 'idle' && !timings.total_ms) return null;

    const agents = [
        { key: 'context', label: 'Контекст', ms: timings.context_ms },
        { key: 'ranking', label: 'Ранжирование', ms: timings.ranking_ms },
        { key: 'generation', label: 'Генерация', ms: timings.generation_ms },
        { key: 'validation', label: 'Валидация', ms: timings.validation_ms },
    ] as const;

    return (
        <div className="d-flex flex-wrap gap-1 mb-2">
            {agents.map((a) => {
                const isActive = currentAgent === a.key;
                const isDone = a.ms !== null;
                const variant = isActive ? 'primary' : isDone ? 'success' : 'secondary';
                return (
                    <Badge key={a.key} bg={variant} style={{ fontSize: '0.72rem' }}>
                        {isActive && <Spinner animation="border" size="sm" className="me-1" />}
                        {a.label}
                        {isDone && ` (${Math.round(a.ms!)}ms)`}
                    </Badge>
                );
            })}
            {timings.total_ms && (
                <Badge bg="dark" style={{ fontSize: '0.72rem' }}>
                    Итого: {Math.round(timings.total_ms)}ms
                </Badge>
            )}
        </div>
    );
};

const Message: FC<{ msg: ChatMessage }> = ({ msg }) => {
    const isUser = msg.role === 'user';
    return (
        <div className={`d-flex ${isUser ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
            <div
                style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isUser ? '#0d6efd' : '#f0f0f0',
                    color: isUser ? '#fff' : '#212529',
                    fontSize: '0.93rem',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                }}
            >
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: 6, fontSize: '0.78rem', opacity: 0.85 }}>
                        <strong>Источники:</strong>{' '}
                        {msg.sources.map((s, i) => (
                            <span key={i}>
                                {s.article_title} ({(s.score * 100).toFixed(0)}%)
                                {i < msg.sources!.length - 1 ? ', ' : ''}
                            </span>
                        ))}
                    </div>
                )}
                {msg.faithful !== undefined && (
                    <div className="mt-1">
                        <Badge
                            bg={msg.faithful ? 'success' : 'warning'}
                            style={{ fontSize: '0.68rem' }}
                        >
                            {msg.faithful ? '✓ Подтверждено' : '⚠ Не подтверждено'}
                        </Badge>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─────────── main component ─────────── */

const ChatPage: FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { messages } = useSelector((s: RootState) => s.chat);
    const { isLoading: modelLoading, progress, progressText, error, retry, generate } =
        useWebLLM();

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: Date.now(),
        };
        dispatch(addMessage(userMsg));

        const assistantId = `assistant-${Date.now()}`;
        const assistantMsg: ChatMessage = {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
        };
        dispatch(addMessage(assistantMsg));

        setInput('');
        setLoading(true);

        try {
            const result = await runRAGPipeline(
                userMsg.content,
                generate,
                dispatch,
                (text) => dispatch(updateLastMessage({ content: text })),
            );

            dispatch(updateLastMessage({ content: result.answer }));
            dispatch(setSources({ messageId: assistantId, sources: result.sources }));
            dispatch(setFaithful({ messageId: assistantId, faithful: result.faithful }));
        } catch (e) {
            console.error('RAG pipeline error:', e);
            dispatch(
                updateLastMessage({
                    content: 'Извините, произошла ошибка генерации. Попробуйте ещё раз.',
                }),
            );
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    /* ─── render ─── */

    if (error) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center"
                 style={{ padding: '80px 20px' }}>
                <h4 className="mb-2">Ошибка WebLLM</h4>
                <p className="text-danger mb-3">{error}</p>
                <Button variant="primary" onClick={retry}>
                    Повторить загрузку
                </Button>
            </div>
        );
    }

    if (modelLoading) {
        return <ModelLoader progress={progress} text={progressText} />;
    }

    const visibleMessages = messages.filter((m) => m.role !== 'system');

    return (
        <div
            className="d-flex flex-column mx-auto"
            style={{ maxWidth: 760, padding: '20px 16px 24px', height: 'calc(100vh - 120px)' }}
        >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="mb-0">RAG-чат техподдержки</h4>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => dispatch(clearChat())}
                    disabled={loading}
                >
                    Очистить
                </Button>
            </div>

            <AgentStatus />

            {/* Chat window — flex-grow заполняет всё пространство */}
            <div
                className="flex-grow-1 border rounded-3 bg-white p-3 mb-2"
                style={{ overflowY: 'auto', minHeight: 0 }}
            >
                {visibleMessages.length === 0 && (
                    <div className="d-flex align-items-center justify-content-center h-100">
                        <p className="text-muted mb-0">Задайте вопрос по базе знаний техподдержки</p>
                    </div>
                )}
                {visibleMessages.map((msg) => (
                    <Message key={msg.id} msg={msg} />
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Input area — фиксирована внизу */}
            <div className="d-flex gap-2 align-items-end">
                <textarea
                    className="form-control"
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Введите вопрос… (Enter — отправить, Shift+Enter — новая строка)"
                    disabled={loading}
                    style={{ resize: 'none', fontSize: '0.93rem' }}
                />
                <Button
                    variant="primary"
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    style={{ minWidth: 100, height: 58 }}
                >
                    {loading ? <Spinner animation="border" size="sm" /> : 'Отправить'}
                </Button>
            </div>
        </div>
    );
};

export default ChatPage;
