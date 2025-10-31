import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BillingApiClient } from '../../services/billing-api.client';
import { Plan } from '../../models/billing.models';

export interface UpgradeDialogData {
  type: 'parking' | 'iot';
  plan: Plan;
  priceId: string;
}

@Component({
  selector: 'app-upgrade-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="upgrade-dialog">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2 mat-dialog-title>Límite Alcanzado</h2>
      </div>

      <mat-dialog-content>
        <p class="message">
          Has alcanzado el límite de tu plan actual.
          <strong *ngIf="data.type === 'parking'">
            No puedes crear más parkings.
          </strong>
          <strong *ngIf="data.type === 'iot'">
            No puedes agregar más dispositivos IoT.
          </strong>
        </p>

        <div class="upgrade-offer">
          <mat-icon>workspace_premium</mat-icon>
          <div class="offer-content">
            <h3>Actualiza a {{ data.plan.name }}</h3>
            <p>
              <strong *ngIf="data.type === 'parking'">
                Hasta {{ data.plan.parkingLimit }} parkings
              </strong>
              <strong *ngIf="data.type === 'iot'">
                Hasta {{ data.plan.iotLimit }} dispositivos IoT
              </strong>
            </p>
            <p class="price">
              Por solo {{ data.plan.currency === 'EUR' ? '€' : '$' }}{{ data.plan.price }}/mes
            </p>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          Cancelar
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="onUpgrade()"
          [disabled]="isLoading">
          <mat-icon *ngIf="!isLoading">upgrade</mat-icon>
          {{ isLoading ? 'Procesando...' : 'Actualizar Ahora' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .upgrade-dialog {
      padding: 8px;
    }

    .dialog-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 16px;
    }

    .warning-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #F59E0B;
      margin-bottom: 16px;
    }

    h2 {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 0;
      text-align: center;
    }

    mat-dialog-content {
      padding: 24px 0;
    }

    .message {
      font-size: 16px;
      color: #6B7280;
      text-align: center;
      margin: 0 0 24px 0;
      line-height: 1.6;
    }

    .message strong {
      color: #111827;
      display: block;
      margin-top: 8px;
    }

    .upgrade-offer {
      display: flex;
      gap: 16px;
      padding: 20px;
      background: linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%);
      border: 2px solid #6D5AE6;
      border-radius: 12px;
      align-items: center;
    }

    .upgrade-offer > mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #6D5AE6;
      flex-shrink: 0;
    }

    .offer-content h3 {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .offer-content p {
      font-size: 14px;
      color: #6B7280;
      margin: 4px 0;
    }

    .offer-content strong {
      color: #6D5AE6;
      font-weight: 600;
    }

    .price {
      font-size: 20px !important;
      font-weight: 700 !important;
      color: #111827 !important;
      margin-top: 12px !important;
    }

    mat-dialog-actions {
      padding: 24px 0 8px 0;
      gap: 12px;
    }

    mat-dialog-actions button {
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
    }

    mat-dialog-actions button mat-icon {
      margin-right: 8px;
    }
  `]
})
export class UpgradeDialogComponent {
  private billingApi = inject(BillingApiClient);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<UpgradeDialogComponent>);

  isLoading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: UpgradeDialogData) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  async onUpgrade(): Promise<void> {
    this.isLoading = true;

    try {
      console.log('🔄 Creando sesión de Checkout...', { priceId: this.data.priceId });

      const response = await this.billingApi.createCheckoutSession(this.data.priceId).toPromise();

      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      // Redirigir a Stripe Checkout usando la URL
      if (response.url) {
        console.log('✅ Redirigiendo a Stripe Checkout:', response.url);
        window.location.href = response.url;
      } else if (response.sessionId) {
        console.log('⚠️ Recibido sessionId sin URL. El backend debe devolver la URL completa.');
        throw new Error('El servidor debe devolver una URL de checkout');
      } else {
        throw new Error('No se recibió URL ni sessionId del servidor');
      }

    } catch (error: any) {
      console.error('❌ Error al crear sesión de Checkout:', error);
      this.snackBar.open(
        error.message || 'Error al procesar la actualización. Intenta de nuevo.',
        'Cerrar',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
      this.isLoading = false;
    }
  }
}
