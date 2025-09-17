import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AlertService } from '../core/services/alert.service';
import { LocalStorageService } from '../core/services/local-storage.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userProfile: number = 2; // Default to Student
  userName: string = '';
  userRole: string = 'Student';

  constructor(
    private alertService: AlertService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.alertService.closeLoading();
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    const credentials = this.localStorageService.getCredentials();
    if (credentials) {
      this.userProfile = credentials.status; // 0=Admin, 1=Instructor, 2=Student
      this.userName = credentials.name;
      this.userRole = this.getUserRoleText(this.userProfile);
    }
  }

  getUserRoleText(profile: number): string {
    switch (profile) {
      case 0: return 'Administrator';
      case 1: return 'Instructor';
      case 2: return 'Student';
      default: return 'Student';
    }
  }

  isAdmin(): boolean {
    return this.userProfile === 0;
  }

  isInstructor(): boolean {
    return this.userProfile === 1;
  }

  isStudent(): boolean {
    return this.userProfile === 2;
  }

  hasAdminAccess(): boolean {
    return this.userProfile === 0;
  }

  hasInstructorAccess(): boolean {
    return this.userProfile === 0 || this.userProfile === 1;
  }

  logout(): void {
    this.localStorageService.clear();
  }
}
