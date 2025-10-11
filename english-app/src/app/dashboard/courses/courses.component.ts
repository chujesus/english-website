import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { StudentProgress } from '../../shared/interfaces/progress';
import { TopicsService } from '../../core/services/topics.service';
import { ITopic } from '../../shared/interfaces/models';

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
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private topicsService: TopicsService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.route.queryParams.subscribe(params => {
      this.courseId = +params['id'];
      this.moduleTitle = params['title'];
      this.user = {
        id: +params['userId']
      };
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
}
