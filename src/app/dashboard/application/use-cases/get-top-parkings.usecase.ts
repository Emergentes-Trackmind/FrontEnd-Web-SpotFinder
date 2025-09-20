import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TopParkingDTO } from '../../domain/dtos/metrics.dto';
import { AnalyticsPort } from '../../domain/services/analytics.port';

@Injectable({ providedIn: 'root' })
export class GetTopParkingsUseCase {
  constructor(private analyticsPort: AnalyticsPort) {}

  execute(): Observable<TopParkingDTO[]> {
    return this.analyticsPort.getTopParkings();
  }
}
