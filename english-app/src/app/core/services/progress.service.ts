import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LocalStorageService } from './local-storage.service';
import { StudentProgress, TopicProgress, DashboardData } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class ProgressService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    /**
     * Get student progress for a specific course
     * @param courseId - Course ID
     * @param userId - User ID
     */
    getStudentProgressByCourse(courseId: number, userId: number): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/progress/student/${userId}?courseId=${courseId}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get student progress for all courses
     * @param userId - User ID
     */
    getAllStudentProgress(userId: number): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/progress/student/${userId}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get topic-specific progress for a student
     */
    getTopicProgress(topicId: number, userId?: number): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/progress/student/${userId}/topic/${topicId}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Update topic progress status
     */
    updateTopicProgress(topicId: number, status: string, progressPercentage?: number, userId?: number): Observable<any[]> {
        const body = {
            status,
            progress_percentage: progressPercentage || 0
        };
        return this.http.put<any>(`${this.apiUrl}/progress/student/${userId}/topic/${topicId}`, body).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get student dashboard data with overview of all courses
     */
    getStudentDashboard(userId?: number): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/progress/dashboard/${userId}`).pipe(map((res: any) => res.data as any[]));
    }
}