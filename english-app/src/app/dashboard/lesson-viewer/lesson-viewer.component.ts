import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SpeechPracticeComponent } from '../practices/speech-practice/speech-practice.component';
import { SpeechQuizComponent } from '../practices/speech-quiz/speech-quiz.component';
import { FillInBlankPracticeComponent } from '../practices/fill-in-blank-practice/fill-in-blank-practice.component';
import { TopicsService } from '../../core/services/topics.service';
import { IFillInBlank, ILesson, IListening, ITopic, SpeechPracticeItem, IStudentProgress, IAssessment } from '../../shared/interfaces/models';
import { LessonsService } from '../../core/services/lessons.service';
import { StudentService } from '../../core/services/student.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-lesson-viewer',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, SpeechPracticeComponent, SpeechQuizComponent, FillInBlankPracticeComponent],
    templateUrl: './lesson-viewer.component.html',
    styleUrl: './lesson-viewer.component.scss'
})
export class LessonViewerComponent implements OnInit {
    user: any = null;
    courseId: number = 0;
    topicId: number = 0;
    activeSection = 0;
    lessonProgress = 0;
    height: number = 0;
    screenHeight: number = 0;
    courseTitle: string = "";
    cefrLevel: string = "";
    error: string = "";
    currentLesson: ILesson[] = [];
    lessons: ILesson[] = [];
    topic: ITopic | null = null;
    loading = false;
    loadingPractices = false;
    totalLessonsInTopic = 0;
    safeLessonContent!: SafeHtml;

    // Referencia al componente de Writing Practice
    @ViewChild(FillInBlankPracticeComponent) fillInBlankComponent!: FillInBlankPracticeComponent;
    // Arrays separados para cada tipo de práctica
    userAnswers: { [key: number]: string | null } = {}; // Para reading (mantener compatibilidad)
    feedback: { [key: number]: string | null } = {}; // Para reading (mantener compatibilidad)

    // Arrays específicos para cada práctica
    listeningAnswers: { [key: number]: string | null } = {};
    listeningFeedback: { [key: number]: string | null } = {};

    // Arrays para speaking practice
    speakingRecognizedTexts: { [key: number]: string | null } = {};
    speakingCorrectness: { [key: number]: boolean | null } = {};

    speechPracticeItems: SpeechPracticeItem[] = [];
    questions: IFillInBlank[] = [];
    listening: IListening[] = [];

    // Progreso de cada práctica por lección actual
    practiceProgress = {
        reading: 0,
        writing: 0,
        listening: 0,
        speaking: 0
    };

    // Progreso acumulado de cada práctica a nivel de todo el tópico
    topicProgress = {
        reading: 0,
        writing: 0,
        listening: 0,
        speaking: 0
    };

    // Counter of completely finished lessons
    completedLessonsCount = 0;

    // Estados guardados para cada tipo de práctica
    savedStates = {
        reading: {
            answers: {} as { [key: number]: string | null },
            feedback: {} as { [key: number]: string | null },
            saved: false
        },
        writing: {
            answers: [] as any[],
            saved: false
        },
        listening: {
            answers: {} as { [key: number]: string | null },
            feedback: {} as { [key: number]: string | null },
            saved: false
        },
        speaking: {
            practiceItems: [] as SpeechPracticeItem[],
            saved: false
        }
    };

    constructor(private route: ActivatedRoute, private topicsService: TopicsService, private lessonsService: LessonsService, private studentService: StudentService, private sanitizer: DomSanitizer) { }

    ngOnInit(): void {
        this.loadingPractices = true;
        this.route.queryParams.subscribe(params => {
            this.user = { id: +params['userId'] };
            this.courseId = +params['courseId'];
            this.courseTitle = params['courseTitle'];
            this.topicId = +params['topicId'];
            this.cefrLevel = params['cefrLevel'];
            this.loadTopics();
            this.loadLessons();
        });
    }

    loadTopics(): void {
        this.topicsService.getTopicById(this.topicId).subscribe({
            next: (topics: ITopic[]) => {
                this.topic = topics[0] || null;
            },
            error: (error) => {
                console.error('❌ Error loading topic:', error);
            }
        });
    }

