export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatRequest {
  prompt: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  message: string;
}

export interface ChatErrorResponse {
  error: string;
}

export interface StreamChunk {
  content?: string;
  error?: string;
}
