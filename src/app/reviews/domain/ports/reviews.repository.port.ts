import { Observable } from 'rxjs';
import { Review } from '../entities/review.entity';
import { ReviewKpis, ReviewFilters, ReviewsListResponse } from '../dtos/review-kpis.dto';
import { ReviewId } from '../value-objects/review-id.vo';

export abstract class ReviewsRepositoryPort {
  abstract getReviews(filters?: ReviewFilters): Observable<ReviewsListResponse>;
  abstract getReviewsKpis(): Observable<ReviewKpis>;
  abstract getReview(id: ReviewId): Observable<Review>;
  abstract respondReview(id: ReviewId, responseText: string): Observable<Review>;
  abstract markReviewAsRead(id: ReviewId): Observable<Review>;
  abstract deleteReview(id: ReviewId): Observable<void>;
  abstract exportReviewsCSV(filters?: ReviewFilters): Observable<Blob>;
}
