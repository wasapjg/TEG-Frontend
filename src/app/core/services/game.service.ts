import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, switchMap, takeWhile, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

export interface GameStateDto {
  gameId: number;
  status: string;
  currentPhase: string;
  currentTurn: number;
  currentPlayerName: string;
  currentPlayerId: number;
  players: PlayerInGameDto[];
  territories: { [key: number]: TerritoryDto };
  continents: ContinentDto[];
  recentEvents: GameEventDto[];
  remainingCards: number;
  canEndTurn: boolean;
  isGameOver: boolean;
  winnerName?: string;
}

export interface PlayerInGameDto {
  id: number;
  displayName: string;
  isBot: boolean;
  botLevel?: string;
  status: string;
  color: string;
  armiesToPlace: number;
  seatOrder: number;
  joinedAt: Date;
  territoriesCount: number;
  totalArmies: number;
  cardsCount: number;
  objective?: ObjectiveDto;
}

export interface TerritoryDto {
  id: number;
  name: string;
  continentName: string;
  ownerName?: string;
  armies: number;
  positionX: number;
  positionY: number;
  neighborIds: number[];
  canBeAttacked: boolean;
  canAttack: boolean;
}

export interface ContinentDto {
  id: number;
  name: string;
  bonusArmies: number;
  countries: TerritoryDto[];
  controllerName?: string;
  isControlled: boolean;
  totalCountries: number;
  controlledCountries: number;
}

export interface ObjectiveDto {
  id: number;
  type: string;
  description: string;
  isCommon: boolean;
  isAchieved: boolean;
  progressDescription: string;
}

export interface GameEventDto {
  id: number;
  turnNumber: number;
  actorName: string;
  type: string;
  description: string;
  data: string;
  timestamp: Date;
}

export interface AttackDto {
  attackerCountryId: number;
  defenderCountryId: number;
  playerId: number;
  attackingArmies: number;
  attackerDice: number;
  defenderDice: number;
}

export interface CombatResultDto {
  attackerCountryId: number;
  attackerCountryName: string;
  defenderCountryId: number;
  defenderCountryName: string;
  attackerPlayerName: string;
  defenderPlayerName: string;
  attackerDice: number[];
  defenderDice: number[];
  attackerLosses: number;
  defenderLosses: number;
  territoryConquered: boolean;
  attackerRemainingArmies: number;
  defenderRemainingArmies: number;
}

export interface ReinforcementDto {
  playerId: number;
  reinforcements: { [countryId: number]: number };
  totalArmies: number;
}

export interface FortifyDto {
  playerId: number;
  fromCountryId: number;
  toCountryId: number;
  armies: number;
}

export interface CardTradeDto {
  playerId: number;
  cardIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly API_URL = `${environment.apiUrl}/games`;
  
  // Estado actual del juego
  private gameStateSubject = new BehaviorSubject<GameStateDto | null>(null);
  public gameState$ = this.gameStateSubject.asObservable();
  
  // Últimos eventos del juego
  private gameEventsSubject = new BehaviorSubject<GameEventDto[]>([]);
  public gameEvents$ = this.gameEventsSubject.asObservable();
  
  private isPollingActive = false;
  private currentGameCode: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Obtener estado completo del juego
   */
  getGameState(gameCode: string): Observable<GameStateDto> {
    const options = this.authService.getRequestOptions();
    return this.http.get<GameStateDto>(`${this.API_URL}/${gameCode}/state`, options);
  }

  /**
   * Realizar ataque
   */
  performAttack(gameCode: string, attackData: AttackDto): Observable<CombatResultDto> {
    const options = this.authService.getRequestOptions();
    return this.http.post<CombatResultDto>(`${this.API_URL}/${gameCode}/attack`, attackData, options);
  }

  /**
   * Colocar refuerzos
   */
  placeReinforcements(gameCode: string, reinforcementData: ReinforcementDto): Observable<any> {
    const options = this.authService.getRequestOptions();
    return this.http.post(`${this.API_URL}/${gameCode}/reinforce`, reinforcementData, options);
  }

  /**
   * Reagrupar ejércitos
   */
  fortifyPosition(gameCode: string, fortifyData: FortifyDto): Observable<any> {
    const options = this.authService.getRequestOptions();
    return this.http.post(`${this.API_URL}/${gameCode}/fortify`, fortifyData, options);
  }

  /**
   * Intercambiar cartas
   */
  tradeCards(gameCode: string, tradeData: CardTradeDto): Observable<any> {
    const options = this.authService.getRequestOptions();
    return this.http.post(`${this.API_URL}/${gameCode}/trade-cards`, tradeData, options);
  }

