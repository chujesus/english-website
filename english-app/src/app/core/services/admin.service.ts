import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContentUpload, TopicUpdate, LessonUpload, ContentManagement } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }



    /**
     * Get content management overview
     */
    getContentManagement(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/admin/content-management`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Upload complete course content
     */
    uploadCourseContent(contentData: ContentUpload): Observable<any[]> {
        return this.http.post<any>(`${this.apiUrl}/admin/upload/course`, contentData).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Update specific topic content
     */
    updateTopicContent(topicId: number, topicData: TopicUpdate): Observable<any[]> {
        return this.http.put<any>(`${this.apiUrl}/admin/topic/${topicId}`, topicData).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Upload/update lesson content for a topic
     */
    uploadLessonContent(topicId: number, lessonData: LessonUpload): Observable<any[]> {
        return this.http.post<any>(`${this.apiUrl}/admin/upload/lesson/${topicId}`, lessonData).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Validate JSON structure for course content
     */
    validateJSONStructure(jsonData: any, type: 'topic' | 'lesson'): Observable<any[]> {
        const body = { jsonData, type };
        return this.http.post<any>(`${this.apiUrl}/admin/validate-json`, body).pipe(map((res: any) => res.data as any[]));
    }
}