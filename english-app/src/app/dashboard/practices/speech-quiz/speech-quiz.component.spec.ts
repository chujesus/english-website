import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechQuizComponent } from './speech-quiz.component';

describe('SpeechQuizComponent', () => {
  let component: SpeechQuizComponent;
  let fixture: ComponentFixture<SpeechQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeechQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeechQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
