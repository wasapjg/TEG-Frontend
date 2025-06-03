import { Component, OnInit, OnDestroy } from '@angular/core';
import { LobbyService, GameCreationDto, GameResponseDto } from '../../services/lobby.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game-lobby',
  standalone: true,
  imports: [/* tus imports */],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.css'
})
export class GameLobbyComponent implements OnInit, OnDestroy {
  
  availableGames: GameResponseDto[] = [];
  private subscription?: Subscription;

  constructor(
    private lobbyService: LobbyService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAvailableGames();
    this.lobbyService.startAvailableGamesPolling();
    
    this.subscription = this.lobbyService.availableGames$.subscribe(games => {
      this.availableGames = games;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.lobbyService.stopPolling();
  }

  createNewGame() {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      console.error('Usuario no autenticado');
      return;
    }

    const gameInitialData: GameCreationDto = {
      createdByUserId: currentUser.id,
      maxPlayers: 6,
      turnTimeLimit: 10,
      chatEnabled: true,
      pactsAllowed: false
    };

    this.lobbyService.createGame(gameInitialData).subscribe({
      next: (gameResponse: GameResponseDto) => {
        console.log('Juego creado exitosamente:', gameResponse);
        // Aquí puedes abrir el modal o navegar al juego
      },
      error: (error) => {
        console.error('Error al crear el juego:', error);
      }
    });
  }

  joinGame(gameCode: string) {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      console.error('Usuario no autenticado');
      return;
    }

    const joinData = {
      userId: currentUser.id,
      gameCode: gameCode
    };

    this.lobbyService.joinGame(joinData).subscribe({
      next: (gameResponse: GameResponseDto) => {
        console.log('Te uniste al juego:', gameResponse);
        // Navegar al juego o actualizar UI
      },
      error: (error) => {
        console.error('Error al unirse al juego:', error);
      }
    });
  }

  private loadAvailableGames() {
    this.lobbyService.getAvailableGames().subscribe({
      next: (games) => {
        this.availableGames = games;
      },
      error: (error) => {
        console.error('Error al cargar juegos:', error);
      }
    });
  }
}