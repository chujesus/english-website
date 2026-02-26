import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SettingService } from '../core/services/setting.service';

interface Module {
    id: number;
    level: string;
    title: string;
    description: string;
    icon: string;
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
    // Background & Branding
    loginBackgroundUrl: string | null = null;
    institutionName = 'CINDEA Abangares';
    institutionTagline = 'Aprende Inglés, Alcanza la Excelencia';
    loadingSettings = true;

    // Navbar state
    isNavbarScrolled = false;
    isMobileMenuOpen = false;

    // Modules
    modules: Module[] = [
        {
            id: 1,
            level: 'A1',
            title: 'Principiante',
            description: 'Domina vocabulario básico, saludos y estructuras gramaticales fundamentales. Perfecto para iniciar tu viaje en inglés.',
            icon: 'fa fa-star'
        },
        {
            id: 2,
            level: 'A2',
            title: 'Elemental',
            description: 'Construye confianza con expresiones comunes, conversaciones cotidianas y tareas rutinarias a un ritmo constante.',
            icon: 'fa fa-book'
        },
        {
            id: 3,
            level: 'B1',
            title: 'Intermedio',
            description: 'Comprende temas complejos, intereses personales y desarrolla fluidez en contextos y situaciones variadas.',
            icon: 'fa fa-graduation-cap'
        },
        {
            id: 4,
            level: 'B2',
            title: 'Intermedio Superior',
            description: 'Domina temas avanzados, ideas abstractas, contextos profesionales y proficiencia de nivel casi nativo.',
            icon: 'fa fa-rocket'
        }
    ];

    // Practices
    practices: Practice[] = [
        {
            id: 1,
            title: 'Práctica de Habla',
            description: 'Mejora la pronunciación y habilidades de conversación con ejercicios de habla interactivos',
            icon: 'fa fa-microphone',
            color: 'primary'
        },
        {
            id: 2,
            title: 'Comprensión Auditiva',
            description: 'Entrena tu oído con materiales de audio auténticos y preguntas de comprensión',
            icon: 'fa fa-headphones',
            color: 'success'
        },
        {
            id: 3,
            title: 'Habilidades de Lectura',
            description: 'Mejora la comprensión lectora a través de textos diversos y ejercicios analíticos',
            icon: 'fa fa-book-open',
            color: 'info'
        },
        {
            id: 4,
            title: 'Ejercicios de Escritura',
            description: 'Desarrolla habilidades de escritura desde oraciones simples hasta composiciones complejas',
            icon: 'fa fa-pen-fancy',
            color: 'warning'
        },
        {
            id: 5,
            title: 'Dominio de Gramática',
            description: 'Comprende y aplica reglas gramaticales con ejercicios dirigidos y explicaciones',
            icon: 'fa fa-spell-check',
            color: 'danger'
        },
        {
            id: 6,
            title: 'Cuestionarios Interactivos',
            description: 'Prueba tus conocimientos con cuestionarios atractivos que abarcan todas las habilidades y niveles',
            icon: 'fa fa-question-circle',
            color: 'secondary'
        }
    ];

    // Benefits
    benefits: Benefit[] = [
        {
            id: 1,
            title: 'Ruta de Aprendizaje Personalizada',
            description: 'Plan de estudios adaptativo que se ajusta a tu ritmo y estilo de aprendizaje para resultados óptimos',
            icon: 'fa fa-route'
        },
        {
            id: 2,
            title: 'Seguimiento del Progreso',
            description: 'Monitorea tu avance con análisis detallados',
            icon: 'fa fa-chart-line'
        },
        {
            id: 3,
            title: 'Contenido Comprensivo',
            description: 'Todas las habilidades del idioma cubierta: Habla, Escucha, Lectura, Escritura y Gramática',
            icon: 'fa fa-layer-group'
        },
        {
            id: 5,
            title: 'Práctica Interactiva',
            description: 'Participa con ejercicios dinámicos, escenarios del mundo real y retroalimentación instantánea',
            icon: 'fa fa-gamepad'
        },
        {
            id: 6,
            title: 'Horario Flexible',
            description: 'Aprende a tu propio ritmo con acceso de por vida a los materiales del curso en cualquier momento',
            icon: 'fa fa-hourglass-half'
        }
    ];

    // FAQ
    faqItems: FAQItem[] = [
        {
            id: 1,
            question: '¿Cómo empiezo con el curso?',
            answer: 'Simplemente crea una cuenta, selecciona tu módulo inicial (A1-B2) y comienza tu viaje de aprendizaje. Puedes acceder a lecciones, prácticas y realizar seguimiento de tu progreso desde el primer día. ¡No se requiere experiencia previa!'
        },
        {
            id: 2,
            question: '¿Puedo cambiar de módulo después de empezar?',
            answer: '¡Sí! Tienes la flexibilidad de ajustar tu ruta de aprendizaje. Tu progreso se rastrea individualmente para cada módulo, permitiendoóte explorar contenido en diferentes niveles cuando estés listo.'
        },
        {
            id: 3,
            question: '¿Qué hago si necesito ayuda o tengo preguntas?',
            answer: 'Nuestra plataforma proporciona materiales de aprendizaje completos, explicaciones de prácticas y retroalimentación detallada. También puedes revisar reglas gramaticales y consultar oraciones de ejemplo en cualquier momento.'
        },
        {
            id: 4,
            question: '¿Cómo se rastrea mi progreso?',
            answer: 'Tu progreso se rastrea automáticamente en todas las actividades. Puedes ver estadísticas detalladas, lecciones completadas, puntuaciones de prácticas y áreas de mejora en tu panel de control.'
        },
        {
            id: 5,
            question: '¿Hay una aplicación móvil?',
            answer: 'Nuestra plataforma es totalmente responsiva y funciona perfectamente en todos los dispositivos: computadora, tablet y móvil. Accede a tus cursos y continúa aprendiendo en cualquier lugar, en cualquier momento.'
        },
        {
            id: 6,
            question: '¿Qué se incluye en cada módulo?',
            answer: 'Cada módulo contiene múltiples temas con lecciones que cubren vocabulario, gramática, lectura, escucha, habla, escritura y cuestionarios interactivos. ¡Progreso real en todas las habilidades del idioma!'
        }
    ];

    // Intersection Observer
    private intersectionObserver?: IntersectionObserver;

    constructor(
        private router: Router,
        private settingService: SettingService
    ) { }

    ngOnInit(): void {
        this.loadSettings();
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
                console.log('Could not load settings, using defaults');
                this.loadingSettings = false;
            }
        });
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
            default: return 'badge-secondary';
        }
    }

    /**
     * Get practice color class
     */
    getPracticeColorClass(color: string): string {
        return `practice-card-${color}`;
    }
}
