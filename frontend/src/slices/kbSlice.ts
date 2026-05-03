// статьи БЗ + семантический поиск

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface KBSearchResult {
    text: string;
    article_id: number;
    article_title: string;
    category: string;
    chunk_index: number;
    score: number;
}

export interface KBArticleImage {
    id: number;
    image_url: string;
    alt_text: string;
    sort_order: number;
}

export interface KBArticle {
    id: number;
    title: string;
    content: string;
    description: string;
    tags: string;
    category: string;
    img_url: string | null;
    images: KBArticleImage[];   // ← ВСЕ картинки статьи
}

interface KBState {
    articles: KBArticle[];
    searchResults: KBSearchResult[];
    searchQuery: string;
    loading: boolean;
    error: string | null;
}

const initialState: KBState = {
    articles: [],
    searchResults: [],
    searchQuery: '',
    loading: false,
    error: null,
};

// Получить все статьи (для отображения списка)
export const fetchKBArticles = createAsyncThunk(
    'kb/fetchArticles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/kb/articles');
            return response.data;
        } catch (error) {
            return rejectWithValue('Ошибка загрузки статей');
        }
    }
);

// Семантический поиск через Redis Vector Search
export const searchKB = createAsyncThunk(
    'kb/search',
    async (query: string, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/kb/search', {
                params: { q: query, top_k: 10 },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue('Ошибка поиска');
        }
    }
);

const kbSlice = createSlice({
    name: 'kb',
    initialState,
    reducers: {
        setSearchQuery(state, action: PayloadAction<string>) {
            state.searchQuery = action.payload;
        },
        clearSearchResults(state) {
            state.searchResults = [];
            state.searchQuery = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // Загрузка статей
            .addCase(fetchKBArticles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchKBArticles.fulfilled, (state, action) => {
                state.loading = false;
                state.articles = action.payload;
            })
            .addCase(fetchKBArticles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Семантический поиск
            .addCase(searchKB.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchKB.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload.results;
            })
            .addCase(searchKB.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setSearchQuery, clearSearchResults } = kbSlice.actions;
export default kbSlice.reducer;