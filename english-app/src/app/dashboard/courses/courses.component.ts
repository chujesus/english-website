import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { StudentProgress } from '../../shared/interfaces';
import moduleTopicsA1 from './english_a1_topics.json';
import moduleTopicsA2 from './english_a2_topics.json';
import moduleTopicsB1 from './english_b1_topics.json';
import moduleTopicsB2 from './english_b2_topics.json';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { StudentService } from '../../core/services/student.service';

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
  moduleId: number | null = null;
  moduleTitle: string | null = null;
  topics: Topic[] = [];
  user: any = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localStorageService: LocalStorageService,
    private studentService: StudentService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.moduleId = +params['id'];
      this.moduleTitle = params['title'];

      this.loadTopics();
    });
  }

  loadTopics(): void {
    // Load topics based on module ID
    if (this.moduleId === 1) {
      this.topics = moduleTopicsA1;
    } else if (this.moduleId === 2) {
      this.topics = moduleTopicsA2;
    } else if (this.moduleId === 3) {
      this.topics = moduleTopicsB1;
    } else if (this.moduleId === 4) {
      this.topics = moduleTopicsB2;
    }
  }

  loadTopicsProgress(): void {
    if (!this.moduleId) return;

    this.loading = true;
    let session = this.localStorageService.getCredentials();
    if (session != null) {
      this.user = {
        id: session.task
      }

      this.studentService.getStudentProgressByCourse(this.moduleId, this.user.id).subscribe({
        next: (response: any) => {
          if (response.ok && response.data) {
            this.updateTopicsWithProgress(response.data);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading progress:', error);
          this.loading = false;
        }
      });
    }
  }

  updateTopicsWithProgress(progressData: any[]): void {
    this.topics.forEach((topic, index) => {
      // Find progress for this topic using the topic_id from your schema
      // Assuming topic_id corresponds to (index + 1) or we need to map it properly
      const topicProgress = progressData.find(p =>
        p.course_id === this.moduleId && p.topic_id === (index + 1)
      );

      if (topicProgress) {
        topic.progress = topicProgress;
        topic.status = topicProgress.status;
        topic.progress_percentage = topicProgress.progress_percentage;
      } else {
        topic.status = 'not_started';
        topic.progress_percentage = 0;
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

  startTopic(topic: Topic, topicIndex: number): void {
    // Navigate to lesson viewer for this topic
    this.router.navigate(['/dashboard/lesson-viewer'], {
      queryParams: {
        courseId: this.moduleId,
        courseTitle: this.moduleTitle,
        topicIndex: topicIndex,
        cefrLevel: topic.cefrLevel
      }
    });

    // Mark topic as started if not already
    if (topic.status === 'not_started') {
      this.studentService.updateCourseProgress(topicIndex + 1, 'in_progress', 0).subscribe({
        next: (response: any) => {
          if (response.ok) {
            topic.status = 'in_progress';
            topic.progress_percentage = 0;
          }
        },
        error: (error) => {
          console.error('Error updating progress:', error);
        }
      });
    }
  }
}
