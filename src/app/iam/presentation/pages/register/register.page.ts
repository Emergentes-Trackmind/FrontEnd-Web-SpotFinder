import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './register.page.html',
  styleUrl: './register.page.css'
})
export class RegisterPage {
  registerForm: FormGroup;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { confirmPassword, ...registerData } = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: () => {
          this.snackBar.open('¡Cuenta creada exitosamente!', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Error al crear la cuenta',
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
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        const labels: { [key: string]: string } = {
          firstName: 'Nombre',
          lastName: 'Apellido',
          email: 'Email',
          password: 'Contraseña',
          confirmPassword: 'Confirmar contraseña'
        };
        return `${labels[fieldName]} es requerido`;
      }
      if (control.errors['email']) {
        return 'Formato de email inválido';
      }
      if (control.errors['minlength']) {
        return fieldName === 'password'
          ? 'La contraseña debe tener al menos 8 caracteres'
          : 'Mínimo 2 caracteres';
      }
      if (control.errors['passwordStrength']) {
        return 'Debe contener mayúscula, minúscula y número';
      }
      if (control.errors['requiredTrue']) {
        return 'Debe aceptar los términos y condiciones';
      }
    }

    // Error de confirmación de contraseña
    if (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch']) {
      const confirmControl = this.registerForm.get('confirmPassword');
      if (confirmControl?.touched) {
        return 'Las contraseñas no coinciden';
      }
    }

    return '';
  }

  get isLoading() {
    return this.authService.isLoading;
  }
}
