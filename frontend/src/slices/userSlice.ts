import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

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

export const loginUserAsync = createAsyncThunk(
    'user/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/login', credentials);
            return response.data;
        } catch {
            return rejectWithValue('Ошибка авторизации');
        }
    }
);

export const logoutUserAsync = createAsyncThunk(
    'user/logout',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/logout');
            return response.data;
        } catch {
            return rejectWithValue('Ошибка при выходе');
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
            .addCase(loginUserAsync.fulfilled, (state) => {
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUserAsync.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isAuthenticated = false;
            })
            .addCase(logoutUserAsync.fulfilled, (state) => {
                state.email = '';
                state.username = '';
                state.isAuthenticated = false;
                state.isStaff = false;
                state.error = null;
            });
    },
});

export default userSlice.reducer;