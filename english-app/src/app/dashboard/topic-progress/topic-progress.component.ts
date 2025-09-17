import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProgressService } from '../../core/services/progress.service';
import { PracticeService } from '../../core/services/practice.service';
import { TopicProgress, TopicScore } from '../../shared/interfaces';

@Component({
    selector: 'app-topic-progress',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './topic-progress.component.html',
    styleUrl: './topic-progress.component.scss'
})
export class TopicProgressComponent implements OnInit {
    topicProgress: TopicProgress | null = null;
    topicScore: TopicScore | null = null;
    loading = true;
    error = '';
    topicId: number = 0;
    topicTitle: string = '';

    constructor(
        private route: ActivatedRoute,
        private progressService: ProgressService,
        private practiceService: PracticeService
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.topicId = +params['topicId'];
            this.topicTitle = params['title'] || '';
            if (this.topicId) {
                this.loadTopicProgress();
                this.loadTopicScore();
            }
        });
    }

    loadTopicProgress(): void {
        this.loading = true;
        this.progressService.getTopicProgress(this.topicId).subscribe({
            next: (response: any) => {
                if (response.ok) {
                    this.topicProgress = response.data;
                } else {
                    this.error = response.message || 'Error loading topic progress';
                }
                this.loading = false;
            },
            error: (error) => {
                this.error = 'Error connecting to server';
                this.loading = false;
            }
        });
    }

    loadTopicScore(): void {
        this.practiceService.calculateTopicScore(this.topicId).subscribe({
            next: (response: any) => {
                if (response.ok) {
                    this.topicScore = response.data;
                }
            },
            error: (error) => {
                // Error loading topic score
            }
        });
    }

    getPracticeTypeLabel(type: string): string {
        switch (type) {
            case 'listening': return 'Listening Practice';
            case 'speaking': return 'Speaking Practice';
            case 'fill_in_blank': return 'Fill in the Blank';
            default: return type;
        }
    }

    getScoreClass(score: number): string {
        if (score >= 80) return 'text-success';
        if (score >= 70) return 'text-warning';
        return 'text-danger';
    }

    getProgressStatus(): string {
        if (!this.topicProgress?.progress) return 'Not Started';
        return this.topicProgress.progress.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    canStartPractice(): boolean {
        return this.topicProgress?.progress?.status !== 'not_started';
    }

    formatDate(dateString: string | null): string {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}