import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import { PracticeSubmission } from '../../shared/interfaces/practice';

@Injectable({
  providedIn: 'root'
})
export class StudentService extends MainService {

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
    * Get student progress for a specific course
    * @param courseId - Course ID
    * @param userId - User ID
    */
  getStudentProgressByCourse(courseId: number, userId: number): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/students/student/${userId}?courseId=${courseId}`).pipe(map((res: any) => res.data as any[]));
  }

  /**
   * Update course progress status
   */
  updateCourseProgress(courseId: number, status: string, progressPercentage?: number, userId?: number): Observable<any[]> {
    const body = {
      status,
      progress_percentage: progressPercentage || 0
    };
    return this.http.put<any>(`${this.baseUrl}/students/student/${userId}/course/${courseId}`, body).pipe(map((res: any) => res.data as any[]));
  }

  /**
     * Get student dashboard data with overview of all courses
     */
  getStudentDashboard(userId?: number): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/students/dashboard/${userId}`).pipe(map((res: any) => res.data as any[]));
  }
}
