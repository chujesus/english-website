import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { Observable } from 'rxjs/internal/Observable';
import { ITopic } from '../../shared/interfaces/models';
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root'
})
export class TopicsService extends MainService {

  constructor(private http: HttpClient, private localStorageService: LocalStorageService) {
    super();
  }

  getTopicById(topicId: number): Observable<ITopic[]> {
    return this.http.get<ITopic[]>(`${this.baseUrl}/topics/${topicId}`).pipe(map((data: any) => {
      return data.topics as ITopic[];
    }));
  }

  getTopicsByUserIdAndCourse(userId: number, courseId: number): Observable<ITopic[]> {
    return this.http.get<ITopic[]>(`${this.baseUrl}/topics/${userId}/${courseId}`).pipe(map((data: any) => {
      return data.topics as ITopic[];
    }));
  }
}
