import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Modal } from 'bootstrap';
import { SpeechPracticeComponent } from '../practices/speech-practice/speech-practice.component';
import { FillInBlankPracticeComponent } from '../practices/fill-in-blank-practice/fill-in-blank-practice.component';
import { SpeechQuizComponent } from '../practices/speech-quiz/speech-quiz.component';
import { ContentService } from '../../core/services/content.service';
import { ProgressService } from '../../core/services/progress.service';
import { ILessonContent, LessonSection } from '../../shared/interfaces';

// Legacy interfaces for backward compatibility with existing modal components
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
  standalone: true,
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

  // Component properties
  topicId: number | null = null;
  lessonIndex: number | null = null;
  courseTitle: string = "";
  cefrLevel: string = "";
  loading = true;
  error = '';

  // Lesson data
  selectedLesson: any;
  currentStep = 0;

  // Practice data (legacy format for modals)
  speechPracticeItems: string[] = [];
  questions: IFillInBlank[] = [];
  listening: IListening[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contentService: ContentService,
    private progressService: ProgressService
  ) { }

  ngOnInit(): void {
    console.log('🔍 LessonsComponent: Initializing');

    this.route.queryParams.subscribe(params => {
      this.topicId = +params['topicId'] || null;
      this.lessonIndex = +params['lessonIndex'] || null;
      this.courseTitle = params['title'] || '';
      this.cefrLevel = params['cefrLevel'] || '';

      console.log('📋 Lesson params:', {
        topicId: this.topicId,
        lessonIndex: this.lessonIndex,
        title: this.courseTitle,
        cefrLevel: this.cefrLevel
      });

      if (this.topicId !== null && this.lessonIndex !== null) {
        this.loadLessonContent();
      } else {
        this.error = 'Missing required parameters: topicId and lessonIndex';
        this.loading = false;
      }
    });
  }

  loadLessonContent(): void {
    if (this.topicId === null || this.lessonIndex === null) return;

    console.log('📚 Loading lesson content...');
    this.loading = true;
    this.error = '';

    this.contentService.getLessonContent(this.topicId, this.lessonIndex).subscribe({
      next: (lessonData) => {
        console.log('✅ Lesson content loaded:', lessonData);

        if (lessonData && lessonData.length > 0) {
          // Assuming the API returns lesson content in the expected format
          this.selectedLesson = lessonData[0] as ILessonContent;
          this.loading = false;

          // Update progress - mark lesson as viewed
          this.updateLessonProgress();
        } else {
          this.error = 'No lesson content found';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('❌ Error loading lesson content:', error);

        if (error.status === 404) {
          this.error = 'Lesson not found';
        } else if (error.status === 401) {
          this.error = 'Authentication required. Please log in again.';
        } else {
          this.error = 'Error loading lesson content. Please try again.';
        }

        this.loading = false;
      }
    });
  }

  updateLessonProgress(): void {
    if (this.topicId === null) return;

    // Update topic progress when lesson is viewed
    this.progressService.updateTopicProgress(this.topicId, 'in_progress').subscribe({
      next: (response) => {
        console.log('✅ Progress updated');
      },
      error: (error) => {
        console.error('❌ Error updating progress:', error);
      }
    });
  }

  goToStep(index: number): void {
    this.currentStep = index;
  }

  openSpeechPractice(section: LessonSection): void {
    console.log('🎤 Opening speech practice for section:', section.title);

    // Extract speech practice items from the lesson section
    this.speechPracticeItems = [];

    if (section.content && Array.isArray(section.content)) {
      this.speechPracticeItems = section.content
        .flatMap((text: any) => {
          const content = text.english || text.content || text.phrase || '';

          if (content.includes('_')) return [];

          if (content.includes('/')) {
            return content.split('/').map((phrase: string) => phrase.trim());
          }

          return [content.trim()];
        })
        .filter((item: string) => item.length > 0);
    }

    console.log('🎤 Speech practice items:', this.speechPracticeItems);

    this.modalSpeechInstance = new Modal(this.modalSpeechElement.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalSpeechInstance.show();
  }

  openFillInBlankPractice(section: LessonSection): void {
    console.log('📝 Opening fill-in-blank practice for section:', section.title);

    // Convert new format to legacy format for the modal
    this.questions = [];

    if (section.content && Array.isArray(section.content)) {
      this.questions = section.content
        .filter((practice: any) => practice.type === 'fill_in_blank' || practice.question)
        .map((practice: any) => ({
          prefix: [practice.question || practice.prefix || ''],
          suffix: practice.suffix || '',
          answer: practice.correct_answer || practice.answer || '',
          selected: '',
          feedback: ''
        }));
    }

    console.log('📝 Fill-in-blank questions:', this.questions);

    this.modalfillInBlankInstance = new Modal(this.modalfillInBlankElement.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalfillInBlankInstance.show();
  }

  openSpeechQuizPractice(section: LessonSection): void {
    console.log('🎧 Opening speech quiz practice for section:', section.title);

    // Convert new format to legacy format for the modal
    this.listening = [];

    if (section.content && Array.isArray(section.content)) {
      this.listening = section.content
        .filter((practice: any) => practice.type === 'listening' || practice.audio)
        .map((practice: any) => ({
          audio: practice.audio_url || practice.audio || '',
          options: practice.options || [],
          answer: practice.correct_answer || practice.answer || ''
        }));
    }

    console.log('🎧 Listening exercises:', this.listening);

    this.modalspeechQuizInstance = new Modal(this.modalspeechQuizElement.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalspeechQuizInstance.show();
  }

  confirm(): void {
    if (this.modalSpeechInstance) {
      this.modalSpeechInstance.hide();
    }
  }

  // Navigation methods
  goBack(): void {
    this.router.navigate(['/dashboard/courses'], {
      queryParams: {
        returnTo: 'lessons',
        topicId: this.topicId
      }
    });
  }

  goToNextLesson(): void {
    if (this.topicId !== null && this.lessonIndex !== null) {
      const nextIndex = this.lessonIndex + 1;
      this.router.navigate(['/dashboard/lessons'], {
        queryParams: {
          topicId: this.topicId,
          lessonIndex: nextIndex,
          title: this.courseTitle,
          cefrLevel: this.cefrLevel
        }
      });
    }
  }

  goToPreviousLesson(): void {
    if (this.topicId !== null && this.lessonIndex !== null && this.lessonIndex > 0) {
      const prevIndex = this.lessonIndex - 1;
      this.router.navigate(['/dashboard/lessons'], {
        queryParams: {
          topicId: this.topicId,
          lessonIndex: prevIndex,
          title: this.courseTitle,
          cefrLevel: this.cefrLevel
        }
      });
    }
  }
}
