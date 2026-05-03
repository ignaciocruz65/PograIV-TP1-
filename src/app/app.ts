import { Component } from '@angular/core';
import { RouterOutlet,RouterLink,Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './servicios/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public auth: AuthService, private router: Router) {}

  async logout() {
    try {
      await this.auth.cerrarSesion();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error("error al cerrar sesion", error);
    }
  }

  async confirmarCerrarSesion() {

    Swal.fire({
      title: '¿Cerrar Sesión?',
      text: "Deberás ingresar tus credenciales nuevamente para jugar.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#212529',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.auth.cerrarSesion();
        this.router.navigate(['/home']);
      }
    });
  }
  }




