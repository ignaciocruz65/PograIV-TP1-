import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mayor-menor.html',
  styleUrl: './mayor-menor.css'
})
export class MayorMenor {
  cartaActual = signal<number>(this.generarCarta());
  puntaje = signal<number>(0);
  mensaje = signal<string>('¿La próxima será Mayor o Menor?');
  juegoTerminado = signal<boolean>(false);

  generarCarta(): number {
    return Math.floor(Math.random() * 12) + 1;
  }

  jugar(eleccionDelUsuario: 'mayor' | 'menor') {
    if (this.juegoTerminado()) return;

    const proximaCarta = this.generarCarta();

    if (eleccionDelUsuario === 'mayor' && proximaCarta > this.cartaActual()) {
      this.ganoRonda(proximaCarta);
    } 
    else if (eleccionDelUsuario === 'menor' && proximaCarta < this.cartaActual()) {
      this.ganoRonda(proximaCarta);
    } 
    else if (proximaCarta === this.cartaActual()) {
      this.mensaje.set(`¡Empate! Salió otro ${proximaCarta}. Zafaste.`);
    } 
    else {
      this.perdio(proximaCarta);
    }
  }

  ganoRonda(nuevaCarta: number) {
    this.puntaje.update(p => p + 1);
    this.mensaje.set(`¡Acertaste! Salió un ${nuevaCarta}.`);
    this.cartaActual.set(nuevaCarta);
  }

  perdio(nuevaCarta: number) {
    this.mensaje.set(`¡Uuuh! Salió un ${nuevaCarta}. Fin del juego.`);
    this.juegoTerminado.set(true);
  }

  reiniciar() {
    this.puntaje.set(0);
    this.cartaActual.set(this.generarCarta());
    this.mensaje.set('¿La próxima será Mayor o Menor?');
    this.juegoTerminado.set(false);
  }

  permitirSalida(): Promise<boolean> | boolean {
    if (this.juegoTerminado() || this.puntaje() === 0) {
      return true; 
    }

    return Swal.fire({
      title: 'PARTIDA EN CURSO',
      text: '¿Desea abandonar la mesa? Su puntaje actual será registrado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#212529',
      cancelButtonColor: '#dc3545', 
      confirmButtonText: 'Abandonar y Guardar',
      cancelButtonText: 'Continuar Jugando',
      background: '#f8f9fa',
      customClass: {
        title: 'text-dark fw-bold fs-4'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.guardarPuntajeEnBD();
        return true;
      }
      return false;
    });
  }

  guardarPuntajeEnBD() {
    if (this.puntaje() > 0) {
      console.log(`[BASE DE DATOS] Guardando puntaje: ${this.puntaje()} puntos.`);
    }
  }


}