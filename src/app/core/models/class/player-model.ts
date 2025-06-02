// import {  User, Objective, Territory, TerritoryCard } from '../interfaces';
import { GamePlayer } from '../interfaces/game-player';
import { User } from '../interfaces/user';
import { Objective } from '../interfaces/objective';
import { Territory } from '../interfaces/map';
import { TerritoryCard } from '../interfaces/card';
import { PlayerState } from '../../enums/player-state';

export class PlayerGameModel implements GamePlayer {
  id: string;
  user: User;
  color: string;
  objective: Objective;
  status: PlayerState;
  conqueredTerritories: Territory[];
  availableTroops: number;
  cards: TerritoryCard[];
  order: number;

  constructor(data: Partial<PlayerState>) {
    this.id = data.id || '';
    this.user = data.user || {} as User;
    this.color = data.color || this.generateRandomColor();
    this.objective = data.objective || {} as Objective;
    this.status = data.status || PlayerState.WAITING;
    this.conqueredTerritories = data.conqueredTerritories || [];
    this.availableTroops = data.availableTroops || 0;
    this.cards = data.cards || [];
    this.order = data.order || 0;
  }

  private generateRandomColor(): string {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33', '#33FFF5'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  addCard(card: TerritoryCard): void {
    this.cards.push(card);
  }

  exchangeCards(cardIds: string[]): boolean {
    // TODO: Implement card exchange logic
    return true;
  }

  updateStatus(newStatus: PlayerState): void {
    this.status = newStatus;
  }
}
