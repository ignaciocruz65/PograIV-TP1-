import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-quien-soy',
  templateUrl: './quien-soy.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./quien-soy.css']
})
export class QuienSoy implements OnInit {
  miPerfil = signal<any>(null);
  constructor(private http: HttpClient) { }
  ngOnInit(): void {
    const urlGithub = 'https://api.github.com/users/ignaciocruz65'; 
    this.http.get(urlGithub).subscribe({
      next: (datos) => {
        this.miPerfil.set(datos);
        console.log("recibido", this.miPerfil);
      },
      error: (error) => {
        console.error("error al cargar los datos de github", error);
      }
    });
  }
}