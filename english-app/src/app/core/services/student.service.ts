import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { IStudentProgress } from '../../shared/interfaces/models';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root'
})
export class StudentService extends MainService {

  constructor(private http: HttpClient, private localStorageService: LocalStorageService) {
    super();
  }

  updateStudentProgress(progress: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/students/students`, progress).pipe(map((student: any) => {
      return student.data as any;
    }));
  }

  getLessonProgress(userId: number, lessonId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/students/lesson-progress/${userId}/${lessonId}`).pipe(map((response: any) => {
      return response.data as any;
    }));
  }

  getTopicProgress(userId: number, topicId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/students/topic-progress/${userId}/${topicId}`).pipe(map((response: any) => {
      return response.data as any;
    }));
  }
}
