// состояние мультиагентного конвейера

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type AgentName = 'context' | 'ranking' | 'generation' | 'validation' | 'idle';

interface AgentState {
    currentAgent: AgentName;
    modelLoaded: string | null;     // название загруженной модели
    modelLoading: boolean;
    contextResult: string | null;   // результат агента контекста
    rankedChunks: string[] | null;  // результат Chain-of-Rank
    generatedAnswer: string | null; // ответ агента генерации
    isFaithful: boolean | null;     // результат агента валидации
    timings: {
        context_ms: number | null;
        ranking_ms: number | null;
        generation_ms: number | null;
        validation_ms: number | null;
        total_ms: number | null;
    };
}

const initialState: AgentState = {
    currentAgent: 'idle',
    modelLoaded: null,
    modelLoading: false,
    contextResult: null,
    rankedChunks: null,
    generatedAnswer: null,
    isFaithful: null,
    timings: {
        context_ms: null,
        ranking_ms: null,
        generation_ms: null,
        validation_ms: null,
        total_ms: null,
    },
};

const agentSlice = createSlice({
    name: 'agent',
    initialState,
    reducers: {
        setCurrentAgent(state, action: PayloadAction<AgentName>) {
            state.currentAgent = action.payload;
        },
        setModelLoaded(state, action: PayloadAction<string>) {
            state.modelLoaded = action.payload;
            state.modelLoading = false;
        },
        setModelLoading(state, action: PayloadAction<boolean>) {
            state.modelLoading = action.payload;
        },
        setContextResult(state, action: PayloadAction<string>) {
            state.contextResult = action.payload;
        },
        setRankedChunks(state, action: PayloadAction<string[]>) {
            state.rankedChunks = action.payload;
        },
        setGeneratedAnswer(state, action: PayloadAction<string>) {
            state.generatedAnswer = action.payload;
        },
        setFaithful(state, action: PayloadAction<boolean>) {
            state.isFaithful = action.payload;
        },
        setTiming(state, action: PayloadAction<{ agent: string; ms: number }>) {
            const key = `${action.payload.agent}_ms` as keyof typeof state.timings;
            if (key in state.timings) {
                state.timings[key] = action.payload.ms;
            }
        },
        setTotalTiming(state, action: PayloadAction<number>) {
            state.timings.total_ms = action.payload;
        },
        resetAgentPipeline(state) {
            state.currentAgent = 'idle';
            state.contextResult = null;
            state.rankedChunks = null;
            state.generatedAnswer = null;
            state.isFaithful = null;
            state.timings = initialState.timings;
        },
    },
});

export const {
    setCurrentAgent,
    setModelLoaded,
    setModelLoading,
    setContextResult,
    setRankedChunks,
    setGeneratedAnswer,
    setFaithful,
    setTiming,
    setTotalTiming,
    resetAgentPipeline,
} = agentSlice.actions;
export default agentSlice.reducer;