import { useState, useRef, useEffect, useCallback } from 'react';
import type { IKBArticle } from '../modules/mock';
import { cosineSimilarity } from '../modules/math';

export interface IProcessedArticle extends IKBArticle {
    score: number;
    isVisible: boolean;
}

export const useKBSearch = (initialItems: IKBArticle[]) => {
    const [items, setItems] = useState<IProcessedArticle[]>(
        initialItems.map(item => ({ ...item, score: 0, isVisible: true }))
    );

    const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null);
    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState(0);

    const workerRef = useRef<Worker | null>(null);

    // Инициализация Web Worker + текстовые эмбеддинги
    useEffect(() => {
        workerRef.current = new Worker(
            new URL('../workers/search.worker.ts', import.meta.url),
            { type: 'module' }
        );

        workerRef.current.onmessage = (e) => {
            const { type, data } = e.data;

            switch (type) {
                case 'progress':
                    if (data.status === 'progress') setProgress(data.progress);
                    else if (data.status === 'ready') setReady(true);
                    break;

                case 'text_embeddings_ready':
                    setItems(prev => prev.map(item => ({
                        ...item,
                        embedding: data[item.id]
                    })));
                    setReady(true);
                    break;

                case 'image_embedding_ready':
                    setImageEmbedding(data);
                    break;
            }
        };

        workerRef.current.postMessage({ type: 'init', data: initialItems });

        return () => workerRef.current?.terminate();
    }, [initialItems]);

    // Ранжирование при получении эмбеддинга изображения
    useEffect(() => {
        if (!imageEmbedding) return;

        setItems(prevItems => {
            if (!prevItems[0].embedding) return prevItems;

            const threshold = 0.005;

            const processed = prevItems.map(item => {
                if (!item.embedding) return item;

                const similarity = cosineSimilarity(imageEmbedding, item.embedding);

                return {
                    ...item,
                    score: similarity,
                    isVisible: similarity > threshold
                };
            });

            processed.sort((a, b) => b.score - a.score);

            return processed;
        });
    }, [imageEmbedding]);

    // Текстовый поиск по эмбеддингам (ImpReSS — неявные рекомендации)
    const searchByText = useCallback((query: string) => {
        if (!query.trim()) {
            resetSearch();
            return;
        }
        // Отправляем текст в worker для получения text embedding запроса
        // Для текстового поиска используем тот же SigLIP text encoder
        workerRef.current?.postMessage({ type: 'text_query', data: query });
    }, []);

    const searchByImage = (file: File) => {
        workerRef.current?.postMessage({ type: 'image', data: file });
    };

    const resetSearch = () => {
        setImageEmbedding(null);
        setItems(prev => {
            const sortedById = [...prev].sort((a, b) => a.id - b.id);
            return sortedById.map(item => ({
                ...item,
                score: 0,
                isVisible: true
            }));
        });
    };

    return {
        items,
        ready,
        progress,
        imageEmbedding,
        searchByImage,
        searchByText,
        resetSearch
    };
};