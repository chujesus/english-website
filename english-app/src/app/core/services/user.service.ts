import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MainService } from './main.service';
import { ApiResponse, IUser } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class UserService extends MainService {

    constructor(private http: HttpClient) {
        super();
    }

    /**
     * Get all users
     */
    getAllUsers(): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/users/all`);
    }

    /**
     * Get user by ID
     */
    getUserById(userId: number): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/users/${userId}`);
    }

    /**
     * Update user information
     */
    updateUser(userId: number, userData: IUser): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/users/${userId}`, userData);
    }

    /**
     * Delete user
     */
    deleteUser(userId: number): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/users/${userId}`);
    }

    /**
     * Toggle user status (activate/deactivate)
     */
    toggleUserStatus(userId: number, state: number, starting_module?: string): Observable<ApiResponse> {
        const body = starting_module ? { state, starting_module } : { state };
        return this.http.patch<ApiResponse>(`${this.baseUrl}/users/${userId}/status`, body);
    }

    /**
     * Get users by profile
     */
    getUsersByProfile(profile: number): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/users/profile-filter/${profile}`);
    }

    /**
     * Get users by status
     */
    getUsersByStatus(state: number): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/users/status/${state}`);
    }

    /**
     * Search users
     */
    searchUsers(searchTerm: string): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/users/search?q=${encodeURIComponent(searchTerm)}`);
    }

    /**
     * Get available starting modules
     */
    getAvailableModules(): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/users/available-modules`);
    }
}