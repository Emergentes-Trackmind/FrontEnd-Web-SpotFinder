import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TotalsKpiDTO } from '../../domain/dtos/metrics.dto';
import { AnalyticsPort } from '../../domain/services/analytics.port';

@Injectable({ providedIn: 'root' })
export class GetTotalsKpisUseCase {
  constructor(private analyticsPort: AnalyticsPort) {}

  execute(): Observable<TotalsKpiDTO> {
    return this.analyticsPort.getTotalsKpis();
  }
}
