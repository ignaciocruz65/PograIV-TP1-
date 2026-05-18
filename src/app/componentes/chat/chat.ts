import { Component, OnInit, signal, effect, ElementRef, ViewChild, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Mensaje {
  id?: number;
  created_at?: string;
  usuario_id: string;
  usuario_email: string;
  mensaje: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  private authService = inject(AuthService);
  private supabase: SupabaseClient;
  
  mensajes = signal<Mensaje[]>([]);
  nuevoMensaje = signal('');
  usuarioActual = this.authService.usuarioActual;
  
  constructor() {
    const supabaseUrl = 'https://qnwtyoxknivtuczjfeno.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud3R5b3hrbml2dHVjempmZW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTA0OTMsImV4cCI6MjA5MzA2NjQ5M30.nYwB5qqtr6fvu5swjYUBhfnckW5cYCcwPrIlq-Br1sQ';
    this.supabase = createClient(supabaseUrl, supabaseKey);

    effect(() => {
      if (this.mensajes()) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  ngOnInit(): void {
    this.cargarMensajes();
    this.suscribirseAMensajes();
  }

  ngOnDestroy(): void {
    this.supabase.channel('sala-chat').unsubscribe();
  }

  async cargarMensajes() {
    const { data, error } = await this.supabase
      .from('mensajes')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error) {
      this.mensajes.set(data || []);
    }
  }

  async enviar() {
    const texto = this.nuevoMensaje().trim();
    const usuario = this.usuarioActual();
    
    if (texto && usuario && texto.length <= 200) {
      const nuevo: Mensaje = {
        usuario_id: usuario.id,
        usuario_email: usuario.email,
        mensaje: texto
      };

      const { error } = await this.supabase
        .from('mensajes')
        .insert([nuevo]);

      if (!error) {
        this.nuevoMensaje.set('');
      }
    }
  }

  private suscribirseAMensajes() {
    this.supabase
      .channel('sala-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes'
        },
        (payload) => {
          const nuevoMsj = payload.new as Mensaje;
          this.mensajes.update(list => [...list, nuevoMsj]);
        }
      )
      .subscribe();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}



