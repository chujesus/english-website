import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingService } from '../../core/services/setting.service';
import { ISetting } from '../../shared/interfaces/models';

@Component({
    selector: 'app-settings-management',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
    templateUrl: './settings-management.component.html',
    styleUrl: './settings-management.component.scss'
})
export class SettingsManagementComponent implements OnInit {
    settings: ISetting[] = [];
    filteredSettings: ISetting[] = [];
    loading = false;
    error = '';
    success = '';
    searchTerm = '';
    selectedSetting: ISetting | null = null;
    showEditModal = false;
    editSettingForm: FormGroup;

    // Modal Deepgram Info
    showDeepgramInfoModal = false;

    // Pagination
    currentPage = 1;
    itemsPerPage = 10;
    totalPages = 0;

    constructor(
        private settingService: SettingService,
        private fb: FormBuilder
    ) {
        this.editSettingForm = this.createEditForm();
    }

    ngOnInit(): void {
        this.loadSettings();
    }

    createEditForm(): FormGroup {
        return this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            value: ['']
        });
    }

    loadSettings(): void {
        this.loading = true;
        this.error = '';

        this.settingService.getAllSettings().subscribe({
            next: (response: any) => {
                this.settings = response.data || [];
                this.applyFilters();
                this.loading = false;
            },
            error: (error: any) => {
                this.error = error.error?.message || 'Error loading settings';
                this.loading = false;
            }
        });
    }

    applyFilters(): void {
        let filtered = [...this.settings];

        if (this.searchTerm.trim()) {
            const search = this.searchTerm.toLowerCase();
            filtered = filtered.filter(setting =>
                setting.name.toLowerCase().includes(search) ||
                (setting.value && setting.value.toLowerCase().includes(search))
            );
        }

        this.filteredSettings = filtered;
        this.calculatePagination();
    }

    calculatePagination(): void {
        this.totalPages = Math.ceil(this.filteredSettings.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
        }
    }

    getPaginatedSettings(): ISetting[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredSettings.slice(start, end);
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

    openEditModal(setting?: ISetting): void {
        if (setting) {
            this.selectedSetting = { ...setting };
            this.editSettingForm.patchValue({
                name: setting.name,
                value: setting.value || ''
            });
        } else {
            this.selectedSetting = null;
            this.editSettingForm.reset();
        }
        this.showEditModal = true;
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.selectedSetting = null;
        this.editSettingForm.reset();
    }

    saveSetting(): void {
        if (this.editSettingForm.invalid) {
            this.markFormGroupTouched(this.editSettingForm);
            return;
        }

        this.loading = true;
        const formData = this.editSettingForm.value;

        if (this.selectedSetting?.id) {
            // Update existing setting
            this.settingService.updateSetting(this.selectedSetting.id, formData).subscribe({
                next: (response: any) => {
                    this.success = response.message || 'Setting updated successfully';
                    this.closeEditModal();
                    this.loadSettings();
                    this.loading = false;

                    setTimeout(() => this.success = '', 3000);
                },
                error: (error: any) => {
                    this.error = error.error?.message || 'Error updating setting';
                    this.loading = false;
                }
            });
        } else {
            // Create new setting
            this.settingService.createSetting(formData).subscribe({
                next: (response: any) => {
                    this.success = response.message || 'Setting created successfully';
                    this.closeEditModal();
                    this.loadSettings();
                    this.loading = false;

                    setTimeout(() => this.success = '', 3000);
                },
                error: (error: any) => {
                    this.error = error.error?.message || 'Error creating setting';
                    this.loading = false;
                }
            });
        }
    }

    deleteSetting(setting: ISetting): void {
        if (!confirm(`Are you sure you want to delete the setting "${setting.name}"?`)) {
            return;
        }

        if (!setting.id) return;

        this.loading = true;
        this.settingService.deleteSetting(setting.id).subscribe({
            next: (response: any) => {
                this.success = response.message || 'Setting deleted successfully';
                this.loadSettings();
                this.loading = false;

                setTimeout(() => this.success = '', 3000);
            },
            error: (error: any) => {
                this.error = error.error?.message || 'Error deleting setting';
                this.loading = false;
            }
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.editSettingForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.editSettingForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('minlength')) {
            return `${fieldName} must be at least ${field.getError('minlength').requiredLength} characters`;
        }
        return 'Invalid field';
    }

    markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }

    trackBySettingId(index: number, setting: ISetting): number | undefined {
        return setting.id;
    }

    /**
     * Open Deepgram Info Modal
     */
    openDeepgramInfoModal(): void {
        this.showDeepgramInfoModal = true;
    }

    /**
     * Close Deepgram Info Modal
     */
    closeDeepgramInfoModal(): void {
        this.showDeepgramInfoModal = false;
    }
}