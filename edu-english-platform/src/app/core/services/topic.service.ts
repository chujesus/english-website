import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MainService } from './main.service';

export interface ApiResponse {
    ok: boolean;
    data?: any;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class TopicService extends MainService {

    constructor(private http: HttpClient) {
        super();
    }

    /**
     * Get all topics
     */
    getAllTopics(): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/topics`);
    }

    /**
     * Get topics by course ID
     */
    getTopicsByCourse(courseId: number, limit?: number): Observable<ApiResponse> {
        const params = limit ? `?limit=${limit}` : '';
        return this.http.get<ApiResponse>(`${this.baseUrl}/topics/course/${courseId}${params}`);
    }

    /**
     * Get topic by ID
     */
    getTopicById(topicId: number): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/topics/${topicId}`);
    }

    /**
     * Get topics by level (CEFR)
     */
    getTopicsByLevel(level: string): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/topics/level/${level}`);
    }
}
