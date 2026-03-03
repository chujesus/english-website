import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

interface Module {
    id: number;
    level: string;
    title: string;
    description: string;
    icon: string;
}

interface Differentiator {
    id: number;
    title: string;
    description: string;
    icon: string;
}

interface Institution {
    id: number;
    name: string;
    logo?: string;
    subdomain: string;
    active: boolean;
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
    imports: [CommonModule],
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, OnDestroy {
    // Branding - CORPORATE (Hardcoded)
    platformName = 'Edu English Platform';
    platformTagline = 'Transforma la enseñanza del inglés en tu institución';
    platformDescription = 'Plataforma académica profesional para la enseñanza del inglés, completamente administrable y personalizable por institución.';
    loadingInstitutions = false;

    // Navbar state
    isNavbarScrolled = false;
    isMobileMenuOpen = false;

    // Intersection Observer
    private intersectionObserver?: any;

    // Academic Levels (Hardcoded - Fixed Structure)
    modules: Module[] = [
        {
            id: 1,
            level: 'A1',
            title: 'Básico',
            description: 'Nivel de principiante. Vocabulario básico y estructuras gramaticales fundamentales.',
            icon: 'fa fa-star'
        },
        {
            id: 2,
            level: 'A2',
            title: 'Elemental',
            description: 'Nivel elemental. Expresiones comunes y conversaciones cotidianas.',
            icon: 'fa fa-book'
        },
        {
            id: 3,
            level: 'B1',
            title: 'Intermedio',
            description: 'Nivel intermedio. Temas complejos e intereses personales.',
            icon: 'fa fa-graduation-cap'
        },
        {
            id: 4,
            level: 'B2',
            title: 'Intermedio Alto',
            description: 'Nivel intermedio alto. Temas avanzados e ideas abstractas.',
            icon: 'fa fa-rocket'
        },
        {
            id: 5,
            level: 'C1',
            title: 'Avanzado',
            description: 'Nivel avanzado. Expresión espontánea y flexible.',
            icon: 'fa fa-crown'
        },
        {
            id: 6,
            level: 'C2',
            title: 'Proficiencia',
            description: 'Nivel de proficiencia. Dominio prácticamente nativo.',
            icon: 'fa fa-trophy'
        }
    ];

    // Differentiators - CORPORATE MESSAGING
    differentiators: Differentiator[] = [
        {
            id: 1,
            title: 'Administración Completa de Módulos',
            description: 'Cada institución puede administrar y personalizar el contenido de sus módulos desde A1 hasta C2, gestionando temas, objetivos y resultados de aprendizaje desde un panel centralizado.',
            icon: 'fa fa-sliders-h'
        },
        {
            id: 2,
            title: 'Gestión Dinámica de Contenido',
            description: 'Controla completamente el contenido temático, ejemplos, prácticas y evaluaciones sin necesidad de programación.',
            icon: 'fa fa-cogs'
        },
        {
            id: 3,
            title: 'Sistema Estructurado por CEFR',
            description: 'Plataforma diseñada sobre estándares internacionales CEFR (Common European Framework of Reference), validada a nivel global.',
            icon: 'fa fa-certificate'
        },
        {
            id: 4,
            title: 'Prácticas Interactivas',
            description: 'Suite completa de ejercicios interactivos: habla, escucha, lectura, escritura, gramática y cuestionarios.',
            icon: 'fa fa-gamepad'
        },
        {
            id: 5,
            title: 'Análisis y Reportes',
            description: 'Dashboards avanzados para monitorear progreso estudiantil, tasas de aprobación y mejoras académicas.',
            icon: 'fa fa-chart-line'
        },
        {
            id: 6,
            title: 'Escalable Multi-Tenant',
            description: 'Infraestructura modular que permite múltiples instituciones con contextos completamente personalizados.',
            icon: 'fa fa-network-wired'
        }
    ];

    // Institutions Array
    institutions: Institution[] = [];

    // FAQ
    faqItems: FAQItem[] = [
        {
            id: 1,
            question: '¿Qué es Edu English Platform?',
            answer: 'Edu English Platform es una solución académica integral de enseñanza del inglés, diseñada para instituciones educativas. Ofrece administración modular completa, contenido personalizable y una experiencia de aprendizaje interactiva basada en estándares internacionales CEFR.'
        },
        {
            id: 2,
            question: '¿Puedo personalizar el contenido según mi institución?',
            answer: 'Absolutamente. La plataforma permite que cada institución personalice módulos, temas, ejemplos, prácticas y evaluaciones. Tienes control total sin necesidad de conocimientos técnicos.'
        },
        {
            id: 3,
            question: '¿Cuál es la estructura de niveles?',
            answer: 'La plataforma sigue el marco CEFR: A1 (Básico), A2 (Elemental), B1 (Intermedio), B2 (Intermedio Alto), C1 (Avanzado) y C2 (Proficiencia). Cada nivel incluye múltiples temas y objetivos de aprendizaje.'
        },
        {
            id: 4,
            question: '¿Cómo se rastrea el progreso estudiantil?',
            answer: 'El sistema automatiza el seguimiento de progreso en tiempo real. Tendrás acceso a reportes detallados sobre lecciones completadas, calificaciones de prácticas, áreas de mejora y métricas institucionales.'
        },
        {
            id: 5,
            question: '¿Es compatible con dispositivos móviles?',
            answer: 'Sí, la plataforma es completamente responsiva. Funciona perfectamente en computadoras, tablets y dispositivos móviles, permitiendo aprendizaje flexible en cualquier lugar y momento.'
        },
        {
            id: 6,
            question: '¿Cuál es el modelo de implementación?',
            answer: 'Ofrecemos implementación modular e iterativa. Puedes comenzar con un nivel y expandir gradualmente. Nuestro equipo de soporte guía cada paso de la configuración y personalización.'
        }
    ];

    constructor(private router: Router) { }

    ngOnInit(): void {
        this.loadInstitutions();
        this.setupIntersectionObserver();
    }

    ngOnDestroy(): void {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
    }

    /**
     * Load associated institutions (hardcoded for now)
     */
    loadInstitutions(): void {
        // Hardcoded: Only CINDEA Abangares for now
        this.institutions = [
            {
                id: 1,
                name: 'CINDEA Abangares',
                subdomain: 'cindea-abangares',
                active: true
            }
        ];
    }

    /**
     * Setup Intersection Observer for animations
     */
    setupIntersectionObserver(): void {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof (window as any).IntersectionObserver === 'undefined') {
            return;
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        this.intersectionObserver = new (window as any).IntersectionObserver((entries: any) => {
            entries.forEach((entry: any) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        const fadeElements = document.querySelectorAll('.fade-on-scroll');
        fadeElements.forEach(element => this.intersectionObserver?.observe(element));
    }

    /**
     * Get badge class based on module level
     */
    getModuleBadgeClass(level: string): string {
        const badgeMap: { [key: string]: string } = {
            'A1': 'badge-a1',
            'A2': 'badge-a2',
            'B1': 'badge-b1',
            'B2': 'badge-b2',
            'C1': 'badge-c1',
            'C2': 'badge-c2'
        };
        return badgeMap[level] || 'badge-default';
    }

    /**
     * Smooth scroll to section
     */
    scrollToSection(sectionId: string): void {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            this.isMobileMenuOpen = false;
        }
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu(): void {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    /**
     * Get background style (corporate landing - fixed gradient)
     */
    getBackgroundStyle(): any {
        return {
            'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
    }

    /**
     * Navbar scroll listener
     */
    @HostListener('window:scroll')
    onScroll(): void {
        this.isNavbarScrolled = window.scrollY > 50;
    }

    /**
     * Navigation methods
     */
    goToAssociatedInstitutions(): void {
        this.scrollToSection('institutions');
    }

    /**
     * Toggle FAQ item
     */
    toggleFAQ(item: FAQItem): void {
        item.open = !item.open;
    }

    /**
     * Navigate to institution app
     */
    accessInstitution(subdomain: string): void {
        const url = `https://${subdomain}-english-app.unitalwebsolutions.com`;
        window.open(url, '_blank');
    }
}
