import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.css'
})
export class ResetPasswordPage implements OnInit {
  resetForm: FormGroup;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  isLoading = signal(false);
  token = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.token.set(token);
      } else {
        this.snackBar.open('Token de recuperación inválido', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/auth/forgot-password']);
      }
    });
  }

  onSubmit(): void {
    if (this.resetForm.valid && this.token()) {
      this.isLoading.set(true);
      const newPassword = this.resetForm.value.password;

      this.authService.resetPassword(this.token()!, newPassword).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.snackBar.open(response.message, 'Cerrar', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.snackBar.open(
            error.message || 'Error al restablecer la contraseña',
            'Cerrar',
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.hidePassword.update(value => !value);
    } else {
      this.hideConfirmPassword.update(value => !value);
    }
  }

  private passwordValidator(control: any) {
    const password = control.value;
    if (!password) return null;

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUpper || !hasLower || !hasNumber) {
      return { passwordStrength: true };
    }

    return null;
  }

  private passwordMatchValidator(form: any) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  private markFormGroupTouched(): void {
    Object.keys(this.resetForm.controls).forEach(key => {
      const control = this.resetForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.resetForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return fieldName === 'password' ? 'Contraseña es requerida' : 'Confirmar contraseña es requerido';
      }
      if (control.errors['minlength']) {
        return 'La contraseña debe tener al menos 8 caracteres';
      }
      if (control.errors['passwordStrength']) {
        return 'Debe contener mayúscula, minúscula y número';
      }
    }

    // Error de confirmación de contraseña
    if (fieldName === 'confirmPassword' && this.resetForm.errors?.['passwordMismatch']) {
      const confirmControl = this.resetForm.get('confirmPassword');
      if (confirmControl?.touched) {
        return 'Las contraseñas no coinciden';
      }
    }

    return '';
  }
}
