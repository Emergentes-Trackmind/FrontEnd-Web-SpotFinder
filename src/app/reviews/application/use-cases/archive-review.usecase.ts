import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReviewsRepositoryPort } from '../../domain/ports/reviews.repository.port';
import { ReviewId } from '../../domain/value-objects/review-id.vo';
import { Review } from '../../domain/entities/review.entity';

@Injectable({ providedIn: 'root' })
export class ArchiveReviewUseCase {
  constructor(private reviewsRepository: ReviewsRepositoryPort) {}

  execute(id: ReviewId): Observable<Review> {
    return this.reviewsRepository.archiveReview(id);
  }
}
