import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../servicios/auth'; 
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.css'
})
export class Ahorcado implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private supabase: SupabaseClient;
  
  palabrasDisponibles: string[] = [
    'ANGULAR', 'COMPONENTES', 'TYPESCRIPT', 'SERVICIOS', 'RUTEO', 'MODULOS', 'PROGRAMACION'
  ];
  
  palabraSecreta = signal<string>('');
  letrasCorrectas = signal<string[]>([]);
  letrasIncorrectas = signal<string[]>([]);
  puntaje = signal<number>(0);
  fechaInicio = signal<number>(0);
  
  intentosMaximos = 6;
  abecedario = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  palabraVisual = computed(() => {
    const secreta = this.palabraSecreta().split('');
    const correctas = this.letrasCorrectas();
    return secreta.map(letra => correctas.includes(letra) ? letra : '_');
  });

  cantidadErrores = computed(() => this.letrasIncorrectas().length);
  juegoPerdido = computed(() => this.cantidadErrores() >= this.intentosMaximos);
  juegoGanado = computed(() => {
    return this.palabraVisual().length > 0 && !this.palabraVisual().includes('_');
  });

  constructor() {
    const supabaseUrl = 'https://qnwtyoxknivtuczjfeno.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud3R5b3hrbml2dHVjempmZW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTA0OTMsImV4cCI6MjA5MzA2NjQ5M30.nYwB5qqtr6fvu5swjYUBhfnckW5cYCcwPrIlq-Br1sQ';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  ngOnInit(): void {
    this.iniciarJuego();
  }

  iniciarJuego() {
    const indiceRandom = Math.floor(Math.random() * this.palabrasDisponibles.length);
    this.palabraSecreta.set(this.palabrasDisponibles[indiceRandom]);
    this.letrasCorrectas.set([]);
    this.letrasIncorrectas.set([]);
    if (this.juegoPerdido()) {
      this.puntaje.set(0);
    }
    this.fechaInicio.set(Date.now());
  }

  presionarLetra(letra: string) {
    if (this.juegoGanado() || this.juegoPerdido()) return;
    if (this.letrasCorrectas().includes(letra) || this.letrasIncorrectas().includes(letra)) return;

    if (this.palabraSecreta().includes(letra)) {
      this.letrasCorrectas.update(actuales => [...actuales, letra]);
      this.verificarVictoria();
    } else {
      this.letrasIncorrectas.update(actuales => [...actuales, letra]);
      this.verificarDerrota();
    }
  }

  verificarVictoria() {
    if (this.juegoGanado()) {
      this.puntaje.update(p => p + 10);
      this.guardarPuntajeEnBD(true);
      this.mostrarAlerta('¡Ganaste!', 'Sumaste 10 puntos.', 'success');
    }
  }

  verificarDerrota() {
    if (this.juegoPerdido()) {
      this.guardarPuntajeEnBD(false);
      this.mostrarAlerta('¡Perdiste!', `La palabra era: ${this.palabraSecreta()}`, 'error');
    }
  }

  async guardarPuntajeEnBD(gano: boolean) {
    const usuario = this.auth.usuarioActual();
    if (!usuario) return;

    const tiempoFinal = Date.now();
    const duracionSegundos = Math.floor((tiempoFinal - this.fechaInicio()) / 1000);
    const letrasSeleccionadas = [...this.letrasCorrectas(), ...this.letrasIncorrectas()].length;

    const { error } = await this.supabase.from('puntajes_ahorcado').insert([
      {
        usuario_id: usuario.id,
        usuario_email: usuario.email,
        palabra: this.palabraSecreta(),
        resultado: gano ? 'GANÓ' : 'PERDIÓ',
        duracion_segundos: duracionSegundos,
        letras_intentadas: letrasSeleccionadas,
        fecha: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error('Error al guardar puntaje ahorcado:', error.message);
    }
  }

  mostrarAlerta(titulo: string, mensaje: string, icono: any) {
    Swal.fire({ title: titulo, text: mensaje, icon: icono, confirmButtonText: 'Siguiente' })
      .then(() => this.iniciarJuego());
  }
  async permitirSalida(): Promise<boolean> {
    // Si no tocó ninguna letra todavía, o si la partida ya terminó, lo dejamos ir gratis
    const sinEmpezar = this.letrasCorrectas().length === 0 && this.letrasIncorrectas().length === 0;
    if (this.juegoGanado() || this.juegoPerdido() || sinEmpezar) {
      return true;
    }

    const result = await Swal.fire({
      title: 'PARTIDA EN CURSO',
      text: '¿Deseas abandonar la partida? Esta palabra se contará como PERDIDA.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#212529',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Rendirse y Salir',
      cancelButtonText: 'Continuar Jugando'
    });

    if (result.isConfirmed) {
      // Si se rinde, le guardamos la derrota en la base de datos para no hacer trampa
      await this.guardarPuntajeEnBD(false);
      return true;
    }
    
    return false;
  }
  salir() {
    this.router.navigate(['/home']);
  }
}