    loadLessons(): void {
        this.loading = true;
        this.error = '';
        this.lessonsService.getLessonsByUserIdAndTopic(this.user.id, this.topicId).subscribe({
            next: (lessons: ILesson[]) => {
                this.lessons = lessons;
                this.totalLessonsInTopic = lessons.length; // Set total lessons
                if (this.lessons.length > 0) {
                    this.currentLesson = [lessons[0]];
                    const content = this.currentLesson[0]?.content || '';
                    this.safeLessonContent = this.sanitizer.bypassSecurityTrustHtml(content);
                    this.activeSection = this.currentLesson[0]?.id || 0;
                    this.loadPractices(this.currentLesson[0]);
                }

                this.loading = false;
                // Load topic progress after lessons are loaded
                this.loadTopicProgress();

                setTimeout(() => {
                    const element = document.querySelector<HTMLDivElement>('.sidebar');
                    if (element) {
                        this.screenHeight = window.innerHeight;
                        this.height = element.scrollHeight + 24;
                    }
                }, 500);
            },
            error: (error) => {
                console.error('Error loading lesson:', error);
                this.loading = false;
                this.error = 'Failed to load lesson content. Please try again later.';
            }
        });
    }

    loadTopicProgress(): void {
        if (!this.user?.id || !this.topicId) return;

        // Obtener todo el progreso del usuario para este tópico
        this.studentService.getTopicProgress(this.user.id, this.topicId).subscribe({
            next: (response) => {
                if (response && response.assessments) {
                    // Resetear progreso del tópico
                    this.topicProgress = {
                        reading: 0,
                        writing: 0,
                        listening: 0,
                        speaking: 0
                    };

                    // Count completed lessons by practice type
                    const completedLessons = {
                        reading: new Set(),
                        writing: new Set(),
                        listening: new Set(),
                        speaking: new Set()
                    };

                    // Process each assessment to count unique completed lessons
                    response.assessments.forEach((assessment: any, index: number) => {
                        const type = assessment.type as 'reading' | 'writing' | 'listening' | 'speaking';
                        const lessonId = assessment.lesson_id;

                        if (lessonId && assessment.score >= 0) {
                            completedLessons[type].add(lessonId);
                        }
                    });

                    // Calculate percentages: (completed lessons / total lessons) × 25%
                    // Each practice type is worth maximum 25% (100% ÷ 4 sections = 25%)
                    if (this.totalLessonsInTopic > 0) {
                        this.topicProgress.reading = Math.round(((completedLessons.reading.size / this.totalLessonsInTopic) * 25) * 100) / 100;
                        this.topicProgress.writing = Math.round(((completedLessons.writing.size / this.totalLessonsInTopic) * 25) * 100) / 100;
                        this.topicProgress.listening = Math.round(((completedLessons.listening.size / this.totalLessonsInTopic) * 25) * 100) / 100;
                        this.topicProgress.speaking = Math.round(((completedLessons.speaking.size / this.totalLessonsInTopic) * 25) * 100) / 100;
                    }

                    // Calculate completely finished lessons (that have all 4 practices)
                    const allLessonIds = new Set<number>();
                    response.assessments.forEach((assessment: any) => {
                        if (assessment.lesson_id && assessment.score >= 0) {
                            allLessonIds.add(assessment.lesson_id);
                        }
                    });

                    // Count lessons that have all 4 practices completed
                    this.completedLessonsCount = 0;
                    allLessonIds.forEach(lessonId => {
                        const hasReading = completedLessons.reading.has(lessonId);
                        const hasWriting = completedLessons.writing.has(lessonId);
                        const hasListening = completedLessons.listening.has(lessonId);
                        const hasSpeaking = completedLessons.speaking.has(lessonId);

                        if (hasReading && hasWriting && hasListening && hasSpeaking) {
                            this.completedLessonsCount++;
                        }
                    });
                }
            },
            error: (error) => {
                console.log('❌ Error loading topic progress:', error);
                // No es crítico, el progreso se mantendrá en 0
            }
        });
    }

    openSection(idLesson: number): void {
        if (this.lessons.length > 0) {
            // Limpiar completamente el estado al cambiar de lección
            this.clearAllPracticeStates();

            this.currentLesson = this.lessons.find(lesson => lesson.id === idLesson) ? [this.lessons.find(lesson => lesson.id === idLesson)!] : [];

            // Cargar las prácticas de la nueva lección
            if (this.currentLesson[0]) {
                this.safeLessonContent = this.sanitizer.bypassSecurityTrustHtml(this.currentLesson[0].content || '');
                this.loadPractices(this.currentLesson[0]);
            }

            this.scrollToSection("lesson-content");
        }
        this.activeSection = idLesson;
    }

