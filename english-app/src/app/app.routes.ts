import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
    // Auth routes - Principal (solo para usuarios no autenticados)
    {
        path: 'auth',
        canActivate: [guestGuard],
        children: [
            {
                path: 'login',
                title: 'Iniciar Sesión',
                loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'register',
                title: 'Registrarse',
                loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
            },
            {
                path: 'forgot-password',
                title: 'Recuperar Contraseña',
                loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
            },
            {
                path: 'reset-password',
                title: 'Restablecer Contraseña',
                loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
    },
    // Dashboard routes - Protegidas (requieren autenticación)
    {
        path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], children: [
            {
                path: 'control-panel',
                title: 'Panel de Control',
                loadComponent: () => import('./dashboard/control-panel/control-panel.component').then(m => m.ControlPanelComponent)
            },
            {
                path: 'modules',
                title: 'Módulos',
                loadComponent: () => import('./dashboard/modules/modules.component').then(m => m.ModulesComponent)
            },
            {
                path: 'courses',
                title: 'Cursos',
                loadComponent: () => import('./dashboard/courses/courses.component').then(m => m.CoursesComponent)
            },
            {
                path: 'lesson-viewer',
                title: 'Visor de Lecciones',
                loadComponent: () => import('./dashboard/lesson-viewer/lesson-viewer.component').then(m => m.LessonViewerComponent)
            },
            {
                path: 'instructor-analytics',
                title: 'Analytics de Instructor',
                loadComponent: () => import('./dashboard/instructor-analytics/instructor-analytics.component').then(m => m.InstructorAnalyticsComponent)
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
