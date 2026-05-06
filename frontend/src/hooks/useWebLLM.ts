/**
 * useWebLLM — хук инициализации WebLLM-движка в браузере.
 *
 * По методичке ЛР9: CreateMLCEngine + прогресс загрузки модели.
 * Источники: [8] WebLLM — inference в браузере, [10] On-Device AI
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import {
    CreateMLCEngine,
    type MLCEngine,
    type ChatCompletionMessageParam,
    type InitProgressReport,
} from '@mlc-ai/web-llm';

/** Маленькая модель для edge-устройств [9] */
const DEFAULT_MODEL = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';

export interface UseWebLLMReturn {
    engine: MLCEngine | null;
    progress: number;
    progressText: string;
    error: string | null;
    isLoading: boolean;
    retry: () => void;
    generate: (
        messages: ChatCompletionMessageParam[],
        onChunk: (text: string) => void,
    ) => Promise<string>;
}

export default function useWebLLM(model?: string): UseWebLLMReturn {
    const engineRef = useRef<MLCEngine | null>(null);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    /** Сброс состояния и повторная загрузка модели */
    const retry = useCallback(() => {
        engineRef.current = null;
        setError(null);
        setProgress(0);
        setProgressText('');
        setIsLoading(true);
        setRetryCount((c) => c + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const initProgressCallback = (report: InitProgressReport) => {
            if (cancelled) return;
            setProgress(report.progress ?? 0);
            setProgressText(report.text ?? '');
        };

        (async () => {
            try {
                const eng = await CreateMLCEngine(model ?? DEFAULT_MODEL, {
                    initProgressCallback,
                });
                if (cancelled) return;
                engineRef.current = eng;
            } catch (e: unknown) {
                if (cancelled) return;
                const msg = e instanceof Error ? e.message : String(e);
                setError(
                    msg.includes('WebGPU')
                        ? 'Браузер не поддерживает WebGPU. Используйте Chrome 113+ или Edge 113+.'
                        : `Ошибка загрузки модели: ${msg}`,
                );
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [model, retryCount]);

    /** Потоковая генерация ответа */
    const generate = useCallback(
        async (
            messages: ChatCompletionMessageParam[],
            onChunk: (text: string) => void,
        ): Promise<string> => {
            const eng = engineRef.current;
            if (!eng) throw new Error('Engine not loaded');

            const stream = await eng.chat.completions.create({
                messages,
                temperature: 0.1,
                top_p: 0.9,
                max_tokens: 2000,
                frequency_penalty: 0.5,
                presence_penalty: 0.3,
                stream: true,
            });

            let reply = '';
            for await (const chunk of stream) {
                reply += chunk.choices?.[0]?.delta?.content ?? '';
                onChunk(reply);
            }
            return reply;
        },
        [],
    );

    return {
        engine: engineRef.current,
        progress,
        progressText,
        error,
        isLoading,
        retry,
        generate,
    };
}
