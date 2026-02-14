import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface StudentAnalytics {
  user_id: number;
  user_name: string;
  email: string;
  total_topics: number;
  completed_topics: number;
  in_progress_topics: number;
  average_score: number;
  total_time_spent: number;
  last_activity: string;
  course_progress: CourseProgress[];
}

interface CourseProgress {
  course_id: number;
  course_title: string;
  level: string;
  progress_percentage: number;
  topics_completed: number;
  total_topics: number;
}

@Component({
  selector: 'app-instructor-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instructor-analytics.component.html',
  styleUrls: ['./instructor-analytics.component.scss']
})
export class InstructorAnalyticsComponent implements OnInit {
  students: StudentAnalytics[] = [];
  filteredStudents: StudentAnalytics[] = [];
  loading = false;

  // Summary stats
  totalStudents = 0;
  activeStudents = 0;
  averageProgress = 0;
  completionRate = 0;

  // Filters
  selectedCourse = '';
  progressFilter = '';
  searchTerm = '';
  sortBy = 'name';

  constructor() { }

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;

    // Mock data based on your schema structure
    setTimeout(() => {
      this.students = [
        {
          user_id: 3,
          user_name: 'Alice Student',
          email: 'alice@example.com',
          total_topics: 80,
          completed_topics: 25,
          in_progress_topics: 10,
          average_score: 87.5,
          total_time_spent: 1200, // minutes
          last_activity: '2024-09-15T08:30:00Z',
          course_progress: [
            { course_id: 1, course_title: 'English A1', level: 'A1', progress_percentage: 95, topics_completed: 19, total_topics: 20 },
            { course_id: 2, course_title: 'English A2', level: 'A2', progress_percentage: 30, topics_completed: 6, total_topics: 20 }
          ]
        },
        {
          user_id: 4,
          user_name: 'Bob Learner',
          email: 'bob@example.com',
          total_topics: 40,
          completed_topics: 8,
          in_progress_topics: 5,
          average_score: 72.3,
          total_time_spent: 480,
          last_activity: '2024-09-14T16:45:00Z',
          course_progress: [
            { course_id: 1, course_title: 'English A1', level: 'A1', progress_percentage: 40, topics_completed: 8, total_topics: 20 }
          ]
        }
      ];

      this.calculateSummaryStats();
      this.filterStudents();
      this.loading = false;
    }, 1000);
  }

  calculateSummaryStats(): void {
    this.totalStudents = this.students.length;
    this.activeStudents = this.students.filter(s => {
      const lastActivity = new Date(s.last_activity);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastActivity > weekAgo;
    }).length;

    this.averageProgress = Math.round(
      this.students.reduce((sum, s) => sum + this.getOverallProgress(s), 0) / this.totalStudents
    );

    this.completionRate = Math.round(
      this.students.reduce((sum, s) => sum + (s.completed_topics / s.total_topics * 100), 0) / this.totalStudents
    );
  }

  filterStudents(): void {
    this.filteredStudents = this.students.filter(student => {
      const matchesCourse = !this.selectedCourse ||
        student.course_progress.some(c => c.course_id.toString() === this.selectedCourse);

      const matchesProgress = !this.progressFilter || this.getProgressStatus(student) === this.progressFilter;

      const matchesSearch = !this.searchTerm ||
        student.user_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesCourse && matchesProgress && matchesSearch;
    });

    this.sortStudents();
  }

  sortStudents(): void {
    this.filteredStudents.sort((a, b) => {
      switch (this.sortBy) {
        case 'progress':
          return this.getOverallProgress(b) - this.getOverallProgress(a);
        case 'activity':
          return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
        case 'score':
          return b.average_score - a.average_score;
        case 'name':
        default:
          return a.user_name.localeCompare(b.user_name);
      }
    });
  }

  getOverallProgress(student: StudentAnalytics): number {
    if (student.total_topics === 0) return 0;
    return Math.round((student.completed_topics / student.total_topics) * 100);
  }

  getProgressStatus(student: StudentAnalytics): string {
    const progress = this.getOverallProgress(student);
    if (progress === 0) return 'not_started';
    if (progress === 100) return 'completed';
    return 'in_progress';
  }

  getProgressBarClass(percentage: number): string {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning text-dark';
    return 'bg-danger';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  }

  formatTimeSpent(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  refreshData(): void {
    this.loadAnalytics();
  }

  trackByStudentId(index: number, student: StudentAnalytics): number {
    return student.user_id;
  }
}