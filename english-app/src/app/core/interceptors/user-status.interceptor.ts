import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';

@Injectable()
export class UserStatusInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private authService: AuthService,
        private alertService: AlertService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                // Check if the error is 403 (Forbidden) and user is inactive
                if (error.status === 403 &&
                    (error.error?.message?.includes('inactive') ||
                        error.error?.message?.includes('Access denied'))) {

                    // Show alert to user
                    this.alertService.showWarningAlert(
                        'Account Inactive',
                        'Your account has been deactivated. Please contact the administrator.'
                    );

                    // Logout user (this will also redirect to login)
                    this.authService.logout();

                    return throwError(() => new Error('Account inactive'));
                }

                return throwError(() => error);
            })
        );
    }
}