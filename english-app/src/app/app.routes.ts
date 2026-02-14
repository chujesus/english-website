import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
    // Auth routes - Main (only for non-authenticated users)
    {
        path: 'auth',
        canActivate: [guestGuard],
        children: [
            {
                path: 'login',
                title: 'Login',
                loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'register',
                title: 'Register',
                loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
            },
            {
                path: 'forgot-password',
                title: 'Forgot Password',
                loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
            },
            {
                path: 'change-password/:id/:passwordToken',
                title: 'Change Password',
                loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
    },
    // Dashboard routes - Protected (require authentication)
    {
        path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], children: [
            {
                path: 'control-panel',
                title: 'Control Panel',
                loadComponent: () => import('./dashboard/control-panel/control-panel.component').then(m => m.ControlPanelComponent)
            },
            {
                path: 'modules',
                title: 'Modules',
                loadComponent: () => import('./dashboard/modules/modules.component').then(m => m.ModulesComponent)
            },
            {
                path: 'courses',
                title: 'Courses',
                loadComponent: () => import('./dashboard/courses/courses.component').then(m => m.CoursesComponent)
            },
            {
                path: 'lesson-viewer',
                title: 'Lesson Viewer',
                loadComponent: () => import('./dashboard/lesson-viewer/lesson-viewer.component').then(m => m.LessonViewerComponent)
            },
            {
                path: 'manage-content',
                title: 'Manage Content',
                loadComponent: () => import('./dashboard/manage-content/manage-content.component').then(m => m.ManageContentComponent)
            },
            {
                path: 'profile',
                title: 'Profile',
                loadComponent: () => import('./dashboard/profile/profile.component').then(m => m.ProfileComponent)
            },
            {
                path: 'user-management',
                title: 'User Management',
                loadComponent: () => import('./dashboard/user-management/user-management.component').then(m => m.UserManagementComponent)
            },
            {
                path: 'settings-management',
                title: 'Settings Management',
                loadComponent: () => import('./dashboard/settings-management/settings-management.component').then(m => m.SettingsManagementComponent)
            },
            { path: '**', redirectTo: '/dashboard/control-panel' }
        ]
    },
    // Ruta principal redirige a login
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },
    // Ruta wildcard para 404 (redirige a login)
    {
        path: '**',
        redirectTo: '/auth/login'
    }
];
