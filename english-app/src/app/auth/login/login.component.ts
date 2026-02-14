import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { SettingService } from '../../core/services/setting.service';
import { IUser, Profile, Status } from '../../shared/interfaces';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { isGoogleConfigValid } from '../../core/config/google.config';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  user!: IUser;
  isGoogleConfigValid = isGoogleConfigValid();
  institutionName = 'English Learning Platform';
  loginBackgroundUrl: string | null = null;
  loadingSettings = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private alertService: AlertService,
    private settingService: SettingService
  ) {
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.loadSettings();
  }

  loadSettings(): void {
    this.loadingSettings = true;
    this.settingService.getAllSettings().subscribe({
      next: (response: any) => {
        if (response.data && Array.isArray(response.data)) {
          const institutionSetting = response.data.find((s: any) => s.name === 'Institution name');
          const backgroundSetting = response.data.find((s: any) => s.name === 'Login Background');

          if (institutionSetting?.value) {
            this.institutionName = institutionSetting.value;
          }
          if (backgroundSetting?.value) {
            this.loginBackgroundUrl = backgroundSetting.value;
          }
        }
        this.loadingSettings = false;
      },
      error: () => {
        console.log('Could not load settings, using defaults');
        this.loadingSettings = false;
      }
    });
  }

  getBackgroundStyle() {
    if (this.loginBackgroundUrl) {
      return {
        'background': `linear-gradient(135deg, rgba(43, 143, 250, 0.25) 0%, rgba(0, 86, 184, 0.25) 100%), url('${this.loginBackgroundUrl}')`,
        'background-size': 'cover',
        'background-position': 'center',
        'background-attachment': 'fixed'
      };
    }
    return {
      'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async loginWithGoogle() {
    this.loading = true;
    this.errorMessage = '';

    try {
      const currentUser = await this.authService.loginWithGoogle();
      if (currentUser?.profile === Profile.Administrator) {
        this.router.navigate(['/dashboard/admin']);
      } else {
        this.router.navigate(['/dashboard/control-panel']);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Error signing in with Google';
    } finally {
      this.loading = false;
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return Object.values(this.loginForm.controls).forEach(control => {
        control.markAsTouched();
      });
    } else {
      this.alertService.showLoadingAlert("Espere por favor...");
      this.alertService.showLoading();
      this.user = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };
      this.authService.login(this.user).subscribe({
        next: (user: IUser[]) => {
          if (user.length > 0 && user[0].state === Status.Active) {
            this.localStorageService.setCredentials(user[0]);
            if (user[0].profile === Profile.Administrator) {
              this.router.navigate(['/dashboard/admin']);
            } else if (user[0].profile === Profile.Student) {
              this.router.navigate(['/dashboard/control-panel']);
            }
          } else {
            this.alertService.closeLoading();
            this.alertService.showWarningAlert("Alerta!", "Usuario no se puede conectar");
          }
        }, error: (ex) => {
          this.alertService.closeLoading();
          this.alertService.showWarningAlert("Alerta!", ex.error.message);
        }
      });
    }
  }
}