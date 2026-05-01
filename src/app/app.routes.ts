import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./componentes/home/home').then(c => c.Home) 
    },  
    {
        path: 'home',
        loadComponent: () => import('./componentes/home/home').then(c => c.Home)
    },
    {
        path: 'login',
        loadComponent: () => import('./componentes/login/login').then(c => c.Login)
    },
    {
        path: 'quien-soy',
        canActivate: [authGuard],
        loadComponent: () => import('./componentes/quien-soy/quien-soy').then(c => c.QuienSoy)
    },
    {
        path: 'registro',
        loadComponent: () => import('./componentes/registro/registro').then(c => c.Registro)
    },
    {
        path: 'juegos',
        canActivate: [authGuard],
        loadChildren: () => import('./modulos/juegos/juegos.routes').then(c => c.JUEGOS_ROUTES)
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full'
    }
];

