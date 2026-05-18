import { ValidatorFn, ValidationErrors, AbstractControl } from "@angular/forms";

// Validador de Edad: Sincrónico y con parámetro dinámico
export function edadValidator(minimo: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const edad = control.value;
        if (edad !== null && edad !== '') {
        if (edad < minimo) {
            return { edadMinima: `Debes ser mayor de ${minimo} años` };
        } if (edad > 99) {
            return { edadMaxima: 'Tu edad no es valida' };
        }
        }
        return null;
    };
}

export function confirmarClaveValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
        const claveControl = formGroup.get('clave');
        const repiteClaveControl = formGroup.get('repiteClave');
        const respuestaError = { noCoincide: 'Las contraseñas no coinciden' };

        if (claveControl?.value !== repiteClaveControl?.value) {
        formGroup.get('repiteClave')?.setErrors(respuestaError);
        return respuestaError;
        } else {
        formGroup.get('repiteClave')?.setErrors(null);
        return null;
        }
    };

}

export function caracteresEmailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;

    if (email !== null && email !== '') {
        if (email.length < 6) {
            return { caracteresMinimos: 'El correo electrónico debe tener al menos 6 caracteres' };
        }
        if (email.length > 50) {
            return { caracteresMaximos: 'El correo electrónico no puede tener más de 50 caracteres' };
        }
    }
    
    return null;
}