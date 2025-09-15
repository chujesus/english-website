import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // TODO: Implementar lógica de autenticación real
    // Por ahora permitimos acceso libre
    const isAuthenticated = authService.isAuthenticated();

    if (isAuthenticated) {
        return true;
    } else {
        // Redirigir a login si no está autenticado
        router.navigate(['/auth/login']);
        return false;
    }
};

export const guestGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    debugger;
    // TODO: Implementar lógica de autenticación real
    // Por ahora permitimos acceso libre a auth
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
        return true;
    } else {
        // Redirigir a dashboard si ya está autenticado
        router.navigate(['/dashboard']);
        return false;
    }
};
