import { Routes } from '@angular/router';
import { Juegos } from './juegos';
import { MayorMenor } from './mayor-menor/mayor-menor';
import { partidaGuard } from '../../guards/partida-guard';

export const JUEGOS_ROUTES: Routes = [
    
    { 
        path: '', 
        component: Juegos
    },
    
    {
        path: 'mayor-menor',
        component: MayorMenor,
        canDeactivate: [partidaGuard]
    
    }
];