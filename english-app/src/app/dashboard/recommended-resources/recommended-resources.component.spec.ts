import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendedResourcesComponent } from './recommended-resources.component';

describe('RecommendedResourcesComponent', () => {
    let component: RecommendedResourcesComponent;
    let fixture: ComponentFixture<RecommendedResourcesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RecommendedResourcesComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(RecommendedResourcesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
