import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReviewsRepositoryPort } from '../../domain/ports/reviews.repository.port';
import { ReviewFilters } from '../../domain/dtos/review-kpis.dto';

@Injectable({ providedIn: 'root' })
export class ExportReviewsCsvUseCase {
  constructor(private reviewsRepository: ReviewsRepositoryPort) {}

  execute(filters?: ReviewFilters): Observable<Blob> {
    return this.reviewsRepository.exportReviewsCSV(filters);
  }

  executeManual(filters?: ReviewFilters): Observable<Blob> {
    // Alternative implementation if backend doesn't support CSV export
    return this.reviewsRepository.getReviews({ ...filters, pageSize: 10000 }).pipe(
      map(response => {
        const csvData = this.convertToCSV(response.data);
        return new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      })
    );
  }

  private convertToCSV(reviews: any[]): string {
    const headers = [
      'id', 'driver', 'email', 'parking', 'rating', 'comment',
      'created_at', 'responded', 'response_text', 'response_at', 'read_at'
    ];

    const csvRows = [
      headers.join(','),
      ...reviews.map(review => [
        review.id.value, // Use .value to extract the ID from ReviewId Value Object
        `"${review.driver_name || ''}"`,
        `"${review.user_email || ''}"`,
        `"${review.parking_name || ''}"`,
        review.rating,
        `"${review.comment.replace(/"/g, '""')}"`,
        review.created_at,
        review.responded,
        `"${review.response_text?.replace(/"/g, '""') || ''}"`,
        review.response_at || '',
        review.read_at || ''
      ].join(','))
    ];

    return csvRows.join('\n');
  }
}
