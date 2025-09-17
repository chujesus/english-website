import { environment } from '../../../environments/environment';
import { GoogleConfig } from '../../shared/interfaces';

// Configuración que se adapta automáticamente según el environment
export const GOOGLE_CONFIG: GoogleConfig = {
    clientId: environment.googleAuth.clientId,
    redirectUri: environment.googleAuth.redirectUri,
    scope: environment.googleAuth.scope
};

// Para verificar si la configuración es válida
export const isGoogleConfigValid = (): boolean => {
    return !GOOGLE_CONFIG.clientId.includes('YOUR_GOOGLE_CLIENT_ID');
};