    loadPractices(practices: any): void {
        if (practices.is_speaking) {
            this.speechPracticeItems = practices.speaking
                .flatMap((text: any): SpeechPracticeItem[] => {
                    const content = text.english || text.content || text.phrase || '';
                    const definition = text.definition || '';
                    const pronunciation = text.pronunciation || '';

                    if (content.includes('_')) return [];

                    if (content.includes('/') && pronunciation.includes('/')) {
                        const englishParts = content.split('/').map((p: string) => p.trim());
                        const pronParts = pronunciation.split('/').map((p: string) => p.trim());

                        return englishParts.map((phrase: string, idx: number) => ({
                            english: phrase,
                            definition,
                            pronunciation: pronParts[idx] || '' // Empareja según índice
                        }));
                    }

                    // Si solo tiene "/" en english
                    if (content.includes('/')) {
                        return content.split('/').map((phrase: string) => ({
                            english: phrase.trim(),
                            definition,
                            pronunciation
                        }));
                    }

                    return [{
                        english: content.trim(),
                        definition: text.definition || '',
                        pronunciation: text.pronunciation || ''
                    }];
                })
                .filter((item: SpeechPracticeItem) => item.english.length > 0);
        }

        if (practices.is_listening) {
            this.listening = practices.listening
                .map((practice: any) => ({
                    audio: practice.audio || '',
                    options: practice.options || [],
                    answer: practice.answer || ''
                }));
        }

        if (practices.is_writing) {
            this.questions = practices.writing
                .map((practice: any) => ({
                    prefix: [practice.prefix || ''],
                    suffix: practice.suffix || '',
                    answer: practice.answer || '',
                    selected: '',
                    feedback: ''
                }));
        }

        // Cargar respuestas guardadas desde la base de datos
        this.loadSavedProgressFromDatabase();
    }

    reset() {
        this.userAnswers = {};
        this.feedback = {};

        // Reset writing questions
        this.questions.forEach(q => {
            q.selected = '';
            q.feedback = '';
        });

        // Resetear progreso de prácticas
        this.practiceProgress = {
            reading: 0,
            writing: 0,
            listening: 0,
            speaking: 0
        };

        // Limpiar estados guardados
        this.savedStates.reading.answers = {};
        this.savedStates.reading.feedback = {};
        this.savedStates.reading.saved = false;

        this.savedStates.writing.answers = [];
        this.savedStates.writing.saved = false;

        this.savedStates.listening.answers = {};
        this.savedStates.listening.feedback = {};
        this.savedStates.listening.saved = false;

        this.savedStates.speaking.saved = false;
    }

    clearAllPracticeStates(): void {
        // Limpiar completamente todos los estados de prácticas
        this.userAnswers = {};
        this.feedback = {};
        this.listeningAnswers = {};
        this.listeningFeedback = {};
        this.speakingRecognizedTexts = {};
        this.speakingCorrectness = {};

        // Limpiar arrays de prácticas
        this.speechPracticeItems = [];
        this.questions = [];
        this.listening = [];

        // Resetear progreso de prácticas
        this.practiceProgress = {
            reading: 0,
            writing: 0,
            listening: 0,
            speaking: 0
        };

        // Limpiar estados guardados completamente
        this.savedStates = {
            reading: {
                answers: {},
                feedback: {},
                saved: false
            },
            writing: {
                answers: [],
                saved: false
            },
            listening: {
                answers: {},
                feedback: {},
                saved: false
            },
            speaking: {
                practiceItems: [],
                saved: false
            }
        };

        // Resetear progreso de la lección
        this.lessonProgress = 0;
        this.loadingPractices = true;
    }

    saveReading(questions: any[]) {
        this.savePractice(questions, 'reading', 'Reading comprehension');
    }

    saveWriting(questions: any[]) {
        this.savePractice(questions, 'writing', 'Writing practice');
    }

    saveListening(questions: any[]) {
        this.savePractice(questions, 'listening', 'Listening comprehension');
    }

    saveSpeaking(practiceData: any[]) {
        this.savePractice(practiceData, 'speaking', 'Speaking practice');
    }

