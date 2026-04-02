export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
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
