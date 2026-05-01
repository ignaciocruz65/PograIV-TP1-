import { Component, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = signal('');
  clave = signal('');
  errorMsg = signal<string | null>(null);
  cargando = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  async ingresar() {
    this.cargando.set(true);
    this.errorMsg.set(null);
    
    try {
      await this.auth.iniciarSesion(this.email(), this.clave());
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMsg.set(error.message || 'error al iniciar sesión');
    } finally {
      this.cargando.set(false);
    }
  }  

  accesoRapido(correo: string, pass: string) {
    this.email.set(correo);
    this.clave.set(pass);
  }
}
