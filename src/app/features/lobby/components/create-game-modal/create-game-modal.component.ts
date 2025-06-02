import {Component, OnDestroy, EventEmitter, Output, Input, OnInit} from '@angular/core';
import {LobbyService} from '../../services/lobby.service';
import {GameModel} from '../../../../core/models/class/game-model';
import {BotLevel} from '../../../../core/enums/BotLevel';
import {BotStrategy} from '../../../../core/enums/BotStrategy';
import {FormsModule} from '@angular/forms';
import{PlayerGameModel} from '../../../../core/models/class/player-model';
import {interval, Subscription} from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-game-modal',
  templateUrl: './create-game-modal.component.html',
  imports: [
    FormsModule
  ],
  styleUrl: './create-game-modal.component.css'
})
export class CreateGameModalComponent implements OnDestroy, OnInit{
  @Input() gameCode: string = '';

  maxPlayers = 6;
  chatEnabled = true;
  turnTime = 60;
  rules = 'any';
  // Nuevo: opciones de niveles de bot
  botLevel: BotLevel = BotLevel.NOVICE; // valor por defecto
  botLevels = Object.values(BotLevel); // array para iterar en el select
  players: PlayerGameModel[] = [];

  private pollingSubscription?: Subscription

  constructor(private lobbyService: LobbyService) {}

  ngOnInit() {//actulizamos lista del player cada 5s
    if (this.gameCode) {
      this.startPolling();
    }
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

    const initGameDto = {
      gameCode: this.gameCode,
      maxPlayers: this.maxPlayers,
      turnTimeLimit: this.turnTime,
      chatEnabled: this.chatEnabled,
      pactsAllowed: true
    };

    this.lobbyService.initGame(initGameDto).subscribe({
      next: (game: GameModel) => {
        console.log("Partida inicializada:", game);

        this.players = game.players;
        this.gameCode = game.code;

        // Ahora agregamos los bots si faltan jugadores
        const currentPlayersCount = game.players.length;
        const botsToAdd = this.maxPlayers - currentPlayersCount;

        if (botsToAdd > 0) {
          const strategies = Object.values(BotStrategy);
          const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];

          const addBotsDto = {
            gameCode: this.gameCode,
            count: botsToAdd,
            botLevel: BotLevel[this.botLevel as keyof typeof BotLevel],
            botStrategy: randomStrategy
          };

          this.lobbyService.addBotsToGame(addBotsDto).subscribe({
            next: () => {
              console.log('Bots añadidos correctamente');
            },
            error: (err) => {
              console.error('Error al añadir los bots:', err);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al añadir los bots: ' + err.message
              });
            }
          });
        }

      },
      error: (err) => {
        console.error('Error al iniciar el juego:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al iniciar el juego: ' + err.message
        });
      }

    });
  }

//metodo automatico para actulizar lista de players en tiempo rial
  startPolling() {
    this.pollingSubscription = interval(5000).subscribe(() => {
      this.lobbyService.getGameByCode(this.gameCode).subscribe(game => {
        this.players = game.players;
      });
    });
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
  }

  //los siguientes metodos son para ajustar los parametros de creacion del juego
  decreaseMaxPlayers() {
    if (this.maxPlayers > 2) this.maxPlayers--;
  }

  increaseMaxPlayers() {
    if (this.maxPlayers < 6) this.maxPlayers++;
  }

  decreaseTurnTime() {
    if (this.turnTime > 15) this.turnTime -= 5; //el tiempo lo manejamos en segundos aca y luego los pasamos a mins
  }

  increaseTurnTime() {
    if (this.turnTime < 120) this.turnTime += 5;
  }

  @Output() cerrar = new EventEmitter<void>();

  closeModal() {
    this.pollingSubscription?.unsubscribe(); // Detener el polling si está activo
    this.cerrar.emit(); // Emitir el evento al padre para cerrar el modal
  }

}
