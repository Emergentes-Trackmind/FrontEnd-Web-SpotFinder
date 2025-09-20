import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay, tap, map } from 'rxjs/operators';
import { ReviewsRepositoryPort } from '../../domain/ports/reviews.repository.port';
import { Review } from '../../domain/entities/review.entity';
import { ReviewKpis, ReviewFilters, ReviewsListResponse } from '../../domain/dtos/review-kpis.dto';
import { ReviewId } from '../../domain/value-objects/review-id.vo';
import { ReviewsApi } from '../http/reviews.api';

@Injectable({ providedIn: 'root' })
export class ReviewsRepository extends ReviewsRepositoryPort {
  private api = inject(ReviewsApi);
  private readonly CACHE_SIZE = 1;
  private readonly CACHE_WINDOW_TIME = 5 * 60 * 1000;

  private readonly shareReplayConfig = {
    bufferSize: this.CACHE_SIZE,
    windowTime: this.CACHE_WINDOW_TIME,
    refCount: true
  };

  getReviews(filters?: ReviewFilters): Observable<ReviewsListResponse> {
    return this.api.getReviews(filters).pipe(
      tap(() => console.log('🔍 Fetching reviews with filters:', filters)),
      map(response => this.transformReviewsResponse(response)),
      shareReplay(this.shareReplayConfig)
    );
  }

  getReviewsKpis(): Observable<ReviewKpis> {
    return this.api.getReviewsKpis().pipe(
      tap(() => console.log('📊 Fetching reviews KPIs')),
      shareReplay(this.shareReplayConfig)
    );
  }

  getReview(id: ReviewId): Observable<Review> {
    return this.api.getReview(id).pipe(
      tap(() => console.log('📋 Fetching review:', id.value)),
      map(review => this.transformReview(review))
    );
  }

  respondReview(id: ReviewId, responseText: string): Observable<Review> {
    return this.api.respondReview(id, responseText).pipe(
      tap(() => console.log('💬 Responding to review:', id.value)),
      map(review => this.transformReview(review))
    );
  }

  markReviewAsRead(id: ReviewId): Observable<Review> {
    return this.api.markReviewAsRead(id).pipe(
      tap(() => console.log('✅ Marking review as read:', id.value)),
      map(review => this.transformReview(review))
    );
  }

  deleteReview(id: ReviewId): Observable<void> {
    return this.api.deleteReview(id).pipe(
      tap(() => console.log('🗑️ Deleting review:', id.value))
    );
  }

  exportReviewsCSV(filters?: ReviewFilters): Observable<Blob> {
    return this.api.exportReviewsCSV(filters).pipe(
      tap(() => console.log('📤 Exporting reviews CSV with filters:', filters))
    );
  }

  private transformReviewsResponse(response: any): ReviewsListResponse {
    if (Array.isArray(response)) {
      return {
        data: response.map(review => this.transformReview(review)),
        total: response.length,
        page: 1,
        pageSize: response.length,
        totalPages: 1
      };
    }

    return {
      ...response,
      data: response.data?.map((review: any) => this.transformReview(review)) || []
    };
  }

  private transformReview(review: any): Review {
    return {
      ...review,
      id: ReviewId.create(review.id), // Convert raw id to ReviewId Value Object
      driver_name: review.drivers?.full_name || review.driver_name,
      user_email: review.drivers?.users?.email || review.user_email,
      parking_name: review.parkings?.name || review.parking_name,
      parking_city: review.parkings?.address?.split(',').pop()?.trim() || review.parking_city,
      driver_avatar: review.drivers?.avatar || review.driver_avatar,
      responded: Boolean(review.responded || review.response_text)
    };
  }
}
