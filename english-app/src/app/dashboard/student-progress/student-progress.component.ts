import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgressService } from '../../core/services/progress.service';
import { DashboardData } from '../../shared/interfaces';

@Component({
    selector: 'app-student-progress',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './student-progress.component.html',
    styleUrl: './student-progress.component.scss'
})
export class StudentProgressComponent implements OnInit {
    dashboardData: DashboardData[] = [];
    loading = true;
    error = '';

    constructor(private progressService: ProgressService) { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.loading = true;
        this.progressService.getStudentDashboard().subscribe({
            next: (response: any) => {
                if (response.ok) {
                    this.dashboardData = response.data;
                } else {
                    this.error = response.message || 'Error loading dashboard data';
                }
                this.loading = false;
            },
            error: (error) => {
                this.error = 'Error connecting to server';
                this.loading = false;
            }
        });
    }

    getProgressBarClass(percentage: number): string {
        if (percentage >= 80) return 'bg-success';
        if (percentage >= 50) return 'bg-warning';
        return 'bg-danger';
    }

    getStatusText(percentage: number, topicsCompleted: number, totalTopics: number): string {
        if (topicsCompleted === totalTopics) return 'Completed';
        if (topicsCompleted > 0) return 'In Progress';
        return 'Not Started';
    }

    getTotalTopicsCompleted(): number {
        return this.dashboardData.reduce((total, course) => total + course.topics_completed, 0);
    }

    getTotalTopicsStarted(): number {
        return this.dashboardData.reduce((total, course) => total + course.topics_started, 0);
    }

    getAverageProgress(): number {
        if (this.dashboardData.length === 0) return 0;
        const totalProgress = this.dashboardData.reduce((total, course) => total + course.progress_percentage, 0);
        return Math.round(totalProgress / this.dashboardData.length);
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}