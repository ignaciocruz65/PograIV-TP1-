import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../../../servicios/auth';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type Card = {
  code: string;
  image: string;
  value: string;
  suit: string;
};

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mayor-menor.html',
  styleUrl: './mayor-menor.css'
})
export class MayorMenor implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private supabase: SupabaseClient;

  deckId = signal<string>('');
  cartaActual = signal<Card | null>(null);
  puntaje = signal<number>(0);
  restantes = signal<number>(0);
  mensaje = signal<string>('¡Bienvenido! ¿La próxima carta será Mayor o Menor?');
  juegoTerminado = signal<boolean>(false);
  cargando = signal<boolean>(true);

  private valoresMap: { [key: string]: number } = {
    'ACE': 14,
    'KING': 13,
    'QUEEN': 12,
    'JACK': 11,
    '10': 10,
    '9': 9,
    '8': 8,
    '7': 7,
    '6': 6,
    '5': 5,
    '4': 4,
    '3': 3,
    '2': 2
  };

  constructor() {
    const supabaseUrl = 'https://qnwtyoxknivtuczjfeno.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud3R5b3hrbml2dHVjempmZW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTA0OTMsImV4cCI6MjA5MzA2NjQ5M30.nYwB5qqtr6fvu5swjYUBhfnckW5cYCcwPrIlq-Br1sQ';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  ngOnInit() {
    this.iniciarMazo();
  }

  iniciarMazo() {
    this.cargando.set(true);
    this.http.get<any>('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1').subscribe({
      next: (data) => {
        this.deckId.set(data.deck_id);
        this.restantes.set(data.remaining);
        this.sacarCartaInicial();
      },
      error: (err) => {
        console.error('Error al iniciar el mazo:', err);
        this.cargando.set(false);
      }
    });
  }

  sacarCartaInicial() {
    this.http.get<any>(`https://deckofcardsapi.com/api/deck/${this.deckId()}/draw/?count=1`).subscribe({
      next: (data) => {
        this.cartaActual.set(data.cards[0]);
        this.restantes.set(data.remaining);
        this.cargando.set(false);
      }
    });
  }

  jugar(eleccion: 'mayor' | 'menor') {
    
    const cartaMesa = this.cartaActual();
    if (this.juegoTerminado() || this.cargando() || !this.cartaActual()) return;
    this.cargando.set(true);
    this.http.get<any>(`https://deckofcardsapi.com/api/deck/${this.deckId()}/draw/?count=1`).subscribe({
      next: (data) => {
        if (!cartaMesa) return;
        const proximaCarta = data.cards[0];
        this.restantes.set(data.remaining);
        
        const valorActual = this.valoresMap[cartaMesa.value];
        const valorProximo = this.valoresMap[proximaCarta.value];

        if (eleccion === 'mayor' && valorProximo > valorActual) {
          this.ganoRonda(proximaCarta);
        } 
        else if (eleccion === 'menor' && valorProximo < valorActual) {
          this.ganoRonda(proximaCarta);
        } 
        else if (valorProximo === valorActual) {
          this.mensaje.set(`¡Empate! Salió otro ${proximaCarta.value}. ¡Te salvaste!`);
          this.cartaActual.set(proximaCarta);
          this.cargando.set(false);
        } 
        else {
          this.perdio(proximaCarta);
        }

        if (this.restantes() === 0 && !this.juegoTerminado()) {
          this.mensaje.set('¡Increíble! ¡Usaste todo el mazo! ¡Victoria!');
          this.juegoTerminado.set(true);
          this.guardarPuntajeEnBD();
        }
      },
      error: (err) => {
        console.error('Error al sacar carta:', err);
        this.cargando.set(false);
      }
    });
  }

  ganoRonda(nuevaCarta: Card) {
    this.puntaje.update(p => p + 1);
    this.mensaje.set(`¡Correcto! Era un ${nuevaCarta.value}.`);
    this.cartaActual.set(nuevaCarta);
    this.cargando.set(false);
  }

  perdio(nuevaCarta: Card) {
    this.mensaje.set(`¡Uy! Era un ${nuevaCarta.value}. Juego terminado.`);
    this.cartaActual.set(nuevaCarta);
    this.juegoTerminado.set(true);
    this.cargando.set(false);
    this.guardarPuntajeEnBD();
  }

  reiniciar() {
    this.puntaje.set(0);
    this.mensaje.set('¿La próxima carta será Mayor o Menor?');
    this.juegoTerminado.set(false);
    this.iniciarMazo();
  }

  async guardarPuntajeEnBD() {
    const usuario = this.auth.usuarioActual();
    if (this.puntaje() > 0 && usuario) {
      const { error } = await this.supabase.from('puntajes_mayor_menor').insert([
        {
          usuario_id: usuario.id,
          usuario_email: usuario.email,
          puntaje: this.puntaje(),
          fecha: new Date().toISOString()
        }
      ]);

      if (error) console.error('Error:', error.message);
    }
  }

  async permitirSalida(): Promise<boolean> {
    if (this.juegoTerminado() || this.puntaje() === 0) return true;

    const result = await Swal.fire({
      title: 'PARTIDA EN CURSO',
      text: '¿Quieres salir? Se guardará tu puntaje actual.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Salir y Guardar',
      cancelButtonText: 'Quedarme'
    });

    if (result.isConfirmed) {
      await this.guardarPuntajeEnBD();
      return true;
    }
    
    return false;
  }
}
