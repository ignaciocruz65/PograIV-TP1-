import { Component } from '@angular/core';
import { RouterOutlet,RouterLink,Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './servicios/auth';
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
}
