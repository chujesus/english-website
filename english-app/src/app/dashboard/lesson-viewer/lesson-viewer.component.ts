import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IFillInBlank, ILessonContent, IListening, SpeechPracticeItem, Topic } from '../../shared/interfaces/content';
import moduleTopicsA1 from '../courses/english_a1_topics.json';
import moduleTopicsA2 from '../courses/english_a2_topics.json';
import moduleTopicsB1 from '../courses/english_b1_topics.json';
import moduleTopicsB2 from '../courses/english_b2_topics.json';
import { FormsModule } from '@angular/forms';
import { SpeechPracticeComponent } from '../practices/speech-practice/speech-practice.component';
import { SpeechQuizComponent } from '../practices/speech-quiz/speech-quiz.component';
import { FillInBlankPracticeComponent } from '../practices/fill-in-blank-practice/fill-in-blank-practice.component';

@Component({
    selector: 'app-lesson-viewer',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, SpeechPracticeComponent, SpeechQuizComponent, FillInBlankPracticeComponent],
    templateUrl: './lesson-viewer.component.html',
    styleUrl: './lesson-viewer.component.scss'
})
export class LessonViewerComponent implements OnInit {
    courseId: number = 0;
    currentTopicIndex: number = 0;
    activeSection = 0;
    lessonProgress = 0;
    height: number = 0;
    screenHeight: number = 0;
    courseTitle: string = "";
    cefrLevel: string = "";
    error: string = "";
    currentLesson: ILessonContent = { lessonId: 0, cefrLevel: '', sections: [] };
    lessons: ILessonContent = { lessonId: 0, cefrLevel: '', sections: [] };
    topics: Topic | null = null;
    loading = false;
    userAnswers: { [key: number]: string | null } = {};
    feedback: { [key: number]: string | null } = {};
    speechPracticeItems: SpeechPracticeItem[] = [];
    questions: IFillInBlank[] = [];
    listening: IListening[] = [];

    constructor(private route: ActivatedRoute, private http: HttpClient) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.courseId = +params['courseId'];
            this.courseTitle = params['courseTitle'];
            this.currentTopicIndex = +params['topicIndex'];
            this.cefrLevel = params['cefrLevel'];
            // Load topics based on module ID
            if (this.courseId === 1) {
                this.topics = moduleTopicsA1[0];
            } else if (this.courseId === 2) {
                this.topics = moduleTopicsA2[0];
            } else if (this.courseId === 3) {
                this.topics = moduleTopicsB1[0];
            } else if (this.courseId === 4) {
                this.topics = moduleTopicsB2[0];
            }
            this.loadLessonContent();
            this.loadProgress();
        });
    }

    loadLessonContent(): void {
        this.loading = true;
        this.error = '';

        const fileName = `english_${this.cefrLevel.toLowerCase()}_${this.currentTopicIndex}.json`;
        const lessonPath = `assets/lessons-files/english-${this.cefrLevel.toLowerCase()}/${fileName}`;

        this.http.get<ILessonContent[]>(lessonPath).subscribe({
            next: (content) => {
                this.lessons = content.find(lesson => lesson.cefrLevel.toLowerCase() === this.cefrLevel.toLowerCase()
                    && lesson.lessonId === this.currentTopicIndex) || { lessonId: 0, cefrLevel: '', sections: [] };
                if (this.lessons.sections.length > 1) {
                    this.currentLesson = {
                        ...this.lessons,
                        sections: this.lessons.sections.length > 0 ? [this.lessons.sections[0]] : []
                    };
                    this.loadPractices(this.currentLesson.sections[0]);
                }

                this.activeSection = 0;
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
            }
        });
    }

    openSection(index: number): void {
        if (this.lessons.sections.length > 1) {
            this.currentLesson = {
                ...this.lessons,
                sections: this.lessons.sections.length > 0 ? [this.lessons.sections[index]] : []
            };
            this.loadPractices(this.lessons.sections[index]);
            this.scrollToSection();
        }
        this.activeSection = index;
    }

    loadPractices(practices: any): void {
        if (practices.isSpeaking) {
            this.speechPracticeItems = practices.speaking
                .flatMap((text: any): SpeechPracticeItem[] => {
                    const content = text.english || text.content || text.phrase || '';

                    if (content.includes('_')) return [];

                    if (content.includes('/')) {
                        return content.split('/').map((phrase: string) => ({
                            english: phrase.trim(),
                            definition: text.definition || '',
                            pronunciation: text.pronunciation || ''
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

        if (practices.isListening) {
            this.listening = practices.listening
                .map((practice: any) => ({
                    audio: practice.audio || '',
                    options: practice.options || [],
                    answer: practice.answer || ''
                }));
        }

        if (practices.isFillInBlank) {
            this.questions = practices.fillInBlank
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

    loadProgress(): void {
        // Mock progress loading for now
        this.lessonProgress = Math.floor(Math.random() * 100);
    }

    scrollToSection(): void {
        const element = document.getElementById("lesson-content");
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
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

    startPractice(practiceType: string, sectionIndex: number): void {

    }
}