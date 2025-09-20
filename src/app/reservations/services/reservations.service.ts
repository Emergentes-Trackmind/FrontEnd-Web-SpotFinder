import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { Reservation } from '../domain/entities/reservation.entity';
import { ReservationStatus } from '../domain/enums/reservation-status.enum';
import { ListReservationsUseCase, ListReservationsFilters } from '../application/use-cases/list-reservations.usecase';
import { GetReservationUseCase } from '../application/use-cases/get-reservation.usecase';
import { ConfirmReservationUseCase } from '../application/use-cases/confirm-reservation.usecase';
import { CancelReservationUseCase } from '../application/use-cases/cancel-reservation.usecase';
import { ExportReservationsCsvUseCase } from '../application/use-cases/export-reservations-csv.usecase';

@Injectable({ providedIn: 'root' })
export class ReservationsService {
  // Estado reactivo
  private filtersSubject = new BehaviorSubject<ListReservationsFilters>({
    _page: 1,
    _limit: 10,
    _sort: 'createdAt',
    _order: 'desc'
  });

  private reservationsSubject = new BehaviorSubject<Reservation[]>([]);
  private totalSubject = new BehaviorSubject<number>(0);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  filters$ = this.filtersSubject.asObservable();
  reservations$ = this.reservationsSubject.asObservable();
  total$ = this.totalSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  // Signals para estado reactivo
  selectedReservation = signal<Reservation | null>(null);
  isDetailPanelOpen = signal<boolean>(false);

  // Computed signals
  hasReservations = computed(() => this.reservationsSubject.value.length > 0);
  currentPage = computed(() => this.filtersSubject.value._page || 1);
  pageSize = computed(() => this.filtersSubject.value._limit || 10);

  constructor(
    private listUC: ListReservationsUseCase,
    private getUC: GetReservationUseCase,
    private confirmUC: ConfirmReservationUseCase,
    private cancelUC: CancelReservationUseCase,
    private exportUC: ExportReservationsCsvUseCase,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeDataLoad();
    this.syncFiltersWithQueryParams();
  }

  private initializeDataLoad(): void {
    this.filters$.pipe(
      tap(() => {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);
      }),
      switchMap(filters => this.listUC.execute(filters)),
      catchError(error => {
        this.errorSubject.next(error.message || 'Error al cargar reservas');
        this.loadingSubject.next(false);
        return of({ data: [], total: 0 });
      })
    ).subscribe({
      next: response => {
        this.reservationsSubject.next(response.data);
        this.totalSubject.next(response.total);
        this.loadingSubject.next(false);
      }
    });
  }

  private syncFiltersWithQueryParams(): void {
    // Implementar sincronización con query params si es necesario
    // Para simplicidad, mantenemos el estado en el servicio por ahora
  }

  // Métodos públicos para manipular filtros
  setFilters(newFilters: Partial<ListReservationsFilters>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...newFilters, _page: 1 });
  }

  setPage(page: number): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, _page: page });
  }

  setSearchQuery(query: string): void {
    this.setFilters({ q: query });
  }

  setStatusFilter(statuses: ReservationStatus[]): void {
    this.setFilters({ status: statuses });
  }

  setParkingFilter(parkingId: string | number | undefined): void {
    this.setFilters({ parkingId });
  }

  setDateRangeFilter(startDate?: string, endDate?: string): void {
    this.setFilters({
      startTime_gte: startDate,
      startTime_lte: endDate
    });
  }

  // Métodos para acciones sobre reservas
  confirmReservation(id: string | number): Observable<Reservation> {
    return this.confirmUC.execute(id).pipe(
      tap(updatedReservation => {
        this.updateReservationInList(updatedReservation);
        this.selectedReservation.set(updatedReservation);
      }),
      catchError(error => {
        this.errorSubject.next(error.message || 'Error al confirmar reserva');
        throw error;
      })
    );
  }

  cancelReservation(id: string | number): Observable<Reservation> {
    return this.cancelUC.execute(id).pipe(
      tap(updatedReservation => {
        this.updateReservationInList(updatedReservation);
        this.selectedReservation.set(updatedReservation);
      }),
      catchError(error => {
        this.errorSubject.next(error.message || 'Error al cancelar reserva');
        throw error;
      })
    );
  }

  getReservation(id: string | number): Observable<Reservation> {
    return this.getUC.execute(id).pipe(
      tap(reservation => this.selectedReservation.set(reservation)),
      catchError(error => {
        this.errorSubject.next(error.message || 'Error al cargar reserva');
        throw error;
      })
    );
  }

  exportReservations(reservations?: Reservation[]): void {
    const dataToExport = reservations || this.reservationsSubject.value;
    this.exportUC.execute(dataToExport, 'reservas_filtradas');
  }

  exportSingleReservation(reservation: Reservation): void {
    this.exportUC.execute(reservation, `reserva_${reservation.id}`);
  }

  // Métodos para el panel de detalle
  openReservationDetail(reservation: Reservation): void {
    this.selectedReservation.set(reservation);
    this.isDetailPanelOpen.set(true);
  }

  closeReservationDetail(): void {
    this.isDetailPanelOpen.set(false);
    this.selectedReservation.set(null);
  }

  // Métodos de utilidad
  private updateReservationInList(updatedReservation: Reservation): void {
    const currentReservations = this.reservationsSubject.value;
    const updatedReservations = currentReservations.map(reservation =>
      reservation.id === updatedReservation.id ? updatedReservation : reservation
    );
    this.reservationsSubject.next(updatedReservations);
  }

  refreshReservations(): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters });
  }
}
