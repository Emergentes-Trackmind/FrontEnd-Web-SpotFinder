import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

export interface SpotsConfirmDialogData {
  totalSpots: number;
  spotsPreview: string[];
}

@Component({
  selector: 'app-spots-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <div class="spots-confirm-dialog">
      <h2 mat-dialog-title>
        <mat-icon>add_location</mat-icon>
        Confirmar creación de plazas
      </h2>

      <mat-dialog-content>
        <div class="confirmation-message">
          <p>Está a punto de crear <strong>{{ data.totalSpots }} plazas</strong> automáticamente.</p>
          <p>Las plazas se generarán con los siguientes identificadores:</p>

          <div class="spots-preview">
            <div class="preview-header">
              <mat-icon>preview</mat-icon>
              <span>Vista previa (primeras 20 plazas):</span>
            </div>
            <div class="spots-grid">
              <span
                *ngFor="let spot of data.spotsPreview.slice(0, 20)"
                class="spot-label">
                {{ spot }}
              </span>
              <span *ngIf="data.totalSpots > 20" class="more-spots">
                ... y {{ data.totalSpots - 20 }} más
              </span>
            </div>
          </div>

          <div class="warning-note">
            <mat-icon color="warn">info</mat-icon>
            <p>Esta acción creará las plazas permanentemente. ¿Desea continuar?</p>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button
          mat-button
          (click)="onCancel()"
          class="cancel-button">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="onConfirm()"
          class="confirm-button">
          <mat-icon>check</mat-icon>
          Crear {{ data.totalSpots }} plazas
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .spots-confirm-dialog {
      min-width: 500px;
      max-width: 600px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: #1976d2;
    }

    .confirmation-message {
      line-height: 1.6;
    }

    .spots-preview {
      margin: 20px 0;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .preview-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-weight: 500;
      color: #333;
    }

    .spots-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .spot-label {
      background-color: #1976d2;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      min-width: 30px;
      text-align: center;
    }

    .more-spots {
      color: #666;
      font-style: italic;
      align-self: center;
      padding: 4px 8px;
    }

    .warning-note {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-top: 20px;
      padding: 12px;
      background-color: #fff3e0;
      border-radius: 4px;
      border-left: 4px solid #ff9800;
    }

    .warning-note p {
      margin: 0;
      color: #e65100;
      font-weight: 500;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
      gap: 12px;
    }

    .cancel-button {
      color: #666;
    }

    .confirm-button {
      background-color: #4caf50 !important;
    }

    .confirm-button mat-icon,
    .cancel-button mat-icon {
      margin-right: 4px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class SpotsConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SpotsConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SpotsConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
