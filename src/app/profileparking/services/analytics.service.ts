import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface AnalyticsData {
  kpis: {
    avgOccupation: { value: number; trend: number; };
    monthlyRevenue: { value: number; trend: number; };
    uniqueUsers: { value: number; trend: number; };
    avgTime: { value: number; trend: number; };
  };
  hourlyOccupation: Array<{
    hour: string;
    percentage: number;
  }>;
  recentActivity: Array<{
    action: string;
    details: string;
    timeAgo: string;
  }>;
}

// Interfaz para los datos del JSON
interface AnalyticsJson {
  id: string;
  profileId: string;
  kpis: {
    avgOccupation: { value: number; trend: number; };
    monthlyRevenue: { value: number; trend: number; };
    uniqueUsers: { value: number; trend: number; };
    avgTime: { value: number; trend: number; };
  };
  hourlyOccupation: Array<{
    hour: string;
    percentage: number;
  }>;
  recentActivity: Array<{
    action: string;
    details: string;
    timeAgo: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  // Usar ruta relativa - el ApiPrefixInterceptor agregará el baseUrl
  private readonly baseUrl = '/analytics';
  private cache = new Map<string, Observable<AnalyticsData>>();

  constructor(private http: HttpClient) {}

  /**
   * Obtener analíticas completas de un perfil
   */
  getProfileAnalytics(profileId: string): Observable<AnalyticsData> {
    const cacheKey = `analytics_${profileId}`;

    if (!this.cache.has(cacheKey)) {
      const request$ = this.http.get<AnalyticsJson[]>(`${this.baseUrl}?profileId=${profileId}`).pipe(
        map(analytics => {
          const data = analytics.find(a => a.profileId === profileId);
          return data ? this.mapJsonToAnalytics(data) : this.getDefaultAnalytics();
        }),
        catchError(error => {
          console.error('Error loading analytics:', error);
          return of(this.getDefaultAnalytics());
        })
      );

      this.cache.set(cacheKey, request$);
    }

    return this.cache.get(cacheKey)!;
  }

  /**
   * Limpiar cache de analytics para un perfil específico
   */
  clearCache(profileId?: string): void {
    if (profileId) {
      const cacheKey = `analytics_${profileId}`;
      this.cache.delete(cacheKey);
    } else {
      // Limpiar todo el cache
      this.cache.clear();
    }
  }

  /**
   * Limpiar todo el cache de analytics
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Mapear JSON a AnalyticsData
   */
  private mapJsonToAnalytics(json: AnalyticsJson): AnalyticsData {
    return {
      kpis: json.kpis,
      hourlyOccupation: json.hourlyOccupation,
      recentActivity: json.recentActivity
    };
  }

  /**
   * Datos por defecto
   */
  private getDefaultAnalytics(): AnalyticsData {
    return {
      kpis: {
        avgOccupation: { value: 0, trend: 0 },
        monthlyRevenue: { value: 0, trend: 0 },
        uniqueUsers: { value: 0, trend: 0 },
        avgTime: { value: 0, trend: 0 }
      },
      hourlyOccupation: this.generateDefaultHourlyData(),
      recentActivity: []
    };
  }

  /**
   * Generar datos de ocupación por hora por defecto
   */
  private generateDefaultHourlyData() {
    const hours = [];
    for (let i = 6; i <= 23; i++) {
      hours.push({
        hour: `${i.toString().padStart(2, '0')}:00`,
        percentage: 0
      });
    }
    return hours;
  }
}
