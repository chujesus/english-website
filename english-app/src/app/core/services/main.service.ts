import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MainService {
    baseUrl = 'http://localhost:3001';
    //baseUrl = 'https://ctp-matricula-web.unitalwebsolutions.com';
    baseUrlTSE = 'https://padron-electoral.unitalwebsolutions.com';

    constructor() { }
}
