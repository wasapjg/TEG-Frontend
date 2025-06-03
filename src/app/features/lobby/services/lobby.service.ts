import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, switchMap, takeWhile, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { BotLevel } from '../../../core/enums/BotLevel';
import { BotStrategy } from '../../../core/enums/BotStrategy';

// DTOs para requests
export interface GameCreationDto {
  createdByUserId: number;
  maxPlayers: number;
  turnTimeLimit: number; // en minutos
  chatEnabled: boolean;
  pactsAllowed: boolean;
  gameCode?: string; // opcional, se genera automáticamente
}

export interface GameJoinDto {
  userId: number;
  gameCode: string;
}

export interface AddBotsDto {
  gameCode: string;
  count: number;
  botLevel: BotLevel;
  botStrategy: BotStrategy;
}

export interface GameInitDto {
  gameCode: string;
  maxPlayers: number;
  turnTimeLimit: number;
  chatEnabled: boolean;
  pactsAllowed: boolean;
}

// DTO para responses del backend
export interface GameResponseDto {
  id: number;
  gameCode: string;
  createdByUsername: string;
  status: string;
  currentPhase?: string;
  currentTurn?: number;
  currentPlayerIndex?: number;
  maxPlayers: number;
  turnTimeLimit: number;
  chatEnabled: boolean;
  pactsAllowed: boolean;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  players: PlayerResponseDto[];
  currentPlayerName?: string;
}

// DTO para jugadores del backend
export interface PlayerResponseDto {
  id: string;
  userId?: string;
  username: string;
  displayName: string;
  isBot: boolean;
  botLevel?: string;
  status: string;
  color: string;
  seatOrder: number;
  joinedAt: Date;
  territoriesCount: number;
  totalArmies: number;
  cardsCount: number;
  armiesToPlace: number;
}

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  private readonly API_URL = `${environment.apiUrl}/games`;
  
  // Subject para mantener la lista de juegos disponibles
  private availableGamesSubject = new BehaviorSubject<GameResponseDto[]>([]);
  public availableGames$ = this.availableGamesSubject.asObservable();
  
  // Subject para el juego actual
  private currentGameSubject = new BehaviorSubject<GameResponseDto | null>(null);
  public currentGame$ = this.currentGameSubject.asObservable();
  
  private isPollingActive = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Crear una nueva partida
   */
  createGame(gameData: GameCreationDto): Observable<GameResponseDto> {
    const options = this.authService.getRequestOptions();
    return this.http.post<GameResponseDto>(this.API_URL, gameData, options);
  }

  /**
   * Obtener lista de juegos disponibles
   */
  getAvailableGames(): Observable<GameResponseDto[]> {
    const options = this.authService.getRequestOptions();
    return this.http.get<GameResponseDto[]>(`${this.API_URL}/available`, options);
  }

  /**
   * Obtener un juego por código
   */
  getGameByCode(gameCode: string): Observable<GameResponseDto> {
    const options = this.authService.getRequestOptions();
    return this.http.get<GameResponseDto>(`${this.API_URL}/code/${gameCode}`, options);
  }

  /**
   * Unirse a una partida
   */
  joinGame(joinData: GameJoinDto): Observable<GameResponseDto> {
    const options = this.authService.getRequestOptions();
    return this.http.post<GameResponseDto>(`${this.API_URL}/${joinData.gameCode}/join`, joinData, options);
  }

  /**
   * Salir de una partida
   */
  leaveGame(gameCode: string): Observable<any> {
    const options = this.authService.getRequestOptions();
    return this.http.post(`${this.API_URL}/${gameCode}/leave`, {}, options);
  }

  /**
   * Inicializar configuraciones del juego (antes de empezar)
   */
  initGame(initData: GameInitDto): Observable<GameResponseDto> {
    const options = this.authService.getRequestOptions();
    return this.http.put<GameResponseDto>(`${this.API_URL}/${initData.gameCode}/init`, initData, options);
  }

  /**
   * Agregar bots a la partida
   */
  addBotsToGame(addBotsData: AddBotsDto): Observable<GameResponseDto> {
    const options = this.authService.getRequestOptions();
    return this.http.post<GameResponseDto>(`${this.API_URL}/${addBotsData.gameCode}/add-bots`, addBotsData, options);
  }

  /**
   * Iniciar la partida (solo el host)
   */
  startGame(gameCode: string): Observable<GameResponseDto> {
    const options = this.authService.getRequestOptions();
    return this.http.post<GameResponseDto>(`${this.API_URL}/${gameCode}/start`, {}, options);
  }

  /**
   * Iniciar polling para actualizar la lista de juegos disponibles
   */
  startAvailableGamesPolling(): void {
    if (this.isPollingActive) return;
    
    this.isPollingActive = true;
    
    interval(5000).pipe(
      takeWhile(() => this.isPollingActive),
      switchMap(() => this.getAvailableGames()),
      catchError(error => {
        console.error('Error en polling de juegos disponibles:', error);
        return of([]);
      })
    ).subscribe(games => {
      this.availableGamesSubject.next(games);
    });
  }

  /**
   * Iniciar polling para un juego específico
   */
  startGamePolling(gameCode: string): void {
    if (this.isPollingActive) return;
    
    this.isPollingActive = true;
    
    interval(2000).pipe(
      takeWhile(() => this.isPollingActive),
      switchMap(() => this.getGameByCode(gameCode)),
      catchError(error => {
        console.error('Error en polling del juego:', error);
        return of(null);
      })
    ).subscribe(game => {
      if (game) {
        this.currentGameSubject.next(game);
      }
    });
  }

  /**
   * Detener polling
   */
  stopPolling(): void {
    this.isPollingActive = false;
  }

  /**
   * Limpiar datos del servicio
   */
  clearData(): void {
    this.availableGamesSubject.next([]);
    this.currentGameSubject.next(null);
    this.stopPolling();
  }

  /**
   * Verificar si el usuario puede unirse a un juego
   */
  canJoinGame(game: GameResponseDto): boolean {
    return game.status === 'WAITING_FOR_PLAYERS' && 
           game.players.length < game.maxPlayers;
  }

  /**
   * Verificar si el usuario es el host del juego
   */
  isGameHost(game: GameResponseDto): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.username === game.createdByUsername;
  }
}