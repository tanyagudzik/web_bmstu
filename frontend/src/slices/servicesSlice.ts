import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';
import type { SupportService } from '../api/Api';
import { services as SERVICES_MOCK } from '../mocks/services';

interface ServicesState {
    searchValue: string;
    services: SupportService[];
    loading: boolean;
    error: string | null;
}

const initialState: ServicesState = {
    searchValue: '',
    services: [],
    loading: false,
    error: null,
};

/** Получение списка услуг через кодогенерированный Api.ts (ЛР7 — redux-thunk + кодогенерация) */
export const getServicesList = createAsyncThunk(
    'services/getServicesList',
    async (_, { getState, rejectWithValue }) => {
        const { services } = getState() as { services: ServicesState };
        try {
            const response = await api.supportServices.supportServicesList(
                { q: services.searchValue || undefined },
            );
            return response.data;
        } catch {
            return rejectWithValue('Ошибка при загрузке услуг');
        }
    }
);

const servicesSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {
        setSearchValue(state, action: PayloadAction<string>) {
            state.searchValue = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getServicesList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getServicesList.fulfilled, (state, action) => {
                state.loading = false;
                state.services = action.payload;
            })
            .addCase(getServicesList.rejected, (state) => {
                state.loading = false;
                // Fallback на моки при недоступности бэкенда (требование ЛР6)
                state.services = SERVICES_MOCK.map((m) => ({
                    id: m.id,
                    title: m.title,
                    description: m.desc,
                    eta: m.eta,
                    img_url: m.img || null,
                } as unknown as SupportService));
            });
    },
});

export const { setSearchValue } = servicesSlice.actions;
export default servicesSlice.reducer;
