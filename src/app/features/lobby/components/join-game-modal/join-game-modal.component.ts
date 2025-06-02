import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-join-game-modal',
  imports: [],
  templateUrl: './join-game-modal.component.html',
  styleUrl: './join-game-modal.component.css'
})
export class JoinGameModalComponent {
  @Output() cerrar = new EventEmitter<unknown>();

}
