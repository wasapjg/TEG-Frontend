import { PlayerState } from "../../enums/player-state";
import { TerritoryCard } from "./card";
import { Territory } from "./map";
import { Objective } from "./objective";
import { User } from "./user";

// Interfaces for Game Player
export interface GamePlayer {
  id: string;
  user: User;
  color: string;
  objective: Objective;
  state: PlayerState;
  conqueredTerritories: Territory[];
  availableTroops: number;
  cards: TerritoryCard[];
  order: number; // Turn order
}
