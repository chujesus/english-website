import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Key } from '../../shared/constants/constants';

@Injectable({
    providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

    constructor(private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        let session = JSON.parse(localStorage.getItem(Key.IsloggedKey)!);
        const token = session !== null ? session.token : null;

        if (session !== null) {
            req = req.clone({
                setHeaders: {
                    "Access-Control-Allow-Origin": "*",
                    Authorization: `Bearer ${token}`
                }
            });
        } else {
            req = req.clone({
                setHeaders: {}
            });
        }

        return next.handle(req).pipe(
            catchError((err: HttpErrorResponse) => {
                console.error('❌ HTTP Error in interceptor:', err);

                if (err.status === 401) {
                    console.log('🚫 Unauthorized - redirecting to login');
                    localStorage.removeItem(Key.IsloggedKey);
                    this.router.navigate(['/auth/login']);
                }

                return throwError(() => err);
            })
        );
    }
}