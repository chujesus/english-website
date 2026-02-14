import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { ProfileService, UserProfileData } from '../../core/services/profile.service';
import { Profile } from '../../shared/interfaces/auth';

export interface UserProfile {
    id?: number;
    identification: string;
    name: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    url_image?: string;
    image_name?: string;
    email?: string;
    profile?: number;
    created_at?: string;
    updated_at?: string;
}

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    loading = false;
    error = '';
    success = '';
    currentUser: UserProfile | null = null;
    previewImage: string | null = null; constructor(
        private fb: FormBuilder,
        private localStorageService: LocalStorageService,
        private profileService: ProfileService
    ) {
        this.profileForm = this.createProfileForm();
    }

    ngOnInit(): void {
        this.loadUserProfile();
        this.setupDragAndDrop();
    }

    setupDragAndDrop(): void {
        // Setup drag and drop functionality after view init
        setTimeout(() => {
            const uploadArea = document.querySelector('.file-upload-area');
            if (uploadArea) {
                uploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadArea.classList.add('dragover');
                });

                uploadArea.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove('dragover');
                });

                uploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove('dragover');

                    const files = (e as DragEvent).dataTransfer?.files;
                    if (files && files.length > 0) {
                        this.handleFileSelection(files[0]);
                    }
                });
            }
        }, 100);
    }

    createProfileForm(): FormGroup {
        return this.fb.group({
            identification: ['', [Validators.required, Validators.minLength(3)]],
            name: ['', [Validators.required, Validators.minLength(2)]],
            first_name: [''],
            last_name: [''],
            phone: ['', [Validators.pattern('^[+]?[0-9\\s\\-\\(\\)]*$')]],
            email: ['', [Validators.email]],
            url_image: ['']
        });
    }

    loadUserProfile(): void {
        this.loading = true;
        this.error = '';

        // Get basic session info from localStorage (only ID, name, status, token)
        const session = this.localStorageService.getCredentials();

        if (session && session.task) {
            // Initialize with minimal data from session
            this.currentUser = {
                id: session.task,
                identification: '',
                name: session.name || '',
                first_name: '',
                last_name: '',
                phone: '',
                url_image: '',
                image_name: '',
                email: '',
                profile: session.status || session.profile,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Fetch complete user data from database
            this.profileService.getUserProfile(session.task).subscribe({
                next: (profileData: any) => {

                    // Update current user with complete data from database
                    this.currentUser = {
                        id: session.task,
                        identification: profileData.identification || '',
                        name: profileData.name || session.name || '',
                        first_name: profileData.first_name || '',
                        last_name: profileData.last_name || '',
                        phone: profileData.phone || '',
                        url_image: profileData.url_image || '',
                        image_name: profileData.image_name || '',
                        email: profileData.email || '',
                        profile: profileData.profile || session.status,
                        created_at: profileData.created_at || new Date().toISOString(),
                        updated_at: profileData.updated_at || new Date().toISOString()
                    };

                    // Populate form with fresh data from database
                    this.populateForm(this.currentUser);

                    if (this.currentUser.url_image) {
                        this.previewImage = this.currentUser.url_image;
                    }

                    this.loading = false;
                },
                error: (error: any) => {
                    console.error('Error fetching profile data from database:', error);
                    this.error = 'Error loading profile data. Please try again.';
                    this.loading = false;
                }
            });
        } else {
            // No session data available
            this.error = 'No user session found. Please log in again.';
            this.loading = false;
        }
    }

    private populateForm(userData: UserProfile | null): void {
        if (userData) {
            this.profileForm.patchValue({
                identification: userData.identification,
                name: userData.name,
                first_name: userData.first_name,
                last_name: userData.last_name,
                phone: userData.phone,
                email: userData.email,
                url_image: userData.url_image
            });
        }
    }

    triggerFileInput(): void {
        const fileInput = document.getElementById('profileImage') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.handleFileSelection(file);
        }
    }

    handleFileSelection(file: File): void {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.error = 'Please select a valid image file';
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            this.error = 'File size must be less than 2MB';
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.previewImage = e.target.result;
        };
        reader.readAsDataURL(file);

        // Clear any previous errors
        this.error = '';
    }

    removeImage(): void {
        this.previewImage = null;
        this.profileForm.patchValue({ url_image: '' });

        // Clear file input
        const fileInput = document.getElementById('profileImage') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    saveProfile(): void {
        if (this.profileForm.invalid) {
            this.markFormGroupTouched(this.profileForm);
            return;
        }

        this.loading = true;
        this.error = '';
        this.success = '';

        const formData = this.profileForm.value;
        const profileData: UserProfileData = {
            identification: formData.identification,
            name: formData.name,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            email: formData.email,
            url_image: formData.url_image || undefined,
            image_name: formData.url_image ? `profile_${this.currentUser?.id}_${Date.now()}` : undefined
        };

        if (this.currentUser?.id) {
            // Use the profile service to update data
            this.profileService.updateUserProfile(this.currentUser.id, profileData).subscribe({
                next: (response: any) => {
                    this.loading = false;
                    this.success = response.message || 'Profile updated successfully!';
                    this.loadUserProfile(); // Reload data

                    // Clear success message after 3 seconds
                    setTimeout(() => {
                        this.success = '';
                    }, 3000);
                },
                error: (error: any) => {
                    this.loading = false;
                    this.error = error.error?.message || 'Error updating profile';
                    console.error('Error updating profile:', error);
                }
            });
        } else {
            this.loading = false;
            this.error = 'User ID not found';
        }
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    // Helper methods for form validation
    isFieldInvalid(fieldName: string): boolean {
        const field = this.profileForm.get(fieldName);
        return field ? field.invalid && (field.dirty || field.touched) : false;
    }

    getFieldError(fieldName: string): string {
        const field = this.profileForm.get(fieldName);
        if (field?.errors) {
            if (field.errors['required']) return `${fieldName} is required`;
            if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
            if (field.errors['email']) return 'Please enter a valid email address';
            if (field.errors['pattern']) return 'Please enter a valid phone number';
        }
        return '';
    }

    getUserRoleName(): string {
        if (!this.currentUser) return 'User';

        switch (this.currentUser.profile) {
            case Profile.Administrator: return 'Administrator';
            case Profile.Student: return 'Student';
            default: return 'User';
        }
    }

    /** Check if current user is Administrator */
    isAdmin(): boolean {
        return this.currentUser?.profile === Profile.Administrator;
    }

    getCurrentTitle(): string {
        return 'User Profile';
    }

    getCurrentDescription(): string {
        return 'Manage your personal information and account settings. Keep your profile up to date.';
    }

    getCurrentIcon(): string {
        return 'fas fa-user-circle';
    }

    getCurrentCount(): number {
        return 0; // Not applicable for profile
    }
}