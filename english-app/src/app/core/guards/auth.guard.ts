import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const alertService = inject(AlertService);
    const router = inject(Router);

    // TODO: Implement real authentication logic
    // For now we allow free access
    const isAuthenticated = await authService.isNotExpiredToken()

    if (isAuthenticated) {
        return true;
    } else {
        alertService.showWarningToast("User does not have permission to access the system.");
        router.navigate(['/login']);
        return false;
    }
};

export const guestGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // TODO: Implement real authentication logic
    // For now we allow free access to auth
    const isAuthenticated = await authService.isNotExpiredToken()

    if (!isAuthenticated) {
        return true;
    } else {
        // Redirect to dashboard if already authenticated
        router.navigate(['/dashboard/control-panel']);
        return false;
    }
};
