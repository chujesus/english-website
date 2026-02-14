import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MainService } from './main.service';

export interface UserProfileData {
    id?: number;
    identification: string;
    name: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    url_image?: string;
    image_name?: string;
    email?: string;
    profile?: number;
}

export interface ProfileUpdateResponse {
    ok: boolean;
    message: string;
    user?: UserProfileData;
}

@Injectable({
    providedIn: 'root'
})
export class ProfileService extends MainService {

    constructor(private http: HttpClient) {
        super();
    }

    /**
     * Get user profile by ID
     */
    getUserProfile(userId: number): Observable<UserProfileData> {
        return this.http.get<any>(`${this.baseUrl}/users/profile/${userId}`).pipe(
            map((response: any) => response.user as UserProfileData)
        );
    }

    /**
     * Update user profile
     */
    updateUserProfile(userId: number, profileData: UserProfileData): Observable<ProfileUpdateResponse> {
        return this.http.put<ProfileUpdateResponse>(`${this.baseUrl}/users/profile/${userId}`, profileData);
    }

    /**
     * Delete profile image
     */
    deleteProfileImage(userId: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/users/profile-image/${userId}`);
    }
}