    private savePractice(practiceData: any[], type: 'reading' | 'writing' | 'listening' | 'speaking', activityName: string) {
        // 1. Calcular feedback y puntuación
        let correctAnswers = 0;
        const practiceAnswered: any[] = [];

        // Para reading (preguntas con opciones)
        if (type === 'reading') {
            practiceData.forEach((q, index) => {
                const userAnswer = this.userAnswers[index];
                const isCorrect = userAnswer === q.answer;

                if (isCorrect) {
                    this.feedback[index] = 'correct';
                    correctAnswers++;
                } else {
                    this.feedback[index] = 'wrong';
                }

                practiceAnswered.push({
                    question: q.question || `Question ${index + 1}`,
                    options: q.options || [],
                    userAnswer: userAnswer,
                    correctAnswer: q.answer,
                    isCorrect: isCorrect
                });
            });
        }

        // Para listening (preguntas con opciones de audio)
        else if (type === 'listening') {
            practiceData.forEach((q, index) => {
                const userAnswer = this.listeningAnswers[index];
                const isCorrect = userAnswer === q.answer;

                if (isCorrect) {
                    this.listeningFeedback[index] = 'correct';
                    correctAnswers++;
                } else {
                    this.listeningFeedback[index] = 'wrong';
                }

                practiceAnswered.push({
                    question: q.audio || `Audio ${index + 1}`,
                    options: q.options || [],
                    userAnswer: userAnswer,
                    correctAnswer: q.answer,
                    isCorrect: isCorrect
                });
            });
        }

        // Para writing (fill in the blanks)
        else if (type === 'writing') {
            practiceData.forEach((q, index) => {
                const userAnswer = q.selected || '';
                const isCorrect = userAnswer.toLowerCase().trim() === q.answer.toLowerCase().trim();

                if (isCorrect) {
                    correctAnswers++;
                }

                practiceAnswered.push({
                    prefix: q.prefix,
                    suffix: q.suffix,
                    userAnswer: userAnswer,
                    correctAnswer: q.answer,
                    isCorrect: isCorrect
                });
            });
        }

        // Para speaking (práctica de pronunciación)
        else if (type === 'speaking') {
            // Para speaking, contar respuestas correctas basadas en el reconocimiento
            correctAnswers = 0;
            practiceData.forEach((item, index) => {
                const userSaid = this.speakingRecognizedTexts[index] || '';
                const isCorrect = this.speakingCorrectness[index] || false;

                if (isCorrect) {
                    correctAnswers++;
                }

                practiceAnswered.push({
                    english: item.english,
                    definition: item.definition,
                    pronunciation: item.pronunciation,
                    userSaid: userSaid,
                    isCorrect: isCorrect,
                    practiced: true,
                    index: index
                });
            });
        }

        // 2. Calcular porcentaje de aciertos para esta práctica
        const accuracyPercent = practiceData.length > 0 ? (correctAnswers / practiceData.length) * 100 : 0;

        // 3. Calculate progress contribution based on total topic lessons
        // If there are 10 lessons, each complete lesson is worth 10%
        // If there are 20 lessons, each complete lesson is worth 5%
        const progressPerLesson = this.totalLessonsInTopic > 0 ? (100 / this.totalLessonsInTopic) : 0;

        // Para esta práctica, calcular qué porcentaje de la lección representa
        // Asumiendo que hay 4 tipos de prácticas por lección (reading, writing, listening, speaking)
        const practiceProgressPercent = practiceData.length > 0 ? (correctAnswers / practiceData.length) * (progressPerLesson / 4) : 0;

        // Redondear a 2 decimales para precisión
        const roundedProgress = Math.round(practiceProgressPercent * 100) / 100;

        // 4. Calcular el progreso total acumulado de todas las prácticas
        const totalProgressPercent = this.calculateTotalProgress(type, roundedProgress);

        // 5. Determinar si la lección estará completada después de guardar esta práctica
        // Verificar cuántas prácticas están completadas + la actual que se está guardando
        const practicesCompleted = [
            this.savedStates.reading.saved || type === 'reading',
            this.savedStates.writing.saved || type === 'writing',
            this.savedStates.listening.saved || type === 'listening',
            this.savedStates.speaking.saved || type === 'speaking'
        ];

        // La lección está completada si todas las 4 prácticas han sido contestadas (sin importar calificación)
        const isCompleted = practicesCompleted.every(completed => completed);

        // 6. Crear objeto IStudentProgress
        const studentProgress: IStudentProgress = {
            user_id: this.user.id,
            course_id: this.courseId,
            topic_id: this.topicId,
            lesson_id: this.currentLesson[0]?.id || 0,
            is_completed: isCompleted,
            progress_percent: totalProgressPercent
        };

        // 7. Crear objeto IAssessment - score es la contribución al progreso (0-25%), no porcentaje de aciertos
        const assessment: IAssessment = {
            user_id: this.user.id,
            student_progress_id: 0, // Se asignará en el backend
            type: type,
            practice_answered: practiceAnswered,
            score: roundedProgress, // Contribución al progreso total (0-25%)
            feedback: `${activityName} completed with ${correctAnswers}/${practiceData.length} correct answers (${accuracyPercent.toFixed(1)}% accuracy)`
        };

        // 8. Preparar payload completo para el servicio
        const progressData = {
            ...studentProgress,
            assessment: assessment
        };

        // 9. Guardar estado de respuestas antes de enviar al servidor
        this.saveAnswersState(type);

        // 8. Llamar al servicio para actualizar progreso
        this.studentService.updateStudentProgress(progressData).subscribe({
            next: (response) => {
                // Marcar como guardado exitosamente
                this.savedStates[type].saved = true;
                // Actualizar el progreso visual de la lección
                this.lessonProgress = totalProgressPercent;

                // Recargar el progreso del tópico para actualizar el cuadro "Your Progress"
                this.loadTopicProgress();

                // Si es writing practice, marcar el componente como completado para mostrar summary
                if (type === 'writing' && this.fillInBlankComponent) {
                    setTimeout(() => {
                        this.fillInBlankComponent.markAsCompleted();
                    }, 100); // Pequeño delay para asegurar que el estado se actualice
                }
            },
            error: (error) => {
                console.error(`❌ Error updating ${activityName} progress:`, error);
                // Revertir estado guardado si falla
                this.savedStates[type].saved = false;
            }
        });
    }

