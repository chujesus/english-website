import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

interface StudentSummary {
    id: number;
    name: string;
    email: string;
    identification: string;
    starting_module: string | null;
    courses_active: number;
    total_lessons_accessed: number;
    lessons_completed: number;
    avg_progress: number;
    last_active: string | null;
}

interface LessonDetail {
    lesson_id: number;
    lesson_title: string;
    is_completed: boolean;
    progress_percent: number;
    last_accessed: string | null;
}

interface TopicDetail {
    topic_id: number;
    topic_title: string;
    lessons: LessonDetail[];
    total_lessons: number;
    completed_lessons: number;
}

interface CourseDetail {
    course_id: number;
    course_title: string;
    course_level: string;
    topics: TopicDetail[];
    total_lessons: number;
    completed_lessons: number;
    avg_progress: number;
}

@Component({
    selector: 'app-admin-student-progress',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './admin-student-progress.component.html',
    styleUrl: './admin-student-progress.component.scss'
})
export class AdminStudentProgressComponent implements OnInit {
    // List view
    students: StudentSummary[] = [];
    filteredStudents: StudentSummary[] = [];
    loading = false;
    error = '';
    searchTerm = '';

    // Pagination
    currentPage = 1;
    itemsPerPage = 10;
    totalPages = 0;

    // Detail view
    selectedStudent: StudentSummary | null = null;
    studentCourses: CourseDetail[] = [];
    loadingDetail = false;
    errorDetail = '';
    expandedTopics: Set<number> = new Set();

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.loadStudents();
    }

    loadStudents(): void {
        this.loading = true;
        this.error = '';
        this.selectedStudent = null;
        this.adminService.getAdminAllStudentsProgress().subscribe({
            next: (response: any) => {
                this.students = response.data || [];
                this.applyFilter();
                this.loading = false;
            },
            error: (err: any) => {
                this.error = err.message || 'Error loading student progress';
                this.loading = false;
            }
        });
    }

    applyFilter(): void {
        const term = this.searchTerm.toLowerCase().trim();
        this.filteredStudents = term
            ? this.students.filter(s =>
                s.name.toLowerCase().includes(term) ||
                s.email.toLowerCase().includes(term) ||
                (s.identification && s.identification.toLowerCase().includes(term))
            )
            : [...this.students];

        this.totalPages = Math.ceil(this.filteredStudents.length / this.itemsPerPage);
        this.currentPage = 1;
    }

    onSearchChange(): void {
        this.applyFilter();
    }

    getPaginatedStudents(): StudentSummary[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredStudents.slice(start, start + this.itemsPerPage);
    }

    getPages(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) this.currentPage = page;
    }

    openDetail(student: StudentSummary): void {
        this.selectedStudent = student;
        this.studentCourses = [];
        this.expandedTopics.clear();
        this.loadingDetail = true;
        this.errorDetail = '';

        this.adminService.getAdminStudentDetail(student.id).subscribe({
            next: (response: any) => {
                this.studentCourses = response.data?.courses || [];
                this.loadingDetail = false;
            },
            error: (err: any) => {
                this.errorDetail = err.error?.message || 'Error loading student detail';
                this.loadingDetail = false;
            }
        });
    }

    backToList(): void {
        this.selectedStudent = null;
        this.studentCourses = [];
        this.expandedTopics.clear();
    }

    toggleTopic(topicId: number): void {
        if (this.expandedTopics.has(topicId)) {
            this.expandedTopics.delete(topicId);
        } else {
            this.expandedTopics.add(topicId);
        }
    }

    isTopicExpanded(topicId: number): boolean {
        return this.expandedTopics.has(topicId);
    }

    getProgressClass(percent: number): string {
        if (percent >= 100) return 'bg-success';
        if (percent >= 50) return 'bg-info';
        if (percent > 0) return 'bg-warning';
        return 'bg-secondary';
    }

    getProgressTextClass(percent: number): string {
        if (percent >= 100) return 'text-success';
        if (percent >= 50) return 'text-info';
        if (percent > 0) return 'text-warning';
        return 'text-muted';
    }

    getCourseCompletionPercent(course: CourseDetail): number {
        if (!course.total_lessons) return 0;
        return Math.round((course.completed_lessons / course.total_lessons) * 100);
    }

    getTopicCompletionPercent(topic: TopicDetail): number {
        if (!topic.total_lessons) return 0;
        return Math.round((topic.completed_lessons / topic.total_lessons) * 100);
    }

    formatDate(date: string | null): string {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    trackByStudentId(_: number, s: StudentSummary): number { return s.id; }
    trackByCourseId(_: number, c: CourseDetail): number { return c.course_id; }
    trackByTopicId(_: number, t: TopicDetail): number { return t.topic_id; }
    trackByLessonId(_: number, l: LessonDetail): number { return l.lesson_id; }
}
