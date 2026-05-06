import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';

interface UserState {
    email: string;
    username: string;
    isAuthenticated: boolean;
    isStaff: boolean;
    error: string | null;
}

const initialState: UserState = {
    email: '',
    username: '',
    isAuthenticated: false,
    isStaff: false,
    error: null,
};

/** Авторизация */
export const loginUserAsync = createAsyncThunk(
    'user/loginUserAsync',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await api.login.loginCreate(credentials);
            // Бэкенд возвращает {detail: 'logged in', is_staff: true/false}
            const data = response.data as { detail: string; is_staff?: boolean };
            return {
                email: credentials.email,
                isStaff: data.is_staff ?? false,
            };
        } catch {
            return rejectWithValue('Ошибка авторизации');
        }
    }
);

/** Деавторизация */
export const logoutUserAsync = createAsyncThunk(
    'user/logoutUserAsync',
    async (_, { rejectWithValue }) => {
        try {
            await api.logout.logoutCreate();
        } catch {
            return rejectWithValue('Ошибка при выходе');
        }
    }
);

/** Регистрация — Register требует username: string (не optional) */
export const registerUserAsync = createAsyncThunk(
    'user/registerUserAsync',
    async (data: { email: string; password: string; username: string }, { rejectWithValue }) => {
        try {
            await api.register.registerCreate(data);
        } catch {
            return rejectWithValue('Ошибка регистрации');
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loginUserAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(loginUserAsync.fulfilled, (state, action) => {
                state.email = action.payload.email;
                state.username = action.payload.email;
                state.isAuthenticated = true;
                state.isStaff = action.payload.isStaff;
                state.error = null;
            })
            .addCase(loginUserAsync.rejected, (state, action) => {
                state.email = '';
                state.username = '';
                state.isAuthenticated = false;
                state.isStaff = false;
                state.error = action.payload as string;
            })
            .addCase(logoutUserAsync.fulfilled, (state) => {
                state.email = '';
                state.username = '';
                state.isAuthenticated = false;
                state.isStaff = false;
                state.error = null;
            })
            .addCase(registerUserAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(registerUserAsync.fulfilled, (state) => {
                state.error = null;
            })
            .addCase(registerUserAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export default userSlice.reducer;
