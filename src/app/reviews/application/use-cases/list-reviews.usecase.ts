import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReviewsRepositoryPort } from '../../domain/ports/reviews.repository.port';
import { ReviewFilters, ReviewsListResponse } from '../../domain/dtos/review-kpis.dto';

@Injectable({ providedIn: 'root' })
export class ListReviewsUseCase {
  constructor(private reviewsRepository: ReviewsRepositoryPort) {}

  execute(filters?: ReviewFilters): Observable<ReviewsListResponse> {
    return this.reviewsRepository.getReviews(filters);
  }
}
