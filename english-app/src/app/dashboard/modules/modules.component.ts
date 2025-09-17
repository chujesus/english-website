import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { DashboardData, CourseModule } from '../../shared/interfaces';
import { ProgressService } from '../../core/services/progress.service';
import { LocalStorageService } from '../../core/services/local-storage.service';

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './modules.component.html',
  styleUrl: './modules.component.scss'
})
export class ModulesComponent implements OnInit {
  user: any = null;
  modules: CourseModule[] = [];
  dashboardData: DashboardData[] = [];
  loading = true;
  error = '';

  constructor(
    private contentService: ContentService,
    private progressService: ProgressService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.loadCourseModules();
  }

  loadCourseModules(): void {
    this.loading = true;
    this.error = '';
    let session = this.localStorageService.getCredentials();
    if (session != null) {
      this.user = {
        id: session.task
      }

      this.contentService.getCourseModulesWithProgress(this.user.id).subscribe({
        next: (modules) => {
          this.modules = modules || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error loading course modules:', error);
          this.loading = false;
        }
      });
    }
  }

  loadStudentProgress(): void {
    this.loading = true;
    this.error = '';
    this.progressService.getStudentDashboard().subscribe({
      next: (dashboard) => {
        this.dashboardData = dashboard;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error loading student progress';
        this.loading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in_progress': return 'bg-warning';
      case 'not_started': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'not_started': return 'Not Started';
      default: return 'Unknown';
    }
  }

  getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'A1': return 'bg-info';
      case 'A2': return 'bg-primary';
      case 'B1': return 'bg-warning';
      case 'B2': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getProgressBarClass(progress: number | undefined): string {
    if (!progress) return 'bg-secondary';
    if (progress >= 80) return 'bg-success';
    if (progress >= 50) return 'bg-warning';
    return 'bg-danger';
  }
}
