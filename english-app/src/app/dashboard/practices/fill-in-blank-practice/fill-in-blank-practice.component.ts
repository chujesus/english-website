import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Carousel } from 'bootstrap';

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
  @ViewChild('carousel') carousel!: ElementRef;

  ngOnInit(): void {
  }

  checkAnswers() {
    this.questions.forEach(q => {
      const correct = q.answer.trim().toLowerCase();
      const selected = (q.selected || '').trim().toLowerCase();
      q.feedback = selected === correct ? 'correct' : `wrong|${q.answer}`;
    });

    const el = this.carousel.nativeElement;
    const instance = Carousel.getInstance(el) || new Carousel(el);
    instance.next();
  }

  clearAll() {
    this.questions.forEach(q => {
      q.selected = '';
      q.feedback = '';
    });

    const el = this.carousel.nativeElement;
    const instance = Carousel.getInstance(el) || new Carousel(el);
    if (instance) {
      instance.to(0);
    }
  }

  reset() {
    this.questions.forEach(q => {
      q.selected = '';
      q.feedback = '';
    });
  }
}
