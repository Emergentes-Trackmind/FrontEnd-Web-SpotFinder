import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

// Domain
import { Review } from '../domain/entities/review.entity';
import { ReviewKpis, ReviewFilters } from '../domain/dtos/review-kpis.dto';
import { ReviewId } from '../domain/value-objects/review-id.vo';

@Injectable({ providedIn: 'root' })
export class ReviewsFacade {
  // State with signals
  private reviews = signal<Review[]>([]);
  private kpis = signal<ReviewKpis | null>(null);
  private loading = signal<boolean>(false);
  private totalReviews = signal<number>(0);

  // Public getters
  getReviews() { return this.reviews(); }
  getKpis() { return this.kpis(); }
  isLoading() { return this.loading(); }
  getTotalReviews() { return this.totalReviews(); }

  // Mock methods for basic functionality
  loadReviews(filters?: ReviewFilters): Observable<Review[]> {
    this.loading.set(true);

    // Mock data with ReviewId Value Objects
    const mockReviews: Review[] = [
      {
        id: ReviewId.create('1'),
        driver_name: 'María González',
        parking_name: 'Centro Comercial Plaza',
        rating: 5,
        comment: 'Excelente servicio, muy fácil de usar la app y el estacionamiento estaba limpio y seguro.',
        created_at: '2024-01-15T10:30:00.000Z',
        responded: true,
        response_text: 'Muchas gracias por tu comentario María.',
        response_at: '2024-01-15T14:20:00.000Z',
        read_at: '2024-01-15T14:25:00.000Z'
      },
      {
        id: ReviewId.create('2'),
        driver_name: 'Carlos Ruiz',
        parking_name: 'Estacionamiento Norte',
        rating: 3,
        comment: 'Buen servicio en general, aunque el precio podría ser un poco más competitivo.',
        created_at: '2024-01-14T16:45:00.000Z',
        responded: false
      },
      {
        id: ReviewId.create('3'),
        driver_name: 'Ana Martínez',
        parking_name: 'Plaza Central',
        rating: 5,
        comment: 'Perfecto! Reservé desde la app y todo funcionó sin problemas.',
        created_at: '2024-01-13T09:15:00.000Z',
        responded: true,
        response_text: 'Gracias Ana por tu comentario positivo.',
        response_at: '2024-01-13T11:30:00.000Z',
        read_at: '2024-01-13T11:35:00.000Z'
      },
      {
        id: ReviewId.create('4'),
        driver_name: 'Roberto Silva',
        parking_name: 'Estacionamiento Sur',
        rating: 2,
        comment: 'Tuve problemas con la app al momento de pagar.',
        created_at: '2024-01-12T14:22:00.000Z',
        responded: false,
        read_at: '2024-01-12T15:00:00.000Z'
      },
      {
        id: ReviewId.create('5'),
        driver_name: 'Laura Fernández',
        parking_name: 'Centro Comercial Norte',
        rating: 4,
        comment: 'Muy buena ubicación y fácil acceso. El precio es justo.',
        created_at: '2024-01-11T08:15:00.000Z',
        responded: true,
        response_text: 'Muchas gracias Laura, nos alegra que hayas tenido una buena experiencia.',
        response_at: '2024-01-11T10:45:00.000Z',
        read_at: '2024-01-11T10:50:00.000Z'
      },
      {
        id: ReviewId.create('6'),
        driver_name: 'Diego Morales',
        parking_name: 'Plaza del Sol',
        rating: 1,
        comment: 'Mal servicio, el estacionamiento estaba sucio y el personal no fue amable.',
        created_at: '2024-01-10T19:30:00.000Z',
        responded: false
      }
    ];

    return of(mockReviews).pipe(
      delay(1000),
      tap(reviews => {
        this.reviews.set(reviews);
        this.totalReviews.set(1247);
        this.loading.set(false);
      })
    );
  }

  loadKpis(): Observable<ReviewKpis> {
    const mockKpis: ReviewKpis = {
      averageRating: 4.8,
      averageRatingDelta: -0.2,
      totalReviews: 1247,
      totalReviewsDelta: 23,
      responseRate: 94,
      responseRateDelta: 1.6,
      avgResponseTimeHours: 2.4,
      avgResponseTimeDelta: -0.3
    };

    return of(mockKpis).pipe(
      delay(500),
      tap(kpis => this.kpis.set(kpis))
    );
  }

  respondToReview(id: ReviewId, text: string): Observable<boolean> {
    return of(true).pipe(delay(500));
  }

  markAsRead(id: ReviewId): Observable<boolean> {
    return of(true).pipe(delay(300));
  }

  deleteReview(id: ReviewId): Observable<boolean> {
    return of(true).pipe(delay(500));
  }

  exportReviewsCSV(): Observable<Blob> {
    return of(new Blob(['mock csv data'], { type: 'text/csv' })).pipe(delay(1000));
  }
}
