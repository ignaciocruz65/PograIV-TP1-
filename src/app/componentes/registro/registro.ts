import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  email = signal('');
  clave = signal('');
  errorMsg = signal<string | null>(null);
  cargando = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  async registrar() {
    this.cargando.set(true);
    this.errorMsg.set(null);

    try {
      await this.auth.registrarUsuario(this.email(), this.clave());
      
      console.log('registrado');
      this.router.navigate(['/home']); 
      
    } catch (error: any) {
      this.errorMsg.set(error.message || 'error al intentar registrarse');
    } finally {
      this.cargando.set(false);
    }
  }
}