import { Component } from '@angular/core';
import {LobbyService} from '../../services/lobby.service';
import { GameModel } from '../../../../core/models/class/game-model';
import {CreateGameModalComponent} from '../create-game-modal/create-game-modal.component';
import {JoinGameModalComponent} from '../join-game-modal/join-game-modal.component';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-game-lobby',
  standalone : true,
  imports: [CommonModule, CreateGameModalComponent, JoinGameModalComponent],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.css'
})
export class GameLobbyComponent{

// Propiedades mínimas para crear la partida
  createdByUserId: number = 123; // poner el id real del usuario logueado
  maxPlayers: number = 6;
  turnTimeLimit: number = 2; // minutos
  chatEnabled: boolean = true;
  pactsAllowed: boolean = true;


  gameCodeCreated: string = ''; //variable para guardar el codigo de la partida que se puede llegar a crear
  // se usará para mandarlo al otro componente(create-game-modal) y cargar el juego allá

  showModalCreateGame = false;
  showModalJoinGame = false;

  constructor(private lobbyService : LobbyService) {}

  async openModalCreateGame(){
    const gameInitialData = { //sería el GameCreationDto
      CreatedByUserId: this.createdByUserId,
      maxPlayers: this.maxPlayers,
      turnTimeLimit: this.turnTimeLimit,
      chatEnabled: this.chatEnabled,
      pactsAllowed: this.pactsAllowed
    }

    ///creamos la partida con los minimos requisitos y abrimos el modal de configuracion de partida
    this.lobbyService.createGame(gameInitialData).subscribe({
      next: (gameResponse) => {
        console.log('Partida creada:', gameResponse);
        this.gameCodeCreated = gameResponse.gameCode

        //abrimos el modal de creacion de partida despues de obtener el codigo
        this.showModalCreateGame = true;
      },
      error: (err) => {
        console.error('Error creando partida:', err);
      }
    });
  }


  openModalJoinGame(){
    //levantamos el modal para unirse a un juego
    this.showModalJoinGame = true;
  }

  closeModalCreateGame(){
    this.showModalCreateGame = false;
  }
  closeModalJoinGame(){
    this.showModalJoinGame = false;
  }

}
