import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReviewsRepositoryPort } from '../../domain/ports/reviews.repository.port';
import { Review } from '../../domain/entities/review.entity';
import { ReviewId } from '../../domain/value-objects/review-id.vo';

@Injectable({ providedIn: 'root' })
export class GetReviewUseCase {
  constructor(private reviewsRepository: ReviewsRepositoryPort) {}

  execute(id: ReviewId): Observable<Review> {
    return this.reviewsRepository.getReview(id);
  }
}
