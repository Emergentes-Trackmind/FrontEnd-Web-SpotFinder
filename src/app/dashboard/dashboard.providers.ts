import { Provider } from '@angular/core';
import { AnalyticsPort } from './domain/services/analytics.port';
import { AnalyticsRepository } from './infrastructure/repositories/analytics.repo';

export const DASHBOARD_PROVIDERS: Provider[] = [
  {
    provide: AnalyticsPort,
    useClass: AnalyticsRepository
  }
];
