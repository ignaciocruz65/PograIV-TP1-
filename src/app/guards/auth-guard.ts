import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../servicios/auth';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.usuarioActual()) {
    return true;
  }

  console.log('acceso denegado, pal login ');
  router.navigate(['/login']);
  return false;
};