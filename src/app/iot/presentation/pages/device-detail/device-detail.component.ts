import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DevicesFacade } from '../../../services/devices.facade';
import { IotService } from '../../../services/iot.service';

/**
 * Componente de detalle/edición de dispositivo IoT
 */
@Component({
  selector: 'app-device-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule
  ],
  template: `
    <div class="detail-container">
      <div class="detail-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Dispositivo' : (isNewMode ? 'Nuevo Dispositivo' : 'Detalle Dispositivo') }}</h1>
      </div>

      <mat-card>
        <form [formGroup]="deviceForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <mat-form-field>
              <mat-label>Nombre del Dispositivo</mat-label>
              <input matInput formControlName="displayName" placeholder="Ej: Sensor Plaza A">
              <mat-hint>Nombre identificativo que quieres dar al sensor</mat-hint>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Número de Serie</mat-label>
              <input matInput formControlName="serialNumber" placeholder="SN-2024-XXX">
              <mat-hint>Número de serie del dispositivo físico ya registrado por el simulador</mat-hint>
            </mat-form-field>
          </div>

          <div class="info-note">
            <mat-icon>info</mat-icon>
            <p>El dispositivo debe estar previamente registrado por el simulador IoT. Aquí solo vinculas un dispositivo existente a tu usuario con el nombre que prefieras.</p>
          </div>

          <div class="actions">
            <button mat-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="!deviceForm.valid || isSubmitting">
              {{ isNewMode ? 'Vincular Dispositivo' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </mat-card>

      @if (!isNewMode && !isEditMode && currentDevice) {
        <mat-card class="info-card">
          <h2>Información del Dispositivo</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Batería:</span>
              <span class="value">{{ currentDevice.battery }}%</span>
            </div>
            <div class="info-item">
              <span class="label">Última Conexión:</span>
              <span class="value">{{ currentDevice.lastCheckIn | date:'medium' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Estado:</span>
              <span class="value">{{ currentDevice.status }}</span>
            </div>
            <div class="info-item">
              <span class="label">Token:</span>
              <span class="value">{{ currentDevice.deviceToken }}</span>
            </div>
          </div>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .detail-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;

      h1 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      padding: 1.5rem;
    }

    .info-note {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      margin: 0 1.5rem 1.5rem;
      background-color: #e3f2fd;
      border-radius: 8px;
      border-left: 4px solid #1976d2;

      mat-icon {
        color: #1976d2;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      p {
        margin: 0;
        color: #1565c0;
        font-size: 14px;
        line-height: 1.5;
      }
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .info-card {
      margin-top: 1.5rem;
      padding: 1.5rem;

      h2 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .label {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
      }

      .value {
        font-size: 1rem;
        color: #111827;
      }
    }
  `]
})
export class DeviceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private iotService = inject(IotService);
  facade = inject(DevicesFacade);

  deviceForm!: FormGroup;
  isNewMode = false;
  isEditMode = false;
  isSubmitting = false;
  deviceId: string | null = null;

  get currentDevice() {
    return this.facade.currentDevice$();
  }

  ngOnInit(): void {
    this.deviceId = this.route.snapshot.paramMap.get('id');
    this.isNewMode = this.route.snapshot.url.some(segment => segment.path === 'new');
    this.isEditMode = this.route.snapshot.url.some(segment => segment.path === 'edit');

    this.initForm();

    if (this.deviceId && !this.isNewMode) {
      this.loadDevice();
    }
  }

  initForm(): void {
    this.deviceForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(3)]],
      serialNumber: ['', [Validators.required, Validators.minLength(5)]]
    });

    if (!this.isNewMode && !this.isEditMode) {
      this.deviceForm.disable();
    }
  }

  loadDevice(): void {
    if (!this.deviceId) return;

    this.facade.loadDeviceById(this.deviceId).subscribe({
      next: (device) => {
        this.deviceForm.patchValue({
          displayName: device.model || '',
          serialNumber: device.serialNumber
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar dispositivo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (!this.deviceForm.valid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formValue = this.deviceForm.value;

    if (this.isNewMode) {
      // Obtener userId del localStorage
      const token = localStorage.getItem('token');
      let userId = '1761826163261'; // Usuario por defecto

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.userId || payload.sub || userId;
        } catch (e) {
          console.warn('No se pudo decodificar el token, usando userId por defecto');
        }
      }

      // Usar el nuevo servicio IoT para vincular el dispositivo existente
      this.iotService.bindDevice(userId.toString(), formValue.serialNumber, formValue.displayName).subscribe({
        next: () => {
          this.snackBar.open('✅ Dispositivo vinculado exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/iot/devices']);
        },
        error: (err) => {
          console.error('Error al vincular dispositivo:', err);
          let errorMessage = '❌ Error al vincular dispositivo';

          if (err.status === 404) {
            errorMessage = '❌ Dispositivo no encontrado. Verifica que el número de serie sea correcto y que el simulador haya registrado el dispositivo.';
          } else if (err.status === 409) {
            errorMessage = '❌ El dispositivo ya está vinculado a otro usuario.';
          }

          this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
          this.isSubmitting = false;
        }
      });
    } else if (this.isEditMode && this.deviceId) {
      this.facade.updateDevice(this.deviceId, formValue).subscribe({
        next: () => {
          this.snackBar.open('✅ Dispositivo actualizado exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/iot/devices', this.deviceId]);
        },
        error: () => {
          this.snackBar.open('❌ Error al actualizar dispositivo', 'Cerrar', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/iot/devices']);
  }
}

