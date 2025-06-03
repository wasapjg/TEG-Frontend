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
  // Modelo del formulario
  registerData = {
    username: '',
    email: '',
    password: ''
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
      
      const registerDataToSend: UserRegisterDto = {
        username: this.registerData.username,
        email: this.registerData.email,
        password: this.registerData.password
      };

      this.authService.register(registerDataToSend).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.showNotification(
            'success',
            '¡Cuenta Creada!',
            `Bienvenido ${registerDataToSend.username}. Tu cuenta ha sido creada exitosamente.`
          );
          
          // Redirigir al lobby después del registro exitoso
          this.router.navigate(['/lobby']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error en registro:', error);
          
          let errorMessage = 'Error desconocido al crear la cuenta';
          if (error.status === 409) {
            errorMessage = 'El usuario o email ya existe';
          } else if (error.status === 400) {
            errorMessage = 'Datos de registro inválidos';
          } else if (error.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.notificationService.showNotification(
            'error',
            'Error de Registro',
            errorMessage
          );
        }
      });
    } else {
      this.notificationService.showNotification(
        'warning',
        'Formulario Incompleto',
        'Por favor completa todos los campos correctamente'
      );
    }
  }

  onCancel(): void {
    this.registerData = {
      username: '',
      email: '',
      password: ''
    };
    this.notificationService.showNotification(
      'info',
      'Formulario Limpiado',
      'Se han borrado todos los datos del formulario'
    );
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

}