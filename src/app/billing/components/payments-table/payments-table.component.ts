import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { PaymentRow } from '../../models/billing.models';

@Component({
  selector: 'app-payments-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="payments-table-container">
      <h2>Historial de Pagos</h2>

      <div class="table-wrapper" *ngIf="rows && rows.length > 0">
        <table mat-table [dataSource]="rows" class="payments-table">
          <!-- Columna Fecha -->
          <ng-container matColumnDef="paidAt">
            <th mat-header-cell *matHeaderCellDef>Fecha</th>
            <td mat-cell *matCellDef="let row">
              {{ row.paidAt | date: 'dd/MM/yyyy HH:mm' }}
            </td>
          </ng-container>

          <!-- Columna Monto -->
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Monto</th>
            <td mat-cell *matCellDef="let row">
              <strong>{{ row.currency === 'EUR' ? '€' : '$' }}{{ row.amount }}</strong>
            </td>
          </ng-container>

          <!-- Columna Estado -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip [class]="'payment-status-' + row.status.toLowerCase()">
                {{ getStatusLabel(row.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Columna ID Transacción -->
          <ng-container matColumnDef="transactionId">
            <th mat-header-cell *matHeaderCellDef>ID Transacción</th>
            <td mat-cell *matCellDef="let row">
              <code class="transaction-id">{{ row.transactionId }}</code>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>

      <!-- Estado vacío -->
      <div class="empty-state" *ngIf="!rows || rows.length === 0">
        <mat-icon>receipt_long</mat-icon>
        <p>No hay pagos registrados</p>
      </div>
    </div>
  `,
  styles: [`
    .payments-table-container {
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }

    h2 {
      margin: 0 0 24px 0;
      font-size: 20px;
      font-weight: 600;
      color: #111827;
    }

    .table-wrapper {
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
    }

    .payments-table {
      width: 100%;
      background: white;
    }

    .payments-table th {
      background-color: #F9FAFB;
      font-weight: 600;
      color: #111827;
      padding: 16px;
    }

    .payments-table td {
      padding: 16px;
      color: #6B7280;
    }

    .payments-table tr:hover {
      background-color: #F9FAFB;
    }

    mat-chip {
      font-weight: 600;
      font-size: 12px;
    }

    .payment-status-succeeded {
      background-color: #10B981 !important;
      color: white !important;
    }

    .payment-status-failed {
      background-color: #EF4444 !important;
      color: white !important;
    }

    .payment-status-pending {
      background-color: #F59E0B !important;
      color: white !important;
    }

    .transaction-id {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      background: #F3F4F6;
      padding: 4px 8px;
      border-radius: 4px;
      color: #6B7280;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #6B7280;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state p {
      font-size: 16px;
      margin: 0;
    }

    @media (max-width: 768px) {
      .payments-table-container {
        padding: 16px;
      }

      .payments-table th,
      .payments-table td {
        padding: 12px 8px;
        font-size: 14px;
      }

      .transaction-id {
        font-size: 11px;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
      }
    }
  `]
})
export class PaymentsTableComponent {
  @Input() rows: PaymentRow[] = [];

  displayedColumns: string[] = ['paidAt', 'amount', 'status', 'transactionId'];

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'SUCCEEDED': 'EXITOSO',
      'FAILED': 'FALLIDO',
      'PENDING': 'PENDIENTE'
    };
    return labels[status] || status;
  }
}

