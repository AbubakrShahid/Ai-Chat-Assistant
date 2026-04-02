import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage, Conversation } from "@/types/chat";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sidebarOpen: boolean;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createNewConversation(): Conversation {
  return {
    id: generateId(),
    title: "New Chat",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  isLoading: false,
  isStreaming: false,
  error: null,
  sidebarOpen: true,
};

function ensureConversations(state: ChatState): Conversation[] {
  if (!Array.isArray(state.conversations)) {
    state.conversations = [];
  }
  return state.conversations;
}

function getActiveConversation(state: ChatState): Conversation | undefined {
  const conversations = ensureConversations(state);
  return conversations.find((c) => c.id === state.activeConversationId);
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    createConversation(state) {
      ensureConversations(state);
      const conversation = createNewConversation();
      state.conversations.unshift(conversation);
      state.activeConversationId = conversation.id;
      state.error = null;
      state.isLoading = false;
      state.isStreaming = false;
    },

    setActiveConversation(state, action: PayloadAction<string>) {
      state.activeConversationId = action.payload;
      state.error = null;
      state.isLoading = false;
      state.isStreaming = false;
    },

    deleteConversation(state, action: PayloadAction<string>) {
      ensureConversations(state);
      state.conversations = state.conversations.filter(
        (c) => c.id !== action.payload
      );
      if (state.activeConversationId === action.payload) {
        if (state.conversations.length > 0) {
          state.activeConversationId = state.conversations[0].id;
        } else {
          const conversation = createNewConversation();
          state.conversations.push(conversation);
          state.activeConversationId = conversation.id;
        }
      }
    },

    updateConversationTitle(
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) {
      const conversation = ensureConversations(state).find(
        (c) => c.id === action.payload.id
      );
      if (conversation) {
        conversation.title = action.payload.title;
      }
    },

    addUserMessage(state, action: PayloadAction<string>) {
      const conversation = getActiveConversation(state);
      if (!conversation) return;

      conversation.messages.push({
        id: generateId(),
        role: "user",
        content: action.payload,
        timestamp: Date.now(),
      });
      conversation.updatedAt = Date.now();
      state.isLoading = true;
      state.error = null;
    },

    startStreaming(state) {
      const conversation = getActiveConversation(state);
      if (!conversation) return;

      conversation.messages.push({
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      });
      state.isLoading = false;
      state.isStreaming = true;
    },

    appendStreamChunk(state, action: PayloadAction<string>) {
      const conversation = getActiveConversation(state);
      if (!conversation) return;

      const lastMessage =
        conversation.messages[conversation.messages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        lastMessage.content += action.payload;
      }
    },

    finishStreaming(state) {
      state.isStreaming = false;
      const conversation = getActiveConversation(state);
      if (conversation) {
        conversation.updatedAt = Date.now();
      }
    },

    setStreamError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.isStreaming = false;
      state.error = action.payload;

      const conversation = getActiveConversation(state);
      if (conversation) {
        const lastMessage =
          conversation.messages[conversation.messages.length - 1];
        if (
          lastMessage &&
          lastMessage.role === "assistant" &&
          lastMessage.content === ""
        ) {
          conversation.messages.pop();
        }
      }
    },

    clearConversation(state) {
      const conversation = getActiveConversation(state);
      if (conversation) {
        conversation.messages = [];
        conversation.title = "New Chat";
        conversation.updatedAt = Date.now();
      }
      state.error = null;
      state.isLoading = false;
      state.isStreaming = false;
    },

    dismissError(state) {
      state.error = null;
    },

    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
  },
});

export const {
  createConversation,
  setActiveConversation,
  deleteConversation,
  updateConversationTitle,
  addUserMessage,
  startStreaming,
  appendStreamChunk,
  finishStreaming,
  setStreamError,
  clearConversation,
  dismissError,
  toggleSidebar,
  setSidebarOpen,
} = chatSlice.actions;

export default chatSlice.reducer;
