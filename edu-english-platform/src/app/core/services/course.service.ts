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
export class CourseService extends MainService {

    constructor(private http: HttpClient) {
        super();
    }

    /**
     * Get all courses
     */
    getAllCourses(): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/courses`);
    }

    /**
     * Get course by ID
     */
    getCourseById(courseId: number): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/courses/${courseId}`);
    }

    /**
     * Get courses by level
     */
    getCoursesByLevel(level: string): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/courses/level/${level}`);
    }
}
