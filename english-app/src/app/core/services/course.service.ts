import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { ICourse } from '../../shared/interfaces/models';

@Injectable({
  providedIn: 'root'
})
export class CourseService extends MainService {

  constructor(private http: HttpClient, private localStorageService: LocalStorageService) {
    super();
  }

  getCoursesByUserId(id: number): Observable<ICourse[]> {
    return this.http.get<ICourse[]>(`${this.baseUrl}/courses/${id}`).pipe(map((data: any) => {
      return data.courses as ICourse[];
    }));
  }
}
