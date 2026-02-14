import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MainService {
    //baseUrl = 'http://localhost:3001';
    baseUrl = 'https://api-english-app.unitalwebsolutions.com';
    baseUrlTSE = 'https://padron-electoral.unitalwebsolutions.com';

    constructor() { }
}
