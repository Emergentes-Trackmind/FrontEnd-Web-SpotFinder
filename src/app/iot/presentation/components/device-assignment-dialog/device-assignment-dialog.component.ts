import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { IotDevice } from '../../../domain/entities/iot-device.entity';
import { SpotData } from '../../../../profileparking/models/spots.models';
import { SpotsService } from '../../../../profileparking/services/spots.service';
import { DevicesFacade } from '../../../services/devices.facade';

export interface DeviceAssignmentData {
  device: IotDevice;
  parkingId: string;
}

export interface AssignmentResult {
  device: IotDevice;
  assignedSpot: SpotData;
  action: 'assign' | 'reassign';
}

/**
 * Modal para asignar dispositivos IoT a plazas específicas
 */
@Component({
  selector: 'app-device-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="assignment-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>link</mat-icon>
          Asignar Dispositivo a Plaza
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <!-- Información del dispositivo -->
        <div class="device-info">
          <h3>Dispositivo Seleccionado</h3>
          <div class="device-card">
            <div class="device-details">
              <strong>{{ data.device.model || 'Sin nombre' }}</strong>
              <span class="serial">{{ data.device.serialNumber }}</span>
              <div class="device-type">
                <mat-icon>{{ getDeviceIcon(data.device.type) }}</mat-icon>
                {{ getDeviceTypeLabel(data.device.type) }}
              </div>
            </div>
            @if (data.device.parkingSpotLabel) {
              <div class="current-assignment">
                <mat-icon color="warn">warning</mat-icon>
                <span>Actualmente asignado a: <strong>{{ data.device.parkingSpotLabel }}</strong></span>
              </div>
            }
          </div>
        </div>

        <!-- Formulario de asignación -->
        <form [formGroup]="assignmentForm" class="assignment-form">
          <mat-form-field appearance="outline" class="spot-selector">
            <mat-label>Seleccionar Plaza</mat-label>
            <mat-select formControlName="spotId" [disabled]="loading">
              <mat-option value="">-- Seleccione una plaza --</mat-option>
              @for (spot of availableSpots; track spot.id) {
                <mat-option [value]="spot.id">
                  <div class="spot-option">
                    <mat-icon class="spot-icon">local_parking</mat-icon>
                    <span class="spot-label">{{ spot.label }}</span>
                    <span class="spot-status">{{ getSpotStatusLabel(spot.status) }}</span>
                  </div>
                </mat-option>
              }
            </mat-select>
            <mat-hint>Solo se muestran las plazas disponibles</mat-hint>
          </mat-form-field>

          @if (assignmentForm.get('spotId')?.errors?.['required'] && assignmentForm.get('spotId')?.touched) {
            <div class="error-message">
              <mat-icon color="warn">error</mat-icon>
              Debe seleccionar una plaza
            </div>
          }
        </form>

        @if (loading) {
          <div class="loading-state">
            <mat-progress-spinner diameter="40"></mat-progress-spinner>
            <p>Cargando plazas disponibles...</p>
          </div>
        }

        @if (availableSpots.length === 0 && !loading) {
          <div class="empty-state">
            <mat-icon>info</mat-icon>
            <p>No hay plazas disponibles para asignar</p>
            <small>Todas las plazas están ocupadas o reservadas</small>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close>
          Cancelar
        </button>
        <button
          mat-raised-button
          color="primary"
          [disabled]="assignmentForm.invalid || loading"
          (click)="onConfirmAssignment()">
          <mat-icon>link</mat-icon>
          {{ getActionButtonText() }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .assignment-dialog {
      width: 100%;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem 0;

      h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        color: #111827;
        font-size: 1.25rem;
        font-weight: 600;
      }
    }

    .dialog-content {
      padding: 1.5rem;
      max-height: 60vh;
      overflow-y: auto;
    }

    .device-info {
      margin-bottom: 2rem;

      h3 {
        color: #374151;
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }
    }

    .device-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
    }

    .device-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      strong {
        font-size: 1rem;
        color: #111827;
      }

      .serial {
        font-size: 0.875rem;
        color: #6b7280;
        font-family: monospace;
      }

      .device-type {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #4f46e5;
        font-size: 0.875rem;
        font-weight: 500;
      }
    }

    .current-assignment {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.75rem;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #92400e;
    }

    .assignment-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .spot-selector {
      width: 100%;
    }

    .spot-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;

      .spot-icon {
        color: #10b981;
        font-size: 1.25rem;
      }

      .spot-label {
        font-weight: 600;
        color: #111827;
      }

      .spot-status {
        font-size: 0.75rem;
        color: #6b7280;
        margin-left: auto;
      }
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      color: #6b7280;

      mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        margin-bottom: 1rem;
      }

      p {
        margin: 0;
        font-size: 1rem;
        font-weight: 500;
      }

      small {
        margin-top: 0.5rem;
        font-size: 0.875rem;
      }
    }

    .dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;

      button {
        min-width: 120px;
      }
    }
  `]
})
export class DeviceAssignmentDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private spotsService = inject(SpotsService);
  private snackBar = inject(MatSnackBar);

  assignmentForm!: FormGroup;
  availableSpots: SpotData[] = [];
  loading = true;

  constructor(
    public dialogRef: MatDialogRef<DeviceAssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeviceAssignmentData
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadAvailableSpots();
  }

  private initializeForm(): void {
    this.assignmentForm = this.fb.group({
      spotId: ['', Validators.required]
    });
  }

  private loadAvailableSpots(): void {
    this.loading = true;

    this.spotsService.loadSpotsForParking(this.data.parkingId).subscribe({
      next: () => {
        // Filtrar solo plazas disponibles
        this.spotsService.spots$.subscribe(allSpots => {
          this.availableSpots = allSpots.filter(spot =>
            spot.status === 'AVAILABLE'
          );
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Error cargando plazas:', error);
        this.snackBar.open('Error cargando plazas disponibles', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onConfirmAssignment(): void {
    if (this.assignmentForm.invalid) return;

    const selectedSpotId = this.assignmentForm.get('spotId')?.value;
    const selectedSpot = this.availableSpots.find(spot => spot.id === selectedSpotId);

    if (!selectedSpot) {
      this.snackBar.open('Plaza seleccionada no válida', 'Cerrar', { duration: 3000 });
      return;
    }

    const action = this.data.device.parkingSpotLabel ? 'reassign' : 'assign';

    const result: AssignmentResult = {
      device: this.data.device,
      assignedSpot: selectedSpot,
      action
    };

    this.dialogRef.close(result);
  }

  getDeviceIcon(type: string): string {
    const icons = {
      sensor: 'sensors',
      camera: 'videocam',
      barrier: 'security'
    };
    return icons[type as keyof typeof icons] || 'device_unknown';
  }

  getDeviceTypeLabel(type: string): string {
    const labels = {
      sensor: 'Sensor',
      camera: 'Cámara',
      barrier: 'Barrera'
    };
    return labels[type as keyof typeof labels] || type;
  }

  getSpotStatusLabel(status: string): string {
    const labels = {
      AVAILABLE: 'Disponible',
      OCCUPIED: 'Ocupado',
      RESERVED: 'Reservado'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getActionButtonText(): string {
    return this.data.device.parkingSpotLabel ? 'Reasignar Dispositivo' : 'Asignar Dispositivo';
  }
}
