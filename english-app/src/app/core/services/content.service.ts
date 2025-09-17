import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Course, Topic, Lesson, CourseModule } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class ContentService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    /**
     * Get all courses
     */
    getAllCourses(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/content/courses`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get course content with topics
     */
    getCourseContent(courseId: number): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/content/course/${courseId}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get topics for a specific course
     */
    getCourseTopics(courseId: number): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/content/course/${courseId}/topics`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get topic content with lessons
     */
    getTopicContent(topicId: number): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/content/topic/${topicId}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get specific lesson content
     */
    getLessonContent(topicId: number, lessonIndex: number): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/content/lesson/${topicId}/${lessonIndex}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get uploaded files for admin dashboard
     */
    getUploadedFiles(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/admin/uploaded-files`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Upload content files
     */
    uploadContentFiles(level: string, contentType: string, files: File[]): Observable<any[]> {
        const formData = new FormData();
        formData.append('level', level);
        formData.append('contentType', contentType);
        files.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });
        return this.http.post<any>(`${this.apiUrl}/admin/upload-content`, formData).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Delete uploaded file
     */
    deleteUploadedFile(fileId: number): Observable<any[]> {
        return this.http.delete<any>(`${this.apiUrl}/admin/uploaded-files/${fileId}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Update course content
     */
    updateCourseContent(courseId: number, content: any): Observable<any[]> {
        return this.http.put<any>(`${this.apiUrl}/admin/course/${courseId}/content`, { content }).pipe(map((res: any) => res.data as any[]));
    }

    // Course Modules Methods

    /**
     * Get all course modules
     */
    getCourseModules(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/course-modules`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get course modules with student progress
     */
    getCourseModulesWithProgress(userId: number): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/course-modules/with-progress?userId=${userId}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Create a new course module
     */
    createCourseModule(courseModule: Partial<CourseModule>): Observable<any[]> {
        return this.http.post<any>(`${this.apiUrl}/course-modules`, courseModule).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Update course module
     */
    updateCourseModule(id: number, courseModule: Partial<CourseModule>): Observable<any[]> {
        return this.http.put<any>(`${this.apiUrl}/course-modules/${id}`, courseModule).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Delete course module
     */
    deleteCourseModule(id: number): Observable<any[]> {
        return this.http.delete<any>(`${this.apiUrl}/course-modules/${id}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Bulk update course modules (for JSON editor)
     */
    bulkUpdateCourseModules(courseModules: CourseModule[]): Observable<any[]> {
        return this.http.put<any>(`${this.apiUrl}/course-modules/bulk-update`,
            { courseModules }
        ).pipe(map((res: any) => res.data as any[]));
    }
}