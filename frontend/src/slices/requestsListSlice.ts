import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';
import type { SupportRequest } from '../api/Api';

interface RequestsListState {
    requests: SupportRequest[];
    loading: boolean;
    error: string | null;
    /* бэкенд-фильтры */
    statusFilter: string;
    dateFrom: string;
    dateTo: string;
    /* фронтенд-фильтр */
    creatorFilter: string;
}

const initialState: RequestsListState = {
    requests: [],
    loading: false,
    error: null,
    statusFilter: '',
    dateFrom: '',
    dateTo: '',
    creatorFilter: '',
};

/** GET список заявок с бэкенд-фильтрами */
export const getRequestsList = createAsyncThunk(
    'requestsList/getRequestsList',
    async (
        params: { status?: string; date_from?: string; date_to?: string },
        { rejectWithValue },
    ) => {
        try {
            const query: Record<string, string> = {};
            if (params.status) query.status = params.status;
            if (params.date_from) query.date_from = params.date_from;
            if (params.date_to) query.date_to = params.date_to;
            const response = await api.supportRequests.supportRequestsList(query);
            return response.data;
        } catch {
            return rejectWithValue('Ошибка загрузки списка заявок');
        }
    },
);

const requestsListSlice = createSlice({
    name: 'requestsList',
    initialState,
    reducers: {
        setStatusFilter(state, action: PayloadAction<string>) {
            state.statusFilter = action.payload;
        },
        setDateFrom(state, action: PayloadAction<string>) {
            state.dateFrom = action.payload;
        },
        setDateTo(state, action: PayloadAction<string>) {
            state.dateTo = action.payload;
        },
        setCreatorFilter(state, action: PayloadAction<string>) {
            state.creatorFilter = action.payload;
        },
        clearRequestsList(state) {
            state.requests = [];
            state.statusFilter = '';
            state.dateFrom = '';
            state.dateTo = '';
            state.creatorFilter = '';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getRequestsList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRequestsList.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload;
            })
            .addCase(getRequestsList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setStatusFilter,
    setDateFrom,
    setDateTo,
    setCreatorFilter,
    clearRequestsList,
} = requestsListSlice.actions;

export default requestsListSlice.reducer;
