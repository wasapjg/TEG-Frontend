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
  // Modelo del formulario
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
    // Si ya está logueado, redirigir al lobby
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/lobby']);
    }
  }

  onSubmit(form: any): void {
    if (form.valid) {
      this.isLoading = true;

      this.authService.login(this.loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.showNotification(
            'success',
            '¡Bienvenido!',
            `Hola ${this.loginData.identity.username}, has iniciado sesión correctamente`
          );
          this.router.navigate(['/lobby']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error en login:', error);
          
          let errorMessage = 'Error desconocido';
          if (error.status === 401) {
            errorMessage = 'Usuario o contraseña incorrectos';
          } else if (error.status === 404) {
            errorMessage = 'Usuario no encontrado';
          } else if (error.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.notificationService.showNotification(
            'error',
            'Error de Login',
            errorMessage
          );
        }
      });
    } else {
      this.notificationService.showNotification(
        'warning',
        'Formulario Incompleto',
        'Por favor completa todos los campos requeridos'
      );
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
    this.notificationService.showNotification(
      'info',
      'Formulario Limpiado',
      'Se han borrado todos los datos del formulario'
    );
  }

  onForgotPassword(): void {
    this.notificationService.showNotification(
      'info',
      'Recuperar Contraseña',
      'Funcionalidad próximamente disponible'
    );
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}