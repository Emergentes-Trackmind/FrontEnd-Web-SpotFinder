import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { AnalyticsPort } from '../../domain/services/analytics.port';
import { AnalyticsApi } from '../http/analytics.api';
import {
  TotalsKpiDTO,
  RevenueByMonthDTO,
  OccupancyByHourDTO,
  ActivityItemDTO,
  TopParkingDTO
} from '../../domain/dtos/metrics.dto';

@Injectable({ providedIn: 'root' })
export class AnalyticsRepository extends AnalyticsPort {
  private readonly CACHE_SIZE = 1;
  private readonly CACHE_WINDOW_TIME = 5 * 60 * 1000; // 5 minutos

  // Configuración optimizada para shareReplay
  private readonly shareReplayConfig = {
    bufferSize: this.CACHE_SIZE,
    windowTime: this.CACHE_WINDOW_TIME,
    refCount: true // Permite que el observable se complete cuando no hay suscriptores
  };

  constructor(private api: AnalyticsApi) {
    super();
  }

  getTotalsKpis(): Observable<TotalsKpiDTO> {
    return this.api.getTotalsKpis().pipe(
      tap(() => console.log('🔍 Fetching totals KPIs')),
      shareReplay(this.shareReplayConfig)
    );
  }

  getRevenueByMonth(): Observable<RevenueByMonthDTO[]> {
    return this.api.getRevenueByMonth().pipe(
      tap(() => console.log('📊 Fetching revenue by month')),
      shareReplay(this.shareReplayConfig)
    );
  }

  getOccupancyByHour(): Observable<OccupancyByHourDTO[]> {
    return this.api.getOccupancyByHour().pipe(
      tap(() => console.log('⏰ Fetching occupancy by hour')),
      shareReplay(this.shareReplayConfig)
    );
  }

  getRecentActivity(): Observable<ActivityItemDTO[]> {
    return this.api.getRecentActivity().pipe(
      tap(() => console.log('📋 Fetching recent activity')),
      shareReplay(this.shareReplayConfig)
    );
  }

  getTopParkings(): Observable<TopParkingDTO[]> {
    return this.api.getTopParkings().pipe(
      tap(() => console.log('🏆 Fetching top parkings')),
      shareReplay(this.shareReplayConfig)
    );
  }
}
