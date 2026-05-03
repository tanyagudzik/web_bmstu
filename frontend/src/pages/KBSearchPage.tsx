import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, ProgressBar, Badge } from 'react-bootstrap';
import type { AppDispatch, RootState } from '../store';
import { fetchKBArticles, searchKB, setSearchQuery } from '../slices/kbSlice';
import { KB_ARTICLES_MOCK } from '../modules/mock';
import { useKBSearch } from '../hooks/useKBSearch';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

const CATEGORY_LABELS: Record<string, string> = {
    network: 'Сеть и VPN',
    printer: 'Принтеры',
    software: 'ПО',
    hardware: 'Оборудование',
    email: 'Почта',
    access: 'Доступы',
    other: 'Прочее',
};

const CATEGORY_COLORS: Record<string, string> = {
    network: 'primary',
    printer: 'warning',
    software: 'success',
    hardware: 'danger',
    email: 'info',
    access: 'secondary',
    other: 'dark',
};

// Порог релевантности для Redis Vector Search (cosine distance).
// score < RELEVANCE_THRESHOLD → статья релевантна.
// Cosine distance: 0 = идеально, 2 = максимально далеко.
const RELEVANCE_THRESHOLD = 0.35;

function KBSearchPage() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const dispatch = useDispatch<AppDispatch>();
    const { articles, searchResults, searchQuery, loading } = useSelector(
        (state: RootState) => state.kb
    );

    // SigLIP для поиска по картинкам (из ЛР6)
    const {
        items: siglipItems,
        ready,
        progress,
        imageEmbedding,
        searchByImage,
        resetSearch: resetSiglipSearch,
    } = useKBSearch(KB_ARTICLES_MOCK);

    // Загрузка статей из API при монтировании
    useEffect(() => {
        dispatch(fetchKBArticles());
    }, [dispatch]);

    // ImpReSS [14] — debounce текстовый поиск через Redis Vector Search
    useEffect(() => {
        if (!searchQuery.trim()) return;
        const timer = setTimeout(() => {
            dispatch(searchKB(searchQuery));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, dispatch]);

    // === Определяем режим отображения ===
    // 1. Картинка загружена → SigLIP результаты
    // 2. Текстовый запрос → Redis Vector Search результаты (с порогом)
    // 3. Ничего → все статьи из БД (API)

    type DisplayItem = {
        id: number;
        title: string;
        content: string;
        category: string;
        score: number;
        tags: string;
        image: string;
        isVisible: boolean;
        embedding: number[] | null;
    };

    let displayItems: DisplayItem[];

    if (selectedImage) {
        // Режим 1: поиск по картинке — данные из SigLIP
        displayItems = siglipItems.map(a => ({
            id: a.id,
            title: a.title,
            content: a.content,
            category: a.category,
            score: a.score,
            tags: a.tags,
            image: a.image,
            isVisible: a.isVisible,
            embedding: a.embedding || null,
        }));
    } else if (searchQuery.trim().length > 0 && searchResults.length > 0) {
        // Режим 2: текстовый поиск — данные из Redis Vector Search
        displayItems = Array.from(
            searchResults.reduce((map, result) => {
                const existing = map.get(result.article_id);
                if (!existing || result.score < existing.score) {
                    map.set(result.article_id, result);
                }
                return map;
            }, new Map<number, typeof searchResults[number]>()).values()
        )
            .filter(r => r.score < RELEVANCE_THRESHOLD)  // ← ПОРОГ
            .sort((a, b) => a.score - b.score)
            .map(r => ({
                id: r.article_id,
                title: r.article_title,
                content: r.text,
                category: r.category,
                score: 1 - r.score,
                tags: '',
                image: '',
                isVisible: true,
                embedding: null,
            }));
    } else {
        // Режим 3: все статьи из БД (Confluence + seed_kb)
        displayItems = articles.map(a => ({
            id: a.id,
            title: a.title,
            content: a.content,
            category: a.category,
            score: 0,
            tags: a.tags,
            image: '',
            isVisible: true,
            embedding: null,
        }));
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            dispatch(setSearchQuery(''));
            searchByImage(file);
        }
    };

    const handleClear = () => {
        setSelectedImage(null);
        dispatch(setSearchQuery(''));
        resetSiglipSearch();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="app-container">
            <h1>Поиск по базе знаний</h1>
            <p className="text-muted">
                Введите текст запроса или загрузите скриншот ошибки
            </p>

            {/* Текстовый поиск (Redis Vector Search) */}
            <div style={{ marginBottom: '16px', maxWidth: '600px' }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Опишите проблему..."
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                />
                {loading && <small className="text-muted">Поиск...</small>}
            </div>

            {/* Поиск по картинке (SigLIP) */}
            <div className="search-section">
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                />

                <div style={{ flexShrink: 0 }}>
                    {selectedImage ? (
                        <img src={selectedImage} alt="Скриншот" className="preview-image" />
                    ) : (
                        <div className="placeholder-image">Нет скриншота</div>
                    )}
                </div>

                <div className="action-panel">
                    <Button
                        className="action-btn"
                        variant="primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!ready}
                    >
                        {ready ? 'Загрузить скриншот ошибки' : 'Загрузка SigLIP...'}
                    </Button>

                    {!ready && (
                        <ProgressBar
                            className="action-progress"
                            now={progress}
                            label={`${Math.round(progress)}%`}
                            animated
                        />
                    )}

                    {imageEmbedding && (
                        <div className="embed-preview">
                            <strong>Image Embed: </strong><br />
                            [{imageEmbedding.slice(0, 5).map((n: number) => n.toFixed(3)).join(', ')}...]
                        </div>
                    )}

                    <Button
                        className="action-btn"
                        variant="outline-danger"
                        onClick={handleClear}
                        disabled={!selectedImage && !searchQuery}
                    >
                        Сбросить
                    </Button>
                </div>
            </div>

            {/* Информация о результатах */}
            {searchQuery.trim().length > 0 && !loading && (
                <div style={{ marginBottom: '12px' }}>
                    <small className="text-muted">
                        Найдено статей: {displayItems.length}
                        {searchResults.length > displayItems.length && (
                            <> (отфильтровано по релевантности: {searchResults.length - displayItems.length} нерелевантных)</>
                        )}
                    </small>
                </div>
            )}

            {/* Результаты */}
            <div className="items-list">
                {displayItems.length === 0 && searchQuery.trim().length > 0 && !loading && (
                    <p className="text-muted">Ничего не найдено. Попробуйте другой запрос.</p>
                )}

                {displayItems.map((article) => {
                    if (!article.isVisible) return null;

                    return (
                        <div key={article.id} className="furniture-row">
                            {article.image && (
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="row-image"
                                />
                            )}

                            <div className="row-content">
                                <h5>
                                    {article.title}{' '}
                                    <Badge bg={CATEGORY_COLORS[article.category] || 'dark'}>
                                        {CATEGORY_LABELS[article.category] || article.category}
                                    </Badge>
                                </h5>
                                <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                                    {article.content.substring(0, 200)}...
                                </p>
                                {article.tags && (
                                    <small className="text-secondary">
                                        Теги: {article.tags}
                                    </small>
                                )}
                            </div>

                            <div className="row-stats">
                                {article.score > 0 && (
                                    <div>
                                        Сходство:{' '}
                                        <span className="similarity-value">
                                            {(article.score * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                )}
                                {article.embedding && (
                                    <div className="embed-preview-text">
                                        <strong>Text Embed:</strong><br />
                                        [{article.embedding.slice(0, 5).map((n: number) => n.toFixed(3)).join(', ')}...]
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default KBSearchPage;