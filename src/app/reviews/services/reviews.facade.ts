import { Injectable, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

// Domain
import { Review } from '../domain/entities/review.entity';
import { ReviewKpis, ReviewFilters } from '../domain/dtos/review-kpis.dto';
import { ReviewId } from '../domain/value-objects/review-id.vo';

// Repository
import { ReviewsRepository } from '../infrastructure/repositories/reviews.repository';

@Injectable({ providedIn: 'root' })
export class ReviewsFacade {
  private repository = inject(ReviewsRepository);

  // State with signals
  private reviews = signal<Review[]>([]);
  private kpis = signal<ReviewKpis | null>(null);
  private loading = signal<boolean>(false);
  private totalReviews = signal<number>(0);

  // Public getters
  getReviews() { return this.reviews(); }
  getKpis() { return this.kpis(); }
  isLoading() { return this.loading(); }
  getTotalReviews() { return this.totalReviews(); }

  // Load reviews from repository
  loadReviews(filters?: ReviewFilters): Observable<Review[]> {
    this.loading.set(true);

    return this.repository.getReviews(filters).pipe(
      tap(response => {
        this.reviews.set(response.data);
        this.totalReviews.set(response.total);
        this.loading.set(false);
      }),
      map(response => response.data)
    );
  }

  // Load KPIs from repository
  loadKpis(): Observable<ReviewKpis> {
    return this.repository.getReviewsKpis().pipe(
      tap(kpis => this.kpis.set(kpis))
    );
  }

  // Respond to a review
  respondToReview(id: ReviewId, text: string): Observable<boolean> {
    return this.repository.respondReview(id, text).pipe(
      map(() => true),
      tap(() => {
        // Update local state
        const currentReviews = this.reviews();
        const updatedReviews = currentReviews.map(r =>
          r.id.equals(id) ? { ...r, responded: true, responseText: text, responseAt: new Date().toISOString() } : r
        );
        this.reviews.set(updatedReviews);
      })
    );
  }

  // Mark review as read
  markAsRead(id: ReviewId): Observable<boolean> {
    return this.repository.markReviewAsRead(id).pipe(
      map(() => true),
      tap(() => {
        // Update local state
        const currentReviews = this.reviews();
        const updatedReviews = currentReviews.map(r =>
          r.id.equals(id) ? { ...r, readAt: new Date().toISOString() } : r
        );
        this.reviews.set(updatedReviews);
      })
    );
  }

  // Archive a review (hide without deleting)
  archiveReview(id: ReviewId): Observable<boolean> {
    return this.repository.archiveReview(id).pipe(
      map(() => true),
      tap(() => {
        // Remove from local state (filtered out)
        const currentReviews = this.reviews();
        const updatedReviews = currentReviews.filter(r => !r.id.equals(id));
        this.reviews.set(updatedReviews);
        this.totalReviews.set(this.totalReviews() - 1);
      })
    );
  }

  // Export reviews to CSV
  exportReviewsCSV(filters?: ReviewFilters): Observable<Blob> {
    return this.repository.exportReviewsCSV(filters);
  }
}
