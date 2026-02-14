import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { IUser } from '../../shared/interfaces';
import { onlyNumbers } from '../../shared/validators/validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form_password!: FormGroup;
  passwordToken: string = "";
  id!: number;
  user!: IUser;
  isChangeType: boolean = true;
  isChangeRepeatType: boolean = true;
  isRepeatVisible: boolean = true;
  isPassMatch = false;
  isVisible: boolean = true;

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService, private router: Router, private fbUpdatePassword: FormBuilder,
    private alertService: AlertService) {
    this.initForm();
  }

  ngOnInit(): void {
    this.getUser();
  }

  initForm() {
    this.form_password = this.fbUpdatePassword.group({
      password: ['', [Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{6,}$')]],
      confirm_password: ['', [Validators.required]]
    });
  }

  getUser() {
    this.activatedRoute.params.subscribe(params => {
      this.id = +params['id'];
      this.passwordToken = params['passwordToken'];

      this.authService.getUser(this.id).subscribe((user: IUser[]) => {
        if (user.length > 0) {
          this.user = user[0];
          if (this.user.password_token === null || this.user.password_token!.trim() === "" || this.user.password_token !== this.passwordToken) {
            this.alertService.showWarningAlert("Sorry!", "This link is not valid.").then(() => {
              this.router.navigate(['/']);
            });
          }
        } else {
          this.alertService.showInfoAlert("Sorry! This link is not valid.").then(() => {
            this.router.navigate(['/']);
          });
        }
      });
    });
  }

  get passwordRequire() {
    return this.form_password.get('password')!.invalid && this.form_password.get('password')!.touched && this.form_password.get('password')!.value.trim() === '';
  }

  get passwordPatternError() {
    return this.form_password.get('password')!.hasError('pattern');
  }

  get confirmPasswordRequire() {
    return this.form_password.get('confirm_password')!.invalid && this.form_password.get('confirm_password')!.touched && this.form_password.get('confirm_password')!.value.trim() === '';
  }

  get confirmPasswordPatternError() {
    return this.form_password.get('confirm_password')!.hasError('pattern');
  }

  get passwordsMatch() {
    if (this.form_password.get('password')!.value !== '' && this.form_password.get('confirm_password')!.value.trim() !== '') {
      const pass1 = this.form_password.get('password')!.value;
      const pass2 = this.form_password.get('confirm_password')!.value;
      this.isPassMatch = (pass1 === pass2) ? false : true;
    }

    if (this.form_password.get('confirm_password')!.value === '') {
      this.isPassMatch = false;
    }

    return this.isPassMatch;
  }

  viewPass() {
    this.isVisible = !this.isVisible;
    this.isChangeType = !this.isChangeType;
  }

  viewRepeatPass() {
    this.isRepeatVisible = !this.isRepeatVisible;
    this.isChangeRepeatType = !this.isChangeRepeatType;
  }

  validNumber(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return onlyNumbers(charCode);
  }

  continue() {
    if (this.form_password.invalid) {
      return Object.values(this.form_password.controls).forEach(control => {
        control.markAsTouched();
      });
    } else {
      this.alertService.showLoadingAlert("Please wait...");
      this.alertService.showLoading();

      this.user.password = this.form_password.value.password;
      this.user.password_token = "";
      debugger;
      this.authService.updateUser(this.user).subscribe({
        next: (data: IUser[]) => {
          this.alertService.closeLoading();
          if (data.length > 0) {
            this.alertService.showSuccessAlert("Successfully", "Your password has been updated").then(result => {
              this.router.navigate(['/login']);
            });
          } else {
            this.alertService.showErrorAlert('Error', 'An error occurred. Please try again later!')
              .then(() => {
                this.router.navigate(['/']);
              });
          }
        }, error: (err) => {
          this.alertService.closeLoading();
        }
      });
    }
  }
}