  /**
   * Terminar fase de ataque
   */
  finishAttackPhase(gameCode: string): Observable<any> {
    const options = this.authService.getRequestOptions();
    return this.http.post(`${this.API_URL}/${gameCode}/finish-attack-phase`, {}, options);
  }

  /**
   * Terminar turno
   */
  endTurn(gameCode: string): Observable<any> {
    const options = this.authService.getRequestOptions();
    return this.http.post(`${this.API_URL}/${gameCode}/end-turn`, {}, options);
  }

  /**
   * Colocar ejércitos iniciales
   */
  placeInitialArmies(gameCode: string, placementData: { [countryId: number]: number }): Observable<any> {
    const options = this.authService.getRequestOptions();
    return this.http.post(`${this.API_URL}/${gameCode}/place-initial-armies`, { reinforcements: placementData }, options);
  }

  /**
   * Obtener cartas del jugador
   */
  getPlayerCards(gameCode: string): Observable<any[]> {
    const options = this.authService.getRequestOptions();
    return this.http.get<any[]>(`${this.API_URL}/${gameCode}/player/cards`, options);
  }

  /**
   * Obtener objetivo del jugador
   */
  getPlayerObjective(gameCode: string): Observable<ObjectiveDto> {
    const options = this.authService.getRequestOptions();
    return this.http.get<ObjectiveDto>(`${this.API_URL}/${gameCode}/player/objective`, options);
  }

  /**
   * Iniciar polling del estado del juego
   */
  startGameStatePolling(gameCode: string): void {
    if (this.isPollingActive && this.currentGameCode === gameCode) return;
    
    this.currentGameCode = gameCode;
    this.isPollingActive = true;
    
    interval(environment.ui.polling.gameState).pipe( // Usa configuración del environment
      takeWhile(() => this.isPollingActive),
      switchMap(() => this.getGameState(gameCode)),
      catchError(error => {
        console.error('Error en polling del estado del juego:', error);
        return of(null);
      })
    ).subscribe(gameState => {
      if (gameState) {
        this.gameStateSubject.next(gameState);
        // Actualizar eventos si hay nuevos
        if (gameState.recentEvents) {
          this.gameEventsSubject.next(gameState.recentEvents);
        }
      }
    });
  }

  /**
   * Detener polling
   */
  stopGameStatePolling(): void {
    this.isPollingActive = false;
    this.currentGameCode = null;
  }

  /**
   * Limpiar estado del juego
   */
  clearGameState(): void {
    this.gameStateSubject.next(null);
    this.gameEventsSubject.next([]);
    this.stopGameStatePolling();
  }

  /**
   * Verificar si es el turno del jugador actual
   */
  isCurrentPlayerTurn(): boolean {
    const gameState = this.gameStateSubject.value;
    const currentUser = this.authService.getCurrentUser();
    
    if (!gameState || !currentUser) return false;
    
    const currentPlayer = gameState.players.find(p => 
      p.displayName === currentUser.username && !p.isBot
    );
    
    return currentPlayer?.id === gameState.currentPlayerId;
  }

  /**
   * Obtener el jugador actual
   */
  getCurrentPlayer(): PlayerInGameDto | null {
    const gameState = this.gameStateSubject.value;
    const currentUser = this.authService.getCurrentUser();
    
    if (!gameState || !currentUser) return null;
    
    return gameState.players.find(p => 
      p.displayName === currentUser.username && !p.isBot
    ) || null;
  }

  /**
   * Verificar si se puede realizar una acción específica
   */
  canPerformAction(action: 'attack' | 'reinforce' | 'fortify' | 'trade' | 'endTurn'): boolean {
    const gameState = this.gameStateSubject.value;
    if (!gameState || !this.isCurrentPlayerTurn()) return false;

    switch (action) {
      case 'attack':
        return gameState.currentPhase === 'ATTACK';
      case 'reinforce':
        return gameState.currentPhase === 'REINFORCEMENT';
      case 'fortify':
        return gameState.currentPhase === 'FORTIFY';
      case 'trade':
        return gameState.currentPhase === 'REINFORCEMENT'; // Se puede canjear en fase de refuerzo
      case 'endTurn':
        return gameState.canEndTurn;
      default:
        return false;
    }
  }

  /**
   * Salir del juego
   */
  leaveGame(gameCode: string): Observable<any> {
    const options = this.authService.getRequestOptions();
    return this.http.post(`${this.API_URL}/${gameCode}/leave`, {}, options);
  }
}