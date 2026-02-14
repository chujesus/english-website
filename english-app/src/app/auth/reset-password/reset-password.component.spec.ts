import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { of } from 'rxjs';

describe('ResetPasswordComponent', () => {
    let component: ResetPasswordComponent;
    let fixture: ComponentFixture<ResetPasswordComponent>;
    let mockAuthService: jasmine.SpyObj<AuthService>;
    let mockAlertService: jasmine.SpyObj<AlertService>;
    let mockActivatedRoute: any;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['getUser', 'updateUser']);
        const alertSpy = jasmine.createSpyObj('AlertService', ['showLoadingAlert', 'showLoading', 'closeLoading', 'showSuccessAlert', 'showErrorAlert', 'showWarningAlert', 'showInfoAlert']);
        mockActivatedRoute = {
            params: of({ id: '1', passwordToken: 'test-token' })
        };

        await TestBed.configureTestingModule({
            imports: [
                ResetPasswordComponent,
                ReactiveFormsModule,
                RouterTestingModule
            ],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: AlertService, useValue: alertSpy },
                { provide: ActivatedRoute, useValue: mockActivatedRoute }
            ]
        })
            .compileComponents();

        mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        mockAlertService = TestBed.inject(AlertService) as jasmine.SpyObj<AlertService>;
        fixture = TestBed.createComponent(ResetPasswordComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form with password and confirm_password fields', () => {
        expect(component.form_password.get('password')?.value).toBe('');
        expect(component.form_password.get('confirm_password')?.value).toBe('');
    });

    it('should validate password field as required', () => {
        const passwordControl = component.form_password.get('password');

        expect(passwordControl?.valid).toBeFalsy();

        passwordControl?.setValue('Test123');
        expect(passwordControl?.valid).toBeTruthy();
    });

    it('should detect when passwords do not match', () => {
        component.form_password.patchValue({
            password: 'Test123',
            confirm_password: 'Different123'
        });

        expect(component.passwordsMatch).toBeTruthy();
    });

    it('should detect when passwords match', () => {
        component.form_password.patchValue({
            password: 'Test123',
            confirm_password: 'Test123'
        });

        expect(component.passwordsMatch).toBeFalsy();
    });

    it('should toggle password visibility', () => {
        expect(component.isVisible).toBeTruthy();
        expect(component.isChangeType).toBeTruthy();

        component.viewPass();

        expect(component.isVisible).toBeFalsy();
        expect(component.isChangeType).toBeFalsy();
    });

    it('should toggle repeat password visibility', () => {
        expect(component.isRepeatVisible).toBeTruthy();
        expect(component.isChangeRepeatType).toBeTruthy();

        component.viewRepeatPass();

        expect(component.isRepeatVisible).toBeFalsy();
        expect(component.isChangeRepeatType).toBeFalsy();
    });
});
