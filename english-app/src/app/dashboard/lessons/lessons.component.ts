import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Modal } from 'bootstrap';
import { SpeechPracticeComponent } from '../practices/speech-practice/speech-practice.component';
import { FillInBlankPracticeComponent } from '../practices/fill-in-blank-practice/fill-in-blank-practice.component';
import { SpeechQuizComponent } from '../practices/speech-quiz/speech-quiz.component';
import { HttpClient } from '@angular/common/http';

interface ILessons {
  cefrLevel: string;
  lessonId: number;
  sections: ISection[];
}

interface ISection {
  title: string;
  isSpeaking: boolean;
  isListen: boolean;
  isFillInBlank: boolean;
  items: IItem[];
  fillInBlank?: IFillInBlank[];
  listening?: IListening[];
}

interface IItem {
  english: string;
  spanish: string;
}

interface IFillInBlank {
  prefix: string[];
  suffix: string;
  answer: string;
  selected: string;
  feedback: string;
}

interface IListening {
  audio: string;
  options: string[];
  answer: string;
}

@Component({
  selector: 'app-lessons',
  imports: [CommonModule, SpeechPracticeComponent, FillInBlankPracticeComponent, SpeechQuizComponent],
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.scss'
})
export class LessonsComponent implements OnInit {
  @ViewChild('speechModal') modalSpeechElement!: ElementRef;
  @ViewChild('fillInBlank') modalfillInBlankElement!: ElementRef;
  @ViewChild('speechQuiz') modalspeechQuizElement!: ElementRef;
  private modalSpeechInstance!: Modal;
  private modalfillInBlankInstance!: Modal;
  private modalspeechQuizInstance!: Modal;
  courseId: number | null = null;
  courseTitle: string = "";
  cefrLevel: string = "";
  speechPracticeItems: string[] = [];
  questions: IFillInBlank[] = [];
  listening: IListening[] = [];
  selectedLesson: ILessons | null = null;
  currentStep = 0;

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.courseId = +params['id'];
      this.courseTitle = params['title'];
      this.cefrLevel = params['cefrLevel'];
      const fileName = `english_${this.cefrLevel.toLowerCase()}_${this.courseId}.json`;
      const filePath = `assets/lessons-files/english-${this.cefrLevel.toLowerCase()}/${fileName}`;
      this.http.get<ILessons[]>(filePath).subscribe({
        next: (data) => {
          this.selectedLesson = data.find(lesson => lesson.cefrLevel.toLowerCase() === this.cefrLevel.toLowerCase() && lesson.lessonId === this.courseId) || null;
        },
        error: (error) => {
          console.error(`No se pudo cargar el archivo: ${filePath}`, error);
        }
      });
    });
  }

  goToStep(index: number): void {
    this.currentStep = index;
  }

  openSpeechPractice(items: IItem[]): void {
    this.speechPracticeItems = items
      .flatMap(item => {
        const english = item.english;

        if (english.includes('_')) return [];

        if (english.includes('/')) {
          return english.split('/').map(phrase => phrase.trim());
        }

        return [english.trim()];
      });
    this.modalSpeechInstance = new Modal(this.modalSpeechElement.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalSpeechInstance.show();
  }

  confirm() {
    this.modalSpeechInstance.hide();
  }

  openFillInBlankPractice(items: IFillInBlank[]): void {
    this.questions = items.map(q => ({ ...q, selected: '', feedback: '' }));
    this.modalfillInBlankInstance = new Modal(this.modalfillInBlankElement.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalfillInBlankInstance.show();
  }

  openSpeechQuizPractice(listening: IListening[]): void {
    this.listening = listening.map(q => ({ ...q }));
    this.modalspeechQuizInstance = new Modal(this.modalspeechQuizElement.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalspeechQuizInstance.show();
  }
}
