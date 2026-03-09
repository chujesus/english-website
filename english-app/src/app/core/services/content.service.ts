import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { MainService } from './main.service';

@Injectable({
    providedIn: 'root'
})
export class ContentService extends MainService {

    constructor(private http: HttpClient) {
        super();
    }

    /**
     * Get all courses
     */
    getAllCourses(): Observable<any[]> {
        return this.http.get<any>(`${this.baseUrl}/content/courses`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get course content with topics
     */
    getCourseContent(courseId: number): Observable<any[]> {
        return this.http.get<any>(`${this.baseUrl}/content/course/${courseId}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get topics for a specific course
     */
    getCourseTopics(courseId: number): Observable<any[]> {
        return this.http.get<any>(`${this.baseUrl}/content/course/${courseId}/topics`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get topic content with lessons
     */
    getTopicContent(topicId: number): Observable<any[]> {
        return this.http.get<any>(`${this.baseUrl}/content/topic/${topicId}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get specific lesson content
     */
    getLessonContent(topicId: number, lessonIndex: number): Observable<any[]> {
        return this.http.get<any>(`${this.baseUrl}/content/lesson/${topicId}/${lessonIndex}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get uploaded files for admin dashboard
     */
    getUploadedFiles(): Observable<any[]> {
        return this.http.get<any>(`${this.baseUrl}/admin/uploaded-files`).pipe(map((res: any) => res.data as any[]));
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
        return this.http.post<any>(`${this.baseUrl}/admin/upload-content`, formData).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Delete uploaded file
     */
    deleteUploadedFile(fileId: number): Observable<any[]> {
        return this.http.delete<any>(`${this.baseUrl}/admin/uploaded-files/${fileId}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Update course content
     */
    updateCourseContent(courseId: number, content: any): Observable<any[]> {
        return this.http.put<any>(`${this.baseUrl}/admin/course/${courseId}/content`, { content }).pipe(map((res: any) => res.data as any[]));
    }

    // Course Modules Methods

    /**
     * Get all course modules
     */
    getCourseModules(): Observable<any[]> {
        return this.http.get<any>(`${this.baseUrl}/course-modules`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Get course modules with student progress
     */
    getCourseModulesWithProgress(userId: number): Observable<any[]> {
        return this.http.get<any>(`${this.baseUrl}/course-modules/with-progress?userId=${userId}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Create a new course module
     */
    createCourseModule(courseModule: Partial<CourseModule>): Observable<any[]> {
        return this.http.post<any>(`${this.baseUrl}/course-modules`, courseModule).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Update course module
     */
    updateCourseModule(id: number, courseModule: Partial<CourseModule>): Observable<any[]> {
        return this.http.put<any>(`${this.baseUrl}/course-modules/${id}`, courseModule).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Delete course module
     */
    deleteCourseModule(id: number): Observable<any[]> {
        return this.http.delete<any>(`${this.baseUrl}/course-modules/${id}`).pipe(map((res: any) => res.data as any[]));
    }

    /**
     * Bulk update course modules (for JSON editor)
     */
    bulkUpdateCourseModules(courseModules: CourseModule[]): Observable<any[]> {
        return this.http.put<any>(`${this.baseUrl}/course-modules/bulk-update`,
            { courseModules }
        ).pipe(map((res: any) => res.data as any[]));
    }
}