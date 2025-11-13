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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProfileService } from '../../../services/profile.service';
import { Profile } from '../../../domain/entities/profile.entity';
import { ThemeService } from '../../../../shared/services/theme.service';

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
    MatDividerModule,
    TranslateModule
  ],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css'
})
export class ProfilePage implements OnInit {
  personalDataForm!: FormGroup;
  preferencesForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private themeService: ThemeService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    // Configurar idioma inicial
    const savedLanguage = localStorage.getItem('app-language') || 'es';
    this.translate.use(savedLanguage);

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

    // Validar que preferences exista antes de acceder a sus propiedades
    if (profile.preferences) {
      this.preferencesForm.patchValue({
        language: profile.preferences.language || 'es',
        timezone: profile.preferences.timezone || 'America/Mexico_City',
        dateFormat: profile.preferences.dateFormat || 'DD/MM/YYYY',
        theme: profile.preferences.theme || this.themeService.theme(),
        notifications: profile.preferences.notifications || {
          email: true,
          push: true,
          sms: false,
          marketing: false,
          parkingAlerts: true,
          systemUpdates: true
        }
      });

      // Aplicar tema guardado
      if (profile.preferences.theme) {
        this.themeService.setTheme(profile.preferences.theme as any);
      }

      // Aplicar idioma guardado
      if (profile.preferences.language) {
        this.translate.use(profile.preferences.language);
        localStorage.setItem('app-language', profile.preferences.language);
      }
    }
  }

  onSavePersonalData(): void {
    if (this.personalDataForm.valid) {
      const formData = this.personalDataForm.value;

      this.profileService.updateProfile(formData).subscribe({
        next: () => {
          this.translate.get('PROFILE.MESSAGES.PERSONAL_DATA_UPDATED').subscribe((msg: string) => {
            this.snackBar.open(msg, this.translate.instant('COMMON.CLOSE'), {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          });
        },
        error: (error) => {
          this.translate.get('PROFILE.MESSAGES.ERROR_UPDATING').subscribe((msg: string) => {
            this.snackBar.open(
              error.message || msg,
              this.translate.instant('COMMON.CLOSE'),
              { duration: 5000, panelClass: ['error-snackbar'] }
            );
          });
        }
      });
    }
  }

  onSavePreferences(): void {
    if (this.preferencesForm.valid) {
      const preferences = this.preferencesForm.value;

      // Aplicar cambio de idioma inmediatamente
      if (preferences.language) {
        this.translate.use(preferences.language);
        localStorage.setItem('app-language', preferences.language);
      }

      // Aplicar cambio de tema inmediatamente
      if (preferences.theme) {
        this.themeService.setTheme(preferences.theme);
      }

      this.profileService.updateProfile({ preferences }).subscribe({
        next: () => {
          this.translate.get('PROFILE.MESSAGES.PREFERENCES_UPDATED').subscribe((msg: string) => {
            this.snackBar.open(msg, this.translate.instant('COMMON.CLOSE'), {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          });
        },
        error: (error) => {
          this.translate.get('PROFILE.MESSAGES.ERROR_UPDATING').subscribe((msg: string) => {
            this.snackBar.open(
              error.message || msg,
              this.translate.instant('COMMON.CLOSE'),
              { duration: 5000, panelClass: ['error-snackbar'] }
            );
          });
        }
      });
    }
  }

  onCloseSession(sessionId: string): void {
    const sessions = this.activeSessions();
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    this.activeSessions.set(updatedSessions);

    this.translate.get('PROFILE.MESSAGES.SESSION_CLOSED').subscribe((msg: string) => {
      this.snackBar.open(msg, this.translate.instant('COMMON.CLOSE'), {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    });
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const control = form.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        const key = fieldName === 'firstName' ? 'PROFILE.PERSONAL_DATA.ERRORS.FIRST_NAME_REQUIRED' : 'PROFILE.PERSONAL_DATA.ERRORS.LAST_NAME_REQUIRED';
        return this.translate.instant(key);
      }
      if (control.errors['minlength']) {
        return this.translate.instant('PROFILE.PERSONAL_DATA.ERRORS.MIN_LENGTH');
      }
      if (control.errors['maxlength']) {
        return this.translate.instant('PROFILE.PERSONAL_DATA.ERRORS.MAX_LENGTH');
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
    { value: 'Europe/Paris', label: 'París (GMT+1)' },
    { value: 'UTC', label: 'UTC (GMT+0)' }
  ];

  readonly dateFormats = [
    { value: 'DD/MM/YYYY', label: '31/12/2023' },
    { value: 'MM/DD/YYYY', label: '12/31/2023' },
    { value: 'YYYY-MM-DD', label: '2023-12-31' }
  ];

  get themes() {
    return [
      { value: 'light', label: this.translate.instant('THEMES.LIGHT') },
      { value: 'dark', label: this.translate.instant('THEMES.DARK') },
      { value: 'auto', label: this.translate.instant('THEMES.AUTO') }
    ];
  }

  get currentTheme() {
    return this.themeService.theme();
  }

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
