import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from 'axios';

interface RequestLine {
    id: number;
    service_id: number;
    service_name: string;
    eta: string;
    img_url: string;
    comment: string;
    ok: boolean | null;
}

interface SupportRequest {
    id: number;
    created_at: string;
    requested_at: string | null;
    finished_at: string | null;
    room: string | null;
    lines: RequestLine[];
}

interface RequestState {
    currentRequest: SupportRequest | null;
    draftId: number | null;
    draftCount: number;
    loading: boolean;
    error: string | null;
}

const initialState: RequestState = {
    currentRequest: null,
    draftId: null,
    draftCount: 0,
    loading: false,
    error: null,
};

export const fetchCart = createAsyncThunk(
    'request/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/support_request/cart');
            return response.data;
        } catch {
            return rejectWithValue('Ошибка загрузки корзины');
        }
    }
);

export const fetchRequest = createAsyncThunk(
    'request/fetchRequest',
    async (requestId: number, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/api/support_request/${requestId}`);
            return response.data;
        } catch {
            return rejectWithValue('Ошибка загрузки заявки');
        }
    }
);

export const addServiceToRequest = createAsyncThunk(
    'request/addService',
    async (serviceId: number, { rejectWithValue }) => {
        try {
            const response = await axios.post(`/api/support_service/${serviceId}/add_to_request`);
            return response.data;
        } catch {
            return rejectWithValue('Ошибка добавления услуги');
        }
    }
);

const requestSlice = createSlice({
    name: 'request',
    initialState,
    reducers: {
        clearRequest(state) {
            state.currentRequest = null;
            state.draftId = null;
            state.draftCount = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.draftId = action.payload.request_id;
                state.draftCount = action.payload.count;
            })
            .addCase(fetchRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.currentRequest = action.payload;
            })
            .addCase(fetchRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addServiceToRequest.fulfilled, (state, action) => {
                state.draftId = action.payload.request_id;
                state.draftCount += 1;
            });
    },
});

export const { clearRequest } = requestSlice.actions;
export default requestSlice.reducer;