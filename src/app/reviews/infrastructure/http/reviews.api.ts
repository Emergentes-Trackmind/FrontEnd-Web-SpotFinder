import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Review } from '../../domain/entities/review.entity';
import { ReviewKpis, ReviewFilters, ReviewsListResponse } from '../../domain/dtos/review-kpis.dto';
import { ReviewId } from '../../domain/value-objects/review-id.vo';
import { ReviewStatus } from '../../domain/enums/review-status.enum';
import { AuthService } from '../../../iam/services/auth.service';

@Injectable({ providedIn: 'root' })
export class ReviewsApi {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  // Usar ruta relativa - el ApiPrefixInterceptor agregará el baseUrl
  private baseUrl = '/reviews';

  private getCurrentUserId(): string | null {
    const user = this.authService.getCurrentUser();
    return user?.id?.toString() || null;
  }

  getReviews(filters?: ReviewFilters): Observable<ReviewsListResponse> {
    let params = new HttpParams();

    // Agregar currentUserId para privacidad
    const currentUserId = this.getCurrentUserId();
    if (currentUserId) {
      params = params.set('currentUserId', currentUserId);
    }

    if (filters) {
      if (filters.searchQuery) params = params.set('q', filters.searchQuery);
      if (filters.status && filters.status !== ReviewStatus.ALL) {
        params = params.set('status', filters.status);
      }
      if (filters.rating) params = params.set('rating', filters.rating.toString());
      if (filters.parkingId) params = params.set('parkingId', filters.parkingId.toString());
      if (filters.dateFrom) params = params.set('createdAt_gte', filters.dateFrom);
      if (filters.dateTo) params = params.set('createdAt_lte', filters.dateTo);
      if (filters.page) params = params.set('_page', filters.page.toString());
      if (filters.pageSize) params = params.set('_limit', filters.pageSize.toString());
      if (filters.sortBy) params = params.set('_sort', filters.sortBy);
      params = params.set('_order', 'desc');
    } else {
      // Defaults
      params = params.set('_page', '1');
      params = params.set('_limit', '10');
      params = params.set('_sort', 'createdAt');
      params = params.set('_order', 'desc');
    }

    return this.http.get<Review[]>(this.baseUrl, { params, observe: 'response' }).pipe(
      map(response => {
        const total = parseInt(response.headers.get('X-Total-Count') || '0', 10);
        const data = (response.body || []).map(item => this.mapToReview(item));

        return {
          data,
          total,
          page: filters?.page || 1,
          pageSize: filters?.pageSize || 10,
          totalPages: Math.ceil(total / (filters?.pageSize || 10))
        };
      })
    );
  }

  getReviewsKpis(): Observable<ReviewKpis> {
    const url = `${this.baseUrl}/kpis`;
    let params = new HttpParams();

    // Agregar currentUserId para privacidad
    const currentUserId = this.getCurrentUserId();
    if (currentUserId) {
      params = params.set('currentUserId', currentUserId);
    }

    return this.http.get<ReviewKpis>(url, { params });
  }

  getReview(id: ReviewId): Observable<Review> {
    const url = `${this.baseUrl}/${id.value}`;
    return this.http.get<Review>(url).pipe(
      map(data => this.mapToReview(data))
    );
  }

  respondReview(id: ReviewId, responseText: string): Observable<Review> {
    const url = `${this.baseUrl}/${id.value}/respond`;
    const body = {
      responseText: responseText,
      responded: true,
      responseAt: new Date().toISOString()
    };

    return this.http.patch<Review>(url, body).pipe(
      map(data => this.mapToReview(data))
    );
  }

  markReviewAsRead(id: ReviewId): Observable<Review> {
    const url = `${this.baseUrl}/${id.value}/read`;
    const body = {
      readAt: new Date().toISOString()
    };

    return this.http.patch<Review>(url, body).pipe(
      map(data => this.mapToReview(data))
    );
  }

  archiveReview(id: ReviewId): Observable<Review> {
    const url = `${this.baseUrl}/${id.value}/archive`;
    const body = {
      archived: true,
      archivedAt: new Date().toISOString()
    };

    return this.http.patch<Review>(url, body).pipe(
      map(data => this.mapToReview(data))
    );
  }

  exportReviewsCSV(filters?: ReviewFilters): Observable<Blob> {
    // For now, just get the data and convert to CSV client-side
    return this.getReviews(filters).pipe(
      map(response => {
        const csvContent = this.convertToCSV(response.data);
        return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      })
    );
  }

  private convertToCSV(reviews: Review[]): string {
    const headers = ['ID', 'Usuario', 'Email', 'Parking', 'Rating', 'Comentario', 'Fecha', 'Respondido', 'Respuesta'];
    const rows = reviews.map(r => [
      r.id.value,
      r.userName || r.driver_name || '',
      r.userEmail || '',
      r.parkingName || r.parking_name || '',
      r.rating,
      r.comment,
      r.createdAt || r.created_at || '',
      r.responded ? 'Sí' : 'No',
      r.responseText || r.response_text || ''
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
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
