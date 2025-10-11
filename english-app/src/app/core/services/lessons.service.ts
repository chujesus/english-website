import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { ILesson } from '../../shared/interfaces/models';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root'
})
export class LessonsService extends MainService {

  constructor(private http: HttpClient, private localStorageService: LocalStorageService) {
    super();
  }

  getLessonsByUserIdAndTopic(userId: number, topicId: number): Observable<ILesson[]> {
    return this.http.get<ILesson[]>(`${this.baseUrl}/lessons/${userId}/${topicId}`).pipe(map((data: any) => {
      return data.lessons as ILesson[];
    }));
  }
}
