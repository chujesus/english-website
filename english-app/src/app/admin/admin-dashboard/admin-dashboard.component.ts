import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ContentService } from '../../core/services/content.service';
import { ContentManagement, CourseModule } from '../../shared/interfaces';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
    contentManagement: ContentManagement | null = null;
    loading = true;
    error = '';

    // Course Modules properties
    courseModules: CourseModule[] = [];
    courseModulesJsonContent = '';
    originalCourseModulesJsonContent = '';
    isValidCourseModulesJson = true;
    courseModulesValidationMessage = 'Ready to edit course modules JSON';
    courseModulesLoading = false;

    // JSON Editor properties
    editingLevel = '';
    jsonContent = '';
    originalJsonContent = '';
    isValidJson = true;
    jsonValidationMessage = 'Ready to edit JSON content';

    // File upload properties
    selectedLevel = '';
    selectedContentType = '';
    selectedFiles: File[] = [];
    uploadedFiles: any[] = [];

    // UI state
    showSuccessToast = false;
    showErrorToast = false;
    successMessage = '';
    errorMessage = '';

    constructor(
        private adminService: AdminService,
        private contentService: ContentService
    ) { }

    ngOnInit(): void {
        this.loadContentManagement();
        this.loadUploadedFiles();
        this.loadCourseModules();
    }

    loadContentManagement(): void {
        this.loading = true;
        this.adminService.getContentManagement().subscribe({
            next: (response: any) => {
                if (response.ok) {
                    this.contentManagement = response.data;
                } else {
                    this.error = response.message || 'Error loading content management data';
                }
                this.loading = false;
            },
            error: (error) => {
                this.error = 'Error connecting to server';
                this.loading = false;
                console.error('Content management error:', error);
            }
        });
    }

    loadUploadedFiles(): void {
        this.contentService.getUploadedFiles().subscribe({
            next: (response: any) => {
                if (response && response.ok) {
                    this.uploadedFiles = response.data || [];
                } else {
                    // Handle case where response doesn't have expected structure
                    this.uploadedFiles = response || [];
                }
            },
            error: (error: any) => {
                console.error('Error loading uploaded files:', error);
                this.uploadedFiles = []; // Set empty array on error
                // Don't show error toast unless it's critical
            }
        });
    }

    // JSON Editor Methods
    loadCourseContent(): void {
        if (!this.editingLevel) return;

        // Create a mapping for level to course ID
        const levelToCourseId: { [key: string]: number } = {
            'A1': 1,
            'A2': 2,
            'B1': 3,
            'B2': 4
        };

        const courseId = levelToCourseId[this.editingLevel];

        this.contentService.getCourseContent(courseId).subscribe({
            next: (response: any) => {
                if (response.ok) {
                    this.jsonContent = JSON.stringify(response.data, null, 2);
                    this.originalJsonContent = this.jsonContent;
                    this.validateJson();
                } else {
                    this.showError('Failed to load course content');
                }
            },
            error: (error: any) => {
                console.error('Error loading course content:', error);
                this.showError('Error loading course content');
            }
        });
    }

    validateJson(): void {
        if (!this.jsonContent.trim()) {
            this.isValidJson = true;
            this.jsonValidationMessage = 'Ready to edit JSON content';
            return;
        }

        try {
            JSON.parse(this.jsonContent);
            this.isValidJson = true;
            this.jsonValidationMessage = 'Valid JSON format';
        } catch (error: any) {
            this.isValidJson = false;
            this.jsonValidationMessage = `Invalid JSON: ${error.message}`;
        }
    }

    resetJsonContent(): void {
        this.jsonContent = this.originalJsonContent;
        this.validateJson();
    }

    saveJsonContent(): void {
        if (!this.isValidJson || !this.editingLevel) return;

        try {
            const parsedContent = JSON.parse(this.jsonContent);

            // Create a mapping for level to course ID
            const levelToCourseId: { [key: string]: number } = {
                'A1': 1,
                'A2': 2,
                'B1': 3,
                'B2': 4
            };

            const courseId = levelToCourseId[this.editingLevel];

            this.contentService.updateCourseContent(courseId, parsedContent).subscribe({
                next: (response: any) => {
                    if (response && response.ok) {
                        this.originalJsonContent = this.jsonContent;
                        this.showSuccess('Course content updated successfully');
                    } else {
                        this.showError(response?.message || 'Failed to update course content');
                    }
                },
                error: (error: any) => {
                    console.error('Save error:', error);
                    this.showError('Error saving course content. Please try again.');
                }
            });

        } catch (error) {
            this.showError('Invalid JSON format');
        }
    }

    // File Upload Methods
    onFileSelected(event: any): void {
        this.selectedFiles = Array.from(event.target.files);
    }

    canUpload(): boolean {
        return !!(this.selectedLevel && this.selectedContentType && this.selectedFiles.length > 0);
    }

    uploadFiles(): void {
        if (!this.canUpload()) return;

        this.contentService.uploadContentFiles(this.selectedLevel, this.selectedContentType, this.selectedFiles).subscribe({
            next: (response: any) => {
                if (response && response.ok) {
                    this.showSuccess('Files uploaded successfully');
                    this.clearUploadForm();
                    this.loadUploadedFiles(); // Refresh the file list
                } else {
                    this.showError(response?.message || 'Failed to upload files');
                }
            },
            error: (error: any) => {
                console.error('Upload error:', error);
                this.showError('Error uploading files. Please try again.');
            }
        });
    }

    clearUploadForm(): void {
        this.selectedLevel = '';
        this.selectedContentType = '';
        this.selectedFiles = [];
        const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    }

    deleteFile(fileId: number): void {
        if (confirm('Are you sure you want to delete this file?')) {
            this.contentService.deleteUploadedFile(fileId).subscribe({
                next: (response: any) => {
                    if (response && response.ok) {
                        this.showSuccess('File deleted successfully');
                        this.loadUploadedFiles(); // Refresh the file list
                    } else {
                        this.showError(response?.message || 'Failed to delete file');
                    }
                },
                error: (error: any) => {
                    console.error('Delete error:', error);
                    this.showError('Error deleting file. Please try again.');
                }
            });
        }
    }

    // Utility Methods
    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'completed': return 'bg-success';
            case 'in_progress': return 'bg-warning';
            case 'not_started': return 'bg-secondary';
            case 'processing': return 'bg-warning';
            case 'failed': return 'bg-danger';
            case 'pending': return 'bg-secondary';
            case 'success': return 'bg-success';
            case 'error': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    formatDate(dateString: string): string {
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

    getLevelBadgeClass(level: string): string {
        switch (level) {
            case 'A1': return 'bg-info';
            case 'A2': return 'bg-primary';
            case 'B1': return 'bg-warning';
            case 'B2': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    getStatusText(status: string): string {
        switch (status) {
            case 'completed': return 'Completed';
            case 'in_progress': return 'In Progress';
            case 'not_started': return 'Not Started';
            default: return status;
        }
    }

    getFileTypeBadgeClass(type: string): string {
        switch (type) {
            case 'json': return 'bg-primary';
            case 'mp3':
            case 'wav': return 'bg-success';
            case 'pdf': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    getTotalTopics(): number {
        if (!this.contentManagement?.courses) return 0;
        return this.contentManagement.courses.reduce((total, course) => total + (course.topic_count || 0), 0);
    }

    getTotalLessons(): number {
        if (!this.contentManagement?.courses) return 0;
        return this.contentManagement.courses.reduce((total, course) => total + (course.lesson_count || 0), 0);
    }

    getUploadTypeLabel(type: string): string {
        switch (type) {
            case 'full_course': return 'Full Course Upload';
            case 'single_topic': return 'Single Topic Update';
            case 'lesson_update': return 'Lesson Update';
            default: return type;
        }
    }

    // Toast Methods
    showSuccess(message: string): void {
        this.successMessage = message;
        this.showSuccessToast = true;
        setTimeout(() => this.hideToast(), 3000);
    }

    showError(message: string): void {
        this.errorMessage = message;
        this.showErrorToast = true;
        setTimeout(() => this.hideToast(), 5000);
    }

    hideToast(): void {
        this.showSuccessToast = false;
        this.showErrorToast = false;
    }

    // Course Modules Management Methods
    loadCourseModules(): void {
        this.courseModulesLoading = true;
        this.contentService.getCourseModules().subscribe({
            next: (response: any) => {
                if (response.ok) {
                    this.courseModules = response.data;
                    this.courseModulesJsonContent = JSON.stringify(this.courseModules, null, 2);
                    this.originalCourseModulesJsonContent = this.courseModulesJsonContent;
                    this.validateCourseModulesJson();
                } else {
                    this.showError('Failed to load course modules');
                }
                this.courseModulesLoading = false;
            },
            error: (error) => {
                console.error('Error loading course modules:', error);
                this.showError('Error loading course modules');
                this.courseModulesLoading = false;
            }
        });
    }

    validateCourseModulesJson(): void {
        if (!this.courseModulesJsonContent.trim()) {
            this.isValidCourseModulesJson = true;
            this.courseModulesValidationMessage = 'Ready to edit course modules JSON';
            return;
        }

        try {
            const parsed = JSON.parse(this.courseModulesJsonContent);
            if (!Array.isArray(parsed)) {
                this.isValidCourseModulesJson = false;
                this.courseModulesValidationMessage = 'JSON must be an array of course modules';
                return;
            }

            // Validate each course module structure
            const requiredFields = ['title', 'level', 'description', 'topics'];
            const validLevels = ['A1', 'A2', 'B1', 'B2'];

            for (let i = 0; i < parsed.length; i++) {
                const module = parsed[i];
                for (const field of requiredFields) {
                    if (!module.hasOwnProperty(field)) {
                        this.isValidCourseModulesJson = false;
                        this.courseModulesValidationMessage = `Module ${i + 1}: Missing required field '${field}'`;
                        return;
                    }
                }

                if (!validLevels.includes(module.level)) {
                    this.isValidCourseModulesJson = false;
                    this.courseModulesValidationMessage = `Module ${i + 1}: Invalid level '${module.level}'. Must be A1, A2, B1, or B2`;
                    return;
                }

                if (typeof module.topics !== 'number' || module.topics < 0) {
                    this.isValidCourseModulesJson = false;
                    this.courseModulesValidationMessage = `Module ${i + 1}: Topics must be a positive number`;
                    return;
                }
            }

            this.isValidCourseModulesJson = true;
            this.courseModulesValidationMessage = `Valid JSON format (${parsed.length} course modules)`;
        } catch (error: any) {
            this.isValidCourseModulesJson = false;
            this.courseModulesValidationMessage = `Invalid JSON: ${error.message}`;
        }
    }

    resetCourseModulesJson(): void {
        this.courseModulesJsonContent = this.originalCourseModulesJsonContent;
        this.validateCourseModulesJson();
    }

    saveCourseModulesJson(): void {
        if (!this.isValidCourseModulesJson) return;

        try {
            const parsedModules = JSON.parse(this.courseModulesJsonContent);

            this.courseModulesLoading = true;
            this.contentService.bulkUpdateCourseModules(parsedModules).subscribe({
                next: (response: any) => {
                    if (response && response.ok) {
                        this.courseModules = response.data;
                        this.originalCourseModulesJsonContent = this.courseModulesJsonContent;
                        this.showSuccess('Course modules updated successfully');
                    } else {
                        this.showError(response?.message || 'Failed to update course modules');
                    }
                    this.courseModulesLoading = false;
                },
                error: (error) => {
                    console.error('Save course modules error:', error);
                    this.showError('Error saving course modules. Please try again.');
                    this.courseModulesLoading = false;
                }
            });

        } catch (error) {
            this.showError('Invalid JSON format');
        }
    }
}