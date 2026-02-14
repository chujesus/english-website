import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ForgotPasswordResponse } from '../../shared/interfaces/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.forgotForm.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: (response: any) => {
        if (response.ok) {
          this.successMessage = response.message || 'An email has been sent with instructions to recover your password.';
        } else {
          this.errorMessage = response.message || 'Error sending recovery email';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Forgot password error:', error);
        this.errorMessage = error.error?.message || error.message || 'Error sending recovery email';
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.forgotForm.controls).forEach(key => {
      this.forgotForm.get(key)?.markAsTouched();
    });
  }
}
