import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../core/services/alert.service';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { SettingService } from '../../core/services/setting.service';
import { Profile } from '../../shared/interfaces/auth';
import { ISetting } from '../../shared/interfaces/models';

@Component({
    standalone: true,
    selector: 'app-recommended-resources',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './recommended-resources.component.html',
    styleUrl: './recommended-resources.component.scss'
})
export class RecommendedResourcesComponent implements OnInit {
    recommendedLinks: ISetting[] = [];
    userProfile: number = Profile.Student;
    loading = false;
    error = '';
    success = '';

    // Modal properties
    showEditModal = false;
    selectedLink: ISetting | null = null;
    editLinkForm: FormGroup;

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
                this.loading = false;
            },
            error: (error: any) => {
                this.error = error.error?.message || 'Error loading recommended resources';
                this.loading = false;
            }
        });
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
                    this.success = response.message || 'Link updated successfully';
                    this.closeEditModal();
                    this.loadRecommendedLinks();
                    this.loading = false;
                    setTimeout(() => this.success = '', 3000);
                },
                error: (error: any) => {
                    this.error = error.error?.message || 'Error updating link';
                    this.loading = false;
                }
            });
        } else {
            // Create new link
            this.settingService.createSetting(formData).subscribe({
                next: (response: any) => {
                    this.success = response.message || 'Link created successfully';
                    this.closeEditModal();
                    this.loadRecommendedLinks();
                    this.loading = false;
                    setTimeout(() => this.success = '', 3000);
                },
                error: (error: any) => {
                    this.error = error.error?.message || 'Error creating link';
                    this.loading = false;
                }
            });
        }
    }

    deleteLink(link: ISetting): void {
        if (!confirm(`Are you sure you want to delete "${link.name}"?`)) {
            return;
        }

        if (!link.id) return;

        this.loading = true;
        this.settingService.deleteSetting(link.id).subscribe({
            next: (response: any) => {
                this.success = response.message || 'Link deleted successfully';
                this.loadRecommendedLinks();
                this.loading = false;
                setTimeout(() => this.success = '', 3000);
            },
            error: (error: any) => {
                this.error = error.error?.message || 'Error deleting link';
                this.loading = false;
            }
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
}