    allAnswered(questions: any[]): boolean {
        return questions.every((_, index) => !!this.userAnswers[index]);
    }

    allListeningAnswered(questions: any[]): boolean {
        return questions.every((_, index) => !!this.listeningAnswers[index]);
    }

    private saveAnswersState(type: 'reading' | 'writing' | 'listening' | 'speaking'): void {
        switch (type) {
            case 'reading':
                // Guardar respuestas del usuario y feedback para persistir al recargar
                this.savedStates.reading.answers = { ...this.userAnswers };
                this.savedStates.reading.feedback = { ...this.feedback };
                break;
            case 'listening':
                // Guardar respuestas de listening por separado
                this.savedStates.listening.answers = { ...this.listeningAnswers };
                this.savedStates.listening.feedback = { ...this.listeningFeedback };
                break;
            case 'writing':
                this.savedStates.writing.answers = this.questions.map(q => ({ ...q }));
                break;
            case 'speaking':
                // Guardar las frases practicadas y las respuestas reales del usuario
                this.savedStates.speaking.practiceItems = [...this.speechPracticeItems];
                break;
        }
    }

    private calculateTotalProgress(currentType: 'reading' | 'writing' | 'listening' | 'speaking', currentProgress: number): number {
        // Actualizar el progreso de la práctica actual
        this.practiceProgress[currentType] = currentProgress;

        // Calculate total progress for this lesson (sum of 4 practices)
        const totalLessonProgress = this.practiceProgress.reading +
            this.practiceProgress.writing +
            this.practiceProgress.listening +
            this.practiceProgress.speaking;

        // Maximum progress per lesson is based on total topic lessons
        const maxProgressPerLesson = this.totalLessonsInTopic > 0 ? (100 / this.totalLessonsInTopic) : 25;

        // Ensure it doesn't exceed the maximum per lesson
        return Math.min(totalLessonProgress, maxProgressPerLesson);
    }

    private updateLessonProgressFromSavedStates(): void {
        // Calculate progress based on actual stored scores
        const totalLessonProgress = this.practiceProgress.reading +
            this.practiceProgress.writing +
            this.practiceProgress.listening +
            this.practiceProgress.speaking;

        // Maximum progress per lesson is based on total topic lessons
        const maxProgressPerLesson = this.totalLessonsInTopic > 0 ? (100 / this.totalLessonsInTopic) : 25;

        // Update visual progress (should not exceed maximum per lesson)
        this.lessonProgress = Math.min(totalLessonProgress, maxProgressPerLesson);
        this.loadingPractices = false;
    }


