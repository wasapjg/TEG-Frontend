// src/app/features/lobby/components/game-lobby/game-lobby.component.ts (SIMPLIFICADO)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LobbyService, GameCreationDto, GameResponseDto } from '../../services/lobby.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-game-lobby',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.css'
})
export class GameLobbyComponent implements OnInit {
  
  availableGames: GameResponseDto[] = [];
  currentUser: any = null;
  isLoading = false;

  constructor(
    private lobbyService: LobbyService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar que el usuario esté logueado
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    console.log('Usuario en lobby:', this.currentUser);
    this.loadAvailableGames();
  }

  /**
   * Cargar juegos disponibles
   */
  loadAvailableGames() {
    this.lobbyService.getAvailableGames().subscribe({
      next: (games) => {
        this.availableGames = games;
        console.log('Juegos disponibles:', games);
      },
      error: (error) => {
        console.error('Error cargando juegos:', error);
        this.notificationService.showNotification(
          'error',
          'Error',
          'No se pudieron cargar los juegos disponibles'
        );
      }
    });
  }

  /**
   * Crear nueva partida
   */
  createNewGame() {
    if (!this.currentUser) {
      this.notificationService.showNotification(
        'error',
        'Error',
        'No hay usuario autenticado'
      );
      return;
    }

    this.isLoading = true;

    const gameData: GameCreationDto = {
      createdByUserId: this.currentUser.id,
      maxPlayers: 6,
      turnTimeLimit: 10,
      chatEnabled: true,
      pactsAllowed: false
    };

    this.lobbyService.createGame(gameData).subscribe({
      next: (gameResponse) => {
        console.log('Juego creado:', gameResponse);
        this.isLoading = false;
        
        this.notificationService.showNotification(
          'success',
          'Partida Creada',
          `Código: ${gameResponse.gameCode}`
        );
        
        // Recargar lista de juegos
        this.loadAvailableGames();
      },
      error: (error) => {
        console.error('Error creando juego:', error);
        this.isLoading = false;
        
        this.notificationService.showNotification(
          'error',
          'Error',
          'No se pudo crear la partida'
        );
      }
    });
  }

  /**
   * Unirse a partida
   */
  joinGame(gameCode: string) {
    if (!this.currentUser) {
      this.notificationService.showNotification(
        'error',
        'Error',
        'No hay usuario autenticado'
      );
      return;
    }

    const joinData = {
      userId: this.currentUser.id,
      gameCode: gameCode
    };

    this.lobbyService.joinGame(joinData).subscribe({
      next: (gameResponse) => {
        console.log('Unido al juego:', gameResponse);
        
        this.notificationService.showNotification(
          'success',
          'Unido a la Partida',
          `Te uniste al juego ${gameCode}`
        );
        
        // Aquí podrías navegar al juego o abrir modal
        // this.router.navigate(['/game', gameCode]);
      },
      error: (error) => {
        console.error('Error uniéndose al juego:', error);
        
        this.notificationService.showNotification(
          'error',
          'Error',
          'No se pudo unir a la partida'
        );
      }
    });
  }

  /**
   * Cerrar sesión
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Refrescar lista de juegos
   */
  refreshGames() {
    this.loadAvailableGames();
  }
}