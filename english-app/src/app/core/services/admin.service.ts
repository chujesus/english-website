import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IContentUpload, ILessonUpload, ITopicUpdate } from '../../shared/interfaces/models';
import { MainService } from './main.service';

export interface AdminCourse {
    id?: number;
    level: string;
    title: string;
    description?: string;
    total_topics?: number;
    created_at?: string;
    updated_at?: string;
}

export interface AdminTopic {
    id?: number;
    course_id: number;
    title: string;
    objective: string;
    examples?: any[];
    keywords?: string[];
    learning_outcome?: string;
    cefr_level?: string;
    skills_covered?: string[];
    tags?: string[];
    total_lessons?: number;
    created_at?: string;
    updated_at?: string;
}

export interface AdminLesson {
    id?: number;
    topic_id: number;
    title: string;
    objective: string;
    is_grammar: boolean;
    is_reading: boolean;
    is_speaking: boolean;
    is_listening: boolean;
    is_writing: boolean;
    content?: any;
    grammar?: any;
    reading?: any;
    speaking?: any;
    listening?: any;
    writing?: any;
    created_at?: string;
    updated_at?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService extends MainService {

    constructor(private http: HttpClient) {
        super();
    }

    // Course methods
    getAllCourses(): Observable<any> {
        return this.http.get(`${this.baseUrl}/admin/courses`);
    }

    createCourse(course: AdminCourse): Observable<any> {
        return this.http.post(`${this.baseUrl}/admin/courses`, course);
    }

    updateCourse(id: number, course: AdminCourse): Observable<any> {
        return this.http.put(`${this.baseUrl}/admin/courses/${id}`, course);
    }

    deleteCourse(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/admin/courses/${id}`);
    }

    // Topic methods
    getTopicsByCourse(courseId: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/admin/courses/${courseId}/topics`);
    }

    createTopic(topic: AdminTopic): Observable<any> {
        return this.http.post(`${this.baseUrl}/admin/topics`, topic);
    }

    updateTopic(id: number, topic: AdminTopic): Observable<any> {
        return this.http.put(`${this.baseUrl}/admin/topics/${id}`, topic);
    }

    deleteTopic(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/admin/topics/${id}`);
    }

    // Lesson methods
    getLessonsByTopic(topicId: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/admin/topics/${topicId}/lessons`);
    }

    createLesson(lesson: AdminLesson): Observable<any> {
        return this.http.post(`${this.baseUrl}/admin/lessons`, lesson);
    }

    updateLesson(id: number, lesson: AdminLesson): Observable<any> {
        return this.http.put(`${this.baseUrl}/admin/lessons/${id}`, lesson);
    }

    deleteLesson(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/admin/lessons/${id}`);
    }

    /**
     * Get content management overview
     */
    getContentManagement(): Observable<any[]> {
        return this.http.get<any>(`${this.baseUrl}/admin/content-management`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Upload complete course content
     */
    uploadCourseContent(contentData: IContentUpload): Observable<any[]> {
        return this.http.post<any>(`${this.baseUrl}/admin/upload/course`, contentData).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Update specific topic content
     */
    updateTopicContent(topicId: number, topicData: ITopicUpdate): Observable<any[]> {
        return this.http.put<any>(`${this.baseUrl}/admin/topic/${topicId}`, topicData).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Upload/update lesson content for a topic
     */
    uploadLessonContent(topicId: number, lessonData: ILessonUpload): Observable<any[]> {
        return this.http.post<any>(`${this.baseUrl}/admin/upload/lesson/${topicId}`, lessonData).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Validate JSON structure for course content
     */
    validateJSONStructure(jsonData: any, type: 'topic' | 'lesson'): Observable<any[]> {
        const body = { jsonData, type };
        return this.http.post<any>(`${this.baseUrl}/admin/validate-json`, body).pipe(map((res: any) => res.data as any[]));
    }

    // Student Progress (admin view)
    getAdminAllStudentsProgress(): Observable<any> {
        debugger;
        return this.http.get(`${this.baseUrl}/admin/students/progress`);
    }

    getAdminStudentDetail(userId: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/admin/students/progress/${userId}`);
    }
}