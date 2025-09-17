export const environment = {
    production: false,
    apiUrl: 'http://localhost:3001',
    googleAuth: {
        clientId: 'YOUR_GOOGLE_CLIENT_ID_DEV.apps.googleusercontent.com',
        scope: 'email profile openid',
        redirectUri: 'http://localhost:4200'
    }
};