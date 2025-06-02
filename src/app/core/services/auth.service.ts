import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserRegisterDto {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserLoginDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  success: boolean;
  user: UserResponseDto;
  sessionId: string; // Session ID simple (no JWT)
  message?: string;
}

export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserUpdateDto {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly USER_KEY = 'teg_current_user';
  private readonly SESSION_KEY = 'teg_session_id';

  private currentUserSubject = new BehaviorSubject<UserResponseDto | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidSession());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Registrar nuevo usuario
   */
  register(userData: UserRegisterDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.handleAuthSuccess(response.user, response.sessionId);
          }
        })
      );
  }

  /**
   * Iniciar sesión
   */
  login(credentials: UserLoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            this.handleAuthSuccess(response.user, response.sessionId);
          }
        })
      );
  }

  /**
   * Cerrar sesión
   */
  logout(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.API_URL}/logout`, {}, { headers })
      .pipe(
        tap(() => {
          this.clearAuthData();
        })
      );
  }

  /**
   * Obtener perfil del usuario actual
   */
  getCurrentUserProfile(): Observable<UserResponseDto> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserResponseDto>(`${environment.apiUrl}/user/profile`, { headers })
      .pipe(
        tap(user => {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * Actualizar perfil de usuario
   */
  updateProfile(userId: string, userData: UserUpdateDto): Observable<UserResponseDto> {
    const headers = this.getAuthHeaders();
    return this.http.put<UserResponseDto>(`${environment.apiUrl}/user/${userId}`, userData, { headers })
      .pipe(
        tap(user => {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * Verificar si hay sesión válida
   */
  checkSession(): Observable<UserResponseDto | null> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserResponseDto>(`${this.API_URL}/check-session`, { headers })
      .pipe(
        tap(user => {
          if (user) {
            this.currentUserSubject.next(user);
          } else {
            this.clearAuthData();
          }
        })
      );
  }

  /**
   * Obtener headers de autorización con Session ID
   */
  getAuthHeaders(): HttpHeaders {
    const sessionId = this.getSessionId();
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId; // Enviar session ID como header personalizado
    }
    
    return new HttpHeaders(headers);
  }

  /**
   * Obtener opciones de request con headers
   */
  getRequestOptions(): { headers: HttpHeaders } {
    return { headers: this.getAuthHeaders() };
  }

  /**
   * Obtener usuario actual desde localStorage
   */
  getCurrentUser(): UserResponseDto | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Obtener Session ID
   */
  getSessionId(): string | null {
    return localStorage.getItem(this.SESSION_KEY);
  }

  /**
   * Verificar si hay sesión válida
   */
  private hasValidSession(): boolean {
    const user = this.getCurrentUser();
    const sessionId = this.getSessionId();
    return user !== null && sessionId !== null;
  }

  /**
   * Manejar respuesta exitosa de autenticación
   */
  private handleAuthSuccess(user: UserResponseDto, sessionId: string): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.SESSION_KEY, sessionId);
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Limpiar datos de autenticación
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Refrescar información del usuario
   */
  refreshUser(): void {
    if (this.hasValidSession()) {
      this.getCurrentUserProfile().subscribe();
    }
  }

  /**
   * Método de conveniencia para verificar autenticación
   */
  isAuthenticated(): boolean {
    return this.hasValidSession();
  }
}