    scrollToSection(sectionId: string): void {
        const outer = document.getElementById("topics-content");
        const inner = document.querySelector<HTMLDivElement>("#lesson-content .lesson-content");
        const target = document.getElementById(sectionId);

        if (outer && inner && target) {
            // Asegura que el contenedor se ve en la ventana
            outer.scrollIntoView({ behavior: "smooth", block: "start" });

            // Espera un poquito y mueve el scroll interno
            setTimeout(() => {
                inner.scrollTo({
                    top: target.offsetTop - inner.offsetTop,
                    behavior: "smooth"
                });
            }, 300);
        }
    }

    private loadSavedProgressFromDatabase(): void {
        if (!this.currentLesson[0]?.id || !this.user?.id) {
            this.loadingPractices = false;
            return;
        }
        this.studentService.getLessonProgress(this.user.id, this.currentLesson[0].id).subscribe({
            next: (response) => {
                if (response && response.progress && response.assessments) {
                    // Resetear progreso antes de restaurar
                    this.practiceProgress = {
                        reading: 0,
                        writing: 0,
                        listening: 0,
                        speaking: 0
                    };

                    // Restaurar estados guardados desde la base de datos
                    response.assessments.forEach((assessment: any) => {
                        this.restoreAssessmentState(assessment);
                    });

                    // Actualizar el progreso visual de la lección después de restaurar todos los estados
                    this.updateLessonProgressFromSavedStates();
                } else {
                    this.loadingPractices = false;
                }
            },
            error: (error) => {
                console.log('🚫 No previous progress found or error loading:', error);
                // No es un error crítico, simplemente no hay progreso previo
                // Asegurar que se finalice la carga de prácticas
                this.loadingPractices = false;
            }
        });
    }

    private restoreAssessmentState(assessment: any): void {
        const type = assessment.type as 'reading' | 'writing' | 'listening' | 'speaking';

        // Marcar como guardado
        this.savedStates[type].saved = true;

        // El campo 'score' en la BD representa la contribución al progreso basada en el total de lecciones
        // Por ejemplo: si hay 10 lecciones, cada práctica completa vale (100/10)/4 = 2.5%
        let practiceProgress = 0;
        if (assessment.score !== undefined && assessment.score !== null) {
            practiceProgress = Math.round(assessment.score * 100) / 100; // Mantener precisión decimal
        }

        // Restaurar el progreso de esta práctica
        this.practiceProgress[type] = practiceProgress;

        switch (type) {
            case 'reading':
                // Restaurar respuestas del usuario y feedback para reading
                if (assessment.practice_answered && Array.isArray(assessment.practice_answered)) {
                    assessment.practice_answered.forEach((item: any, index: number) => {
                        if (item.userAnswer) {
                            this.userAnswers[index] = item.userAnswer;
                            this.feedback[index] = item.isCorrect ? 'correct' : 'wrong';
                        }
                    });

                    // Guardar en estados
                    this.savedStates.reading.answers = { ...this.userAnswers };
                    this.savedStates.reading.feedback = { ...this.feedback };
                }
                break;

            case 'listening':
                // Restaurar respuestas del usuario y feedback para listening
                if (assessment.practice_answered && Array.isArray(assessment.practice_answered)) {
                    assessment.practice_answered.forEach((item: any, index: number) => {
                        if (item.userAnswer) {
                            this.listeningAnswers[index] = item.userAnswer;
                            this.listeningFeedback[index] = item.isCorrect ? 'correct' : 'wrong';
                        }
                    });

                    // Guardar en estados
                    this.savedStates.listening.answers = { ...this.listeningAnswers };
                    this.savedStates.listening.feedback = { ...this.listeningFeedback };
                }
                break;

            case 'writing':
                // Restaurar respuestas de fill in the blanks
                if (assessment.practice_answered && Array.isArray(assessment.practice_answered)) {
                    assessment.practice_answered.forEach((item: any, index: number) => {
                        if (this.questions[index] && item.userAnswer) {
                            this.questions[index].selected = item.userAnswer;
                            this.questions[index].feedback = item.isCorrect ? 'correct' : 'wrong';
                        }
                    });

                    // Guardar en estados
                    this.savedStates.writing.answers = this.questions.map(q => ({ ...q }));
                }
                break;

            case 'speaking':
                // Restaurar frases practicadas y respuestas desde la base de datos
                if (assessment.practice_answered && Array.isArray(assessment.practice_answered)) {
                    const restoredPracticeItems: SpeechPracticeItem[] = assessment.practice_answered.map((item: any) => ({
                        english: item.english || '',
                        definition: item.definition || '',
                        pronunciation: item.pronunciation || ''
                    }));

                    // Restaurar también las respuestas del usuario
                    assessment.practice_answered.forEach((item: any, index: number) => {
                        if (item.userSaid) {
                            this.speakingRecognizedTexts[index] = item.userSaid;
                            this.speakingCorrectness[index] = item.isCorrect || false;
                        }
                    });

                    // Guardar en estados
                    this.savedStates.speaking.practiceItems = restoredPracticeItems;
                }
                break;
        }
    }

