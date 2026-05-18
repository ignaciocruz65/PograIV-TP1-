import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; //
import { AuthService } from '../../servicios/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  errorMsg = signal<string | null>(null);
  cargando = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      clave: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  
  get email() { return this.loginForm.get('email'); }
  get clave() { return this.loginForm.get('clave'); }

  async ingresar() {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      this.errorMsg.set('Credenciales inválidas.');
      return;
    }

    this.cargando.set(true);
    this.errorMsg.set(null);
    const { email, clave } = this.loginForm.value; 

    try {
      await this.auth.iniciarSesion(email, clave);
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMsg.set(error.message || 'Error al iniciar sesión');
    } finally {
      this.cargando.set(false);
    }
  }

  accesoRapido(correo: string, pass: string) {
    this.loginForm.patchValue({ email: correo, clave: pass });
  }
}