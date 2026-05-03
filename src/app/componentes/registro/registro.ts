import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  email = signal('');
  clave = signal('');
  nombre = signal('');
  apellido = signal('');
  edad = signal<number | null>(null);
  errorMsg = signal<string | null>(null);
  cargando = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  async registrar() {
    this.cargando.set(true);
    this.errorMsg.set(null);

    if (!this.nombre() || !this.apellido() || !this.edad() || !this.email() || !this.clave()) {
      this.errorMsg.set('Todos los campos son obligatorios.');
      this.cargando.set(false);
      return;
    }

    try {
      await this.auth.registrarUsuario(
        this.email(), 
        this.clave(), 
        this.nombre(), 
        this.apellido(), 
        this.edad() as number
      );
      
      console.log('Registro y guardado en BD exitoso');
      this.router.navigate(['/home']); 
      
    } catch (error: any) {
      this.errorMsg.set(error.message || 'Error al intentar registrarse');
    } finally {
      this.cargando.set(false);
    }
  }
}