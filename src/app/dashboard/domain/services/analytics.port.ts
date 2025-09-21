import { Observable } from 'rxjs';
import {
  TotalsKpiDTO,
  RevenueByMonthDTO,
  OccupancyByHourDTO,
  ActivityItemDTO,
  TopParkingDTO
} from '../dtos/metrics.dto';

export abstract class AnalyticsPort {
  abstract getTotalsKpis(): Observable<TotalsKpiDTO>;
  abstract getRevenueByMonth(): Observable<RevenueByMonthDTO[]>;
  abstract getOccupancyByHour(): Observable<OccupancyByHourDTO[]>;
  abstract getRecentActivity(): Observable<ActivityItemDTO[]>;
  abstract getTopParkings(): Observable<TopParkingDTO[]>;
}
