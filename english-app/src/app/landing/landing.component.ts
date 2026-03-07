import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SettingService } from '../core/services/setting.service';
import { CourseService } from '../core/services/course.service';
import { TopicsService } from '../core/services/topics.service';

interface Module {
    id: number;
    level: string;
    title: string;
    description: string;
    icon: string;
}

interface Topic {
    id: number;
    title: string;
    course_id: number;
}

interface Practice {
    id: number;
    title: string;
    description: string;
    icon: string;
    color: string;
}

interface Benefit {
    id: number;
    title: string;
    description: string;
    icon: string;
}

interface FAQItem {
    id: number;
    question: string;
    answer: string;
    open?: boolean;
}

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, OnDestroy {
    // Background & Branding (Personalizable desde settings)
    loginBackgroundUrl: string | null = null;
    institutionName = 'Tu Institución';
    institutionTagline = 'Plataforma de Aprendizaje del Inglés';
    loadingSettings = true;
    loadingCourses = false;

    // Navbar state
    isNavbarScrolled = false;
    isMobileMenuOpen = false;

    // Modules (will be populated from API)
    modules: Module[] = [];

    // Topics by course
    topicsByCourse: { [courseId: number]: Topic[] } = {};

    // Practices (Características de la plataforma)
    practices: Practice[] = [
        {
            id: 1,
            title: 'Lecciones Interactivas',
            description: 'Contenido estructurado por nivel CEFR con explicaciones claras, ejemplos prácticos y ejercicios progresivos.',
            icon: 'fa fa-book-open',
            color: 'primary'
        },
        {
            id: 2,
            title: 'Ejercicios Prácticos',
            description: 'Practica todas las habilidades: comprensión auditiva, lectura, escritura, gramática y vocabulario.',
            icon: 'fa fa-dumbbell',
            color: 'success'
        },
        {
            id: 3,
            title: 'Seguimiento del Progreso',
            description: 'Monitorea tu avance en tiempo real con estadísticas detalladas y análisis de áreas de mejora.',
            icon: 'fa fa-chart-line',
            color: 'info'
        },
        {
            id: 4,
            title: 'Contenido Personalizado',
            description: 'Ruta de aprendizaje adaptativa que se ajusta a tu ritmo y necesidades individuales.',
            icon: 'fa fa-user-customized',
            color: 'warning'
        },
        {
            id: 5,
            title: 'Recursos Complementarios',
            description: 'Acceso a materiales de referencia, vocabulario y reglas gramaticales en cualquier momento.',
            icon: 'fa fa-folder-open',
            color: 'danger'
        },
        {
            id: 6,
            title: 'Disponible 24/7',
            description: 'Aprende a tu propio ritmo, en cualquier momento y lugar. Acceso ilimitado a todos los contenidos.',
            icon: 'fa fa-clock',
            color: 'secondary'
        }
    ];

    // Benefits (Ventajas de aprender con nosotros)
    benefits: Benefit[] = [
        {
            id: 1,
            title: 'Estructura Basada en CEFR',
            description: 'Nuestro currículo sigue los estándares internacionales de certificación de inglés (A1 a C2).',
            icon: 'fa fa-certificate'
        },
        {
            id: 2,
            title: 'Certificación Progresiva',
            description: 'Milestones claros en cada nivel para validar tu progreso y reconocer tu aprendizaje.',
            icon: 'fa fa-medal'
        },
        {
            id: 3,
            title: 'Instrucción Completa',
            description: 'Todas las habilidades del idioma cubiertas: Speaking, Listening, Reading, Writing y Grammar.',
            icon: 'fa fa-graduation-cap'
        },
        {
            id: 4,
            title: 'Ambiente de Apoyo',
            description: 'Herramientas interactivas y recursos que hacen el aprendizaje efectivo y motivador.',
            icon: 'fa fa-handshake'
        },
        {
            id: 5,
            title: 'Flexibilidad Total',
            description: 'Aprende según tu horario. No hay presiones, solo tu propio ritmo de aprendizaje.',
            icon: 'fa fa-clock'
        }
    ];

    // FAQ
    faqItems: FAQItem[] = [
        {
            id: 1,
            question: '¿Cómo empiezo a aprender?',
            answer: 'Crea una cuenta en la plataforma. Nuestro sistema te guiará a través de una ruta de aprendizaje personalizada con lecciones, ejercicios y seguimiento de progreso.'
        },
        {
            id: 2,
            question: '¿Cuáles son los niveles disponibles?',
            answer: 'Ofrecemos 6 niveles según el Marco Común Europeo de Referencia (CEFR): A1 (Principiante), A2 (Elemental), B1 (Intermedio), B2 (Intermedio Alto), C1 (Avanzado) y C2 (Proficiencia).'
        },
        {
            id: 3,
            question: '¿Puedo cambiar de nivel durante el aprendizaje?',
            answer: 'Sí. Cuando sientas que has dominado el nivel actual, puedes avanzar al siguiente. También puedes revisar niveles anteriores en cualquier momento para reforzar conceptos.'
        },
        {
            id: 4,
            question: '¿Cómo se rastrea mi progreso?',
            answer: 'Tu progreso se registra automáticamente en cada actividad. Puedes ver estadísticas detalladas, lecciones completadas, calificaciones de ejercicios y áreas donde necesitas más práctica en tu panel personal.'
        },
        {
            id: 5,
            question: '¿Qué contenido incluye cada nivel?',
            answer: 'Cada nivel contiene múltiples temas con lecciones de gramática, vocabulario, comprensión auditiva, lectura y escritura. Cada tema tiene explicaciones, ejemplos prácticos y ejercicios interactivos con retroalimentación inmediata.'
        },
        {
            id: 6,
            question: '¿Es realmente 24/7?',
            answer: 'Sí, la plataforma está disponible todo el tiempo. Puedes acceder desde cualquier dispositivo (computadora, tablet, móvil) y continuar donde dejaste en cualquier momento.'
        }
    ];

    // Intersection Observer
    private intersectionObserver?: IntersectionObserver;

    constructor(
        private router: Router,
        private settingService: SettingService,
        private courseService: CourseService,
        private topicsService: TopicsService
    ) { }

    ngOnInit(): void {
        this.loadSettings();
        this.loadCoursesAndTopics();
        this.setupIntersectionObserver();
    }

    ngOnDestroy(): void {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
    }

    /**
     * Load branding and background from settings
     */
    loadSettings(): void {
        this.loadingSettings = true;
        this.settingService.getAllSettings().subscribe({
            next: (response: any) => {
                if (response.data && Array.isArray(response.data)) {
                    const institutionSetting = response.data.find((s: any) => s.name === 'Institution name');
                    const backgroundSetting = response.data.find((s: any) => s.name === 'Login Background');

                    if (institutionSetting?.value) {
                        this.institutionName = institutionSetting.value;
                    }
                    if (backgroundSetting?.value) {
                        this.loginBackgroundUrl = backgroundSetting.value;
                    }
                }
                this.loadingSettings = false;
            },
            error: () => {
                console.log('Settings no disponibles, usando valores por defecto');
                this.loadingSettings = false;
            }
        });
    }

    /**
     * Load courses and topics from API
     */
    loadCoursesAndTopics(): void {
        this.loadingCourses = true;
        this.courseService.getAllCourses().subscribe({
            next: (response: any) => {
                if (response.ok && response.courses && Array.isArray(response.courses)) {
                    this.modules = response.courses.map((course: any) => ({
                        id: course.id,
                        level: course.level,
                        title: course.title,
                        description: course.description || '',
                        icon: this.getIconForLevel(course.level)
                    }));

                    // Load topics for each course
                    this.modules.forEach(module => {
                        this.loadTopicsForCourse(module.id);
                    });
                }
                this.loadingCourses = false;
            },
            error: (error) => {
                console.error('Error loading courses:', error);
                this.loadingCourses = false;
            }
        });
    }

    /**
     * Load topics for a specific course
     */
    loadTopicsForCourse(courseId: number): void {
        this.topicsService.getTopicsByCourse(courseId, 5).subscribe({
            next: (response: any) => {
                if (response.data && Array.isArray(response.data)) {
                    this.topicsByCourse[courseId] = response.data.map((topic: any) => ({
                        id: topic.id,
                        title: topic.title,
                        course_id: topic.course_id
                    }));
                }
            },
            error: (error) => {
                console.error(`Error loading topics for course ${courseId}:`, error);
            }
        });
    }

    /**
     * Get icon for level
     */
    getIconForLevel(level: string): string {
        const iconMap: { [key: string]: string } = {
            'A1': 'fa fa-star',
            'A2': 'fa fa-book',
            'B1': 'fa fa-graduation-cap',
            'B2': 'fa fa-rocket',
            'C1': 'fa fa-crown',
            'C2': 'fa fa-trophy'
        };
        return iconMap[level] || 'fa fa-book';
    }

    /**
     * Get dynamic background styles
     */
    getBackgroundStyle(): any {
        if (this.loginBackgroundUrl) {
            return {
                'background': `linear-gradient(135deg, rgba(43, 143, 250, 0.25) 0%, rgba(0, 86, 184, 0.25) 100%), url('${this.loginBackgroundUrl}')`,
                'background-size': 'cover',
                'background-position': 'center',
                'background-attachment': 'fixed'
            };
        }
        return {
            'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
    }

    /**
     * Listen to scroll for navbar state
     */
    @HostListener('window:scroll')
    onWindowScroll(): void {
        this.isNavbarScrolled = window.scrollY > 50;
    }

    /**
     * Setup intersection observer for fade-in animations
     */
    private setupIntersectionObserver(): void {
        const options: IntersectionObserverInit = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    this.intersectionObserver?.unobserve(entry.target);
                }
            });
        }, options);

        // Observe all elements with fade-on-scroll class
        setTimeout(() => {
            const elements = document.querySelectorAll('.fade-on-scroll');
            elements.forEach((el) => {
                this.intersectionObserver?.observe(el);
            });
        }, 100);
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu(): void {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu(): void {
        this.isMobileMenuOpen = false;
    }

    /**
     * Navigate to login
     */
    goToLogin(): void {
        this.router.navigate(['/auth/login']);
    }

    /**
     * Navigate to register
     */
    goToRegister(): void {
        this.router.navigate(['/auth/register']);
    }

    /**
     * Smooth scroll to section
     */
    scrollToSection(sectionId: string): void {
        this.closeMobileMenu();
        const element = document.getElementById(sectionId);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }

    /**
     * Toggle FAQ item
     */
    toggleFAQ(item: FAQItem): void {
        item.open = !item.open;
    }

    /**
     * Get module color badge class
     */
    getModuleBadgeClass(level: string): string {
        switch (level) {
            case 'A1': return 'badge-info';
            case 'A2': return 'badge-primary';
            case 'B1': return 'badge-warning';
            case 'B2': return 'badge-danger';
            case 'C1': return 'badge-secondary';
            case 'C2': return 'badge-dark';
            default: return 'badge-secondary';
        }
    }

    /**
     * Get practice color class
     */
    getPracticeColorClass(color: string): string {
        return `practice-card-${color}`;
    }

    /**
     * Get topics for a course
     */
    getTopicsForCourse(courseId: number): Topic[] {
        return this.topicsByCourse[courseId] || [];
    }
}

