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
              <mat-label>Número de Serie</mat-label>
              <input matInput formControlName="serialNumber" [readonly]="!isNewMode">
            </mat-form-field>

            <mat-form-field>
              <mat-label>Modelo</mat-label>
              <input matInput formControlName="model">
            </mat-form-field>

            <mat-form-field>
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="type">
                <mat-option value="sensor">Sensor</mat-option>
                <mat-option value="camera">Cámara</mat-option>
                <mat-option value="barrier">Barrera</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Parking</mat-label>
              <mat-select formControlName="parkingId">
                <mat-option value="1">Parking Centro Comercial</mat-option>
                <mat-option value="2">Parking Plaza Mayor</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Spot (opcional)</mat-label>
              <input matInput formControlName="parkingSpotId" placeholder="Dejar vacío si no aplica">
            </mat-form-field>

            @if (!isNewMode) {
              <mat-form-field>
                <mat-label>Estado</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="online">Online</mat-option>
                  <mat-option value="offline">Offline</mat-option>
                  <mat-option value="maintenance">Mantenimiento</mat-option>
                </mat-select>
              </mat-form-field>
            }
          </div>

          <div class="actions">
            <button mat-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="!deviceForm.valid || isSubmitting">
              {{ isNewMode ? 'Crear' : 'Guardar' }}
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
      serialNumber: ['', Validators.required],
      model: ['', Validators.required],
      type: ['sensor', Validators.required],
      parkingId: ['', Validators.required],
      parkingSpotId: [''],
      status: ['offline']
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
          serialNumber: device.serialNumber,
          model: device.model,
          type: device.type,
          parkingId: device.parkingId,
          parkingSpotId: device.parkingSpotId || '',
          status: device.status
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
      this.facade.createDevice(formValue).subscribe({
        next: () => {
          this.snackBar.open('Dispositivo creado exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/iot/devices']);
        },
        error: () => {
          this.snackBar.open('Error al crear dispositivo', 'Cerrar', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
    } else if (this.isEditMode && this.deviceId) {
      this.facade.updateDevice(this.deviceId, formValue).subscribe({
        next: () => {
          this.snackBar.open('Dispositivo actualizado exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/iot/devices', this.deviceId]);
        },
        error: () => {
          this.snackBar.open('Error al actualizar dispositivo', 'Cerrar', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/iot/devices']);
  }
}

