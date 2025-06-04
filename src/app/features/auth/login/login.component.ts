// src/app/features/auth/login/login.component.ts (COMPLETAMENTE LIMPIO)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserLoginDto } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  
  loginData: UserLoginDto = {
    identity: {
      type: "USERNAME",
      username: ""
    },
    password: ""
  };

  isLoading = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si ya está logueado, ir al lobby
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/lobby']);
    }
  }

  onSubmit(form: any): void {
    if (form.valid) {
      this.isLoading = true;

      this.authService.login(this.loginData).subscribe({
        next: (response) => {

          localStorage.setItem('token', JSON.stringify(response.user));
          // this.authService.saveUser(response.user);

          this.router.navigateByUrl('/lobby');

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
          
          this.notificationService.showNotification(
            'error',
            'Error de Login',
            'Usuario o contraseña incorrectos'
          );
        }
      });
    }
  }

  onCancel(): void {
    this.loginData = {
      identity: {
        type: "USERNAME",
        username: ""
      },
      password: ""
    };
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
