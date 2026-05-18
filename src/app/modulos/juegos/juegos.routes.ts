import { Routes } from '@angular/router';
import { Juegos } from './juegos';
import { partidaGuard } from '../../guards/partida-guard';

export const JUEGOS_ROUTES: Routes = [
    { 
        path: '', 
        component: Juegos
    },
    {
        path: 'mayor-menor',
        loadComponent: () => import('./mayor-menor/mayor-menor').then(c => c.MayorMenor),
        canDeactivate: [partidaGuard]
    },
    {
        path: 'ahorcado',
        loadComponent: () => import('./ahorcado/ahorcado').then(c => c.Ahorcado),
        canDeactivate: [partidaGuard]
    },
    {
        path: 'preguntados',
        loadComponent: () => import('./preguntados/preguntados').then(c => c.Preguntados),
        canDeactivate: [partidaGuard]
    },
    {
        path: 'simon-dice',
        loadComponent: () => import('./simon-dice/simon-dice').then(c => c.SimonDice),
        canDeactivate: [partidaGuard]
    }
];
