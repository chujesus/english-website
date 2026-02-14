export const environment = {
    production: true,
    apiUrl: 'https://your-production-api.com/api',
    googleAuth: {
        clientId: 'YOUR_GOOGLE_CLIENT_ID_PROD.apps.googleusercontent.com',
        scope: 'email profile openid',
        redirectUri: 'https://your-production-domain.com'
    }
};

// IMPORTANT: For production
// 1. Go to https://console.cloud.google.com/
// 2. Use the same project or create a new one
// 3. Create OAuth 2.0 credentials for production
// 4. Add your production domain to authorized origins
