import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OccupancyByHourDTO } from '../../domain/dtos/metrics.dto';
import { AnalyticsPort } from '../../domain/services/analytics.port';

@Injectable({ providedIn: 'root' })
export class GetOccupancyByHourUseCase {
  constructor(private analyticsPort: AnalyticsPort) {}

  execute(): Observable<OccupancyByHourDTO[]> {
    return this.analyticsPort.getOccupancyByHour();
  }
}
