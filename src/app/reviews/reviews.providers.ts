import { Provider } from '@angular/core';
import { ReviewsRepositoryPort } from './domain/ports/reviews.repository.port';
import { ReviewsRepository } from './infrastructure/repositories/reviews.repository';

export const REVIEWS_PROVIDERS: Provider[] = [
  {
    provide: ReviewsRepositoryPort,
    useClass: ReviewsRepository
  }
];
