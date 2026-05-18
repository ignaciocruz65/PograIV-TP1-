import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../servicios/auth';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Swal from 'sweetalert2';

interface Pokemon {
  nombre: string;
  imagen: string;
  tipoCorrecto: string;
  opciones: string[];
}

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.css'
})
export class Preguntados implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private supabase: SupabaseClient;


  pokemonActual = signal<Pokemon | null>(null);
  preguntaNumero = signal(1);
  aciertos = signal(0);
  juegoTerminado = signal(false);
  cargando = signal(true);

  tiposPokemon = ['grass', 'fire', 'water', 'bug', 'normal', 'poison', 'electric', 'ground', 'fairy', 'fighting', 'psychic', 'rock', 'ghost', 'ice', 'dragon'];

  constructor() {
    const supabaseUrl = 'https://qnwtyoxknivtuczjfeno.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud3R5b3hrbml2dHVjempmZW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTA0OTMsImV4cCI6MjA5MzA2NjQ5M30.nYwB5qqtr6fvu5swjYUBhfnckW5cYCcwPrIlq-Br1sQ';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  ngOnInit(): void {
    this.siguientePregunta();
  }

  async siguientePregunta() {
    if (this.preguntaNumero() > 3) {
      this.finalizarJuego();
      return;
    }

    this.cargando.set(true);
    const idAleatorio = Math.floor(Math.random() * 151) + 1;
    
    this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${idAleatorio}`).subscribe({
      next: (data) => {
        const tipoCorrecto = data.types[0].type.name;
        
        let opciones = [tipoCorrecto];
        while (opciones.length < 4) {
          const tipoFalso = this.tiposPokemon[Math.floor(Math.random() * this.tiposPokemon.length)];
          if (!opciones.includes(tipoFalso)) {
            opciones.push(tipoFalso);
          }
        }
        
        opciones = opciones.sort(() => Math.random() - 0.5);

        this.pokemonActual.set({
          nombre: data.name.toUpperCase(),
          imagen: data.sprites.other['official-artwork'].front_default,
          tipoCorrecto: tipoCorrecto,
          opciones: opciones
        });
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al obtener pokemon:', err);
        this.cargando.set(false);
      }
    });
  }

  verificarRespuesta(opcion: string) {
    const pokemon = this.pokemonActual();
    if (this.cargando() || !pokemon) return;
    
    if (opcion === pokemon.tipoCorrecto) {
      this.aciertos.update(a => a + 1);
      Swal.fire({
        title: '¡Correcto!',
        text: `Es tipo ${opcion}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        this.avanzar();
      });
    } else {
      Swal.fire({
        title: '¡Incorrecto!',
        text: `Era tipo ${this.pokemonActual()?.tipoCorrecto}`,
        icon: 'error',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        this.avanzar();
      });
    }
  }

  avanzar() {
    this.preguntaNumero.update(n => n + 1);
    this.siguientePregunta();
  }

  async finalizarJuego() {
    this.juegoTerminado.set(true);
    const usuario = this.auth.usuarioActual();
    
    if (usuario) {
      const { error } = await this.supabase.from('puntajes_preguntados').insert([
        {
          usuario_id: usuario.id,
          usuario_email: usuario.email,
          aciertos: this.aciertos(),
          total_preguntas: 3,
          fecha: new Date().toISOString()
        }
      ]);
      
      if (error) console.error('Error al guardar puntaje:', error.message);
    }

    Swal.fire({
      title: 'Juego Terminado',
      text: `Acertaste ${this.aciertos()} de 3 preguntas`,
      icon: 'info',
      confirmButtonText: 'Reiniciar'
    }).then(() => {
      this.reiniciar();
    });
  }

  reiniciar() {
    this.preguntaNumero.set(1);
    this.aciertos.set(0);
    this.juegoTerminado.set(false);
    this.siguientePregunta();
  }

  async permitirSalida(): Promise<boolean> {
    if (this.juegoTerminado() || this.preguntaNumero() === 1) {
      return true;
    }

    return Swal.fire({
      title: 'PARTIDA EN CURSO',
      text: '¿Deseas abandonar la partida de Poke-Preguntados?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#212529',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Abandonar',
      cancelButtonText: 'Continuar'
    }).then((result) => {
      return result.isConfirmed;
    });
  }
}
