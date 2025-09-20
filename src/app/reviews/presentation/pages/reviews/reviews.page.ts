import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// Components
import { ReviewsKpisComponent } from '../../components/reviews-kpis/reviews-kpis.component';
import { ReviewItemComponent } from '../../components/review-item/review-item.component';

// Services & Domain
import { ReviewKpis } from '../../../domain/dtos/review-kpis.dto';
import { Review } from '../../../domain/entities/review.entity';
import { ReviewsFacade } from '../../../services/reviews.facade';
import { ReviewStatus, ReviewRating } from '../../../domain/enums/review-status.enum';
import { ReviewId } from '../../../domain/value-objects/review-id.vo';

@Component({
  selector: 'app-reviews-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSnackBarModule,
    ReviewsKpisComponent,
    ReviewItemComponent
  ],
  template: `
    <div class="reviews-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Reviews</h1>
          <p class="page-subtitle">Manage customer reviews and ratings</p>
        </div>
      </div>

      <!-- KPIs Section -->
      <app-reviews-kpis
        [kpis]="kpis()"
        [loading]="loading()">
      </app-reviews-kpis>

      <!-- Search and Filters Section -->
      <mat-card class="search-filters-card">
        <div class="search-section">
          <!-- Search Bar -->
          <mat-form-field class="search-field" appearance="outline">
            <mat-label>Search reviews...</mat-label>
            <input
              matInput
              [(ngModel)]="searchQuery"
              (input)="onSearchChange()"
              placeholder="Search by user, comment, parking">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button
              mat-button
              (click)="openFiltersDialog()">
              <mat-icon>tune</mat-icon>
              Filters
            </button>
            <button
              mat-raised-button
              color="accent"
              (click)="exportCSV()">
              <mat-icon>download</mat-icon>
              Export CSV
            </button>
          </div>
        </div>

        <!-- Filter Chips -->
        <div class="filter-chips">
          <!-- Status Chips -->
          <mat-chip-set>
            <mat-chip
              *ngFor="let status of statusOptions"
              [class.selected]="selectedStatus() === status.value"
              (click)="filterByStatus(status.value)">
              {{ status.label }}
              <span *ngIf="status.value === 'ALL'">({{ totalReviews() }})</span>
            </mat-chip>
          </mat-chip-set>

          <!-- Rating Chips -->
          <div class="rating-chips">
            <span class="chips-label">Rating:</span>
            <mat-chip-set>
              <mat-chip
                *ngFor="let rating of ratingOptions"
                [class.selected]="selectedRating() === rating"
                (click)="filterByRating(rating)">
                <mat-icon>star</mat-icon>
                {{ rating }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>
      </mat-card>

      <!-- Loading Bar -->
      <mat-progress-bar
        *ngIf="loading()"
        mode="indeterminate"
        class="loading-bar">
      </mat-progress-bar>

      <!-- Reviews List -->
      <div class="reviews-section">
        <div class="section-header">
          <h2 class="section-title">Recent Reviews</h2>
          <div class="results-info">
            Total: {{ totalReviews() }} reviews
          </div>
        </div>

        <!-- Reviews List -->
        <div class="reviews-list" *ngIf="reviews().length > 0; else emptyState">
          <app-review-item
            *ngFor="let review of reviews()"
            [review]="review"
            (respond)="onRespondToReview($event)"
            (markAsRead)="onMarkAsRead($event)"
            (delete)="onDeleteReview($event)"
            (edit)="onEditResponse($event)">
          </app-review-item>
        </div>

        <!-- Empty State -->
        <ng-template #emptyState>
          <mat-card class="empty-state">
            <div class="empty-content">
              <mat-icon class="empty-icon">rate_review</mat-icon>
              <h3 class="empty-title">No reviews found</h3>
              <p class="empty-message">Reviews from customers will appear here</p>
              <button
                *ngIf="hasActiveFilters()"
                mat-button
                color="primary"
                (click)="clearFilters()">
                Clear Filters
              </button>
            </div>
          </mat-card>
        </ng-template>

        <!-- Pagination -->
        <mat-paginator
          *ngIf="reviews().length > 0"
          [length]="totalReviews()"
          [pageSize]="pageSize()"
          [pageIndex]="currentPage()"
          [pageSizeOptions]="[5, 10, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styleUrl: './reviews.page.css'
})
export class ReviewsPage implements OnInit {
  private reviewsFacadeService = inject(ReviewsFacade);
  private snackBar = inject(MatSnackBar);

  // Local signals
  searchQuery = '';
  selectedStatus = signal<ReviewStatus>(ReviewStatus.ALL);
  selectedRating = signal<number | null>(null);
  reviews = signal<Review[]>([]);
  kpis = signal<ReviewKpis | null>(null);
  loading = signal<boolean>(false);
  totalReviews = signal<number>(0);

  // Pagination signals
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);

  // Options for chips using enums
  statusOptions = [
    { label: 'All', value: ReviewStatus.ALL },
    { label: 'Pending Response', value: ReviewStatus.PENDING_RESPONSE },
    { label: 'Responded', value: ReviewStatus.RESPONDED }
  ];

  ratingOptions = [
    ReviewRating.FIVE,
    ReviewRating.FOUR,
    ReviewRating.THREE,
    ReviewRating.TWO,
    ReviewRating.ONE
  ];

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loadReviews();
    this.loadKpis();
  }

  loadReviews(page?: number, pageSize?: number): void {
    this.loading.set(true);

    // Build filters with pagination
    const filters = {
      status: this.selectedStatus() !== ReviewStatus.ALL ? this.selectedStatus() : undefined,
      rating: this.selectedRating() || undefined,
      searchQuery: this.searchQuery || undefined,
      page: page !== undefined ? page + 1 : this.currentPage() + 1, // Convert to 1-based index
      pageSize: pageSize || this.pageSize()
    };

    this.reviewsFacadeService.loadReviews(filters).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.totalReviews.set(this.reviewsFacadeService.getTotalReviews());
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.loading.set(false);
        this.snackBar.open('Error loading reviews', 'Close', { duration: 3000 });
      }
    });
  }

  loadKpis(): void {
    this.reviewsFacadeService.loadKpis().subscribe({
      next: (kpis) => {
        this.kpis.set(kpis);
      },
      error: (error) => {
        console.error('Error loading KPIs:', error);
        this.snackBar.open('Error loading KPIs', 'Close', { duration: 3000 });
      }
    });
  }

  onSearchChange(): void {
    console.log('Search:', this.searchQuery);
    // Reset to first page when searching
    this.currentPage.set(0);
    this.loadReviews(0);
  }

  filterByStatus(status: ReviewStatus): void {
    this.selectedStatus.set(status);
    console.log('Filter by status:', status);
    // Reset to first page when filtering
    this.currentPage.set(0);
    this.loadReviews(0);
  }

  filterByRating(rating: number): void {
    const newRating = this.selectedRating() === rating ? null : rating;
    this.selectedRating.set(newRating);
    console.log('Filter by rating:', newRating);
    // Reset to first page when filtering
    this.currentPage.set(0);
    this.loadReviews(0);
  }

  openFiltersDialog(): void {
    console.log('Open filters dialog');
    this.snackBar.open('Advanced filters coming soon', 'Close', { duration: 3000 });
  }

  onRespondToReview(event: { id: ReviewId, text: string }): void {
    this.reviewsFacadeService.respondToReview(event.id, event.text).subscribe({
      next: (success) => {
        if (success) {
          this.snackBar.open('Response sent successfully', 'Close', { duration: 3000 });
          this.loadReviews(); // Refresh the list
        }
      },
      error: (error) => {
        console.error('Error responding to review:', error);
        this.snackBar.open('Error sending response', 'Close', { duration: 3000 });
      }
    });
  }

  onMarkAsRead(id: ReviewId): void {
    this.reviewsFacadeService.markAsRead(id).subscribe({
      next: (success) => {
        if (success) {
          this.snackBar.open('Review marked as read', 'Close', { duration: 3000 });
          this.loadReviews(); // Refresh the list
        }
      },
      error: (error) => {
        console.error('Error marking as read:', error);
        this.snackBar.open('Error marking as read', 'Close', { duration: 3000 });
      }
    });
  }

  onDeleteReview(id: ReviewId): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewsFacadeService.deleteReview(id).subscribe({
        next: (success) => {
          if (success) {
            this.snackBar.open('Review deleted successfully', 'Close', { duration: 3000 });
            this.loadReviews(); // Refresh the list
          }
        },
        error: (error) => {
          console.error('Error deleting review:', error);
          this.snackBar.open('Error deleting review', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onEditResponse(event: { id: ReviewId, text: string }): void {
    this.reviewsFacadeService.respondToReview(event.id, event.text).subscribe({
      next: (success) => {
        if (success) {
          this.snackBar.open('Response updated successfully', 'Close', { duration: 3000 });
          this.loadReviews(); // Refresh the list
        }
      },
      error: (error) => {
        console.error('Error editing response:', error);
        this.snackBar.open('Error updating response', 'Close', { duration: 3000 });
      }
    });
  }

  async exportCSV(): Promise<void> {
    this.reviewsFacadeService.exportReviewsCSV().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'reviews.csv';
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Export completed', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error exporting CSV:', error);
        this.snackBar.open('Error exporting reviews', 'Close', { duration: 3000 });
      }
    });
  }

  hasActiveFilters(): boolean {
    return this.searchQuery !== '' ||
           this.selectedStatus() !== ReviewStatus.ALL ||
           this.selectedRating() !== null;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus.set(ReviewStatus.ALL);
    this.selectedRating.set(null);
    this.currentPage.set(0); // Reset to first page
    this.loadReviews(0);
  }

  onPageChange(event: PageEvent): void {
    console.log('Page change:', event);

    // Update pagination state
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);

    // Load reviews for the new page
    this.loadReviews(event.pageIndex, event.pageSize);
  }
}
