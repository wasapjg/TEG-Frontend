// src/app/features/auth/register/register.component.ts (SUPER SIMPLE)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserRegisterDto } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  registerData = {
    username: '',
    email: '',
    password: '',
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

      // Solo enviar lo que necesita el backend
      const registerDataToSend: UserRegisterDto = {
        username: this.registerData.username,
        email: this.registerData.email,
        password: this.registerData.password
      };

      this.authService.register(registerDataToSend).subscribe({
        next: (response) => {
          console.log('Register response:', response);
          
          if (response.success) {
            // Guardar usuario y redirigir
            // this.authService.saveUser(response.user);
            
            this.notificationService.showNotification(
              'success',
              'Registro exitoso',
              `Bienvenido ${response.user.username}`
            );
            
            this.router.navigate(['/lobby']);
          } else {
            this.notificationService.showNotification(
              'error',
              'Error',
              'Registro fallido'
            );
          }
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Register error:', error);
          this.isLoading = false;
          
          let errorMessage = 'Error en el registro';
          if (error.status === 409) {
            errorMessage = 'El usuario ya existe';
          }
          
          this.notificationService.showNotification(
            'error',
            'Error de Registro',
            errorMessage
          );
        }
      });
    }
  }

  onCancel(): void {
    this.registerData = {
      username: '',
      email: '',
      password: ''
    };
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}