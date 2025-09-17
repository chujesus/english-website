import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LocalStorageService } from './local-storage.service';
import { PracticeAttempt, PracticeSubmission, TopicScore } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class PracticeService {
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService
    ) { }

    /**
     * Get current user ID from localStorage
     */
    private getCurrentUserId(): number {
        const credentials = this.localStorageService.getCredentials();
        return credentials?.task || 0;
    }



    /**
     * Submit a practice attempt
     */
    /**
     * Submit a practice attempt
     */
    submitPracticeAttempt(practiceData: Omit<PracticeSubmission, 'user_id'>): Observable<any[]> {
        const userId = this.getCurrentUserId();
        const submissionData = { ...practiceData, user_id: userId };
        return this.http.post<any>(`${this.apiUrl}/practice/submit`, submissionData).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get practice history for a student and topic
     */
    getPracticeHistory(topicId: number): Observable<any[]> {
        const userId = this.getCurrentUserId();
        return this.http.get<any>(`${this.apiUrl}/practice/history/${userId}/${topicId}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Check if student can attempt a specific practice
     */
    canAttemptPractice(topicId: number, practiceType: string, sectionIndex: number): Observable<any[]> {
        const userId = this.getCurrentUserId();
        return this.http.get<any>(`${this.apiUrl}/practice/can-attempt/${userId}/${topicId}/${practiceType}/${sectionIndex}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Calculate topic score based on all completed practices
     */
    calculateTopicScore(topicId: number): Observable<any[]> {
        const userId = this.getCurrentUserId();
        return this.http.get<any>(`${this.apiUrl}/practice/topic-score/${userId}/${topicId}`).pipe(map((res: any) => res.data as any[]));
    }
}