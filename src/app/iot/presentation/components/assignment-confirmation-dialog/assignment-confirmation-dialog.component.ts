import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IotDevice } from '../../../domain/entities/iot-device.entity';
import { SpotData } from '../../../../profileparking/models/spots.models';

export interface AssignmentConfirmationData {
  device: IotDevice;
  spot: SpotData;
  action: 'assign' | 'reassign';
}

/**
 * Diálogo de confirmación para la asignación de dispositivos a plazas
 */
@Component({
  selector: 'app-assignment-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirmation-dialog">
      <div class="dialog-header">
        <mat-icon [color]="getIconColor()" class="confirmation-icon">
          {{ getConfirmationIcon() }}
        </mat-icon>
        <h2 mat-dialog-title>{{ getTitle() }}</h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="confirmation-message">
          <p>{{ getMainMessage() }}</p>

          @if (data.action === 'reassign') {
            <div class="warning-section">
              <mat-icon color="warn">warning</mat-icon>
              <div class="warning-text">
                <strong>¡Atención!</strong>
                <p>Este dispositivo ya está asignado a otra plaza. Al continuar:</p>
                <ul>
                  <li>Se desvinculará de <strong>{{ data.device.parkingSpotLabel }}</strong></li>
                  <li>Se actualizarán sus credenciales automáticamente</li>
                  <li>Los datos históricos se mantendrán intactos</li>
                </ul>
              </div>
            </div>
          }

          <!-- Resumen de la operación -->
          <div class="operation-summary">
            <h3>Resumen de la Operación</h3>

            <div class="summary-item">
              <mat-icon>devices</mat-icon>
              <div class="summary-details">
                <strong>Dispositivo</strong>
                <span>{{ data.device.model || 'Sin nombre' }} ({{ data.device.serialNumber }})</span>
              </div>
            </div>

            <div class="summary-item">
              <mat-icon>{{ getArrowIcon() }}</mat-icon>
              <div class="summary-details">
                <strong>{{ getActionLabel() }}</strong>
                <span>
                  @if (data.action === 'reassign') {
                    De <strong>{{ data.device.parkingSpotLabel }}</strong> → <strong>{{ data.spot.label }}</strong>
                  } @else {
                    A la plaza <strong>{{ data.spot.label }}</strong>
                  }
                </span>
              </div>
            </div>

            <div class="summary-item">
              <mat-icon>local_parking</mat-icon>
              <div class="summary-details">
                <strong>Plaza Destino</strong>
                <span>{{ data.spot.label }} - {{ getSpotStatusLabel(data.spot.status) }}</span>
              </div>
            </div>
          </div>

          @if (data.action === 'assign') {
            <div class="info-section">
              <mat-icon color="primary">info</mat-icon>
              <div class="info-text">
                <p>Una vez confirmada la asignación, el dispositivo comenzará a monitorear esta plaza automáticamente.</p>
              </div>
            </div>
          }
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close>
          <mat-icon>cancel</mat-icon>
          Cancelar
        </button>
        <button
          mat-raised-button
          [color]="getConfirmButtonColor()"
          [mat-dialog-close]="true">
          <mat-icon>{{ getConfirmIcon() }}</mat-icon>
          {{ getConfirmButtonText() }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      width: 100%;
      max-width: 550px;
    }

    .dialog-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem 1.5rem 1rem;
      text-align: center;

      .confirmation-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: 1rem;
      }

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #111827;
      }
    }

    .dialog-content {
      padding: 0 1.5rem 1rem;
    }

    .confirmation-message {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      > p {
        text-align: center;
        font-size: 1rem;
        color: #374151;
        margin: 0;
      }
    }

    .warning-section {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;

      mat-icon {
        flex-shrink: 0;
        margin-top: 0.125rem;
      }

      .warning-text {
        flex: 1;

        strong {
          color: #92400e;
          font-weight: 600;
        }

        p {
          margin: 0.5rem 0;
          color: #78350f;
        }

        ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          color: #78350f;

          li {
            margin-bottom: 0.25rem;
          }
        }
      }
    }

    .info-section {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #eff6ff;
      border: 1px solid #3b82f6;
      border-radius: 8px;

      mat-icon {
        flex-shrink: 0;
        margin-top: 0.125rem;
      }

      .info-text {
        flex: 1;

        p {
          margin: 0;
          color: #1e40af;
        }
      }
    }

    .operation-summary {
      padding: 1rem;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;

      h3 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: #111827;
      }
    }

    .summary-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f3f4f6;

      &:last-child {
        border-bottom: none;
      }

      mat-icon {
        color: #6b7280;
        margin-top: 0.125rem;
        flex-shrink: 0;
      }

      .summary-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        strong {
          font-weight: 600;
          color: #111827;
        }

        span {
          color: #6b7280;
          font-size: 0.875rem;
        }
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
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  `]
})
export class AssignmentConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AssignmentConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssignmentConfirmationData
  ) {}

  getTitle(): string {
    return this.data.action === 'reassign'
      ? 'Confirmar Reasignación'
      : 'Confirmar Asignación';
  }

  getMainMessage(): string {
    return this.data.action === 'reassign'
      ? `¿Estás seguro de que deseas reasignar este dispositivo a la plaza ${this.data.spot.label}?`
      : `¿Estás seguro de que deseas asignar el dispositivo a la plaza ${this.data.spot.label}?`;
  }

  getConfirmationIcon(): string {
    return this.data.action === 'reassign' ? 'swap_horiz' : 'link';
  }

  getIconColor(): string {
    return this.data.action === 'reassign' ? 'warn' : 'primary';
  }

  getArrowIcon(): string {
    return this.data.action === 'reassign' ? 'swap_horiz' : 'arrow_forward';
  }

  getActionLabel(): string {
    return this.data.action === 'reassign' ? 'Mover dispositivo' : 'Asignar a';
  }

  getConfirmButtonColor(): string {
    return this.data.action === 'reassign' ? 'warn' : 'primary';
  }

  getConfirmIcon(): string {
    return this.data.action === 'reassign' ? 'swap_horiz' : 'check';
  }

  getConfirmButtonText(): string {
    return this.data.action === 'reassign' ? 'Reasignar' : 'Confirmar Asignación';
  }

  getSpotStatusLabel(status: string): string {
    const labels = {
      AVAILABLE: 'Disponible',
      UNASSIGNED: 'Sin asignar',
      OCCUPIED: 'Ocupado',
      MAINTENANCE: 'Mantenimiento'
    };
    return labels[status as keyof typeof labels] || status;
  }
}
