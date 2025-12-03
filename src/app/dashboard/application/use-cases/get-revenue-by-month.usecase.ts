import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RevenueByMonthDTO } from '../../domain/dtos/metrics.dto';
import { AnalyticsPort } from '../../domain/services/analytics.port';

@Injectable({ providedIn: 'root' })
export class GetRevenueByMonthUseCase {
  constructor(private analyticsPort: AnalyticsPort) {}

  execute(): Observable<RevenueByMonthDTO[]> {
    return this.analyticsPort.getRevenueByMonth();
  }
}
