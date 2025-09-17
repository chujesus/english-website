import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

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

  currentQuestionIndex = 0;
  selectedAnswer: string | null = null;
  isCorrect: boolean | null = null;
  showSummary = false;

  summaryResults: { correct: boolean }[] = [];

  ngOnInit(): void {
    this.resetState();
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

  private resetState() {
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.isCorrect = null;
    this.showSummary = false;
    this.summaryResults = [];
  }
}
