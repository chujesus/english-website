import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

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
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
        children: [
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
                path: 'lessons',
                title: 'Lecciones',
                loadComponent: () => import('./dashboard/lessons/lessons.component').then(m => m.LessonsComponent)
            },
            {
                path: 'practices/speech-practice',
                title: 'Práctica de Pronunciación',
                loadComponent: () => import('./dashboard/practices/speech-practice/speech-practice.component').then(m => m.SpeechPracticeComponent)
            },
            {
                path: 'practices/speech-quiz',
                title: 'Quiz de Pronunciación',
                loadComponent: () => import('./dashboard/practices/speech-quiz/speech-quiz.component').then(m => m.SpeechQuizComponent)
            },
            {
                path: 'practices/fill-in-blank',
                title: 'Práctica de Completar',
                loadComponent: () => import('./dashboard/practices/fill-in-blank-practice/fill-in-blank-practice.component').then(m => m.FillInBlankPracticeComponent)
            },
            {
                path: '',
                redirectTo: 'modules',
                pathMatch: 'full'
            }
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
