import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const alertService = inject(AlertService);
    const router = inject(Router);

    // TODO: Implementar lógica de autenticación real
    // Por ahora permitimos acceso libre
    const isAuthenticated = await authService.isNotExpiredToken()

    if (isAuthenticated) {
        return true;
    } else {
        alertService.showWarningToast("Usuario no tiene permisos para ingresar al sistema.");
        router.navigate(['/login']);
        return false;
    }
};

export const guestGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // TODO: Implementar lógica de autenticación real
    // Por ahora permitimos acceso libre a auth
    const isAuthenticated = await authService.isNotExpiredToken()

    if (!isAuthenticated) {
        return true;
    } else {
        // Redirigir a dashboard si ya está autenticado
        router.navigate(['/dashboard/control-panel']);
        return false;
    }
};
