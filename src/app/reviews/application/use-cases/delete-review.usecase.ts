import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReviewsRepositoryPort } from '../../domain/ports/reviews.repository.port';
import { ReviewId } from '../../domain/value-objects/review-id.vo';

@Injectable({ providedIn: 'root' })
export class DeleteReviewUseCase {
  constructor(private reviewsRepository: ReviewsRepositoryPort) {}

  execute(id: ReviewId): Observable<void> {
    return this.reviewsRepository.deleteReview(id);
  }
}
