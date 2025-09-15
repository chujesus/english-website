import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let mockAuthService: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('AuthService', ['login']);

        await TestBed.configureTestingModule({
            imports: [
                LoginComponent,
                ReactiveFormsModule,
                RouterTestingModule
            ],
            providers: [
                { provide: AuthService, useValue: spy }
            ]
        })
            .compileComponents();

        mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
        expect(component.loginForm.get('email')?.value).toBe('');
        expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should validate email field', () => {
        const emailControl = component.loginForm.get('email');

        expect(emailControl?.valid).toBeFalsy();

        emailControl?.setValue('invalid-email');
        expect(emailControl?.valid).toBeFalsy();

        emailControl?.setValue('test@example.com');
        expect(emailControl?.valid).toBeTruthy();
    });

    it('should validate password field', () => {
        const passwordControl = component.loginForm.get('password');

        expect(passwordControl?.valid).toBeFalsy();

        passwordControl?.setValue('123');
        expect(passwordControl?.valid).toBeFalsy();

        passwordControl?.setValue('password123');
        expect(passwordControl?.valid).toBeTruthy();
    });

    it('should not submit if form is invalid', () => {
        component.onSubmit();

        expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should call AuthService.login when form is valid', async () => {
        const mockUser = { email: 'test@example.com', password: 'password123' };
        mockAuthService.login.and.returnValue(Promise.resolve());

        component.loginForm.patchValue(mockUser);

        await component.onSubmit();

        expect(mockAuthService.login).toHaveBeenCalledWith(mockUser.email, mockUser.password);
    });

    it('should handle login error', async () => {
        const mockUser = { email: 'test@example.com', password: 'password123' };
        const errorMessage = 'Invalid credentials';
        mockAuthService.login.and.returnValue(Promise.reject(new Error(errorMessage)));

        component.loginForm.patchValue(mockUser);

        await component.onSubmit();

        expect(component.errorMessage).toBe(errorMessage);
        expect(component.loading).toBeFalsy();
    });

    it('should return correct field validation status', () => {
        const emailControl = component.loginForm.get('email');

        expect(component.isFieldInvalid('email')).toBeFalsy();

        emailControl?.markAsTouched();
        emailControl?.setValue('');

        expect(component.isFieldInvalid('email')).toBeTruthy();
    });
});
