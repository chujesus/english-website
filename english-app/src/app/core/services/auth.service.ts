import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map, Observable, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { IUser, Profile, ForgotPasswordResponse } from '../../shared/interfaces';
import { GoogleAuthService } from './google-auth.service';
import { MainService } from './main.service';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { jwtDecode } from "jwt-decode";
import { Key } from '../../shared/constants/constants';

@Injectable({
    providedIn: 'root'
})
export class AuthService extends MainService {

    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private googleAuth: GoogleAuthService,
        private router: Router
    ) {
        super();
    }

    login(_user: IUser): Observable<IUser[]> {
        return this.http.post<any[]>(`${this.baseUrl}/auths/login`, _user).pipe(map((user: any) => {
            return user.data as IUser[];
        }));
    }

    async loginWithGoogle(): Promise<IUser> {
        try {
            const googlePayload = await this.googleAuth.signInWithGoogle();
            const user: IUser = {
                google_id: googlePayload.googleId,
                token: 'google_access_token_' + Date.now(),
                refresh_token: 'google_refresh_token_' + Date.now(),
                name: googlePayload.name,
                email: googlePayload.email,
                profile: Profile.Student,
                url_image: googlePayload.avatar
            };

            this.localStorageService.setCredentials(user);
            return user;

        } catch (error) {
            console.error('Error in Google login:', error);
            throw new Error('Error signing in with Google');
        }
    }

    register(_user: any): Observable<IUser[]> {
        return this.http.post<any[]>(`${this.baseUrl}/auths/register`, _user).pipe(map((user: any) => {
            return user.data as IUser[];
        }));
    }

    getUser(id: number): Observable<IUser[]> {
        return this.http.get<IUser[]>(`${this.baseUrl}/auths/${id}`).pipe(map((user: any) => {
            return user.data as IUser[];
        }));
    }

    getUserIdentification(identification: string): Observable<IUser[]> {
        return this.http.get<IUser[]>(`${this.baseUrl}/auths/identification/${identification}`).pipe(map((users: any) => {
            return users.data as IUser[];
        }));
    }

    getUserEmail(email: string): Observable<IUser[]> {
        return this.http.get<IUser[]>(`${this.baseUrl}/auths/email/${email}`).pipe(map((user: any) => {
            return user.data as IUser[];
        }));
    }

    getUsersProfile(profile: number): Observable<IUser[]> {
        return this.http.get<IUser[]>(`${this.baseUrl}/auths/profile/${profile}`).pipe(map((users: any) => {
            return users.data.map((user: IUser) => {
                user.user_state = user.state === 1 ? 'Enabled' : 'Disabled';
                return user;
            });
        }));
    }

    getUserToken(id: number): Observable<IUser[]> {
        return this.http.get<IUser[]>(`${this.baseUrl}/auths/generate-jwt/${id}`).pipe(map((user: any) => {
            return user.data as IUser[];
        }));
    }

    isLoggedIn() {
        const isLogged = this.localStorageService.getCredentials();
        if (!isLogged) {
            return false;
        }
        return true;
    }

    async isNotExpiredToken(): Promise<boolean> {
        let session = JSON.parse(localStorage.getItem(Key.IsloggedKey)!);

        if (session !== null) {
            let decoded = jwtDecode(session.token);
            let expiredToken = Number(decoded.exp);
            let expiredDate = new Date(expiredToken * 1000);
            let currentDate = new Date();
            let diffDate = expiredDate.getTime() - currentDate.getTime();
            diffDate = Math.round(diffDate / (1000 * 60));

            if (diffDate < 11 && diffDate > -11 || true) {
                try {
                    return true;
                } catch (error) {
                    return false;
                }
            }
        }

        return false;
    }

    logout(): void {
        // Clear all user data from localStorage
        this.localStorageService.clear();

        // Clear any other potential localStorage items
        localStorage.removeItem(Key.IsloggedKey);

        // Sign out from Google if applicable
        this.googleAuth.signOut();

        // Redirect to login page (root route)
        this.router.navigate(['/auth/login']).then(() => {
            // Force page reload to ensure clean state
            window.location.reload();
        });
    }

    /**
     * Send recovery password email
     */
    forgotPassword(email: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/auths/recovery-password/${email}`).pipe(
            map((response: any) => {
                return response;
            })
        );
    }

    updateUser(_user: any): Observable<IUser[]> {
        return this.http.put<IUser[]>(`${this.baseUrl}/auths/${_user.id}`, _user).pipe(map((user: any) => {
            return user.data as IUser[];
        }));
    }

    /**
     * Check if current user account is still active
     */
    checkUserStatus(): Observable<boolean> {
        const session = this.localStorageService.getCredentials();
        if (!session || !session.task) {
            return of(false);
        }

        return this.http.get<any>(`${this.baseUrl}/users/profile/${session.task}`).pipe(
            map((response: any) => {
                if (response.ok && response.user) {
                    return response.user.state === 1; // Active user
                }
                return false;
            }),
            catchError(() => {
                // If there's an error, consider user as inactive
                return of(false);
            })
        );
    }
}
