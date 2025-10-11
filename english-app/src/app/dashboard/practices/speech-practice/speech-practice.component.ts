import { Component, Inject, Input, NgZone, OnChanges, OnInit, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DeepgramService } from '../../../core/services/deepgram.service';
import { Router } from '@angular/router';
import { get as levenshtein } from 'fast-levenshtein';
import { SpeechPracticeItem } from '../../../shared/interfaces/models';

@Component({
  standalone: true,
  selector: 'app-speech-practice',
  imports: [CommonModule],
  templateUrl: './speech-practice.component.html',
  styleUrl: './speech-practice.component.scss'
})
export class SpeechPracticeComponent implements OnInit, OnChanges {
  recognizedText: string = '';
  @Input() targetSentences: SpeechPracticeItem[] = [];
  @Input() currentIndex: number = 0;
  recognizedTexts: string[] = Array(this.targetSentences.length).fill('');
  isCorrectList: (boolean | null)[] = Array(this.targetSentences.length).fill(null);
  similarityList: number[] = Array(this.targetSentences.length).fill(0);
  private mediaRecorder: MediaRecorder | null = null;
  recognition: any;
  isSpeaking: boolean = false;
  speakingIndex: number | null = null;
  isBusy: boolean = false;

  /**
   *
   */
  constructor(private zone: NgZone, @Inject(PLATFORM_ID) private platformId: Object, private deepgramService: DeepgramService, private router: Router) {
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.trim();
          this.zone.run(() => {
            this.recognizedTexts[this.currentIndex] = transcript;
            const expected = this.cleanText(this.targetSentences[this.currentIndex].english);
            const actual = this.cleanText(transcript);
            const distance = levenshtein(expected, actual);
            const similarity = Math.max(0, 1 - distance / expected.length);
            const percentage = Math.round(similarity * 100);

            this.isCorrectList[this.currentIndex] = distance <= 1;
            this.similarityList[this.currentIndex] = percentage;
          });
        };
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['targetSentences']) {
      this.currentIndex = 0;
    }
  }

  private cleanText(text: string): string {
    return text
      .toLowerCase()
      .replace(/’/g, "'")
      .replace(/[.,!?"]/g, '')
      .replace(/\s+/g, ' ')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  startRecognition(index: number) {
    if (this.isBusy) return;
    this.isBusy = true;
    this.speakingIndex = index;
    this.currentIndex = index;

    this.recognition.onspeechend = () => {
      this.zone.run(() => {
        this.isBusy = false;
        this.recognition.stop();
      });
    };

    this.recognition.onend = () => {
      this.zone.run(() => {
        this.isBusy = false;
        this.speakingIndex = null;
      });
    };

    this.recognition.start();
  }

  recognizeWithDeepgram(index: number) {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      return;
    }

    if (this.isBusy) return;

    this.isBusy = true;
    this.speakingIndex = index;
    this.currentIndex = index;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        this.mediaRecorder = null;

        this.deepgramService.transcribeAudio(audioBlob).subscribe({
          next: (res) => {
            const transcript = res?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
            this.zone.run(() => {
              this.recognizedTexts[this.currentIndex] = transcript;

              const expected = this.cleanText(this.targetSentences[this.currentIndex].english);
              const actual = this.cleanText(transcript);
              const distance = levenshtein(expected, actual);
              const similarity = Math.max(0, 1 - distance / expected.length);
              const percentage = Math.round(similarity * 100);

              this.isCorrectList[this.currentIndex] = distance <= 1;
              this.similarityList[this.currentIndex] = percentage;

              this.isBusy = false;
              this.speakingIndex = null;
            });
          },
          error: (err) => {
            console.error('Deepgram error:', err);
            this.zone.run(() => {
              this.isBusy = false;
              this.speakingIndex = null;
            });
          }
        });

        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
    });
  }

  playSentence(index: number) {
    if (typeof window !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined') {
      this.isBusy = true;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(this.targetSentences[index].english);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;

      utterance.onend = () => {
        this.zone.run(() => {
          this.isBusy = false;
        });
      };

      window.speechSynthesis.speak(utterance);
    }
  }

  next() {
    if (this.currentIndex < this.targetSentences.length - 1) {
      this.currentIndex++;
    }
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  getCorrectCount(): number {
    return this.isCorrectList.filter((result, index) =>
      this.recognizedTexts[index] && result === true
    ).length;
  }

  getIncorrectCount(): number {
    return this.isCorrectList.filter((result, index) =>
      this.recognizedTexts[index] && result === false
    ).length;
  }

  getPendingCount(): number {
    return this.recognizedTexts.filter(text => !text || text.trim() === '').length;
  }

  getProgressPercentage(): number {
    return Math.round(((this.currentIndex + 1) / this.targetSentences.length) * 100);
  }
}
