import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../servicios/auth';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-simon-dice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simon-dice.html',
  styleUrl: './simon-dice.css'
})
export class SimonDice {
  private auth = inject(AuthService);
  private router = inject(Router);
  private supabase: SupabaseClient;
  private forzarSalida = false; 
  secuenciaMaquina = signal<number[]>([]);
  secuenciaJugador = signal<number[]>([]);
  puntaje = signal<number>(0);
  
  estadoJuego = signal<'esperando' | 'mostrando' | 'jugando'>('esperando');
  

  botonActivo = signal<number | null>(null);
  private intervaloSecuencia: any;
  private timeoutLuz: any;

  constructor() {
    const supabaseUrl = 'https://qnwtyoxknivtuczjfeno.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud3R5b3hrbml2dHVjempmZW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTA0OTMsImV4cCI6MjA5MzA2NjQ5M30.nYwB5qqtr6fvu5swjYUBhfnckW5cYCcwPrIlq-Br1sQ';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  ngOnDestroy() {
    this.limpiarTemporizadores();
  }
  limpiarTemporizadores() {
    if (this.intervaloSecuencia) clearInterval(this.intervaloSecuencia);
    if (this.timeoutLuz) clearTimeout(this.timeoutLuz);
  }

  iniciarJuego() {
    this.puntaje.set(0);
    this.secuenciaMaquina.set([]);
    this.siguienteRonda();
  }

  siguienteRonda() {
    this.secuenciaJugador.set([]); 
    this.estadoJuego.set('mostrando'); 

    const nuevoColor = Math.floor(Math.random() * 4);
    this.secuenciaMaquina.update(secuencia => [...secuencia, nuevoColor]);

    this.reproducirSecuencia();
  }

  reproducirSecuencia() {
    this.limpiarTemporizadores();
    const secuencia = this.secuenciaMaquina();
    let i = 0;

    this.intervaloSecuencia = setInterval(() => {
      this.iluminarBoton(secuencia[i]);
      i++;

      if (i >= secuencia.length) {
        clearInterval(this.intervaloSecuencia);
        this.timeoutLuz = setTimeout(() => {
          this.estadoJuego.set('jugando');
        }, 500); 
      }
    }, 800); 
  }

  iluminarBoton(indiceColor: number) {
    this.botonActivo.set(indiceColor);
    
    this.timeoutLuz = setTimeout(() => {
      this.botonActivo.set(null);
    }, 400);
  }

  seleccionarColor(indiceColor: number) {
    if (this.estadoJuego() !== 'jugando') return;

    this.iluminarBoton(indiceColor);
    this.secuenciaJugador.update(sec => [...sec, indiceColor]);

    const pasoActual = this.secuenciaJugador().length - 1;

    if (this.secuenciaJugador()[pasoActual] !== this.secuenciaMaquina()[pasoActual]) {
      this.perder();
      return;
    }

    if (this.secuenciaJugador().length === this.secuenciaMaquina().length) {
      this.puntaje.update(p => p + 1);
      this.estadoJuego.set('mostrando'); 
      
      this.timeoutLuz =setTimeout(() => {
        this.siguienteRonda();
      }, 1000);
    }
  }

  async perder() {
    this.estadoJuego.set('esperando');
    await this.guardarPuntajeEnBD();

    Swal.fire({
      title: 'Tu memoria esta para atras, Fallaste!',
      text: `Alcanzaste el nivel ${this.puntaje()}`,
      icon: 'error',
      confirmButtonText: 'Reintentar',
      confirmButtonColor: '#212529'
    });
  }

  async guardarPuntajeEnBD() {
    const usuario = this.auth.usuarioActual();
    if (this.puntaje() > 0 && usuario) {
      const { error } = await this.supabase.from('puntajes_simon_dice').insert([
        {
          usuario_id: usuario.id,
          usuario_email: usuario.email,
          puntaje: this.puntaje(),
          fecha: new Date().toISOString()
        }
      ]);

      if (error) console.error('Error al guardar puntaje Simon Dice:', error.message);
    }
  }

  async salir() {
    if (this.estadoJuego() === 'esperando' || this.puntaje() === 0) {
      this.forzarSalida = true;
      this.limpiarTemporizadores();
      this.router.navigate(['/home']);
      return;
    }

    this.limpiarTemporizadores(); 

    const result = await Swal.fire({
      title: 'PARTIDA EN CURSO',
      text: '¿Quieres salir? Se guardará tu nivel actual.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Salir y Guardar',
      cancelButtonText: 'Quedarme',
      confirmButtonColor: '#0d6efd', 
      cancelButtonColor: '#dc3545'
    });

    if (result.isConfirmed) {
      await this.guardarPuntajeEnBD();
      this.forzarSalida = true; 
      this.router.navigate(['/home']);
    } else {
      this.reproducirSecuencia(); 
    }
  }

  async permitirSalida(): Promise<boolean> {
    if (this.forzarSalida || this.estadoJuego() === 'esperando' || this.puntaje() === 0) {
      return true;
    }
  
    this.limpiarTemporizadores();
    const result = await Swal.fire({
      title: 'PARTIDA EN CURSO',
      text: '¿Intentas irte? Se guardará tu nivel actual.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Salir y Guardar',
      cancelButtonText: 'Quedarme',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#dc3545'
    });

    if (result.isConfirmed) {
      await this.guardarPuntajeEnBD();
      return true;
    } else {
      this.reproducirSecuencia();
      return false;
    }
  }
}
