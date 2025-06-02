import { GameState } from "../../enums/game-state";
import { Game } from "../interfaces/game";
import { PlayerModel } from "./player-model";
import { GameOptions } from "../interfaces/game";
import { GameMap } from "../interfaces/map";
import { GameEvent } from "../interfaces/event";
import { GameAction } from "../interfaces/action";
import { GameTurn } from "../interfaces/turn";
import { TurnPhase } from "../../enums/turn-phase";
import { Territory } from "../interfaces/map";
import { ActionType } from "../../enums/action-type";
import { EventType } from "../../enums/event-type";
import { ChatMessage } from "../interfaces/chat";



export class GameModel implements Game {
  id: string;
  code: string;
  name: string;
  creator: string;
  creationDate: Date;
  state: GameState;
  players: PlayerModel[];
  options: GameOptions;
  map: GameMap;
  currentTurn: GameTurn;
  eventHistory: GameEvent[];
  chat: ChatMessage[];

  constructor(data: Partial<Game>) {
    this.id = data.id || '';
    this.code = data.code || this.generateCode();
    this.name = data.name || '';
    this.creator = data.creator || '';
    this.creationDate = data.creationDate || new Date();
    this.state = data.state || GameState.WAITING_FOR_PLAYERS;
    this.players = data.players || [];
    this.options = data.options || {
      maxPlayers: 6,
      turnTime: 60,
      chatEnabled: true,
      specialRules: []
    };
    this.map = data.map || {
      continents: [],
      territories: [],
      connections: []
    };
    this.currentTurn = data.currentTurn || {
      playerId: '',
      phase: TurnPhase.DEPLOYMENT,
      remainingTime: this.options.turnTime,
      availableActions: [],
      troopsToDeploy: 0
    };
    this.eventHistory = data.eventHistory || [];
    this.chat = data.chat || [];
  }

  private generateCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  addPlayer(player: PlayerModel): boolean {
    if (this.players.length < this.options.maxPlayers &&
        this.state === GameState.WAITING_FOR_PLAYERS) {
      this.players.push(player);
      return true;
    }
    return false;
  }

  startGame(): boolean {
    if (this.players.length >= 2 && this.state === GameState.WAITING_FOR_PLAYERS) {
      this.state = GameState.IN_PROGRESS;
      this.assignTurnOrder();
      this.assignObjectives();
      this.registerEvent({
        id: Date.now().toString(),
        timestamp: new Date(),
        type: EventType.GAME_START,
        playerId: this.creator,
        details: { players: this.players.length },
        message: `Game started with ${this.players.length} players`
      });
      this.startTurn(this.players[0].id);
      return true;
    }
    return false;
  }

  private assignTurnOrder(): void {
    for (let i = this.players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
    }
    this.players.forEach((player, index) => player.order = index);
  }

  private assignObjectives(): void {
    // TODO: Implement game-specific objective assignment
  }

  startTurn(playerId: string): void {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;

    this.currentTurn = {
      playerId,
      phase: TurnPhase.DEPLOYMENT,
      remainingTime: this.options.turnTime,
      availableActions: [{ type: ActionType.DEPLOY_TROOPS }],
      troopsToDeploy: this.calculateNewTroops(player)
    };

    this.registerEvent({
      id: Date.now().toString(),
      timestamp: new Date(),
      type: EventType.NEW_TURN,
      playerId,
      details: { phase: TurnPhase.DEPLOYMENT },
      message: `Turn for ${player.user.name}. Deployment phase.`
    });
  }

  private calculateNewTroops(player: PlayerModel): number {
    // TODO: Implement troop calculation logic
    return 3;
  }

  executeAction(action: GameAction, playerId: string): boolean {
    if (this.currentTurn.playerId !== playerId) return false;

    switch (action.type) {
      case ActionType.DEPLOY_TROOPS: return this.deployTroops(action, playerId);
      case ActionType.ATTACK: return this.attackTerritory(action, playerId);
      case ActionType.MOVE_TROOPS: return this.moveTroops(action, playerId);
      case ActionType.END_PHASE: return this.endPhase(playerId);
      case ActionType.END_TURN: return this.endTurn(playerId);
      default: return false;
    }
  }

  private deployTroops(action: GameAction, playerId: string): boolean {
    // TODO: Implement deploy troops logic
    return true;
  }

  private attackTerritory(action: GameAction, playerId: string): boolean {
    // TODO: Implement attack logic
    return true;
  }

  private moveTroops(action: GameAction, playerId: string): boolean {
    // TODO: Implement move troops logic
    return true;
  }

  private endPhase(playerId: string): boolean {
    // TODO: Implement phase transition
    return true;
  }

  private endTurn(playerId: string): boolean {
    // TODO: Implement turn rotation
    return true;
  }

  pauseGame(): void {
    if (this.state === GameState.IN_PROGRESS) {
      this.state = GameState.PAUSED;
      this.registerEvent({
        id: Date.now().toString(),
        timestamp: new Date(),
        type: EventType.GENERIC,
        playerId: '',
        details: {},
        message: 'Game has been paused'
      });
    }
  }

  resumeGame(): void {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.IN_PROGRESS;
      this.registerEvent({
        id: Date.now().toString(),
        timestamp: new Date(),
        type: EventType.GENERIC,
        playerId: '',
        details: {},
        message: 'Game has been resumed'
      });
    }
  }

  endGame(winnerId?: string): void {
    this.state = GameState.FINISHED;
    this.registerEvent({
      id: Date.now().toString(),
      timestamp: new Date(),
      type: EventType.GAME_END,
      playerId: winnerId || '',
      details: { winner: winnerId },
      message: winnerId
        ? `Player ${this.players.find(p => p.id === winnerId)?.user.name} has won!`
        : 'Game ended'
    });
  }

  registerEvent(event: GameEvent): void {
    this.eventHistory.push(event);
  }

  sendChatMessage(message: ChatMessage): void {
    if (this.options.chatEnabled) {
      this.chat.push(message);
    }
  }

  getPlayer(playerId: string): PlayerModel | undefined {
    return this.players.find(p => p.id === playerId);
  }

  getTerritoriesByPlayer(playerId: string): Territory[] {
    return this.map.territories.filter(t => t.ownerId === playerId);
  }

  checkVictory(): string | null {
    for (const player of this.players) {
      if (this.hasCompletedObjective(player)) {
        return player.id;
      }
    }
    return null;
  }

  private hasCompletedObjective(player: PlayerModel): boolean {
    // TODO: Implement victory condition logic
    return false;
  }
}
