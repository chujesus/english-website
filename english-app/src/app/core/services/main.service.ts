import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MainService {
    //baseUrl = 'https://api-english-app.unitalwebsolutions.com';
    baseUrl = 'http://localhost:3001';
    baseUrlTSE = 'https://padron-electoral.unitalwebsolutions.com';

    constructor() { }
}
