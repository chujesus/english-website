import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService extends MainService {

  constructor(private http: HttpClient, private localStorageService: LocalStorageService) {
    super();
  }

}
