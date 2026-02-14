import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MainService } from './main.service';
import { ApiResponse } from '../../shared/interfaces';
import { ISetting } from '../../shared/interfaces/models';

@Injectable({
    providedIn: 'root'
})
export class SettingService extends MainService {

    constructor(private http: HttpClient) {
        super();
    }

    /**
     * Get all settings
     */
    getAllSettings(): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/settings`);
    }

    /**
     * Get setting by name
     */
    getSettingByName(name: string): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/settings/name/${name}`);
    }

    /**
     * Create new setting
     */
    createSetting(setting: ISetting): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.baseUrl}/settings`, setting);
    }

    /**
     * Update setting
     */
    updateSetting(id: number, setting: ISetting): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/settings/${id}`, setting);
    }

    /**
     * Delete setting
     */
    deleteSetting(id: number): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/settings/${id}`);
    }
}
