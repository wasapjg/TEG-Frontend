// src/app/features/lobby/services/lobby.service.ts (SIMPLIFICADO)
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { BotLevel } from '../../../core/enums/BotLevel';
import { BotStrategy } from '../../../core/enums/BotStrategy';

// DTOs básicos
export interface GameCreationDto {
  createdByUserId: number;
  maxPlayers: number;
  turnTimeLimit: number;
  chatEnabled: boolean;
  pactsAllowed: boolean;
}

export interface GameJoinDto {
  userId: number;
  gameCode: string;
}

export interface GameResponseDto {
  id: number;
  gameCode: string;
  createdByUsername: string;
  status: string;
  maxPlayers: number;
  turnTimeLimit: number;
  chatEnabled: boolean;
  pactsAllowed: boolean;
  players: any[];
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

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  private readonly API_URL = `${environment.apiUrl}/games`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Obtener headers básicos (sin session compleja)
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  /**
   * Crear nueva partida
   */
  createGame(gameData: GameCreationDto): Observable<GameResponseDto> {
    return this.http.post<GameResponseDto>(this.API_URL, gameData, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtener juegos disponibles
   */
  getAvailableGames(): Observable<GameResponseDto[]> {
    return this.http.get<GameResponseDto[]>(`${this.API_URL}/available`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener juego por código
   */
  getGameByCode(gameCode: string): Observable<GameResponseDto> {
    return this.http.get<GameResponseDto>(`${this.API_URL}/code/${gameCode}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Unirse a partida
   */
  joinGame(joinData: GameJoinDto): Observable<GameResponseDto> {
    return this.http.post<GameResponseDto>(`${this.API_URL}/${joinData.gameCode}/join`, joinData, {
      headers: this.getHeaders()
    });
  }

  /**
   * Inicializar juego
   */
  initGame(initData: GameInitDto): Observable<GameResponseDto> {
    return this.http.put<GameResponseDto>(`${this.API_URL}/${initData.gameCode}/init`, initData, {
      headers: this.getHeaders()
    });
  }

  /**
   * Agregar bots
   */
  addBotsToGame(addBotsData: AddBotsDto): Observable<GameResponseDto> {
    return this.http.post<GameResponseDto>(`${this.API_URL}/${addBotsData.gameCode}/add-bots`, addBotsData, {
      headers: this.getHeaders()
    });
  }

  /**
   * Iniciar partida
   */
  startGame(gameCode: string): Observable<GameResponseDto> {
    return this.http.post<GameResponseDto>(`${this.API_URL}/${gameCode}/start`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Salir de partida
   */
  leaveGame(gameCode: string): Observable<any> {
    return this.http.post(`${this.API_URL}/${gameCode}/leave`, {}, {
      headers: this.getHeaders()
    });
  }
}