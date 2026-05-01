import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'

})


export class AuthService {
  usuarioActual = signal<any>(null);
  private supabase: SupabaseClient;
  constructor() {

    const supabaseUrl = 'https://qnwtyoxknivtuczjfeno.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud3R5b3hrbml2dHVjempmZW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTA0OTMsImV4cCI6MjA5MzA2NjQ5M30.nYwB5qqtr6fvu5swjYUBhfnckW5cYCcwPrIlq-Br1sQ';

    
    this.supabase = createClient(supabaseUrl, supabaseKey);


    this.supabase.auth.onAuthStateChange((event, session) => {
      this.usuarioActual.set(session?.user ?? null);
      console.log('sesion iniciada:', event, session?.user?.email);
    });
  }


  async registrarUsuario(email: string, clave: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email: email,
      password: clave,
    });
    if (error) throw error;
    return data;
  }


  async iniciarSesion(email: string, clave: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email,
      password: clave,
    });
    if (error) throw error;
    return data;
  }


  async cerrarSesion() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  estaLogueado(): boolean {
    return this.usuarioActual() !== null;
  }
}