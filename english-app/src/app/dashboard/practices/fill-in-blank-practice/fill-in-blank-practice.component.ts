import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { StudentService } from '../../../core/services/student.service';

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
  @Input() savedAnswers: IFillInBlank[] = []; // Respuestas guardadas
  @Input() isWritingCompleted: boolean = false; // Si está completado
  @Output() practiceCompleted = new EventEmitter<any>();

  practiceStartTime: number = 0;
  isCompleted: boolean = false;
  score: number = 0;

  constructor(private courseService: CourseService, private studentService: StudentService) { }

  ngOnInit(): void {
    this.practiceStartTime = Date.now();
    this.checkAndRestoreState();
  }

  checkAndRestoreState(): void {
    // Restaurar estado si está completado
    if (this.isWritingCompleted || (this.savedAnswers && this.savedAnswers.length > 0)) {
      this.restoreCompletedState();
    }
  }

  // Método público para marcar la práctica como completada desde el exterior
  markAsCompleted(): void {
    this.checkAnswers();
  }

  restoreCompletedState(): void {
    // Restaurar respuestas guardadas
    if (this.savedAnswers.length > 0) {
      this.savedAnswers.forEach((savedQ, index) => {
        if (this.questions[index]) {
          this.questions[index].selected = savedQ.selected;
          this.questions[index].feedback = savedQ.feedback;
        }
      });
    }

    // Si está marcado como completado, mostrar resultados
    if (this.isWritingCompleted) {
      this.isCompleted = true;
      // Calcular score basado en las respuestas restauradas
      const correctCount = this.questions.filter(q => q.feedback === 'correct').length;
      this.score = this.questions.length > 0 ? (correctCount / this.questions.length) * 100 : 0;
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

  submitPractice(correctAnswers: number): void {
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
