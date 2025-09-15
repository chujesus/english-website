export const environment = {
    production: true,
    apiUrl: 'https://your-production-api.com/api',
    googleAuth: {
        clientId: 'YOUR_GOOGLE_CLIENT_ID_PROD.apps.googleusercontent.com',
        scope: 'email profile openid',
        redirectUri: 'https://your-production-domain.com'
    }
};

// IMPORTANTE: Para producción
// 1. Ve a https://console.cloud.google.com/
// 2. Usa el mismo proyecto o crea uno nuevo
// 3. Crea credenciales OAuth 2.0 para producción
// 4. Agrega tu dominio de producción a los orígenes autorizados
