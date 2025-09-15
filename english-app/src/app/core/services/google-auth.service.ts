import { Injectable } from '@angular/core';
import { GoogleAuthPayload } from '../../shared/interfaces/auth';
import { GOOGLE_CONFIG } from '../config/google.config';

declare global {
    interface Window {
        google: any;
        gapi: any;
    }
}

@Injectable({
    providedIn: 'root'
})
export class GoogleAuthService {
    private isGoogleLoaded = false;

    constructor() {
        this.loadGoogleAPI();
    }

    private async loadGoogleAPI(): Promise<void> {
        try {
            // Esperar a que Google Identity Services se cargue
            await this.waitForGoogleScript();

            // Inicializar Google Identity Services
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CONFIG.clientId,
                    callback: this.handleCredentialResponse.bind(this)
                });

                this.isGoogleLoaded = true;
                console.log('Google Auth API loaded successfully');
            }
        } catch (error) {
            console.error('Error loading Google Auth API:', error);
        }
    }

    private waitForGoogleScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            const maxAttempts = 50;
            let attempts = 0;

            const checkGoogle = () => {
                attempts++;
                if (window.google && window.google.accounts) {
                    resolve();
                } else if (attempts < maxAttempts) {
                    setTimeout(checkGoogle, 100);
                } else {
                    reject(new Error('Google script failed to load'));
                }
            };

            checkGoogle();
        });
    }

    private credentialResponse: any = null;

    private handleCredentialResponse(response: any) {
        this.credentialResponse = response;
    }

    async signInWithGoogle(): Promise<GoogleAuthPayload> {
        if (!this.isGoogleLoaded) {
            throw new Error('Google Auth not loaded yet');
        }

        return new Promise((resolve, reject) => {
            try {
                // Mostrar el popup de Google
                window.google.accounts.id.prompt((notification: any) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        // Fallback al método de popup
                        this.signInWithPopup().then(resolve).catch(reject);
                    }
                });

                // Escuchar la respuesta de credenciales
                const checkResponse = () => {
                    if (this.credentialResponse) {
                        const payload = this.parseJwtPayload(this.credentialResponse.credential);
                        this.credentialResponse = null; // Reset

                        resolve({
                            email: payload.email,
                            name: payload.name,
                            googleId: payload.sub,
                            avatar: payload.picture
                        });
                    } else {
                        setTimeout(checkResponse, 100);
                    }
                };

                setTimeout(checkResponse, 100);

                // Timeout después de 30 segundos
                setTimeout(() => {
                    if (this.credentialResponse === null) {
                        reject(new Error('Google sign-in timeout'));
                    }
                }, 30000);

            } catch (error) {
                reject(error);
            }
        });
    }

    private async signInWithPopup(): Promise<GoogleAuthPayload> {
        return new Promise((resolve, reject) => {
            // Este es un fallback usando OAuth 2.0 popup
            const authUrl = `https://accounts.google.com/oauth/authorize?` +
                `client_id=${GOOGLE_CONFIG.clientId}&` +
                `redirect_uri=${window.location.origin}&` +
                `scope=${GOOGLE_CONFIG.scope}&` +
                `response_type=token&` +
                `include_granted_scopes=true`;

            const popup = window.open(authUrl, 'google-signin', 'width=500,height=600');

            const checkClosed = setInterval(() => {
                if (popup?.closed) {
                    clearInterval(checkClosed);
                    reject(new Error('Google sign-in popup closed'));
                }
            }, 1000);

            // Por ahora retornamos datos mock para desarrollo
            setTimeout(() => {
                if (popup) popup.close();
                clearInterval(checkClosed);

                resolve({
                    email: 'test@gmail.com',
                    name: 'Usuario de Prueba',
                    googleId: 'google_test_id_' + Date.now(),
                    avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
                });
            }, 2000);
        });
    }

    private parseJwtPayload(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Invalid JWT token');
        }
    }

    async signOut(): Promise<void> {
        try {
            if (this.isGoogleLoaded && window.google) {
                window.google.accounts.id.disableAutoSelect();
            }
            console.log('Google sign out completed');
        } catch (error) {
            console.error('Error signing out from Google:', error);
        }
    }

    isSignedIn(): boolean {
        // TODO: Implementar verificación real del estado de Google
        return false;
    }

    isLoaded(): boolean {
        return this.isGoogleLoaded;
    }
}
