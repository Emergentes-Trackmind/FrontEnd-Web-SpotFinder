import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.css'
})
export class ForgotPasswordPage {
  forgotForm: FormGroup;
  isLoading = signal(false);
  emailSent = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.valid) {
      this.isLoading.set(true);
      const email = this.forgotForm.value.email;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.emailSent.set(true);
          this.snackBar.open(response.message, 'Cerrar', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.isLoading.set(false);
          this.snackBar.open(
            error.message || 'Error al enviar el email de recuperación',
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

  private markFormGroupTouched(): void {
    Object.keys(this.forgotForm.controls).forEach(key => {
      const control = this.forgotForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.forgotForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'Email es requerido';
      }
      if (control.errors['email']) {
        return 'Formato de email inválido';
      }
    }
    return '';
  }
}
