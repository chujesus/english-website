import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../core/services/auth.service';

describe('ForgotPasswordComponent', () => {
    let component: ForgotPasswordComponent;
    let fixture: ComponentFixture<ForgotPasswordComponent>;
    let mockAuthService: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('AuthService', ['forgotPassword']);

        await TestBed.configureTestingModule({
            imports: [
                ForgotPasswordComponent,
                ReactiveFormsModule,
                RouterTestingModule
            ],
            providers: [
                { provide: AuthService, useValue: spy }
            ]
        })
            .compileComponents();

        mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        fixture = TestBed.createComponent(ForgotPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form with empty email', () => {
        expect(component.forgotForm.get('email')?.value).toBe('');
    });

    it('should validate email field', () => {
        const emailControl = component.forgotForm.get('email');

        expect(emailControl?.valid).toBeFalsy();

        emailControl?.setValue('invalid-email');
        expect(emailControl?.valid).toBeFalsy();

        emailControl?.setValue('test@example.com');
        expect(emailControl?.valid).toBeTruthy();
    });

    it('should not submit if form is invalid', () => {
        component.onSubmit();

        expect(mockAuthService.forgotPassword).not.toHaveBeenCalled();
    });

    it('should call AuthService.forgotPassword when form is valid', async () => {
        const email = 'test@example.com';
        mockAuthService.forgotPassword.and.returnValue(Promise.resolve());

        component.forgotForm.patchValue({ email });

        await component.onSubmit();

        expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(email);
    });

    it('should show success message on successful submission', async () => {
        const email = 'test@example.com';
        mockAuthService.forgotPassword.and.returnValue(Promise.resolve());

        component.forgotForm.patchValue({ email });

        await component.onSubmit();

        expect(component.successMessage).toBe('Se ha enviado un email con las instrucciones para recuperar tu contraseña.');
        expect(component.errorMessage).toBe('');
        expect(component.forgotForm.get('email')?.value).toBe('');
    });

    it('should handle forgot password error', async () => {
        const email = 'test@example.com';
        const errorMessage = 'Email not found';
        mockAuthService.forgotPassword.and.returnValue(Promise.reject(new Error(errorMessage)));

        component.forgotForm.patchValue({ email });

        await component.onSubmit();

        expect(component.errorMessage).toBe(errorMessage);
        expect(component.successMessage).toBe('');
        expect(component.loading).toBeFalsy();
    });

    it('should return correct field validation status', () => {
        const emailControl = component.forgotForm.get('email');

        expect(component.isFieldInvalid('email')).toBeFalsy();

        emailControl?.markAsTouched();
        emailControl?.setValue('');

        expect(component.isFieldInvalid('email')).toBeTruthy();
    });

    it('should reset loading state after submission', async () => {
        const email = 'test@example.com';
        mockAuthService.forgotPassword.and.returnValue(Promise.resolve());

        component.forgotForm.patchValue({ email });

        expect(component.loading).toBeFalsy();

        const submitPromise = component.onSubmit();
        expect(component.loading).toBeTruthy();

        await submitPromise;
        expect(component.loading).toBeFalsy();
    });
});
