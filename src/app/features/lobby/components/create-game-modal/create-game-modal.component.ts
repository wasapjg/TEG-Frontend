import { Component, OnDestroy, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { LobbyService, GameResponseDto, AddBotsDto, GameInitDto } from '../../services/lobby.service';
import { BotLevel } from '../../../../core/enums/BotLevel';
import { BotStrategy } from '../../../../core/enums/BotStrategy';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

// Interfaz para jugadores en el modal
interface PlayerInModal {
  id: string;
  username: string;
  isBot: boolean;
  color: string;
  joinedAt: Date;
}

@Component({
  selector: 'app-create-game-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-game-modal.component.html',
  styleUrl: './create-game-modal.component.css'
})
export class CreateGameModalComponent implements OnDestroy, OnInit {
  @Input() gameCode: string = '';
  @Output() cerrar = new EventEmitter<void>();

  // Configuraciones del juego
  maxPlayers = 6;
  chatEnabled = true;
  turnTime = 60; // en segundos
  rules = 'any';
  botLevel: BotLevel = BotLevel.NOVICE;
  botLevels = Object.values(BotLevel);
  
  // Lista de jugadores 
  players: PlayerInModal[] = [];
  
  // Estado del componente
  isLoading = false;
  private pollingSubscription?: Subscription;

  constructor(private lobbyService: LobbyService) {}

  ngOnInit() {
    if (this.gameCode) {
      this.startPolling();
    }
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
  }

  completeGameCreation() {
    if (!this.gameCode) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay un gameCode válido.'
      });
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
      next: (gameResponse: GameResponseDto) => { 
        console.log("Partida inicializada:", gameResponse);

        // Convertir players del response 
        this.players = this.convertPlayersToModal(gameResponse.players || []);
        this.gameCode = gameResponse.gameCode; 

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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al iniciar el juego: ' + (err.message || 'Error desconocido')
        });
      }
    });
  }

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
      next: (gameResponse: GameResponseDto) => { // ← Tipo correcto
        console.log('Bots añadidos correctamente');
        this.players = this.convertPlayersToModal(gameResponse.players || []);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al añadir los bots:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al añadir los bots: ' + (err.message || 'Error desconocido')
        });
      }
    });
  }

  // Método para actualizar lista de players en tiempo real
  startPolling() {
    this.pollingSubscription = interval(5000).subscribe(() => {
      this.lobbyService.getGameByCode(this.gameCode).subscribe({
        next: (gameResponse: GameResponseDto) => { // ← Tipo correcto
          this.players = this.convertPlayersToModal(gameResponse.players || []);
        },
        error: (err) => {
          console.error('Error en polling:', err);
        }
      });
    });
  }

  // Convertir players del response a nuestro formato simple
  private convertPlayersToModal(players: any[]): PlayerInModal[] {
    return players.map(player => ({
      id: player.id || '',
      username: player.username || player.displayName || 'Usuario',
      isBot: player.isBot || false,
      color: player.color || '#000000',
      joinedAt: player.joinedAt ? new Date(player.joinedAt) : new Date()
    }));
  }

  // Métodos para ajustar los parámetros de creación del juego
  decreaseMaxPlayers() {
    if (this.maxPlayers > 2) this.maxPlayers--;
  }

  increaseMaxPlayers() {
    if (this.maxPlayers < 6) this.maxPlayers++;
  }

  decreaseTurnTime() {
    if (this.turnTime > 15) this.turnTime -= 5; // Tiempo en segundos
  }

  increaseTurnTime() {
    if (this.turnTime < 120) this.turnTime += 5;
  }

  closeModal() {
    this.pollingSubscription?.unsubscribe();
    this.cerrar.emit();
  }

  // Método para iniciar la partida 
  startGame() {
    if (this.players.length < 2) {
      Swal.fire({
        icon: 'warning',
        title: 'Jugadores Insuficientes',
        text: 'Se necesitan al menos 2 jugadores para iniciar la partida.'
      });
      return;
    }

    this.isLoading = true;

    this.lobbyService.startGame(this.gameCode).subscribe({
      next: (gameResponse: GameResponseDto) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: '¡Partida Iniciada!',
          text: 'La partida ha comenzado. ¡Buena suerte!'
        });
        
        this.closeModal();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al iniciar partida:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo iniciar la partida: ' + (err.message || 'Error desconocido')
        });
      }
    });
  }
}