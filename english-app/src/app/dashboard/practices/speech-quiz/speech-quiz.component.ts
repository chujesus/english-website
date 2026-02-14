import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

interface IListening {
  audio: string;
  options: string[];
  answer: string;
}

@Component({
  standalone: true,
  selector: 'app-speech-quiz',
  imports: [CommonModule],
  templateUrl: './speech-quiz.component.html',
  styleUrl: './speech-quiz.component.scss'
})
export class SpeechQuizComponent implements OnInit {
  @Input() listening: IListening[] = [];
  @Input() savedAnswers: { [key: number]: string | null } = {}; // Respuestas guardadas
  @Input() savedFeedback: { [key: number]: string | null } = {}; // Feedback guardado
  @Input() isCompleted: boolean = false; // Si el quiz está completado

  @Output() answerSelected = new EventEmitter<{ index: number, answer: string }>();

  currentQuestionIndex = 0;
  selectedAnswer: string | null = null;
  isCorrect: boolean | null = null;
  showSummary = false;

  summaryResults: { correct: boolean }[] = [];

  ngOnInit(): void {
    // Si el quiz está completado, restaurar el estado guardado
    if (this.isCompleted && Object.keys(this.savedAnswers).length > 0) {
      this.restoreCompletedState();
    } else {
      this.resetState();
    }
  }

  playAudio() {
    const utterance = new SpeechSynthesisUtterance(this.listening[this.currentQuestionIndex].audio);
    utterance.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  selectAnswer(option: string) {
    this.selectedAnswer = option;
    this.isCorrect = option === this.listening[this.currentQuestionIndex].answer;

    // Emitir la respuesta seleccionada al componente padre
    this.answerSelected.emit({
      index: this.currentQuestionIndex,
      answer: option
    });
  }

  nextOrFinish() {
    const correct = this.isCorrect === true;
    this.summaryResults.push({ correct });

    if (this.currentQuestionIndex < this.listening.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
      this.isCorrect = null;
    } else {
      this.showSummary = true;
    }
  }

  resetQuiz() {
    this.resetState();
  }

  getCorrectCount(): number {
    return this.summaryResults.filter(result => result.correct).length;
  }

  getAccuracyPercentage(): number {
    if (this.summaryResults.length === 0) return 0;
    return Math.round((this.getCorrectCount() / this.summaryResults.length) * 100);
  }

  resetState() {
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.isCorrect = null;
    this.showSummary = false;
    this.summaryResults = [];
  }

  restoreCompletedState() {
    // Restaurar resultados desde las respuestas guardadas
    this.summaryResults = [];

    for (let i = 0; i < this.listening.length; i++) {
      const userAnswer = this.savedAnswers[i];
      const correctAnswer = this.listening[i].answer;
      const isCorrect = userAnswer === correctAnswer;

      this.summaryResults.push({ correct: isCorrect });

      // Emitir cada respuesta guardada al componente padre para sincronizar
      if (userAnswer) {
        this.answerSelected.emit({
          index: i,
          answer: userAnswer
        });
      }
    }

    // Mostrar el resumen directamente
    this.showSummary = true;
    this.currentQuestionIndex = this.listening.length - 1; // Último índice
  }
}
