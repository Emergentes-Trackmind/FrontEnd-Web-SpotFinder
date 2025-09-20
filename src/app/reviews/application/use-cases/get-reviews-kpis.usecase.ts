import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReviewsRepositoryPort } from '../../domain/ports/reviews.repository.port';
import { ReviewKpis } from '../../domain/dtos/review-kpis.dto';

@Injectable({ providedIn: 'root' })
export class GetReviewsKpisUseCase {
  constructor(private reviewsRepository: ReviewsRepositoryPort) {}

  execute(): Observable<ReviewKpis> {
    return this.reviewsRepository.getReviewsKpis();
  }
}