    // Método para verificar si todas las prácticas están completadas
    isLessonCompleted(): boolean {
        return this.savedStates.reading.saved &&
            this.savedStates.writing.saved &&
            this.savedStates.listening.saved &&
            this.savedStates.speaking.saved;
    }

    // Método para manejar respuestas del listening quiz
    onListeningAnswerSelected(event: { index: number, answer: string }): void {
        this.listeningAnswers[event.index] = event.answer;

        // Calcular si es correcto y guardar feedback
        if (this.listening[event.index]) {
            const isCorrect = event.answer === this.listening[event.index].answer;
            this.listeningFeedback[event.index] = isCorrect ? 'correct' : 'wrong';
        }
    }

    // Método para manejar actualizaciones del speaking practice
    onSpeakingPracticeUpdate(event: { index: number, result: any }): void {
        // Guardar la respuesta reconocida y si fue correcta
        this.speakingRecognizedTexts[event.index] = event.result.userSaid;
        this.speakingCorrectness[event.index] = event.result.isCorrect;
    }

    // Métodos de validación para habilitar/deshabilitar botones de guardado
    isSpeakingPracticeComplete(): boolean {
        if (!this.speechPracticeItems || this.speechPracticeItems.length === 0) {
            return false;
        }

        // Si ya está guardado, está completo
        if (this.savedStates.speaking.saved) {
            return true;
        }

        // Verificar que todas las frases tengan respuesta reconocida
        for (let i = 0; i < this.speechPracticeItems.length; i++) {
            const recognizedText = this.speakingRecognizedTexts[i];
            if (!recognizedText || recognizedText.trim() === '') {
                return false;
            }
        }
        return true;
    }

    isWritingPracticeComplete(): boolean {
        if (!this.questions || this.questions.length === 0) {
            return false;
        }

        // Si ya está guardado, está completo
        if (this.savedStates.writing.saved) {
            return true;
        }

        // Verificar que todas las preguntas tengan respuesta seleccionada
        for (let i = 0; i < this.questions.length; i++) {
            if (!this.questions[i].selected || this.questions[i].selected.trim() === '') {
                return false;
            }
        }
        return true;
    }

    getTopicOverallProgress(): number {
        // El progreso total se calcula como: (lecciones completamente terminadas / total lecciones) × 100%
        // Una lección está "completamente terminada" cuando tiene las 4 prácticas completadas
        if (this.totalLessonsInTopic === 0) return 0;

        // Esto se calculará desde el backend cuando tengamos los datos correctos
        // Por ahora, usar una estimación simple basada en lecciones con algún progreso
        return Math.round((this.getCompletedLessonsCount() / this.totalLessonsInTopic) * 100 * 100) / 100;
    }
    /**
     * Returns CSS classes for the topic progress bar based on progress percentage.
     */
    getProgressBarClass(progress: number): string {
        if (progress >= 80) {
            return 'progress-bar bg-success';
        } else if (progress >= 50) {
            return 'progress-bar bg-warning';
        } else if (progress > 0) {
            return 'progress-bar bg-danger';
        }
        return 'progress-bar bg-secondary';
    }

    private getCompletedLessonsCount(): number {
        // Retornar el conteo de lecciones completamente terminadas (con las 4 prácticas)
        return this.completedLessonsCount;
    }
}