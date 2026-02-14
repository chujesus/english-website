import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { Profile } from '../../shared/interfaces/auth';
import { IUser } from '../../shared/interfaces/models';
import { UserService } from '../../core/services/user.service';
import { StartingModuleModalComponent } from './starting-module-modal/starting-module-modal.component';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, StartingModuleModalComponent],
    templateUrl: './user-management.component.html',
    styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
    users: IUser[] = [];
    filteredUsers: IUser[] = [];
    loading = false;
    error = '';
    success = '';
    searchTerm = '';
    selectedUser: IUser | null = null;
    showEditModal = false;
    showDeleteModal = false;
    showStartingModuleModal = false;
    editUserForm: FormGroup;
    currentUser: any = null;

    // Pagination
    currentPage = 1;
    itemsPerPage = 10;
    totalPages = 0;

    // Filters
    filterByStatus = 'all'; // all, active, inactive
    filterByProfile = 'all'; // all, administrator, student

    constructor(
        private userService: UserService,
        private localStorageService: LocalStorageService,
        private fb: FormBuilder
    ) {
        this.editUserForm = this.createEditForm();
    }

    ngOnInit(): void {
        this.currentUser = this.localStorageService.getCredentials();
        this.loadUsers();
    }

    createEditForm(): FormGroup {
        return this.fb.group({
            identification: ['', [Validators.required, Validators.minLength(3)]],
            name: ['', [Validators.required, Validators.minLength(2)]],
            first_name: [''],
            last_name: [''],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.pattern('^[+]?[0-9\\s\\-\\(\\)]*$')]],
            profile: ['', [Validators.required]],
            state: [1, [Validators.required]]
        });
    }

    loadUsers(): void {
        this.loading = true;
        this.error = '';

        this.userService.getAllUsers().subscribe({
            next: (response: any) => {
                this.users = response.data || [];
                this.applyFilters();
                this.loading = false;
            },
            error: (error: any) => {
                this.error = error.error?.message || 'Error loading users';
                this.loading = false;
            }
        });
    }

    applyFilters(): void {
        let filtered = [...this.users];

        // Search filter
        if (this.searchTerm.trim()) {
            const search = this.searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.name!.toLowerCase().includes(search) ||
                user.email!.toLowerCase().includes(search) ||
                user.identification!.toLowerCase().includes(search) ||
                (user.first_name && user.first_name.toLowerCase().includes(search)) ||
                (user.last_name && user.last_name.toLowerCase().includes(search))
            );
        }

        // Status filter
        if (this.filterByStatus !== 'all') {
            const isActive = this.filterByStatus === 'active';
            filtered = filtered.filter(user => (user.state === 1) === isActive);
        }

        // Profile filter
        if (this.filterByProfile !== 'all') {
            const profileValue = this.filterByProfile === 'administrator' ? Profile.Administrator : Profile.Student;
            filtered = filtered.filter(user => user.profile === profileValue);
        }

        this.filteredUsers = filtered;
        this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
        this.currentPage = 1;
    }

    onSearchChange(): void {
        this.applyFilters();
    }

    onFilterChange(): void {
        this.applyFilters();
    }

    getPaginatedUsers(): IUser[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredUsers.slice(startIndex, endIndex);
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    getPages(): number[] {
        const pages: number[] = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    getUserRoleName(profile: number): string {
        switch (profile) {
            case Profile.Administrator: return 'Administrator';
            case Profile.Student: return 'Student';
            default: return 'User';
        }
    }

    getUserStatusBadge(state: number): { class: string, text: string } {
        return state === 1
            ? { class: 'badge bg-success', text: 'Active' }
            : { class: 'badge bg-danger', text: 'Inactive' };
    }

    getStartingModuleBadgeClass(module: string): string {
        switch (module) {
            case 'A1': return 'bg-info text-white';
            case 'A2': return 'bg-primary text-white';
            case 'B1': return 'bg-warning text-dark';
            case 'B2': return 'bg-danger text-white';
            default: return 'bg-secondary text-white';
        }
    }

    openEditModal(user: IUser): void {
        this.selectedUser = { ...user };
        this.editUserForm.patchValue({
            identification: user.identification,
            name: user.name,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email,
            phone: user.phone || '',
            profile: user.profile,
            state: user.state
        });
        this.showEditModal = true;
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.selectedUser = null;
        this.editUserForm.reset();
    }

    saveUser(): void {
        if (this.editUserForm.invalid || !this.selectedUser) {
            this.markFormGroupTouched(this.editUserForm);
            return;
        }

        this.loading = true;
        const formData = this.editUserForm.value;

        this.userService.updateUser(this.selectedUser.id!, formData).subscribe({
            next: (response: any) => {
                this.success = response.message || 'User updated successfully';
                this.closeEditModal();
                this.loadUsers();
                this.loading = false;

                setTimeout(() => this.success = '', 3000);
            },
            error: (error: any) => {
                this.error = error.error?.message || 'Error updating user';
                this.loading = false;
            }
        });
    }

    openDeleteModal(user: IUser): void {
        this.selectedUser = user;
        this.showDeleteModal = true;
    }

    closeDeleteModal(): void {
        this.showDeleteModal = false;
        this.selectedUser = null;
    }

    confirmDelete(): void {
        if (!this.selectedUser) return;

        this.loading = true;
        this.userService.deleteUser(this.selectedUser.id!).subscribe({
            next: (response: any) => {
                this.success = response.message || 'User deleted successfully';
                this.closeDeleteModal();
                this.loadUsers();
                this.loading = false;

                setTimeout(() => this.success = '', 3000);
            },
            error: (error: any) => {
                this.error = error.error?.message || 'Error deleting user';
                this.loading = false;
            }
        });
    }

    toggleUserStatus(user: IUser): void {
        const newState = user.state === 1 ? 0 : 1;

        // If activating a student, show starting module modal
        if (newState === 1 && user.profile === Profile.Student) {
            this.selectedUser = user;
            this.showStartingModuleModal = true;
            return;
        }

        // For deactivation or non-student activation, proceed directly
        this.updateUserStatus(user.id!, newState);
    }

    private updateUserStatus(userId: number, newState: number, startingModule?: string): void {
        const action = newState === 1 ? 'activate' : 'deactivate';

        this.loading = true;
        this.userService.toggleUserStatus(userId, newState, startingModule).subscribe({
            next: (response: any) => {
                this.success = response.message || `User ${action}d successfully`;

                // Update the user in the local array instead of reloading everything
                this.updateLocalUserData(userId, newState, startingModule);
                this.loading = false;

                setTimeout(() => this.success = '', 3000);
            },
            error: (error: any) => {
                this.error = error.error?.message || `Error ${action}ing user`;
                this.loading = false;
            }
        });
    }

    private updateLocalUserData(userId: number, newState: number, startingModule?: string): void {
        const validStartingModule = startingModule as 'A1' | 'A2' | 'B1' | 'B2' | undefined;

        // Update user in the main users array
        const userIndex = this.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex] = {
                ...this.users[userIndex],
                state: newState,
                starting_module: validStartingModule || this.users[userIndex].starting_module
            };
        }

        // Update user in the filtered users array
        const filteredUserIndex = this.filteredUsers.findIndex(user => user.id === userId);
        if (filteredUserIndex !== -1) {
            this.filteredUsers[filteredUserIndex] = {
                ...this.filteredUsers[filteredUserIndex],
                state: newState,
                starting_module: validStartingModule || this.filteredUsers[filteredUserIndex].starting_module
            };
        }
    }

    canEditUser(user: IUser): boolean {
        // Prevent editing own account or other administrators (except if you're admin editing students)
        return this.currentUser && (
            this.currentUser.task !== user.id &&
            (user.profile !== Profile.Administrator || this.currentUser.status === Profile.Administrator)
        );
    }

    canDeleteUser(user: IUser): boolean {
        // Prevent deleting own account
        return this.currentUser && this.currentUser.task !== user.id;
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

    isFieldInvalid(fieldName: string): boolean {
        const field = this.editUserForm.get(fieldName);
        return field ? field.invalid && (field.dirty || field.touched) : false;
    }

    getFieldError(fieldName: string): string {
        const field = this.editUserForm.get(fieldName);
        if (field?.errors) {
            if (field.errors['required']) return `${fieldName} is required`;
            if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
            if (field.errors['email']) return 'Please enter a valid email address';
            if (field.errors['pattern']) return 'Please enter a valid phone number';
        }
        return '';
    }

    getCurrentTitle(): string {
        return 'User Management';
    }

    getCurrentDescription(): string {
        return 'Manage registered users, edit their information, and control their access to the platform.';
    }

    getCurrentIcon(): string {
        return 'fas fa-users-cog';
    }

    getCurrentCount(): number {
        return this.users.length;
    }

    trackByUserId(index: number, user: IUser): number {
        return user.id!;
    }

    // Starting Module Modal Methods
    closeStartingModuleModal(): void {
        this.showStartingModuleModal = false;
        this.selectedUser = null;
    }

    onModuleSelected(startingModule: string): void {
        if (this.selectedUser) {
            this.updateUserStatus(this.selectedUser.id!, 1, startingModule);
            this.closeStartingModuleModal();
        }
    }

    getSelectedUserName(): string {
        if (this.selectedUser) {
            return this.selectedUser.name || 'User';
        }
        return '';
    }
}