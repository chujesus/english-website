import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { MainService } from './main.service';
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root'
})
export class TseService extends MainService {

  constructor(private http: HttpClient) {
    super();
  }

  getTsePerson(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrlTSE}/electoral-registers/id/${id}`).pipe(map((tse: any) => {
      return tse?.data?.[0] || [];
    })
    );
  }
}