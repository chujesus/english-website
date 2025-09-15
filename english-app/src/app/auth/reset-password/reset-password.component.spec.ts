import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';

describe('ResetPasswordComponent', () => {
    let component: ResetPasswordComponent;
    let fixture: ComponentFixture<ResetPasswordComponent>;
    let mockAuthService: jasmine.SpyObj<AuthService>;
    let mockActivatedRoute: any;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['resetPassword']);
        mockActivatedRoute = {
            snapshot: {
                queryParams: { token: 'mock-token' }
            }
        };

        await TestBed.configureTestingModule({
            imports: [
                ResetPasswordComponent,
                ReactiveFormsModule,
                RouterTestingModule
            ],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: ActivatedRoute, useValue: mockActivatedRoute }
            ]
        })
            .compileComponents();

        mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        fixture = TestBed.createComponent(ResetPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
        expect(component.resetForm.get('newPassword')?.value).toBe('');
        expect(component.resetForm.get('confirmPassword')?.value).toBe('');
    });

    it('should validate password field', () => {
        const passwordControl = component.resetForm.get('newPassword');

        expect(passwordControl?.valid).toBeFalsy();

        passwordControl?.setValue('123');
        expect(passwordControl?.valid).toBeFalsy();

        passwordControl?.setValue('password123');
        expect(passwordControl?.valid).toBeTruthy();
    });

    it('should validate password confirmation', () => {
        const passwordControl = component.resetForm.get('newPassword');
        const confirmPasswordControl = component.resetForm.get('confirmPassword');

        passwordControl?.setValue('password123');
        confirmPasswordControl?.setValue('different');

        component.resetForm.updateValueAndValidity();

        expect(confirmPasswordControl?.hasError('passwordMismatch')).toBeTruthy();

        confirmPasswordControl?.setValue('password123');
        component.resetForm.updateValueAndValidity();

        expect(confirmPasswordControl?.hasError('passwordMismatch')).toBeFalsy();
    });

    it('should not submit if form is invalid', () => {
        component.onSubmit();

        expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
    });

    it('should call AuthService.resetPassword when form is valid', async () => {
        const formData = {
            newPassword: 'password123',
            confirmPassword: 'password123'
        };
        mockAuthService.resetPassword.and.returnValue(Promise.resolve());

        component.resetForm.patchValue(formData);

        await component.onSubmit();

        expect(mockAuthService.resetPassword).toHaveBeenCalledWith('mock-token', formData.newPassword);
    });

    it('should show success message on successful password reset', async () => {
        const formData = {
            newPassword: 'password123',
            confirmPassword: 'password123'
        };
        mockAuthService.resetPassword.and.returnValue(Promise.resolve());

        component.resetForm.patchValue(formData);

        await component.onSubmit();

        expect(component.successMessage).toBe('Tu contraseña ha sido actualizada exitosamente.');
        expect(component.errorMessage).toBe('');
        expect(component.resetForm.get('newPassword')?.value).toBe('');
        expect(component.resetForm.get('confirmPassword')?.value).toBe('');
    });

    it('should handle reset password error', async () => {
        const formData = {
            newPassword: 'password123',
            confirmPassword: 'password123'
        };
        const errorMessage = 'Invalid or expired token';
        mockAuthService.resetPassword.and.returnValue(Promise.reject(new Error(errorMessage)));

        component.resetForm.patchValue(formData);

        await component.onSubmit();

        expect(component.errorMessage).toBe(errorMessage);
        expect(component.successMessage).toBe('');
        expect(component.loading).toBeFalsy();
    });

    it('should return correct field validation status', () => {
        const passwordControl = component.resetForm.get('newPassword');

        expect(component.isFieldInvalid('newPassword')).toBeFalsy();

        passwordControl?.markAsTouched();
        passwordControl?.setValue('');

        expect(component.isFieldInvalid('newPassword')).toBeTruthy();
    });

    it('should get token from route on init', () => {
        expect(component.token).toBe('mock-token');
    });

    it('should reset loading state after submission', async () => {
        const formData = {
            newPassword: 'password123',
            confirmPassword: 'password123'
        };
        mockAuthService.resetPassword.and.returnValue(Promise.resolve());

        component.resetForm.patchValue(formData);

        expect(component.loading).toBeFalsy();

        const submitPromise = component.onSubmit();
        expect(component.loading).toBeTruthy();

        await submitPromise;
        expect(component.loading).toBeFalsy();
    });
});
