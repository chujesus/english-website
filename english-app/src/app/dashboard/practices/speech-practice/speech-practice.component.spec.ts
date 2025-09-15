import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechPracticeComponent } from './speech-practice.component';

describe('SpeechPracticeComponent', () => {
  let component: SpeechPracticeComponent;
  let fixture: ComponentFixture<SpeechPracticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeechPracticeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeechPracticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
