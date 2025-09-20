import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  TotalsKpiDTO,
  RevenueByMonthDTO,
  OccupancyByHourDTO,
  ActivityItemDTO,
  TopParkingDTO
} from '../../domain/dtos/metrics.dto';

@Injectable({ providedIn: 'root' })
export class AnalyticsApi {
  private http = inject(HttpClient);
  private baseUrl = environment.analytics.base;
  private endpoints = environment.analytics.endpoints;

  getTotalsKpis(): Observable<TotalsKpiDTO> {
    return this.http.get<TotalsKpiDTO>(`${this.baseUrl}${this.endpoints.totals}`);
  }

  getRevenueByMonth(): Observable<RevenueByMonthDTO[]> {
    return this.http.get<RevenueByMonthDTO[]>(`${this.baseUrl}${this.endpoints.revenueByMonth}`);
  }

  getOccupancyByHour(): Observable<OccupancyByHourDTO[]> {
    return this.http.get<OccupancyByHourDTO[]>(`${this.baseUrl}${this.endpoints.occupancyByHour}`);
  }

  getRecentActivity(): Observable<ActivityItemDTO[]> {
    return this.http.get<ActivityItemDTO[]>(`${this.baseUrl}${this.endpoints.recentActivity}`);
  }

  getTopParkings(): Observable<TopParkingDTO[]> {
    return this.http.get<TopParkingDTO[]>(`${this.baseUrl}${this.endpoints.topParkings}`);
  }
}
