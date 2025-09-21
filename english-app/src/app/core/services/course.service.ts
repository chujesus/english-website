import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { CourseModule } from '../../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class CourseService extends MainService {

  constructor(private http: HttpClient, private localStorageService: LocalStorageService) {
    super();
  }

  /**
   * Get current user ID from localStorage
   */
  private getCurrentUserId(): number {
    const credentials = this.localStorageService.getCredentials();
    return credentials?.task || 0;
  }

  /**
    * Get content management overview
    */
  getContentManagement(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/courses/content-management`).pipe(map((res: any) => res.data as any[]));
  }

  /**
 * Get uploaded files for admin dashboard
 */
  getUploadedFiles(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/courses/uploaded-files`).pipe(map((res: any) => res.data as any[]));
  }

  /**
  * Get course content with topics
  */
  getCourseContent(courseId: number): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/content/course/${courseId}`).pipe(map((res: any) => res.data as any[]));
  }

  /**
     * Update course content
     */
  updateCourseContent(courseId: number, content: any): Observable<any[]> {
    return this.http.put<any>(`${this.baseUrl}/courses/course/${courseId}/content`, { content }).pipe(map((res: any) => res.data as any[]));
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
    return this.http.post<any>(`${this.baseUrl}/courses/upload-content`, formData).pipe(map((res: any) => res.data as any[]));
  }

  /**
    * Delete uploaded file
    */
  deleteUploadedFile(fileId: number): Observable<any[]> {
    return this.http.delete<any>(`${this.baseUrl}/courses/uploaded-files/${fileId}`).pipe(map((res: any) => res.data as any[]));
  }

  /**
    * Get all course modules
    */
  getCourseModules(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/courss`).pipe(map((res: any) => res.data as any[]));
  }

  /**
    * Bulk update course modules (for JSON editor)
    */
  bulkUpdateCourseModules(courseModules: CourseModule[]): Observable<any[]> {
    return this.http.put<any>(`${this.baseUrl}/courses/bulk-update`,
      { courseModules }
    ).pipe(map((res: any) => res.data as any[]));
  }

  /**
     * Get course modules with student progress
     */
  getCourseModulesWithProgress(userId: number): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/courses/with-progress?userId=${userId}`).pipe(map((res: any) => res.data as any[]));
  }

  /**
  * Check if student can attempt a specific practice
  */
  canAttemptPractice(topicId: number, practiceType: string, sectionIndex: number): Observable<any[]> {
    const userId = this.getCurrentUserId();
    return this.http.get<any>(`${this.baseUrl}/courses/can-attempt/${userId}/${topicId}/${practiceType}/${sectionIndex}`).pipe(map((res: any) => res.data as any[]));
  }
}
