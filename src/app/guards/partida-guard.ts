import { CanDeactivateFn } from '@angular/router';

export interface TieneSalidaProtegida {
  permitirSalida: () => Promise<boolean> | boolean;
}

export const partidaGuard: CanDeactivateFn<TieneSalidaProtegida> = (component) => {
  return component.permitirSalida ? component.permitirSalida() : true;
};