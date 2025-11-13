import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Review } from '../../../domain/entities/review.entity';

export interface RespondDialogData {
  review: Review;
}

@Component({
  selector: 'app-respond-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="respond-dialog">
      <h2 mat-dialog-title>
        <mat-icon>reply</mat-icon>
        Responder a la reseña
      </h2>

      <mat-dialog-content>
        <!-- Original Review -->
        <div class="original-review">
          <div class="review-header">
            <div class="user-info">
              <strong>{{ data.review.userName || data.review.driver_name }}</strong>
              <div class="rating">
                <mat-icon *ngFor="let star of getStarsArray()" class="star-icon">
                  {{ star <= data.review.rating ? 'star' : 'star_border' }}
                </mat-icon>
              </div>
            </div>
            <span class="review-date">{{ formatDate(data.review.createdAt || data.review.created_at) }}</span>
          </div>
          <p class="review-comment">{{ data.review.comment }}</p>
        </div>

        <!-- Response Input -->
        <mat-form-field class="response-field" appearance="outline">
          <mat-label>Tu respuesta</mat-label>
          <textarea
            matInput
            [(ngModel)]="responseText"
            placeholder="Escribe tu respuesta al cliente..."
            rows="5"
            maxlength="500"
            required></textarea>
          <mat-hint align="end">{{ responseText.length }}/500</mat-hint>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          Cancelar
        </button>
        <button
          mat-raised-button
          color="primary"
          [disabled]="!responseText.trim()"
          (click)="onSubmit()">
          <mat-icon>send</mat-icon>
          Enviar respuesta
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .respond-dialog {
      min-width: 500px;
      max-width: 600px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      color: #1976d2;
    }

    mat-dialog-content {
      padding: 0 24px;
    }

    .original-review {
      background: #f5f5f5;
      border-left: 4px solid #1976d2;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 24px;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .user-info strong {
      font-size: 1rem;
      color: #333;
    }

    .rating {
      display: flex;
      gap: 2px;
    }

    .star-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #ffa000;
    }

    .review-date {
      font-size: 0.875rem;
      color: #666;
    }

    .review-comment {
      margin: 0;
      color: #555;
      line-height: 1.5;
      font-style: italic;
    }

    .response-field {
      width: 100%;
      margin-top: 8px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
    }

    button[mat-raised-button] {
      min-width: 140px;
    }

    @media (max-width: 600px) {
      .respond-dialog {
        min-width: auto;
        width: 100%;
      }
    }
  `]
})
export class RespondDialogComponent {
  responseText = '';

  constructor(
    public dialogRef: MatDialogRef<RespondDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RespondDialogData
  ) {
    // Pre-fill if editing existing response
    if (data.review.responseText || data.review.response_text) {
      this.responseText = data.review.responseText || data.review.response_text || '';
    }
  }

  getStarsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.responseText.trim()) {
      this.dialogRef.close(this.responseText.trim());
    }
  }
}

