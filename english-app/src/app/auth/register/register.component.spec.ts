import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/services/auth.service';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let mockAuthService: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('AuthService', ['register']);

        await TestBed.configureTestingModule({
            imports: [
                RegisterComponent,
                ReactiveFormsModule,
                RouterTestingModule
            ],
            providers: [
                { provide: AuthService, useValue: spy }
            ]
        })
            .compileComponents();

        mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
        expect(component.registerForm.get('name')?.value).toBe('');
        expect(component.registerForm.get('email')?.value).toBe('');
        expect(component.registerForm.get('password')?.value).toBe('');
        expect(component.registerForm.get('confirmPassword')?.value).toBe('');
    });

    it('should validate email field', () => {
        const emailControl = component.registerForm.get('email');

        expect(emailControl?.valid).toBeFalsy();

        emailControl?.setValue('invalid-email');
        expect(emailControl?.valid).toBeFalsy();

        emailControl?.setValue('test@example.com');
        expect(emailControl?.valid).toBeTruthy();
    });

    it('should validate password confirmation', () => {
        const passwordControl = component.registerForm.get('password');
        const confirmPasswordControl = component.registerForm.get('confirmPassword');

        passwordControl?.setValue('password123');
        confirmPasswordControl?.setValue('different');

        component.registerForm.updateValueAndValidity();

        expect(confirmPasswordControl?.hasError('passwordMismatch')).toBeTruthy();

        confirmPasswordControl?.setValue('password123');
        component.registerForm.updateValueAndValidity();

        expect(confirmPasswordControl?.hasError('passwordMismatch')).toBeFalsy();
    });

    it('should not submit if form is invalid', () => {
        component.onSubmit();

        expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should call AuthService.register when form is valid', async () => {
        const mockUser = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        };
        mockAuthService.register.and.returnValue(Promise.resolve());

        component.registerForm.patchValue(mockUser);

        await component.onSubmit();

        expect(mockAuthService.register).toHaveBeenCalledWith(
            mockUser.name,
            mockUser.email,
            mockUser.password
        );
    });

    it('should handle registration error', async () => {
        const mockUser = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        };
        const errorMessage = 'Email already exists';
        mockAuthService.register.and.returnValue(Promise.reject(new Error(errorMessage)));

        component.registerForm.patchValue(mockUser);

        await component.onSubmit();

        expect(component.errorMessage).toBe(errorMessage);
        expect(component.loading).toBeFalsy();
    });

    it('should return correct field validation status', () => {
        const nameControl = component.registerForm.get('name');

        expect(component.isFieldInvalid('name')).toBeFalsy();

        nameControl?.markAsTouched();
        nameControl?.setValue('');

        expect(component.isFieldInvalid('name')).toBeTruthy();
    });
});
