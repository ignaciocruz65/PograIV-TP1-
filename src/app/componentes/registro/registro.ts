import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth';
import { confirmarClaveValidator, edadValidator, caracteresEmailValidator } from '../../validators/registro.validator';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnInit {
  registroForm!: FormGroup;
  errorMsg = signal<string | null>(null);
  cargando = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.registroForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]),
      apellido: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]),
      edad: new FormControl('', [Validators.required, edadValidator(18)]),
      email: new FormControl('', [Validators.required, Validators.email, caracteresEmailValidator]),
      clave: new FormControl('', [Validators.required, Validators.minLength(6)]),
      repiteClave: new FormControl('', [Validators.required])
    }, { validators: confirmarClaveValidator() });
  }

  get nombre() { return this.registroForm.get('nombre'); }
  get apellido() { return this.registroForm.get('apellido'); }
  get edad() { return this.registroForm.get('edad'); }
  get email() { return this.registroForm.get('email'); }
  get clave() { return this.registroForm.get('clave'); }
  get repiteClave() { return this.registroForm.get('repiteClave'); }

  async registrar() {
    this.registroForm.markAllAsTouched();

    if (this.registroForm.invalid) {
      this.errorMsg.set('por favor, completa todos los campos correctamente.');
      return;
    }

    this.cargando.set(true);
    this.errorMsg.set(null);

    const { email, clave, nombre, apellido, edad } = this.registroForm.value;

    try {
      await this.auth.registrarUsuario(email, clave, nombre, apellido, edad);
      console.log('registro exitoso');
      this.router.navigate(['/home']); 
    } catch (error: any) {
      this.errorMsg.set(error.message || 'error al intentarse registrar');
    } finally {
      this.cargando.set(false);
    }
  }
}