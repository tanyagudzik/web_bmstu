import { useState, useRef } from 'react';
import { Button, ProgressBar, Badge } from 'react-bootstrap';
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

function KBSearchPage() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        items,
        ready,
        progress,
        imageEmbedding,
        searchByImage,
        resetSearch
    } = useKBSearch(KB_ARTICLES_MOCK);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            searchByImage(file);
        }
    };

    const handleClear = () => {
        setSelectedImage(null);
        resetSearch();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const uploadLabel = ready ? 'Загрузить скриншот ошибки' : 'Загрузка SigLIP...';
    const isUploadDisabled = !ready;
    const canReset = Boolean(selectedImage);

    return (
        <div className="app-container">
            <h1>Поиск по базе знаний</h1>
            <p className="text-muted">
                Загрузите скриншот ошибки — система найдёт подходящую статью
            </p>

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
                        disabled={isUploadDisabled}
                    >
                        {uploadLabel}
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
                            [{imageEmbedding.slice(0, 5).map(n => n.toFixed(3)).join(', ')}...]
                        </div>
                    )}

                    <Button
                        className="action-btn"
                        variant="outline-danger"
                        onClick={handleClear}
                        disabled={!canReset}
                    >
                        Сбросить
                    </Button>
                </div>
            </div>

            <div className="items-list">
                {items.map((article) => {
                    if (!article.isVisible) return null;

                    return (
                        <div key={article.id} className="furniture-row">
                            <img
                                src={article.image}
                                alt={article.title}
                                className="row-image"
                            />

                            <div className="row-content">
                                <h5>
                                    {article.title}{' '}
                                    <Badge bg={CATEGORY_COLORS[article.category] || 'dark'}>
                                        {CATEGORY_LABELS[article.category] || article.category}
                                    </Badge>
                                </h5>
                                <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                                    {article.content.substring(0, 150)}...
                                </p>
                                <small className="text-secondary">
                                    Теги: {article.tags}
                                </small>
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
                                        [{article.embedding.slice(0, 5).map(n => n.toFixed(3)).join(', ')}...]
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