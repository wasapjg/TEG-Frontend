// src/app/routes/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from '../features/auth/login/login.component';
import { RegisterComponent } from '../features/auth/register/register.component';
import { GameLobbyComponent } from '../features/lobby/components/game-lobby/game-lobby.component';
import { authGuard, guestGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  // Ruta por defecto
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [guestGuard] // Solo si no está logueado
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [guestGuard] // Solo si no está logueado
  },
  
  { 
    path: 'lobby', 
    component: GameLobbyComponent,
    canActivate: [authGuard] // Solo si está logueado
  },
  
  {
    path: 'game',
    canActivate: [authGuard],
    children: [
      // { path: ':gameCode', component: GameComponent },
      // { path: ':gameCode/stats', component: GameStatsComponent }
    ]
  },
  
  {
    path: 'profile',
    canActivate: [authGuard],
    children: [
      // { path: '', component: ProfileComponent },
      // { path: 'stats', component: UserStatsComponent }
    ]
  },
  
  {
    path: 'settings',
    canActivate: [authGuard],
    children: [
      // { path: '', component: SettingsComponent }
    ]
  },
  
  { 
    path: '**', 
    redirectTo: '/login'
  }
];