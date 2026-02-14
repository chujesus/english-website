import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { IUser, Profile, Status } from '../../shared/interfaces';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { TseService } from '../../core/services/tse.service';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { onlyNumbers, titleCaseTranform } from '../../shared/validators/validators';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    form_subscribe!: FormGroup;
    profile = Profile;
    isReadOnly = false;
    isVisible: boolean = true;
    isChangeType: boolean = true;
    isChangeRepeatType: boolean = true;
    isRepeatVisible: boolean = true;
    isPassMatch = false;
    isIDAvailable = false;
    isMailAvailable = false;
    isMinPasswordAvailable = false;
    isMinPasswordConfirmAvailable = false;
    private searchText$ = new Subject<string>();

    constructor(private fbSubscribe: FormBuilder, private authService: AuthService, private alertService: AlertService,
        private router: Router, private tseService: TseService, private localStorageService: LocalStorageService) {
        this.initForm();
    }

    ngOnInit(): void {
        this.searchText$.pipe(debounceTime(1000), distinctUntilChanged(), switchMap(packageName =>
            this.authService.getUserIdentification(packageName))).subscribe((user: IUser[]) => {
                if (user.length > 0) {
                    this.isIDAvailable = true;
                } else {
                    this.isIDAvailable = false;
                    this.tseService.getTsePerson(this.form_subscribe.get('identification')!.value).subscribe((data: any) => {
                        if (data && data.length !== 0) {
                            this.form_subscribe.patchValue({
                                name: titleCaseTranform(data.NOMBRECOMPLETO),
                                first_name: titleCaseTranform(data.APELLIDO1),
                                last_name: titleCaseTranform(data.APELLIDO2)
                            });
                            this.isReadOnly = true;
                        } else {
                            this.isReadOnly = false;
                        }
                    });
                }
            });
    }

    initForm() {
        this.form_subscribe = this.fbSubscribe.group({
            identification: ['', [Validators.required]],
            name: ['', [Validators.required]],
            first_name: ['', [Validators.required]],
            last_name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
            phone: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{6,}$')]],
            confirm_password: ['', [Validators.required]]
        });
    }

    get IDNoValid() {
        return this.form_subscribe.get('identification')!.invalid && this.form_subscribe.get('identification')!.touched;
    }

    get nameNoValid() {
        return this.form_subscribe.get('name')!.invalid && this.form_subscribe.get('name')!.touched;
    }

    get firstNameNoValid() {
        return this.form_subscribe.get('first_name')!.invalid && this.form_subscribe.get('first_name')!.touched;
    }

    get lastNameNoValid() {
        return this.form_subscribe.get('last_name')!.invalid && this.form_subscribe.get('last_name')!.touched;
    }

    get phoneNoValid() {
        return this.form_subscribe.get('phone')!.invalid && this.form_subscribe.get('phone')!.touched;
    }

    get emailRequired() {
        return this.form_subscribe.get('email')!.touched && this.form_subscribe.get('email')!.value.trim() === '';
    }

    get emailNoValid() {
        return this.form_subscribe.get('email');
    }

    get passwordRequire() {
        return this.form_subscribe.get('password')!.invalid && this.form_subscribe.get('password')!.touched && this.form_subscribe.get('password')!.value.trim() === '';
    }

    get passwordPatternError() {
        return this.form_subscribe.get('password')!.hasError('pattern');
    }

    get confirmPasswordRequire() {
        return this.form_subscribe.get('confirm_password')!.invalid && this.form_subscribe.get('confirm_password')!.touched && this.form_subscribe.get('confirm_password')!.value.trim() === '';
    }

    get confirmPasswordPatternError() {
        return this.form_subscribe.get('confirm_password')!.hasError('pattern');
    }

    get passwordsMatch() {
        if (this.form_subscribe.get('password')!.value !== '' && this.form_subscribe.get('confirm_password')!.value.trim() !== '') {
            const pass1 = this.form_subscribe.get('password')!.value;
            const pass2 = this.form_subscribe.get('confirm_password')!.value;
            this.isPassMatch = (pass1 === pass2) ? false : true;
        }

        if (this.form_subscribe.get('confirm_password')!.value === '') {
            this.isPassMatch = false;
        }

        return this.isPassMatch;
    }

    getIdentification(event: any) {
        if (event.target.value.trim() !== "") {
            this.searchText$.next(event.target.value);
        } else {
            this.isIDAvailable = false;
            this.form_subscribe.patchValue({
                name: "",
                first_name: "",
                last_name: ""
            });
        }
    }

    getEmail(event: any) {
        if (event.target.value.trim() !== "") {
            this.authService.getUserEmail(event.target.value).subscribe((user: IUser[]) => {
                if (user.length > 0) {
                    this.isMailAvailable = true;
                } else {
                    this.isMailAvailable = false;
                }
            });
        } else {
            this.isMailAvailable = false;
        }
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

    getUserAdmin() {
        return new Promise<boolean>((resolve, reject) => {
            if (this.form_subscribe.value.identification === "admin" && this.form_subscribe.value.password === "00112233") {
                this.authService.getUsersProfile(this.profile.Administrator).subscribe((user: IUser[]) => {
                    if (user.length > 0) {
                        this.alertService.showWarningAlert("¡Lo sentimos!", "Ya existe un perfil para el administrador.").then(() => {
                            this.router.navigate(['/']);
                        });
                    } else {
                        resolve(true);
                    }
                });
            } else {
                resolve(false);
            }
        });
    }

    async continue() {
        if (this.form_subscribe.invalid || this.isMailAvailable === true || this.isIDAvailable === true) {
            return Object.values(this.form_subscribe.controls).forEach(control => {
                control.markAsTouched();
            });
        } else {
            try {
                this.alertService.showLoadingAlert("Espere por favor...");
                this.alertService.showLoading();
                const currentDate = new Date();
                const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
                let user = {
                    name: this.form_subscribe.value.name.trim(),
                    first_name: this.form_subscribe.value.first_name.trim(),
                    last_name: this.form_subscribe.value.last_name.trim(),
                    identification: this.form_subscribe.value.identification.trim(),
                    password: this.form_subscribe.value.password,
                    email: this.form_subscribe.value.email,
                    phone: this.form_subscribe.value.phone,
                    state: Status.Inactive,
                    profile: await this.getUserAdmin() ? this.profile.Administrator : this.profile.Student,
                    created_at: formattedDate,
                    updated_at: formattedDate
                };
                this.authService.register(user).subscribe({
                    next: (data: IUser[]) => {
                        if (data.length > 0) {
                            this.alertService.closeLoading();
                            // Store user credentials
                            this.localStorageService.setCredentials(data[0]);
                            this.alertService.showSuccessAlert("Registration completed successfully!", "").then(() => {
                                if (data[0].profile === this.profile.Administrator) {
                                    this.router.navigate(['/dashboard/admin']);
                                } else if (data[0].profile === this.profile.Student) {
                                    this.router.navigate(['/dashboard/control-panel']);
                                }
                            });
                        } else {
                            this.alertService.closeLoading();
                            this.alertService.showErrorAlert('Error', 'No se pudo completar el registro. Intenta de nuevo.');
                        }
                    },
                    error: (error) => {
                        this.alertService.closeLoading();
                        const errorMessage = error.error?.error || error.error?.message || 'Ha ocurrido un error durante el registro';
                        this.alertService.showErrorAlert('Error de Registro', errorMessage);
                        console.error('Registration error:', error);
                    }
                });
            } catch (error) {
                this.alertService.showErrorAlert('Error', 'An error has occurred. Please try again later!');
            }
        }
    }
}
