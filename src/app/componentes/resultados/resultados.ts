import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type PuntajeBase = {
  usuario_email: string;
  fecha: string;
};

type PuntajeAhorcado = PuntajeBase & {
  resultado: string;
  letras_intentadas: number;
  duracion_segundos: number;
};

type PuntajeMayorMenor = PuntajeBase & {
  puntaje: number;
};

type PuntajePreguntados = PuntajeBase & {
  aciertos: number;
  total_preguntas: number;
};

type PuntajeSimonDice = PuntajeBase & {
  puntaje: number;
};

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultados.html',
  styleUrl: './resultados.css'
})
export class Resultados implements OnInit {
  private supabase: SupabaseClient;

  ahorcadoRanking = signal<PuntajeAhorcado[]>([]);
  mayorMenorRanking = signal<PuntajeMayorMenor[]>([]);
  preguntadosRanking = signal<PuntajePreguntados[]>([]);
  simonDiceRanking = signal<PuntajeSimonDice[]>([]);
  
  cargando = signal(true);

  constructor() {
    const supabaseUrl = 'https://qnwtyoxknivtuczjfeno.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud3R5b3hrbml2dHVjempmZW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTA0OTMsImV4cCI6MjA5MzA2NjQ5M30.nYwB5qqtr6fvu5swjYUBhfnckW5cYCcwPrIlq-Br1sQ';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  ngOnInit() {
    this.cargarResultados();
  }

  async cargarResultados() {
    this.cargando.set(true);
    try {
      await Promise.all([
        this.obtenerAhorcado(),
        this.obtenerMayorMenor(),
        this.obtenerPreguntados(),
        this.obtenerSimonDice()
      ]);
    } catch (error) {
      console.error('Error cargando rankings:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  async obtenerAhorcado() {
    const { data, error } = await this.supabase
      .from('puntajes_ahorcado')
      .select('usuario_email, resultado, letras_intentadas, duracion_segundos, fecha')
      .order('resultado', { ascending: false }) // GANÓ primero
      .order('duracion_segundos', { ascending: true }) // Menos tiempo mejor
      .limit(10);

    if (!error) this.ahorcadoRanking.set(data || []);
  }

  async obtenerMayorMenor() {
    const { data, error } = await this.supabase
      .from('puntajes_mayor_menor')
      .select('usuario_email, puntaje, fecha')
      .order('puntaje', { ascending: false })
      .limit(10);

    if (!error) this.mayorMenorRanking.set(data || []);
  }

  async obtenerPreguntados() {
    const { data, error } = await this.supabase
      .from('puntajes_preguntados')
      .select('usuario_email, aciertos, total_preguntas, fecha')
      .order('aciertos', { ascending: false })
      .limit(10);

    if (!error) this.preguntadosRanking.set(data || []);
  }

  async obtenerSimonDice() {
    const { data, error } = await this.supabase
      .from('puntajes_simon_dice')
      .select('usuario_email, puntaje, fecha')
      .order('puntaje', { ascending: false })
      .limit(10);

    if (!error) this.simonDiceRanking.set(data || []);
  }

  formatearFecha(fechaStr: string): string {
    return new Date(fechaStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
