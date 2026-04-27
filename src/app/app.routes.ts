import { Routes } from '@angular/router';

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
        loadComponent: () => import('./componentes/quien-soy/quien-soy').then(c => c.QuienSoy)
    },
    {
        path: 'registro',
        loadComponent: () => import('./componentes/registro/registro').then(c => c.Registro)
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full'
    }
];

