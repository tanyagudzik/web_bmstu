//  история диалога

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    sources?: { article_id: number; article_title: string; score: number }[];
    faithful?: boolean;  // SafeChat [16] — маркировка надёжности
}

interface ChatState {
    messages: ChatMessage[];
    requestId: number | null;  // привязка к заявке инженера
}

const initialState: ChatState = {
    messages: [],
    requestId: null,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setRequestId(state, action: PayloadAction<number | null>) {
            state.requestId = action.payload;
        },
        addMessage(state, action: PayloadAction<ChatMessage>) {
            state.messages.push(action.payload);
        },
        updateLastMessage(state, action: PayloadAction<{ content: string }>) {
            const last = state.messages[state.messages.length - 1];
            if (last && last.role === 'assistant') {
                last.content = action.payload.content;
            }
        },
        setFaithful(state, action: PayloadAction<{ messageId: string; faithful: boolean }>) {
            const msg = state.messages.find(m => m.id === action.payload.messageId);
            if (msg) {
                msg.faithful = action.payload.faithful;
            }
        },
        clearChat(state) {
            state.messages = [];
        },
    },
});

export const {
    setRequestId,
    addMessage,
    updateLastMessage,
    setFaithful,
    clearChat,
} = chatSlice.actions;
export default chatSlice.reducer;