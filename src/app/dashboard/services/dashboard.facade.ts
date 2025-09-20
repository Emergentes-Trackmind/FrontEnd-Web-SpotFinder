import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  TotalsKpiDTO,
  RevenueByMonthDTO,
  OccupancyByHourDTO,
  ActivityItemDTO,
  TopParkingDTO
} from '../domain/dtos/metrics.dto';
import { AnalyticsPort } from '../domain/services/analytics.port';

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private analyticsService = inject(AnalyticsPort);

  // Estado con signals
  private totalsKpis = signal<TotalsKpiDTO | null>(null);
  private revenueByMonth = signal<RevenueByMonthDTO[]>([]);
  private occupancyByHour = signal<OccupancyByHourDTO[]>([]);
  private recentActivity = signal<ActivityItemDTO[]>([]);
  private topParkings = signal<TopParkingDTO[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Computed para estados derivados
  isDataLoaded = computed(() =>
    this.totalsKpis() !== null &&
    this.revenueByMonth().length > 0
  );

  hasError = computed(() => this.error() !== null);

  loadAllDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Cargar datos secuencialmente
    this.loadTotalsKpisData();
    this.loadRevenueData();
    this.loadOccupancyData();
    this.loadActivityData();
    this.loadTopParkingsData();
  }

  private loadTotalsKpisData(): void {
    this.analyticsService.getTotalsKpis().pipe(
      tap((data: TotalsKpiDTO) => {
        this.totalsKpis.set(data);
        this.checkLoadingComplete();
      }),
      catchError(error => {
        console.error('Error loading totals KPIs:', error);
        this.handleError('Error al cargar KPIs totales');
        return [];
      })
    ).subscribe();
  }

  private loadRevenueData(): void {
    this.analyticsService.getRevenueByMonth().pipe(
      tap((data: RevenueByMonthDTO[]) => {
        this.revenueByMonth.set(data);
        this.checkLoadingComplete();
      }),
      catchError(error => {
        console.error('Error loading revenue data:', error);
        this.handleError('Error al cargar ingresos por mes');
        return [];
      })
    ).subscribe();
  }

  private loadOccupancyData(): void {
    this.analyticsService.getOccupancyByHour().pipe(
      tap((data: OccupancyByHourDTO[]) => {
        this.occupancyByHour.set(data);
        this.checkLoadingComplete();
      }),
      catchError(error => {
        console.error('Error loading occupancy data:', error);
        this.handleError('Error al cargar ocupación por hora');
        return [];
      })
    ).subscribe();
  }

  private loadActivityData(): void {
    this.analyticsService.getRecentActivity().pipe(
      tap((data: ActivityItemDTO[]) => {
        this.recentActivity.set(data);
        this.checkLoadingComplete();
      }),
      catchError(error => {
        console.error('Error loading activity data:', error);
        this.handleError('Error al cargar actividad reciente');
        return [];
      })
    ).subscribe();
  }

  private loadTopParkingsData(): void {
    this.analyticsService.getTopParkings().pipe(
      tap((data: TopParkingDTO[]) => {
        this.topParkings.set(data);
        this.checkLoadingComplete();
      }),
      catchError(error => {
        console.error('Error loading top parkings:', error);
        this.handleError('Error al cargar top parkings');
        return [];
      })
    ).subscribe();
  }

  private checkLoadingComplete(): void {
    // Verificar si todos los datos están cargados
    if (this.totalsKpis() &&
        this.revenueByMonth().length >= 0 &&
        this.occupancyByHour().length >= 0 &&
        this.recentActivity().length >= 0 &&
        this.topParkings().length >= 0) {
      this.loading.set(false);
    }
  }

  private handleError(message: string): void {
    this.error.set(message);
    this.loading.set(false);
  }

  // Métodos públicos que pueden ser usados por los componentes
  getTotalsKpis(): Observable<TotalsKpiDTO> {
    return this.analyticsService.getTotalsKpis().pipe(
      tap(data => this.totalsKpis.set(data)),
      catchError(error => {
        this.handleError('Error al cargar KPIs totales');
        throw error;
      })
    );
  }

  getRevenueByMonth(): Observable<RevenueByMonthDTO[]> {
    return this.analyticsService.getRevenueByMonth().pipe(
      tap(data => this.revenueByMonth.set(data)),
      catchError(error => {
        this.handleError('Error al cargar ingresos por mes');
        throw error;
      })
    );
  }

  getOccupancyByHour(): Observable<OccupancyByHourDTO[]> {
    return this.analyticsService.getOccupancyByHour().pipe(
      tap(data => this.occupancyByHour.set(data)),
      catchError(error => {
        this.handleError('Error al cargar ocupación por hora');
        throw error;
      })
    );
  }

  getRecentActivity(): Observable<ActivityItemDTO[]> {
    return this.analyticsService.getRecentActivity().pipe(
      tap(data => this.recentActivity.set(data)),
      catchError(error => {
        this.handleError('Error al cargar actividad reciente');
        throw error;
      })
    );
  }

  getTopParkings(): Observable<TopParkingDTO[]> {
    return this.analyticsService.getTopParkings().pipe(
      tap(data => this.topParkings.set(data)),
      catchError(error => {
        this.handleError('Error al cargar top parkings');
        throw error;
      })
    );
  }

  refreshData(): void {
    this.loadAllDashboardData();
  }

  clearError(): void {
    this.error.set(null);
  }

  getCurrentState() {
    return {
      totalsKpis: this.totalsKpis(),
      revenueByMonth: this.revenueByMonth(),
      occupancyByHour: this.occupancyByHour(),
      recentActivity: this.recentActivity(),
      topParkings: this.topParkings(),
      loading: this.loading(),
      error: this.error(),
      isDataLoaded: this.isDataLoaded(),
      hasError: this.hasError()
    };
  }
}
