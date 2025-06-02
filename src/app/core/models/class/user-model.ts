
  
import { NotificationSettings, User } from '../interfaces/user';
import { ChatMessage } from '../interfaces/chat';

export class UserModel implements User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  gamesPlayed: number = 0;
  gamesWon: number = 0;
  notificationSettings: NotificationSettings;

  constructor(data: Partial<User>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.email = data.email || '';
    this.avatar = data.avatar || '';
    this.gamesPlayed = data.gamesPlayed || 0;
    this.gamesWon = data.gamesWon || 0;
    this.notificationSettings = data.notificationSettings || {
      turn: true,
      attack: true,
      chatMessage: true,
      gameEnd: true,
      soundEnabled: true
    };
  }

  updateProfile(name: string, avatar: string): void {
    this.name = name;
    this.avatar = avatar;
  }

  updateNotificationSettings(config: NotificationSettings): void {
    this.notificationSettings = { ...config };
  }

  registerGamePlayed(won: boolean): void {
    this.gamesPlayed++;
    if (won) {
      this.gamesWon++;
    }
  }
}
