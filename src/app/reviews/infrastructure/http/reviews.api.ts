import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Review } from '../../domain/entities/review.entity';
import { ReviewKpis, ReviewFilters, ReviewsListResponse } from '../../domain/dtos/review-kpis.dto';
import { ReviewId } from '../../domain/value-objects/review-id.vo';
import { ReviewStatus } from '../../domain/enums/review-status.enum';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewsApi {
  private http = inject(HttpClient);
  private baseUrl = environment.api?.reviews?.base || `${environment.api?.base || 'http://localhost:3000/api'}/reviews`;

  getReviews(filters?: ReviewFilters): Observable<ReviewsListResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.searchQuery) params = params.set('q', filters.searchQuery);
      if (filters.status && filters.status !== ReviewStatus.ALL) {
        params = params.set('status', filters.status);
      }
      if (filters.rating) params = params.set('rating_gte', filters.rating.toString());
      if (filters.parkingId) params = params.set('parkings_id', filters.parkingId.toString());
      if (filters.dateFrom) params = params.set('created_at_gte', filters.dateFrom);
      if (filters.dateTo) params = params.set('created_at_lte', filters.dateTo);
      if (filters.page) params = params.set('_page', filters.page.toString());
      if (filters.pageSize) params = params.set('_limit', filters.pageSize.toString());
      if (filters.sortBy) params = params.set('_sort', filters.sortBy);
    }

    // For json-server with relationships
    params = params.set('_expand', 'drivers');
    params = params.set('_expand', 'parkings');

    return this.http.get<any>(this.baseUrl, { params }).pipe(
      map(response => this.mapToReviewsListResponse(response))
    );
  }

  getReviewsKpis(): Observable<ReviewKpis> {
    const url = `${this.baseUrl}/kpis`;
    return this.http.get<ReviewKpis>(url);
  }

  getReview(id: ReviewId): Observable<Review> {
    const url = `${this.baseUrl}/${id.value}`;
    const params = new HttpParams()
      .set('_expand', 'drivers')
      .set('_expand', 'parkings');

    return this.http.get<any>(url, { params }).pipe(
      map(data => this.mapToReview(data))
    );
  }

  respondReview(id: ReviewId, responseText: string): Observable<Review> {
    const url = `${this.baseUrl}/${id.value}/respond`;
    const body = {
      response_text: responseText,
      responded: true,
      response_at: new Date().toISOString()
    };

    return this.http.patch<any>(url, body).pipe(
      map(data => this.mapToReview(data))
    );
  }

  markReviewAsRead(id: ReviewId): Observable<Review> {
    const url = `${this.baseUrl}/${id.value}/read`;
    const body = {
      read_at: new Date().toISOString()
    };

    return this.http.patch<any>(url, body).pipe(
      map(data => this.mapToReview(data))
    );
  }

  deleteReview(id: ReviewId): Observable<void> {
    const url = `${this.baseUrl}/${id.value}`;
    return this.http.delete<void>(url);
  }

  exportReviewsCSV(filters?: ReviewFilters): Observable<Blob> {
    const url = `${this.baseUrl}/export/csv`;
    let params = new HttpParams();

    if (filters) {
      if (filters.searchQuery) params = params.set('q', filters.searchQuery);
      if (filters.status && filters.status !== ReviewStatus.ALL) {
        params = params.set('status', filters.status);
      }
      if (filters.rating) params = params.set('rating_gte', filters.rating.toString());
      if (filters.parkingId) params = params.set('parkings_id', filters.parkingId.toString());
      if (filters.dateFrom) params = params.set('created_at_gte', filters.dateFrom);
      if (filters.dateTo) params = params.set('created_at_lte', filters.dateTo);
    }

    return this.http.get(url, {
      params,
      responseType: 'blob',
      headers: { 'Accept': 'text/csv' }
    });
  }

  private mapToReview(data: any): Review {
    return {
      ...data,
      id: ReviewId.create(data.id)
    };
  }

  private mapToReviewsListResponse(response: any): ReviewsListResponse {
    return {
      data: response.data?.map((item: any) => this.mapToReview(item)) || [],
      total: response.total || 0,
      page: response.page || 1,
      pageSize: response.pageSize || 10,
      totalPages: response.totalPages || 1
    };
  }
}
