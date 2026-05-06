/**
 * ragPipeline — мультиагентный RAG-конвейер для WebLLM.
 *
 * 4 агента [13] Multi-agent Onboarding:
 *   1. context  — извлечение ключевых слов → поиск по БЗ
 *   2. ranking  — Chain-of-Rank ранжирование [7]
 *   3. generation — ответ по контексту
 *   4. validation — проверка faithful [16] SafeChat
 *
 * Тайминги → agentSlice → POST /api/metrics → Prometheus [3]
 */
import type { ChatCompletionMessageParam } from '@mlc-ai/web-llm';
import type { KBSearchResult } from '../slices/kbSlice';
import type { AppDispatch } from '../store';
import {
    setCurrentAgent,
    setContextResult,
    setRankedChunks,
    setGeneratedAnswer,
    setFaithful,
    setTiming,
    setTotalTiming,
    resetAgentPipeline,
} from '../slices/agentSlice';
import axios from 'axios';

interface RAGResult {
    answer: string;
    sources: { article_id: number; article_title: string; score: number }[];
    faithful: boolean;
}

type GenerateFn = (
    messages: ChatCompletionMessageParam[],
    onChunk: (text: string) => void,
) => Promise<string>;

/* ───────────── helpers ───────────── */

async function searchKB(query: string, topK = 5): Promise<KBSearchResult[]> {
    try {
        const { data } = await axios.get('/api/kb/search', {
            params: { q: query, top_k: topK },
        });
        return data.results ?? [];
    } catch {
        return [];
    }
}

function buildContextPrompt(chunks: KBSearchResult[]): string {
    if (!chunks.length) return 'Контекст из базы знаний не найден.';
    return chunks
        .map(
            (c, i) =>
                `[${i + 1}] (${c.article_title}, score=${c.score.toFixed(3)})\n${c.text}`,
        )
        .join('\n\n');
}

/* ───────────── pipeline ───────────── */

export async function runRAGPipeline(
    userQuery: string,
    generate: GenerateFn,
    dispatch: AppDispatch,
    onChunk: (text: string) => void,
): Promise<RAGResult> {
    const pipelineStart = performance.now();
    dispatch(resetAgentPipeline());

    /* ── 1. Агент контекста ── */
    dispatch(setCurrentAgent('context'));
    const ctxStart = performance.now();

    // Извлекаем ключевые слова через LLM (на языке запроса)
    const kwPrompt: ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content:
                'Извлеки 2-5 ключевых слов из вопроса пользователя для поиска по базе знаний. Ответь ТОЛЬКО ключевыми словами через запятую на том же языке, на котором задан вопрос. Ничего больше.',
        },
        { role: 'user', content: userQuery },
    ];
    let keywords = '';
    try {
        keywords = await generate(kwPrompt, () => {});
    } catch {
        keywords = userQuery; // fallback — используем оригинальный запрос
    }
    dispatch(setContextResult(keywords));

    // Поиск в БЗ по ключевым словам + оригинальному запросу
    const [resultsByKw, resultsByQuery] = await Promise.all([
        searchKB(keywords.trim(), 5),
        searchKB(userQuery, 5),
    ]);

    // Дедупликация по article_id + chunk_index
    const seen = new Set<string>();
    const allResults: KBSearchResult[] = [];
    for (const r of [...resultsByQuery, ...resultsByKw]) {
        const key = `${r.article_id}:${r.chunk_index}`;
        if (!seen.has(key)) {
            seen.add(key);
            allResults.push(r);
        }
    }

    dispatch(setTiming({ agent: 'context', ms: performance.now() - ctxStart }));

    /* ── 2. Агент ранжирования (Chain-of-Rank [7]) ── */
    dispatch(setCurrentAgent('ranking'));
    const rankStart = performance.now();

    // Если чанков мало — пропускаем LLM-ранжирование
    let rankedChunks: KBSearchResult[];
    if (allResults.length <= 3) {
        rankedChunks = allResults;
    } else {
        // Chain-of-Rank: просим LLM отранжировать по релевантности
        const rankPrompt: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: `You are a ranking agent. Given a user question and numbered text chunks, reply ONLY with the numbers of the top 3 most relevant chunks in order, comma-separated. Example: 2,1,5`,
            },
            {
                role: 'user',
                content: `Question: ${userQuery}\n\nChunks:\n${allResults.map((c, i) => `[${i + 1}] ${c.text.slice(0, 200)}`).join('\n')}`,
            },
        ];
        try {
            const rankReply = await generate(rankPrompt, () => {});
            const indices = rankReply
                .replace(/[^0-9,]/g, '')
                .split(',')
                .map((s) => parseInt(s, 10) - 1)
                .filter((i) => i >= 0 && i < allResults.length);
            rankedChunks = indices.length
                ? indices.map((i) => allResults[i])
                : allResults.slice(0, 3);
        } catch {
            rankedChunks = allResults.slice(0, 3);
        }
    }

    dispatch(setRankedChunks(rankedChunks.map((c) => c.text)));
    const rankMs = performance.now() - rankStart;
    dispatch(setTiming({ agent: 'ranking', ms: rankMs }));

    /* ── 3. Агент генерации ── */
    dispatch(setCurrentAgent('generation'));
    const genStart = performance.now();

    const context = buildContextPrompt(rankedChunks);
    const genPrompt: ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: `Ты — ассистент технической поддержки. Отвечай на вопросы ТОЛЬКО на основе предоставленного контекста из базы знаний. Если в контексте нет ответа, скажи об этом честно. Отвечай на русском языке.

Контекст:
${context}`,
        },
        { role: 'user', content: userQuery },
    ];

    const answer = await generate(genPrompt, onChunk);
    dispatch(setGeneratedAnswer(answer));
    const genMs = performance.now() - genStart;
    dispatch(setTiming({ agent: 'generation', ms: genMs }));

    /* ── 4. Агент валидации (SafeChat [16]) ── */
    dispatch(setCurrentAgent('validation'));
    const valStart = performance.now();

    let isFaithful = true;
    try {
        const valPrompt: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content:
                    'You are a fact-checking agent. Given a context and an answer, reply ONLY "yes" if the answer is fully supported by the context, or "no" if it contains unsupported claims.',
            },
            {
                role: 'user',
                content: `Context:\n${context}\n\nAnswer:\n${answer}`,
            },
        ];
        const valReply = await generate(valPrompt, () => {});
        isFaithful = !valReply.toLowerCase().includes('no');
    } catch {
        isFaithful = true; // при ошибке считаем faithful
    }

    dispatch(setFaithful(isFaithful));
    const valMs = performance.now() - valStart;
    dispatch(setTiming({ agent: 'validation', ms: valMs }));

    const totalMs = performance.now() - pipelineStart;
    dispatch(setTotalTiming(totalMs));
    dispatch(setCurrentAgent('idle'));

    /* ── Отправка метрик в Prometheus ── */
    const ctxMs = rankStart - ctxStart;
    try {
        await axios.post('/api/metrics', {
            agent_context_ms: ctxMs,
            agent_ranking_ms: rankMs,
            agent_generation_ms: genMs,
            agent_validation_ms: valMs,
            total_ms: totalMs,
            faithful: isFaithful,
            model: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
        });
    } catch {
        // Prometheus может быть недоступен — не критично
    }

    return {
        answer,
        sources: rankedChunks.map((c) => ({
            article_id: c.article_id,
            article_title: c.article_title,
            score: c.score,
        })),
        faithful: isFaithful,
    };
}
