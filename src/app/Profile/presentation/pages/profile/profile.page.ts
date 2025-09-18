import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { ProfileService } from '../../../services/profile.service';
import { Profile } from '../../../domain/entities/profile.entity';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css'
})
export class ProfilePage implements OnInit {
  personalDataForm!: FormGroup; // Agregar ! para indicar asignación definitiva
  preferencesForm!: FormGroup;  // Agregar ! para indicar asignación definitiva

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private initializeForms(): void {
    this.personalDataForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      bio: ['', [Validators.maxLength(500)]]
    });

    this.preferencesForm = this.fb.group({
      language: ['es'],
      timezone: ['America/Mexico_City'],
      dateFormat: ['DD/MM/YYYY'],
      theme: ['light'],
      notifications: this.fb.group({
        email: [true],
        push: [true],
        sms: [false],
        marketing: [false],
        parkingAlerts: [true],
        systemUpdates: [true]
      })
    });
  }

  private loadProfile(): void {
    this.profileService.loadProfile().subscribe({
      next: (profile) => {
        this.populateForms(profile);
      },
      error: (error) => {
        this.snackBar.open(
          error.message || 'Error al cargar el perfil',
          'Cerrar',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  private populateForms(profile: Profile): void {
    this.personalDataForm.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || '',
      bio: profile.bio || ''
    });

    this.preferencesForm.patchValue({
      language: profile.preferences.language,
      timezone: profile.preferences.timezone,
      dateFormat: profile.preferences.dateFormat,
      theme: profile.preferences.theme,
      notifications: profile.preferences.notifications
    });
  }

  onSavePersonalData(): void {
    if (this.personalDataForm.valid) {
      const formData = this.personalDataForm.value;

      this.profileService.updateProfile(formData).subscribe({
        next: () => {
          this.snackBar.open('Datos personales actualizados', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Error al actualizar datos',
            'Cerrar',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }
      });
    }
  }

  onSavePreferences(): void {
    if (this.preferencesForm.valid) {
      const preferences = this.preferencesForm.value;

      this.profileService.updateProfile({ preferences }).subscribe({
        next: () => {
          this.snackBar.open('Preferencias actualizadas', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Error al actualizar preferencias',
            'Cerrar',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }
      });
    }
  }

  onCloseSession(sessionId: string): void {
    const sessions = this.activeSessions();
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    this.activeSessions.set(updatedSessions);

    this.snackBar.open('Sesión cerrada exitosamente', 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const control = form.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${fieldName === 'firstName' ? 'Nombre' : 'Apellido'} es requerido`;
      }
      if (control.errors['minlength']) {
        return 'Mínimo 2 caracteres';
      }
      if (control.errors['maxlength']) {
        return 'Máximo 500 caracteres';
      }
    }
    return '';
  }

  get profile() {
    return this.profileService.profile;
  }

  get isLoading() {
    return this.profileService.isLoading;
  }

  readonly languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' }
  ];

  readonly timezones = [
    { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
    { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
    { value: 'UTC', label: 'UTC (GMT+0)' }
  ];

  readonly dateFormats = [
    { value: 'DD/MM/YYYY', label: '31/12/2023' },
    { value: 'MM/DD/YYYY', label: '12/31/2023' },
    { value: 'YYYY-MM-DD', label: '2023-12-31' }
  ];

  readonly themes = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'auto', label: 'Automático' }
  ];

  // Mock data para sesiones activas
  readonly activeSessions = signal([
    {
      id: '1',
      device: 'Chrome - Windows 10',
      location: 'Ciudad de México, México',
      lastActivity: new Date(),
      current: true
    },
    {
      id: '2',
      device: 'Safari - iPhone 14',
      location: 'Ciudad de México, México',
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      current: false
    }
  ]);
}
