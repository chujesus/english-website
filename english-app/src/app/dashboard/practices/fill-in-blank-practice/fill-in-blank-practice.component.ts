import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PracticeService } from '../../../core/services/practice.service';

interface IFillInBlank {
  prefix: string[];
  suffix: string;
  answer: string;
  selected: string;
  feedback: string;
}

@Component({
  standalone: true,
  selector: 'app-fill-in-blank-practice',
  imports: [CommonModule, FormsModule],
  templateUrl: './fill-in-blank-practice.component.html',
  styleUrl: './fill-in-blank-practice.component.scss'
})
export class FillInBlankPracticeComponent implements OnInit {
  @Input() questions: IFillInBlank[] = [];
  @Input() topicId: number = 0;
  @Input() sectionIndex: number = 0;
  @Input() canAttempt: boolean = true;
  @Output() practiceCompleted = new EventEmitter<any>();

  practiceStartTime: number = 0;
  isCompleted: boolean = false;
  score: number = 0;

  constructor(private practiceService: PracticeService) { }

  ngOnInit(): void {
    this.practiceStartTime = Date.now();
    this.checkIfCanAttempt();
  }

  checkIfCanAttempt(): void {
    if (this.topicId) {
      this.practiceService.canAttemptPractice(this.topicId, 'fill_in_blank', this.sectionIndex).subscribe({
        next: (response: any) => {
          if (response.ok) {
            this.canAttempt = response.data.can_attempt;
          }
        },
        error: (error) => {
          console.error('Error checking practice attempt:', error);
        }
      });
    }
  }

  checkAnswers() {
    let correctAnswers = 0;

    this.questions.forEach(q => {
      const correct = q.answer.trim().toLowerCase();
      const selected = (q.selected || '').trim().toLowerCase();
      const isCorrect = selected === correct;
      q.feedback = isCorrect ? 'correct' : `wrong|${q.answer}`;
      if (isCorrect) correctAnswers++;
    });

    this.score = this.questions.length > 0 ? (correctAnswers / this.questions.length) * 100 : 0;
    this.isCompleted = true;

    // Submit practice if topic ID is provided and practice is allowed
    if (this.topicId && this.canAttempt) {
      this.submitPractice(correctAnswers);
    }
  }

  private submitPractice(correctAnswers: number): void {
    const timeSpent = Math.floor((Date.now() - this.practiceStartTime) / 1000);

    const practiceData = {
      topic_id: this.topicId,
      practice_type: 'fill_in_blank' as const,
      section_index: this.sectionIndex,
      total_questions: this.questions.length,
      correct_answers: correctAnswers,
      time_spent: timeSpent,
      answers: this.questions.map(q => ({
        question: q.prefix.join(' ') + ' _____ ' + q.suffix,
        correct_answer: q.answer,
        user_answer: q.selected,
        is_correct: q.feedback === 'correct'
      }))
    };

    this.practiceService.submitPracticeAttempt(practiceData).subscribe({
      next: (response: any) => {
        if (response.ok) {
          this.practiceCompleted.emit({
            score: response.data.score,
            passed: response.data.passed,
            practiceType: 'fill_in_blank'
          });
        }
      },
      error: (error) => {
        console.error('Error submitting practice:', error);
      }
    });
  }

  clearAll() {
    this.questions.forEach(q => {
      q.selected = '';
      q.feedback = '';
    });
    this.isCompleted = false;
    this.score = 0;
  }

  reset() {
    this.questions.forEach(q => {
      q.selected = '';
      q.feedback = '';
    });
    this.isCompleted = false;
    this.score = 0;
    this.practiceStartTime = Date.now();
  }

  hasAnswers(): boolean {
    return this.questions.some(q => q.selected && q.selected.trim() !== '');
  }

  getScorePercentage(): number {
    if (this.questions.length === 0) return 0;
    return Math.round((this.getCorrectCount() / this.questions.length) * 100);
  }

  getCorrectCount(): number {
    return this.questions.filter(q => q.feedback === 'correct').length;
  }

  getIncorrectCount(): number {
    return this.questions.filter(q => q.feedback && q.feedback !== 'correct').length;
  }
}
