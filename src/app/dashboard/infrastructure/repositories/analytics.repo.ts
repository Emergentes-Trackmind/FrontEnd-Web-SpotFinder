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
    console.log('🔍 [AnalyticsRepo] Requesting totals KPIs...');
    return this.api.getTotalsKpis().pipe(
      tap({
        next: (data) => {
          console.log('✅ [AnalyticsRepo] Totals KPIs received successfully');
          console.log('📊 Data preview:', {
            revenue: data.totalRevenue?.value,
            occupancy: `${data.occupiedSpaces?.occupied}/${data.occupiedSpaces?.total}`,
            users: data.activeUsers?.count,
            parkings: data.registeredParkings?.total
          });
        },
        error: (err) => {
          console.error('❌ [AnalyticsRepo] Failed to fetch Totals KPIs');
          console.error('Error details:', err);
        }
      }),
      shareReplay(this.shareReplayConfig)
    );
  }

  getRevenueByMonth(): Observable<RevenueByMonthDTO[]> {
    console.log('📊 [AnalyticsRepo] Requesting revenue by month...');
    return this.api.getRevenueByMonth().pipe(
      tap({
        next: (data) => {
          console.log(`✅ [AnalyticsRepo] Revenue data received: ${data.length} months`);
          console.log('📈 Sample:', data.slice(0, 3));
        },
        error: (err) => {
          console.error('❌ [AnalyticsRepo] Failed to fetch Revenue data');
          console.error('Error details:', err);
        }
      }),
      shareReplay(this.shareReplayConfig)
    );
  }

  getOccupancyByHour(): Observable<OccupancyByHourDTO[]> {
    console.log('⏰ [AnalyticsRepo] Requesting occupancy by hour...');
    return this.api.getOccupancyByHour().pipe(
      tap({
        next: (data) => {
          console.log(`✅ [AnalyticsRepo] Occupancy data received: ${data.length} hours`);
          console.log('📊 Sample:', data.slice(0, 3));
        },
        error: (err) => {
          console.error('❌ [AnalyticsRepo] Failed to fetch Occupancy data');
          console.error('Error details:', err);
        }
      }),
      shareReplay(this.shareReplayConfig)
    );
  }

  getRecentActivity(): Observable<ActivityItemDTO[]> {
    console.log('📋 [AnalyticsRepo] Requesting recent activity...');
    return this.api.getRecentActivity().pipe(
      tap({
        next: (data) => {
          console.log(`✅ [AnalyticsRepo] Activity data received: ${data.length} items`);
          console.log('📝 Sample:', data.slice(0, 2));
        },
        error: (err) => {
          console.error('❌ [AnalyticsRepo] Failed to fetch Activity data');
          console.error('Error details:', err);
        }
      }),
      shareReplay(this.shareReplayConfig)
    );
  }

  getTopParkings(): Observable<TopParkingDTO[]> {
    console.log('🏆 [AnalyticsRepo] Requesting top parkings...');
    return this.api.getTopParkings().pipe(
      tap({
        next: (data) => {
          console.log(`✅ [AnalyticsRepo] Top parkings received: ${data.length} items`);
          console.log('🅿️ Sample:', data.slice(0, 3));
        },
        error: (err) => {
          console.error('❌ [AnalyticsRepo] Failed to fetch Top Parkings');
          console.error('Error details:', err);
        }
      }),
      shareReplay(this.shareReplayConfig)
    );
  }
}
