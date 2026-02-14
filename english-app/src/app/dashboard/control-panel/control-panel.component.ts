import { Component } from '@angular/core';
import { AlertService } from '../../core/services/alert.service';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Profile } from '../../shared/interfaces/auth';

@Component({
  standalone: true,
  selector: 'app-control-panel',
  imports: [CommonModule, RouterModule],
  templateUrl: './control-panel.component.html',
  styleUrl: './control-panel.component.scss'
})
export class ControlPanelComponent {
  userProfile: number = Profile.Student; // Default to Student
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
}
