import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage, ChatRequest, ChatResponse, ChatErrorResponse } from "@/types/chat";

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const sendMessage = createAsyncThunk<
  ChatMessage,
  string,
  { state: { chat: ChatState }; rejectValue: string }
>("chat/sendMessage", async (prompt, { getState, rejectWithValue }) => {
  const { chat } = getState();

  const requestBody: ChatRequest = {
    prompt,
    history: chat.messages,
  };

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData: ChatErrorResponse = await response.json();
    return rejectWithValue(errorData.error || `Request failed with status ${response.status}`);
  }

  const data: ChatResponse = await response.json();

  const assistantMessage: ChatMessage = {
    id: generateId(),
    role: "assistant",
    content: data.message,
    timestamp: Date.now(),
  };

  return assistantMessage;
});

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addUserMessage(state, action: PayloadAction<string>) {
      state.messages.push({
        id: generateId(),
        role: "user",
        content: action.payload,
        timestamp: Date.now(),
      });
    },
    clearChat(state) {
      state.messages = [];
      state.error = null;
      state.isLoading = false;
    },
    dismissError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Something went wrong. Please try again.";
      });
  },
});

export const { addUserMessage, clearChat, dismissError } = chatSlice.actions;
export default chatSlice.reducer;
