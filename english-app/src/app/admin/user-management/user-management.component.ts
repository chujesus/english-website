import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    profile: number; // 0=Admin, 1=Instructor, 2=Student
    state: number; // 1=active, 0=inactive
    createdAt: string;
    lastLogin?: string;
}

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="text-primary">
              <i class="fas fa-users-cog me-2"></i>
              User Management
            </h2>
            <button class="btn btn-outline-primary" routerLink="/dashboard/admin-dashboard">
              <i class="fas fa-arrow-left me-2"></i>Back to Admin
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="row mb-4">
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filterRole" (change)="loadUsers()">
            <option value="">All Roles</option>
            <option value="0">Administrators</option>
            <option value="1">Instructors</option>
            <option value="2">Students</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filterStatus" (change)="loadUsers()">
            <option value="">All Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control" placeholder="Search by email or name..." 
                 [(ngModel)]="searchTerm" (input)="loadUsers()">
        </div>
        <div class="col-md-2">
          <button class="btn btn-success w-100" (click)="loadUsers()">
            <i class="fas fa-sync me-1"></i>Refresh
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading users...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="alert alert-danger" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ error }}
        <button class="btn btn-outline-danger btn-sm ms-2" (click)="loadUsers()">
          Try Again
        </button>
      </div>

      <!-- Users Table -->
      <div *ngIf="!loading && !error" class="card">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="fas fa-users me-2"></i>
              Users ({{ filteredUsers.length }})
            </h5>
            <span class="badge bg-primary">
              Total: {{ users.length }}
            </span>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of filteredUsers; trackBy: trackByUserId">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-circle me-2" [class]="getRoleAvatarClass(user.profile)">
                        {{ getInitials(user.firstName, user.lastName) }}
                      </div>
                      <div>
                        <strong>{{ user.firstName }} {{ user.lastName }}</strong>
                        <br>
                        <small class="text-muted">ID: {{ user.id }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="badge" [class]="getRoleBadgeClass(user.profile)">
                      {{ getRoleText(user.profile) }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [class]="getStatusBadgeClass(user.state)">
                      {{ user.state === 1 ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>{{ formatDate(user.lastLogin) || 'Never' }}</td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button class="btn btn-outline-primary" 
                              (click)="editUser(user)"
                              title="Edit User">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn" 
                              [class]="user.state === 1 ? 'btn-outline-warning' : 'btn-outline-success'"
                              (click)="toggleUserStatus(user)"
                              [title]="user.state === 1 ? 'Deactivate' : 'Activate'">
                        <i class="fas" [class]="user.state === 1 ? 'fa-pause' : 'fa-play'"></i>
                      </button>
                      <button class="btn btn-outline-info" 
                              (click)="viewUserProgress(user)"
                              *ngIf="user.profile === 2"
                              title="View Progress">
                        <i class="fas fa-chart-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !error && filteredUsers.length === 0" class="text-center py-5">
        <i class="fas fa-users fa-3x text-muted mb-3"></i>
        <h4 class="text-muted">No Users Found</h4>
        <p class="text-muted">No users match your current filters.</p>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div class="modal fade" id="editUserModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-user-edit me-2"></i>
              Edit User: {{ selectedUser?.firstName }} {{ selectedUser?.lastName }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form *ngIf="selectedUser" (ngSubmit)="saveUserChanges()">
              <div class="mb-3">
                <label class="form-label">First Name</label>
                <input type="text" class="form-control" [(ngModel)]="selectedUser.firstName" name="firstName">
              </div>
              <div class="mb-3">
                <label class="form-label">Last Name</label>
                <input type="text" class="form-control" [(ngModel)]="selectedUser.lastName" name="lastName">
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" [(ngModel)]="selectedUser.email" name="email">
              </div>
              <div class="mb-3">
                <label class="form-label">Role</label>
                <select class="form-select" [(ngModel)]="selectedUser.profile" name="profile">
                  <option value="0">Administrator</option>
                  <option value="1">Instructor</option>
                  <option value="2">Student</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Status</label>
                <select class="form-select" [(ngModel)]="selectedUser.state" name="state">
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveUserChanges()">
              <i class="fas fa-save me-1"></i>Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .avatar-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }
    .avatar-admin { background-color: #dc3545; }
    .avatar-instructor { background-color: #fd7e14; }
    .avatar-student { background-color: #20c997; }
    
    .table th {
      border-top: none;
      font-weight: 600;
      color: #495057;
    }
    
    .btn-group-sm .btn {
      padding: 0.25rem 0.5rem;
    }
  `]
})
export class UserManagementComponent implements OnInit {
    users: User[] = [];
    filteredUsers: User[] = [];
    loading = false;
    error = '';

    // Filters
    filterRole = '';
    filterStatus = '';
    searchTerm = '';

    // Modal
    selectedUser: User | null = null;

    constructor() { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading = true;
        this.error = '';

        // Mock data for now - replace with real API call
        setTimeout(() => {
            this.users = [
                {
                    id: 1,
                    email: 'admin@example.com',
                    firstName: 'John',
                    lastName: 'Admin',
                    profile: 0,
                    state: 1,
                    createdAt: '2024-01-15T10:00:00Z',
                    lastLogin: '2024-09-15T08:30:00Z'
                },
                {
                    id: 2,
                    email: 'instructor@example.com',
                    firstName: 'Jane',
                    lastName: 'Teacher',
                    profile: 1,
                    state: 1,
                    createdAt: '2024-02-01T09:00:00Z',
                    lastLogin: '2024-09-14T16:45:00Z'
                },
                {
                    id: 3,
                    email: 'student1@example.com',
                    firstName: 'Alice',
                    lastName: 'Student',
                    profile: 2,
                    state: 1,
                    createdAt: '2024-03-10T14:20:00Z',
                    lastLogin: '2024-09-15T07:15:00Z'
                },
                {
                    id: 4,
                    email: 'student2@example.com',
                    firstName: 'Bob',
                    lastName: 'Learner',
                    profile: 2,
                    state: 0,
                    createdAt: '2024-04-05T11:30:00Z'
                }
            ];

            this.applyFilters();
            this.loading = false;
        }, 1000);
    }

    applyFilters(): void {
        this.filteredUsers = this.users.filter(user => {
            const matchesRole = !this.filterRole || user.profile.toString() === this.filterRole;
            const matchesStatus = !this.filterStatus || user.state.toString() === this.filterStatus;
            const matchesSearch = !this.searchTerm ||
                user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase());

            return matchesRole && matchesStatus && matchesSearch;
        });
    }

    editUser(user: User): void {
        this.selectedUser = { ...user };
        // Open modal (Bootstrap modal trigger)
    }

    saveUserChanges(): void {
        if (!this.selectedUser) return;

        // Update user in the array
        const index = this.users.findIndex(u => u.id === this.selectedUser!.id);
        if (index !== -1) {
            this.users[index] = { ...this.selectedUser };
            this.applyFilters();
        }

        // Close modal and show success message
        this.selectedUser = null;
    }

    toggleUserStatus(user: User): void {
        user.state = user.state === 1 ? 0 : 1;
        this.applyFilters();
    }

    viewUserProgress(user: User): void {
        // Navigate to user progress view
        console.log('View progress for user:', user.id);
    }

    trackByUserId(index: number, user: User): number {
        return user.id;
    }

    getRoleText(profile: number): string {
        switch (profile) {
            case 0: return 'Administrator';
            case 1: return 'Instructor';
            case 2: return 'Student';
            default: return 'Unknown';
        }
    }

    getRoleBadgeClass(profile: number): string {
        switch (profile) {
            case 0: return 'bg-danger';
            case 1: return 'bg-warning';
            case 2: return 'bg-success';
            default: return 'bg-secondary';
        }
    }

    getRoleAvatarClass(profile: number): string {
        switch (profile) {
            case 0: return 'avatar-admin';
            case 1: return 'avatar-instructor';
            case 2: return 'avatar-student';
            default: return 'avatar-student';
        }
    }

    getStatusBadgeClass(state: number): string {
        return state === 1 ? 'bg-success' : 'bg-secondary';
    }

    getInitials(firstName: string, lastName: string): string {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    formatDate(dateString: string | undefined): string {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    }
}