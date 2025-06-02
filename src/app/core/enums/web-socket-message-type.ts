// WebSocket message type enums
export enum WebSocketMessageType {
  // Connection messages
  CONNECT = 'CONNECT',
  DISCONNECT = 'DISCONNECT',
  ERROR = 'ERROR',
  
  // Game messages
  CREATE_GAME = 'CREATE_GAME',
  JOIN_GAME = 'JOIN_GAME',
  LEAVE_GAME = 'LEAVE_GAME',
  UPDATE_GAME = 'UPDATE_GAME',
  START_GAME = 'START_GAME',
  PAUSE_GAME = 'PAUSE_GAME',
  RESUME_GAME = 'RESUME_GAME',
  
  // Gameplay messages
  GAME_ACTION = 'GAME_ACTION',
  UPDATE_MAP = 'UPDATE_MAP',
  TURN_CHANGE = 'TURN_CHANGE',
  DICE_RESULT = 'DICE_RESULT',
  NEW_EVENT = 'NEW_EVENT',
  
  // Chat messages
  CHAT_MESSAGE = 'CHAT_MESSAGE'
}
