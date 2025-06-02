import { WebSocketMessageType } from "../../enums/web-socket-message-type";

// Interfaces for WebSocket
export interface WebSocketMessage {
  type: WebSocketMessageType;
  content: any;
  gameId?: string;
  sender?: string;
  timestamp: Date;
}

export interface WebSocketResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}
