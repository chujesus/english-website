import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { SettingService } from '../../core/services/setting.service';
import { Profile } from '../../shared/interfaces/auth';
import { ISetting } from '../../shared/interfaces/models';
import { SweetAlertResult } from 'sweetalert2';

@Component({
    standalone: true,
    selector: 'app-recommended-resources',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './recommended-resources.component.html',
    styleUrl: './recommended-resources.component.scss'
})
export class RecommendedResourcesComponent implements OnInit {
    recommendedLinks: ISetting[] = [];
    filteredLinks: ISetting[] = [];
    userProfile: number = Profile.Student;
    loading = false;
    error = '';
    success = '';
    searchTerm = '';

    // Modal properties
    showEditModal = false;
    selectedLink: ISetting | null = null;
    editLinkForm: FormGroup;

    // Pagination
    currentPage = 1;
    itemsPerPage = 10;
    totalPages = 0;

    constructor(
        private alertService: AlertService,
        private localStorageService: LocalStorageService,
        private settingService: SettingService,
        private fb: FormBuilder
    ) {
        this.editLinkForm = this.createEditForm();
    }

    ngOnInit(): void {
        this.alertService.closeLoading();
        this.loadUserInfo();
        this.loadRecommendedLinks();
    }

    createEditForm(): FormGroup {
        return this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            value: ['', [Validators.required, Validators.minLength(5)]]
        });
    }

    loadUserInfo(): void {
        const credentials = this.localStorageService.getCredentials();
        if (credentials) {
            this.userProfile = credentials.status; // 0=Administrator, 1=Student
        }
    }

    isAdmin(): boolean {
        return this.userProfile === Profile.Administrator;
    }

    loadRecommendedLinks(): void {
        this.loading = true;
        this.error = '';

        this.settingService.getSettingsByType('link').subscribe({
            next: (response: any) => {
                this.recommendedLinks = response.data || [];
                this.applyFilters();
                this.loading = false;
            },
            error: (error: any) => {
                this.error = error.error?.message || 'Error loading recommended resources';
                this.loading = false;
            }
        });
    }

    applyFilters(): void {
        let filtered = [...this.recommendedLinks];

        if (this.searchTerm.trim()) {
            const search = this.searchTerm.toLowerCase();
            filtered = filtered.filter(link =>
                link.name.toLowerCase().includes(search) ||
                (link.value && link.value.toLowerCase().includes(search))
            );
        }

        this.filteredLinks = filtered;
        this.calculatePagination();
    }

    calculatePagination(): void {
        this.totalPages = Math.ceil(this.filteredLinks.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
        }
    }

    getPaginatedLinks(): ISetting[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredLinks.slice(start, end);
    }

    onSearchChange(): void {
        this.currentPage = 1;
        this.applyFilters();
    }

    getPages(): number[] {
        const pages = [];
        const maxButtons = 5;
        let start = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
        let end = Math.min(this.totalPages, start + maxButtons - 1);

        if (end - start < maxButtons - 1) {
            start = Math.max(1, end - maxButtons + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    openEditModal(link?: ISetting): void {
        if (link) {
            this.selectedLink = { ...link };
            this.editLinkForm.patchValue({
                name: link.name,
                value: link.value || ''
            });
        } else {
            this.selectedLink = null;
            this.editLinkForm.reset();
        }
        this.showEditModal = true;
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.selectedLink = null;
        this.editLinkForm.reset();
    }

    saveLink(): void {
        if (this.editLinkForm.invalid) {
            this.markFormGroupTouched(this.editLinkForm);
            return;
        }

        this.loading = true;
        const formData = {
            ...this.editLinkForm.value,
            type: 'link'
        };

        if (this.selectedLink?.id) {
            // Update existing link
            this.settingService.updateSetting(this.selectedLink.id, formData).subscribe({
                next: (response: any) => {
                    this.success = response.message || 'Resource updated successfully';
                    this.closeEditModal();
                    this.loadRecommendedLinks();
                    this.loading = false;
                    setTimeout(() => this.success = '', 3000);
                },
                error: (error: any) => {
                    this.error = error.error?.message || 'Error updating resource';
                    this.loading = false;
                }
            });
        } else {
            // Create new link
            this.settingService.createSetting(formData).subscribe({
                next: (response: any) => {
                    this.success = response.message || 'Resource created successfully';
                    this.closeEditModal();
                    this.loadRecommendedLinks();
                    this.loading = false;
                    setTimeout(() => this.success = '', 3000);
                },
                error: (error: any) => {
                    this.error = error.error?.message || 'Error creating resource';
                    this.loading = false;
                }
            });
        }
    }

    deleteLink(link: ISetting): void {
        this.alertService.showDeleteAlert('Delete Resource', `Are you sure you want to delete "${link.name}"?`).then((result: SweetAlertResult) => {
            if (!result.isConfirmed) {
                return;
            }

            if (!link.id) return;

            this.loading = true;
            this.settingService.deleteSetting(link.id).subscribe({
                next: (response: any) => {
                    this.success = response.message || 'Resource deleted successfully';
                    this.loadRecommendedLinks();
                    this.loading = false;
                    setTimeout(() => this.success = '', 3000);
                },
                error: (error: any) => {
                    this.error = error.error?.message || 'Error deleting resource';
                    this.loading = false;
                }
            });
        });
    }

    markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach((key) => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.editLinkForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    trackByLinkId(index: number, link: ISetting): number | undefined {
        return link.id;
    }
}
