import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AlertService } from '../core/services/alert.service';
import { LocalStorageService } from '../core/services/local-storage.service';
import { AuthService } from '../core/services/auth.service';
import { Profile } from '../shared/interfaces/auth';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userProfile: number = Profile.Student; // Default to Student
  userName: string = '';
  userRole: string = 'Student';

  constructor(
    private alertService: AlertService,
    private localStorageService: LocalStorageService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.alertService.closeLoading();
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    const credentials = this.localStorageService.getCredentials();
    if (credentials) {
      this.userProfile = credentials.status; // 0=Administrator, 1=Student
      this.userName = credentials.name;
      this.userRole = this.getUserRoleText(this.userProfile);
    }
  }

  getUserRoleText(profile: number): string {
    switch (profile) {
      case Profile.Administrator: return 'Administrator';
      case Profile.Student: return 'Student';
      default: return 'Student';
    }
  }

  isAdmin(): boolean {
    return this.userProfile === Profile.Administrator;
  }

  isStudent(): boolean {
    return this.userProfile === Profile.Student;
  }

  hasAdminAccess(): boolean {
    return this.userProfile === Profile.Administrator;
  }

  logout(): void {
    this.authService.logout();
  }
}
