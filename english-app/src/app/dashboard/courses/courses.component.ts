import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TopicsService } from '../../core/services/topics.service';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { Profile } from '../../shared/interfaces/auth';
import { ITopic, StudentProgress } from '../../shared/interfaces/models';

export interface Topic {
  title: string;
  objective: string;
  cefrLevel: string;
  examples: string[];
  keywords: string[];
  // Progress tracking properties
  progress?: StudentProgress;
  status?: 'not_started' | 'in_progress' | 'completed';
  progress_percentage?: number;
}

@Component({
  selector: 'app-courses',
  imports: [CommonModule, RouterModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent implements OnInit {
  courseId: number | null = null;
  moduleTitle: string | null = null;
  topics: ITopic[] = [];
  user: any = null;
  userProfile: number = Profile.Student;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private topicsService: TopicsService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.route.queryParams.subscribe(params => {
      this.courseId = +params['id'];
      this.moduleTitle = params['title'];
      this.user = { id: +params['userId'] };
      // Load user profile for role-based unlocking
      const session = this.localStorageService.getCredentials();
      if (session) {
        this.userProfile = session.profile ?? session.status;
      }
      this.loadTopics();
    });
  }

  loadTopics(): void {
    this.topicsService.getTopicsByUserIdAndCourse(this.user.id, this.courseId!).subscribe({
      next: (topics: ITopic[]) => {
        this.topics = topics || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading course topics:', error);
        this.loading = false;
      }
    });
  }

  getStatusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in_progress': return 'bg-warning';
      case 'not_started':
      default: return 'bg-secondary';
    }
  }

  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'not_started':
      default: return 'Not Started';
    }
  }

  getProgressBarClass(progress: number | undefined): string {
    if (!progress) return 'bg-secondary';
    if (progress >= 80) return 'bg-success';
    if (progress >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  getButtonText(status: string | undefined): string {
    switch (status) {
      case 'completed': return 'Review Topic';
      case 'in_progress': return 'Continue';
      case 'not_started':
      default: return 'Start Topic';
    }
  }

  startTopic(topic: ITopic): void {
    // Navigate to lesson viewer for this topic
    this.router.navigate(['/dashboard/lesson-viewer'], {
      queryParams: {
        userId: this.user.id,
        courseId: this.courseId,
        courseTitle: this.moduleTitle,
        topicId: topic.id,
        cefrLevel: topic.cefr_level
      }
    });
  }

  /** Check if user is Administrator */
  isAdmin(): boolean {
    return this.userProfile === Profile.Administrator;
  }

  /** Determine if topic at index is unlocked for student */
  isTopicUnlocked(index: number): boolean {
    if (this.isAdmin()) {
      return true;
    }
    if (index === 0) {
      return true;
    }
    const prev = this.topics[index - 1];
    return prev.status === 'completed';
  }
}
