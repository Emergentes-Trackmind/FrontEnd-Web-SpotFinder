import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityItemDTO } from '../../domain/dtos/metrics.dto';
import { AnalyticsPort } from '../../domain/services/analytics.port';

@Injectable({ providedIn: 'root' })
export class GetRecentActivityUseCase {
  constructor(private analyticsPort: AnalyticsPort) {}

  execute(): Observable<ActivityItemDTO[]> {
    return this.analyticsPort.getRecentActivity();
  }
}
