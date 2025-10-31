import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DeleteConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  parkingCount: number;
}

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="delete-confirm-dialog">
      <h2 mat-dialog-title>
        <mat-icon color="warn">warning</mat-icon>
        {{ data.title }}
      </h2>

      <mat-dialog-content>
        <p class="message">{{ data.message }}</p>
        <p class="count" *ngIf="data.parkingCount > 0">
          Se eliminarán <strong>{{ data.parkingCount }}</strong> parking{{ data.parkingCount > 1 ? 's' : '' }}.
        </p>
        <p class="warning">Esta acción no se puede deshacer.</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText }}
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()" cdkFocusInitial>
          {{ data.confirmText }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .delete-confirm-dialog {
      h2 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 20px;
        font-weight: 500;

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
        }
      }

      mat-dialog-content {
        padding: 20px 0;

        .message {
          font-size: 16px;
          color: rgba(0, 0, 0, 0.87);
          margin: 0 0 12px 0;
        }

        .count {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.6);
          margin: 0 0 12px 0;

          strong {
            color: #f44336;
            font-weight: 600;
          }
        }

        .warning {
          font-size: 13px;
          color: rgba(0, 0, 0, 0.5);
          font-style: italic;
          margin: 0;
        }
      }

      mat-dialog-actions {
        padding: 16px 0 0 0;
        gap: 12px;
      }
    }
  `]
})
export class DeleteConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

