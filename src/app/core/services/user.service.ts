import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService, UserResponseDto, UserUpdateDto } from './auth.service';

export interface UserStatsDto {
  username: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  bestStreak: number;
  currentStreak: number;
  favoriteStrategy: string;
  totalPlayTime: number; // en minutos
}

export interface GameHistoryDto {
  id: string;
  date: Date;
  duration: number; // en minutos
  result: 'VICTORY' | 'DEFEAT' | 'FORFEIT' | 'DRAW';
  players: string[];
  winner?: string;
  statistics: GameStatisticsDto;
}

export interface GameStatisticsDto {
  conqueredTerritories: number;
  troopsEliminated: number;
  controlledContinents: number;
  exchangedCards: number;
  attacksPerformed: number;
}

export interface UserProfileDto {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/user`;
  
  // Subject para estadísticas del usuario
  private userStatsSubject = new BehaviorSubject<UserStatsDto | null>(null);
  public userStats$ = this.userStatsSubject.asObservable();
  
  // Subject para historial de partidas
  private gameHistorySubject = new BehaviorSubject<GameHistoryDto[]>([]);
  public gameHistory$ = this.gameHistorySubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Obtener perfil completo del usuario actual
   */
  getCurrentUserProfile(): Observable<UserProfileDto> {
    const options = this.authService.getRequestOptions();
    return this.http.get<UserProfileDto>(`${this.API_URL}/profile`, options);
  }

  /**
   * Actualizar perfil del usuario
   */
  updateUserProfile(updateData: UserUpdateDto): Observable<UserResponseDto> {
    const options = this.authService.getRequestOptions();
    return this.http.put<UserResponseDto>(`${this.API_URL}/profile`, updateData, options);
  }

  /**
   * Cambiar contraseña
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const options = this.authService.getRequestOptions();
    const passwordData = {
      currentPassword,
      newPassword
    };
    return this.http.put(`${this.API_URL}/change-password`, passwordData, options);
  }

  /**
   * Obtener estadísticas del usuario
   */
  getUserStatistics(userId?: string): Observable<UserStatsDto> {
    const options = this.authService.getRequestOptions();
    const url = userId ? `${this.API_URL}/${userId}/stats` : `${this.API_URL}/stats`;
    return this.http.get<UserStatsDto>(url, options);
  }

  /**
   * Obtener historial de partidas
   */
  getGameHistory(page: number = 0, size: number = 20): Observable<GameHistoryDto[]> {
    const options = this.authService.getRequestOptions();
    const params = { page: page.toString(), size: size.toString() };
    return this.http.get<GameHistoryDto[]>(`${this.API_URL}/game-history`, { ...options, params });
  }

  /**
   * Obtener partida específica del historial
   */
  getGameDetails(gameId: string): Observable<GameHistoryDto> {
    const options = this.authService.getRequestOptions();
    return this.http.get<GameHistoryDto>(`${this.API_URL}/game-history/${gameId}`, options);
  }

  /**
   * Obtener ranking global de usuarios
   */
  getGlobalRanking(limit: number = 100): Observable<UserStatsDto[]> {
    const options = this.authService.getRequestOptions();
    const params = { limit: limit.toString() };
    return this.http.get<UserStatsDto[]>(`${this.API_URL}/ranking`, { ...options, params });
  }

  /**
   * Buscar usuarios por nombre
   */
  searchUsers(username: string): Observable<UserProfileDto[]> {
    const options = this.authService.getRequestOptions();
    const params = { username };
    return this.http.get<UserProfileDto[]>(`${this.API_URL}/search`, { ...options, params });
  }

  /**
   * Obtener perfil de otro usuario (público)
   */
  getUserProfile(userId: string): Observable<UserProfileDto> {
    const options = this.authService.getRequestOptions();
    return this.http.get<UserProfileDto>(`${this.API_URL}/${userId}/profile`, options);
  }

  /**
   * Subir avatar
   */
  uploadAvatar(file: File): Observable<any> {
    const options = this.authService.getRequestOptions();
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Remover Content-Type header para FormData
    const uploadOptions = { ...options };
    if (uploadOptions.headers) {
      uploadOptions.headers = uploadOptions.headers.delete('Content-Type');
    }
    
    return this.http.post(`${this.API_URL}/avatar`, formData, uploadOptions);
  }

  /**
   * Eliminar avatar
   */
  deleteAvatar(): Observable<any> {
    const options = this.authService.getRequestOptions();
    return this.http.delete(`${this.API_URL}/avatar`, options);
  }

  /**
   * Cargar estadísticas del usuario actual
   */
  loadCurrentUserStats(): void {
    this.getUserStatistics().subscribe({
      next: (stats) => {
        this.userStatsSubject.next(stats);
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
        this.userStatsSubject.next(null);
      }
    });
  }

  /**
   * Cargar historial de partidas del usuario actual
   */
  loadGameHistory(page: number = 0): void {
    this.getGameHistory(page).subscribe({
      next: (history) => {
        if (page === 0) {
          this.gameHistorySubject.next(history);
        } else {
          // Agregar más partidas al historial existente
          const currentHistory = this.gameHistorySubject.value;
          this.gameHistorySubject.next([...currentHistory, ...history]);
        }
      },
      error: (error) => {
        console.error('Error loading game history:', error);
      }
    });
  }

  /**
   * Limpiar datos del servicio
   */
  clearUserData(): void {
    this.userStatsSubject.next(null);
    this.gameHistorySubject.next([]);
  }

  /**
   * Verificar si el usuario puede cambiar su perfil
   */
  canEditProfile(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Obtener estadísticas rápidas para mostrar en el perfil
   */
  getQuickStats(): { wins: number; losses: number; winRate: number } | null {
    const stats = this.userStatsSubject.value;
    if (!stats) return null;
    
    return {
      wins: stats.wins,
      losses: stats.losses,
      winRate: stats.winRate
    };
  }

  /**
   * Verificar si el nombre de usuario está disponible
   */
  checkUsernameAvailability(username: string): Observable<{ available: boolean }> {
    const params = { username };
    return this.http.get<{ available: boolean }>(`${this.API_URL}/check-username`, { params });
  }

  /**
   * Verificar si el email está disponible
   */
  checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    const params = { email };
    return this.http.get<{ available: boolean }>(`${this.API_URL}/check-email`, { params });
  }
}