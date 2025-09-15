import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FillInBlankPracticeComponent } from './fill-in-blank-practice.component';

describe('FillInBlankPracticeComponent', () => {
  let component: FillInBlankPracticeComponent;
  let fixture: ComponentFixture<FillInBlankPracticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FillInBlankPracticeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FillInBlankPracticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
