import { combineReducers, configureStore } from '@reduxjs/toolkit';
import kbReducer from './slices/kbSlice';
import userReducer from './slices/userSlice';
import requestReducer from './slices/requestSlice';
import chatReducer from './slices/chatSlice';
import agentReducer from './slices/agentSlice';

const store = configureStore({
    reducer: combineReducers({
        kb: kbReducer,
        user: userReducer,
        request: requestReducer,
        chat: chatReducer,
        agent: agentReducer,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;