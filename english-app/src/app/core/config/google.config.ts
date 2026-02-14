import { environment } from '../../../environments/environment';
import { GoogleConfig } from '../../shared/interfaces';

// Configuration that adapts automatically according to the environment
export const GOOGLE_CONFIG: GoogleConfig = {
    clientId: environment.googleAuth.clientId,
    redirectUri: environment.googleAuth.redirectUri,
    scope: environment.googleAuth.scope
};

// To verify if the configuration is valid
export const isGoogleConfigValid = (): boolean => {
    return !GOOGLE_CONFIG.clientId.includes('YOUR_GOOGLE_CLIENT_ID');
};
