import { Routes } from '@angular/router';
import { LoginComponent } from '../features/auth/login/login.component';
import { RegisterComponent } from '../features/auth/register/register.component';
import { GameLobbyComponent } from '../features/lobby/components/game-lobby/game-lobby.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // Rutas de autenticación
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Ruta del lobby principal
  { path: 'lobby', component: GameLobbyComponent },
  
  // Ruta para página no encontrada
  { path: '**', redirectTo: '/login' }
];
