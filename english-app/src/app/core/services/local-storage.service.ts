import { Injectable } from '@angular/core';
import { IUser } from '../../shared/interfaces/auth';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    private readonly USER_KEY = 'uws_usc';

    constructor() { }

    setCredentials(user: any) {
        let sessionAuth = {
            task: user.id,
            name: user.name.trim(),
            status: +user.profile,
            uws: user.token
        }
        localStorage.setItem(this.USER_KEY, JSON.stringify(sessionAuth));
    }

    getCredentials() {
        const session = JSON.parse(localStorage.getItem(this.USER_KEY)!);
        if (session !== null) {
            return session;
        }
        return null;
    }

    clear(): void {
        localStorage.removeItem(this.USER_KEY);
    }

    // Validar sesión
    hasValidSession(): boolean {
        const user = this.getCredentials();
        if (!user) return false;

        try {
            // TODO: Implementar validación real del token JWT
            // Por ahora solo verificamos que exista
            const payload = this.decodeToken(user.token);
            return payload && payload.exp > Date.now() / 1000;
        } catch {
            return false;
        }
    }

    // Decodificar token JWT (básico, para desarrollo)
    private decodeToken(token: string): any {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch {
            return null;
        }
    }
}
