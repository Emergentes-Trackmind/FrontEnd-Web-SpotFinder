import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Review } from '../../../domain/entities/review.entity';
import { ReviewId } from '../../../domain/value-objects/review-id.vo';

@Component({
  selector: 'app-review-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <mat-card class="review-item">
      <div class="review-header">
        <div class="user-info">
          <div class="user-avatar">
            <img
              *ngIf="getUserAvatar(); else defaultAvatar"
              [src]="getUserAvatar()"
              [alt]="getUserName()"
              class="avatar-img">
            <ng-template #defaultAvatar>
              <mat-icon>person</mat-icon>
            </ng-template>
          </div>
          <div class="user-details">
            <h4 class="user-name">{{ getUserName() }}</h4>
            <p class="parking-name">{{ getParkingName() }}</p>
            <div class="review-meta">
              <div class="rating">
                <mat-icon
                  *ngFor="let star of getStarsArray()"
                  [class]="star <= review.rating ? 'star-filled' : 'star-empty'">
                  star
                </mat-icon>
              </div>
              <span class="review-date">{{ formatDate(getCreatedAt()) }}</span>
            </div>
          </div>
        </div>

        <div class="review-actions">
          <mat-chip
            class="status-chip"
            [class]="getStatusClass()">
            {{ getStatusText() }}
          </mat-chip>

          <button
            mat-icon-button
            [matMenuTriggerFor]="actionsMenu"
            matTooltip="More actions">
            <mat-icon>more_vert</mat-icon>
          </button>

          <mat-menu #actionsMenu="matMenu">
            <button mat-menu-item (click)="onEdit()" *ngIf="canEdit()">
              <mat-icon>edit</mat-icon>
              <span>Edit Response</span>
            </button>
            <button mat-menu-item (click)="onArchive()" *ngIf="canArchive()">
              <mat-icon>visibility_off</mat-icon>
              <span>Ocultar review</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <div class="review-content">
        <p class="review-comment">{{ review.comment }}</p>

        <!-- Show response if exists -->
        <div *ngIf="review.responded && getResponseText()" class="review-response">
          <div class="response-header">
            <mat-icon>reply</mat-icon>
            <span class="response-label">Your Response</span>
            <span class="response-date" *ngIf="getResponseAt()">{{ formatDate(getResponseAt()!) }}</span>
          </div>
          <p class="response-text">{{ getResponseText() }}</p>
        </div>
      </div>

      <div class="review-footer">
        <div class="footer-actions">
          <button
            *ngIf="!review.responded"
            mat-button
            class="respond-btn"
            (click)="onRespond()">
            <mat-icon>reply</mat-icon>
            Respond
          </button>

          <button
            *ngIf="!getReadAt()"
            mat-button
            (click)="onMarkRead()">
            <mat-icon>mark_chat_read</mat-icon>
            Mark as Read
          </button>
        </div>
      </div>
    </mat-card>
  `,
  styleUrl: './review-item.component.css'
})
export class ReviewItemComponent {
  @Input() review!: Review;
  @Output() respond = new EventEmitter<{ id: ReviewId, text: string }>();
  @Output() markAsRead = new EventEmitter<ReviewId>();
  @Output() archive = new EventEmitter<ReviewId>(); // Cambio de delete a archive
  @Output() edit = new EventEmitter<{ id: ReviewId, text: string }>();

  getStarsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  // Helper methods for backward compatibility
  getUserName(): string {
    return this.review.userName || this.review.driver_name || 'Unknown User';
  }

  getUserAvatar(): string | undefined {
    return this.review.userAvatar || this.review.driver_avatar;
  }

  getParkingName(): string {
    return this.review.parkingName || this.review.parking_name || 'Unknown Parking';
  }

  getCreatedAt(): string {
    return this.review.createdAt || this.review.created_at || '';
  }

  getResponseText(): string | null | undefined {
    return this.review.responseText || this.review.response_text;
  }

  getResponseAt(): string | null | undefined {
    return this.review.responseAt || this.review.response_at;
  }

  getReadAt(): string | null | undefined {
    return this.review.readAt || this.review.read_at;
  }

  getStatusClass(): string {
    if (this.review.responded) return 'responded';
    return 'pending';
  }

  getStatusText(): string {
    if (this.review.responded) return 'Responded';
    return 'Pending Response';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  onRespond(): void {
    // Emit event to parent to open dialog
    this.respond.emit({ id: this.review.id, text: '' });
  }

  onMarkRead(): void {
    this.markAsRead.emit(this.review.id);
  }

  onArchive(): void {
    if (confirm('¿Estás seguro de que deseas ocultar esta reseña?\n\nNo se eliminará, solo dejará de mostrarse en tu lista.')) {
      this.archive.emit(this.review.id);
    }
  }

  onEdit(): void {
    // Emit event to parent to open dialog with existing response
    const currentResponse = this.getResponseText() || '';
    this.edit.emit({ id: this.review.id, text: currentResponse });
  }

  canEdit(): boolean {
    return this.review.responded && !!this.getResponseText();
  }

  canArchive(): boolean {
    return true; // Admin siempre puede ocultar cualquier review
  }
}
