// src/app/features/lobby/components/create-game-modal/create-game-modal.component.ts (SIMPLIFICADO)
import { Component, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LobbyService, GameResponseDto, AddBotsDto, GameInitDto } from '../../services/lobby.service';
import { BotLevel } from '../../../../core/enums/BotLevel';
import { BotStrategy } from '../../../../core/enums/BotStrategy';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-create-game-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-game-modal.component.html',
  styleUrl: './create-game-modal.component.css'
})
export class CreateGameModalComponent {
  @Input() gameCode: string = '';
  @Output() cerrar = new EventEmitter<void>();

  // Configuraciones del juego
  maxPlayers = 6;
  chatEnabled = true;
  turnTime = 60;
  botLevel: BotLevel = BotLevel.NOVICE;
  botLevels = Object.values(BotLevel);
  
  // Lista de jugadores simple
  players: any[] = [];
  
  isLoading = false;

  constructor(
    private lobbyService: LobbyService,
    private notificationService: NotificationService
  ) {}

  /**
   * Completar creación del juego
   */
  completeGameCreation() {
    if (!this.gameCode) {
      this.notificationService.showNotification(
        'error',
        'Error',
        'No hay código de juego válido'
      );
      return;
    }

    this.isLoading = true;

    const initGameDto: GameInitDto = {
      gameCode: this.gameCode,
      maxPlayers: this.maxPlayers,
      turnTimeLimit: this.turnTime,
      chatEnabled: this.chatEnabled,
      pactsAllowed: true
    };

    this.lobbyService.initGame(initGameDto).subscribe({
      next: (gameResponse) => {
        console.log("Partida inicializada:", gameResponse);
        this.players = gameResponse.players || [];

        // Agregar bots si faltan jugadores
        const currentPlayersCount = gameResponse.players?.length || 0;
        const botsToAdd = this.maxPlayers - currentPlayersCount;

        if (botsToAdd > 0) {
          this.addBots(botsToAdd);
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al iniciar el juego:', err);
        this.notificationService.showNotification(
          'error',
          'Error',
          'Error al iniciar el juego'
        );
      }
    });
  }

  /**
   * Agregar bots al juego
   */
  private addBots(botsToAdd: number) {
    const strategies = Object.values(BotStrategy);
    const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];

    const addBotsDto: AddBotsDto = {
      gameCode: this.gameCode,
      count: botsToAdd,
      botLevel: this.botLevel,
      botStrategy: randomStrategy
    };

    this.lobbyService.addBotsToGame(addBotsDto).subscribe({
      next: (gameResponse) => {
        console.log('Bots añadidos correctamente');
        this.players = gameResponse.players || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al añadir los bots:', err);
        this.notificationService.showNotification(
          'error',
          'Error',
          'Error al añadir bots'
        );
      }
    });
  }

  /**
   * Iniciar la partida
   */
  startGame() {
    if (this.players.length < 2) {
      this.notificationService.showNotification(
        'warning',
        'Jugadores Insuficientes',
        'Se necesitan al menos 2 jugadores para iniciar'
      );
      return;
    }

    this.isLoading = true;

    this.lobbyService.startGame(this.gameCode).subscribe({
      next: (gameResponse) => {
        this.isLoading = false;
        this.notificationService.showNotification(
          'success',
          '¡Partida Iniciada!',
          'La partida ha comenzado'
        );
        this.closeModal();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al iniciar partida:', err);
        this.notificationService.showNotification(
          'error',
          'Error',
          'No se pudo iniciar la partida'
        );
      }
    });
  }

  /**
   * Ajustar configuraciones
   */
  decreaseMaxPlayers() {
    if (this.maxPlayers > 2) this.maxPlayers--;
  }

  increaseMaxPlayers() {
    if (this.maxPlayers < 6) this.maxPlayers++;
  }

  decreaseTurnTime() {
    if (this.turnTime > 15) this.turnTime -= 5;
  }

  increaseTurnTime() {
    if (this.turnTime < 120) this.turnTime += 5;
  }

  closeModal() {
    this.cerrar.emit();
  }
}