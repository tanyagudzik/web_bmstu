import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';
import type { SupportRequest } from '../api/Api';

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

/** GET корзина */
export const fetchCart = createAsyncThunk(
    'request/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.supportRequest.supportRequestCartList();
            return response.data;
        } catch {
            return rejectWithValue('Ошибка загрузки корзины');
        }
    }
);

/** GET одна заявка */
export const fetchRequest = createAsyncThunk(
    'request/fetchRequest',
    async (requestId: number, { rejectWithValue }) => {
        try {
            const response = await api.supportRequest.supportRequestRead(String(requestId));
            return response.data;
        } catch {
            return rejectWithValue('Ошибка загрузки заявки');
        }
    }
);

/** POST добавить услугу в заявку */
export const addServiceToRequest = createAsyncThunk(
    'request/addService',
    async (serviceId: number, { rejectWithValue }) => {
        try {
            const response = await api.supportService.supportServiceAddToRequestCreate(String(serviceId));
            return response.data;
        } catch {
            return rejectWithValue('Ошибка добавления услуги');
        }
    }
);

/** DELETE удалить строку из заявки */
export const deleteLineFromRequest = createAsyncThunk(
    'request/deleteLine',
    async ({ rid, serviceId }: { rid: number; serviceId: number }, { rejectWithValue }) => {
        try {
            await api.supportRequest.supportRequestLineDeleteDelete(String(rid), String(serviceId));
            return serviceId;
        } catch {
            return rejectWithValue('Ошибка удаления строки');
        }
    }
);

/** PUT обновить comment в строке м-м */
export const updateLine = createAsyncThunk(
    'request/updateLine',
    async ({ rid, serviceId, comment }: { rid: number; serviceId: number; comment: string }, { rejectWithValue }) => {
        try {
            const response = await api.supportRequest.supportRequestLineUpdate(
                String(rid), String(serviceId), { comment }
            );
            return response.data;
        } catch {
            return rejectWithValue('Ошибка обновления строки');
        }
    }
);

/** PUT сформировать заявку */
export const formRequest = createAsyncThunk(
    'request/form',
    async (rid: number, { rejectWithValue }) => {
        try {
            const response = await api.supportRequest.supportRequestFormUpdate(String(rid));
            return response.data;
        } catch {
            return rejectWithValue('Ошибка формирования заявки');
        }
    }
);

/** DELETE удалить заявку */
export const deleteRequest = createAsyncThunk(
    'request/delete',
    async (rid: number, { rejectWithValue }) => {
        try {
            await api.supportRequest.supportRequestDeleteDelete(String(rid));
            return rid;
        } catch {
            return rejectWithValue('Ошибка удаления заявки');
        }
    }
);

/** PUT изменить поля заявки */
export const updateRequest = createAsyncThunk(
    'request/update',
    async ({ rid, data }: { rid: number; data: { room?: string } }, { rejectWithValue }) => {
        try {
            const response = await api.supportRequest.supportRequestUpdateUpdate(String(rid), data);
            return response.data;
        } catch {
            return rejectWithValue('Ошибка обновления заявки');
        }
    }
);

/** PUT завершить заявку (модератор) */
export const finishRequest = createAsyncThunk(
    'request/finish',
    async (rid: number, { rejectWithValue }) => {
        try {
            const response = await api.supportRequest.supportRequestFinishUpdate(String(rid));
            return response.data;
        } catch {
            return rejectWithValue('Ошибка завершения заявки');
        }
    }
);

/** PUT отклонить заявку (модератор) */
export const rejectRequest = createAsyncThunk(
    'request/reject',
    async (rid: number, { rejectWithValue }) => {
        try {
            const response = await api.supportRequest.supportRequestRejectUpdate(String(rid));
            return response.data;
        } catch {
            return rejectWithValue('Ошибка отклонения заявки');
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
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.draftId = action.payload.request_id ?? null;
                state.draftCount = action.payload.count ?? 0;
            })
            .addCase(fetchRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
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
                state.draftId = action.payload.request_id ?? state.draftId;
                state.draftCount += 1;
            })
            .addCase(deleteLineFromRequest.fulfilled, (state, action) => {
                if (state.currentRequest?.lines) {
                    state.currentRequest.lines = state.currentRequest.lines.filter(
                        (l) => l.service_id !== action.payload
                    );
                }
                state.draftCount = Math.max(0, state.draftCount - 1);
            })
            .addCase(formRequest.fulfilled, (state) => {
                state.draftId = null;
                state.draftCount = 0;
            })
            .addCase(deleteRequest.fulfilled, (state) => {
                state.currentRequest = null;
                state.draftId = null;
                state.draftCount = 0;
            })
            .addCase(updateRequest.fulfilled, (state, action) => {
                state.currentRequest = action.payload;
            })
            .addCase(updateLine.fulfilled, (state, action) => {
                if (state.currentRequest?.lines) {
                    const line = state.currentRequest.lines.find(
                        (l) => l.id === action.payload.id
                    );
                    if (line) {
                        line.comment = action.payload.comment;
                    }
                }
            });
    },
});

export const { clearRequest } = requestSlice.actions;
export default requestSlice.reducer;
