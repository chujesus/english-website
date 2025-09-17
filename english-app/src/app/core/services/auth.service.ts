import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map, Observable } from 'rxjs';
import { IUser, Profile } from '../../shared/interfaces';
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

    constructor(private http: HttpClient, private localStorageService: LocalStorageService, private googleAuth: GoogleAuthService) {
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
            console.error('Error en Google login:', error);
            throw new Error('Error al iniciar sesión con Google');
        }
    }

    register(_user: any): Observable<IUser[]> {
        return this.http.post<any[]>(`${this.baseUrl}/auths/register`, _user).pipe(map((user: any) => {
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
                user.user_state = user.state === 1 ? 'Habilitado' : 'Inhabilitado';
                return user;
            });
        }));
    }

    getUserToken(id: number): Observable<IUser[]> {
        return this.http.get<IUser[]>(`${this.baseUrl}/auths/generate-jwt/${id}`).pipe(map((user: any) => {
            this.localStorageService.setCredentials(user.data[0]);
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
        this.localStorageService.clear();
        this.googleAuth.signOut();
    }
}
