import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SpeechPracticeComponent } from '../practices/speech-practice/speech-practice.component';
import { SpeechQuizComponent } from '../practices/speech-quiz/speech-quiz.component';
import { FillInBlankPracticeComponent } from '../practices/fill-in-blank-practice/fill-in-blank-practice.component';
import { TopicsService } from '../../core/services/topics.service';
import { IFillInBlank, ILesson, IListening, ITopic, SpeechPracticeItem } from '../../shared/interfaces/models';
import { LessonsService } from '../../core/services/lessons.service';

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
    userAnswers: { [key: number]: string | null } = {};
    feedback: { [key: number]: string | null } = {};
    speechPracticeItems: SpeechPracticeItem[] = [];
    questions: IFillInBlank[] = [];
    listening: IListening[] = [];

    constructor(private route: ActivatedRoute, private topicsService: TopicsService, private lessonsService: LessonsService) { }

    ngOnInit(): void {
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
                if (this.lessons.length > 1) {
                    this.currentLesson = [lessons[0]];
                    this.loadPractices(this.currentLesson[0]);
                }
                this.activeSection = this.currentLesson[0]?.id || 0;
                this.loading = false;
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

    openSection(idLesson: number): void {
        if (this.lessons.length > 1) {
            this.currentLesson = this.lessons.find(lesson => lesson.id === idLesson) ? [this.lessons.find(lesson => lesson.id === idLesson)!] : [];
            this.loadPractices(this.currentLesson[0]);
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
    }

    reset() {
        this.userAnswers = {};
        this.feedback = {};
    }

    checkAnswers(questions: any[]) {
        questions.forEach((q, index) => {
            if (this.userAnswers[index] === q.answer) {
                this.feedback[index] = 'correct';
            } else {
                this.feedback[index] = 'wrong';
            }
        });
    }

    allAnswered(questions: any[]): boolean {
        return questions.every((_, index) => !!this.userAnswers[index]);
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

    getSectionIcon(type: string): string {
        switch (type) {
            case 'vocabulary': return 'fa-book';
            case 'grammar': return 'fa-language';
            case 'reading': return 'fa-book-open';
            case 'listening': return 'fa-headphones';
            case 'speaking': return 'fa-microphone';
            case 'practice': return 'fa-pen';
            default: return 'fa-file-text';
        }
    }

    markLessonComplete(): void {
        // Mock completion for now
        this.lessonProgress = 100;
    }
}