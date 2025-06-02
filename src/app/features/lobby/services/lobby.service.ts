import { Injectable } from '@angular/core';
import{GameModel} from '../../../core/models/class/game-model';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {BotLevel} from '../../../core/enums/BotLevel';
import {BotStrategy} from '../../../core/enums/BotStrategy';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  //cambiar las url despues
  private API_URL = 'http://localhost:3000/api'; //endpoind de ejemplo
  private API_GetGameByCode = '';
  constructor(private http: HttpClient) {}

  createGame(gameData: any): Observable<any>{
    return this.http.post(this.API_URL, gameData);
  }

  getGames(): Observable<GameModel[]>{
    return this.http.get<GameModel[]>(this.API_URL)
  }

  initGame(initGameDATA: any): Observable<GameModel> {
    return this.http.put<GameModel>(`${this.API_URL}/games/init`, initGameDATA);
  }


  addBotsToGame(addBotsDto: {
    gameCode: string,
    count: number,
    botLevel: BotLevel,
    botStrategy: BotStrategy
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/games/${addBotsDto.gameCode}/add-bots`, addBotsDto);
  }


  getGameByCode(gameCode: string): Observable<GameModel> {
    return this.http.get<GameModel>(`${this.API_GetGameByCode}/games/${gameCode}`); //acomodar url despues
  }
}
