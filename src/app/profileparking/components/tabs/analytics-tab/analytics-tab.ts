import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AnalyticsService, AnalyticsData } from '../../../services/analytics.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-analytics-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './analytics-tab.html',
  styleUrls: ['./analytics-tab.css']
})
export class AnalyticsTabComponent implements OnInit, OnChanges {
  @Input() profileId?: string | null;

  analyticsData: AnalyticsData | null = null;
  isLoading = false;

  // Datos para el template - se mapean desde analyticsData
  kpiData: any[] = [];
  hourlyOccupation: any[] = [];
  recentActivity: any[] = [];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    if (this.profileId) this.loadAnalytics(this.profileId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profileId'] && !changes['profileId'].isFirstChange()) {
      const id = changes['profileId'].currentValue as string | null;
      if (id) this.loadAnalytics(id);
    }
  }

  private loadAnalytics(id: string): void {
    this.isLoading = true;
    this.analyticsService.getProfileAnalytics(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.analyticsData = data;
          this.mapDataForTemplate(data);
        },
        error: (error) => {
          console.error('Error loading analytics:', error);
          this.mapDataForTemplate(this.getDefaultAnalytics());
        }
      });
  }

  private mapDataForTemplate(data: AnalyticsData): void {
    // Mapear KPIs para el template
    this.kpiData = [
      {
        title: 'Ocupación Promedio',
        value: `${data.kpis.avgOccupation.value}%`,
        change: data.kpis.avgOccupation.trend >= 0 ? `+${data.kpis.avgOccupation.trend}%` : `${data.kpis.avgOccupation.trend}%`,
        trend: data.kpis.avgOccupation.trend >= 0 ? 'up' : 'down',
        icon: 'trending_up',
        description: 'vs. mes anterior'
      },
      {
        title: 'Ingresos Mensuales',
        value: `€${data.kpis.monthlyRevenue.value.toLocaleString()}`,
        change: data.kpis.monthlyRevenue.trend >= 0 ? `+${data.kpis.monthlyRevenue.trend}%` : `${data.kpis.monthlyRevenue.trend}%`,
        trend: data.kpis.monthlyRevenue.trend >= 0 ? 'up' : 'down',
        icon: 'euro',
        description: 'vs. mes anterior'
      },
      {
        title: 'Usuarios Únicos',
        value: data.kpis.uniqueUsers.value.toString(),
        change: data.kpis.uniqueUsers.trend >= 0 ? `+${data.kpis.uniqueUsers.trend}%` : `${data.kpis.uniqueUsers.trend}%`,
        trend: data.kpis.uniqueUsers.trend >= 0 ? 'up' : 'down',
        icon: 'people',
        description: 'vs. mes anterior'
      },
      {
        title: 'Tiempo Promedio',
        value: `${data.kpis.avgTime.value}h`,
        change: data.kpis.avgTime.trend >= 0 ? `+${data.kpis.avgTime.trend}%` : `${data.kpis.avgTime.trend}%`,
        trend: data.kpis.avgTime.trend >= 0 ? 'up' : 'down',
        icon: 'schedule',
        description: 'vs. mes anterior'
      }
    ];

    // Mapear ocupación por hora
    this.hourlyOccupation = data.hourlyOccupation.map(item => ({
      hour: item.hour,
      percentage: item.percentage
    }));

    // Mapear actividad reciente
    this.recentActivity = data.recentActivity.map(item => ({
      action: item.action,
      details: item.details,
      time: item.timeAgo
    }));
  }

  private getDefaultAnalytics(): AnalyticsData {
    return {
      kpis: {
        avgOccupation: { value: 0, trend: 0 },
        monthlyRevenue: { value: 0, trend: 0 },
        uniqueUsers: { value: 0, trend: 0 },
        avgTime: { value: 0, trend: 0 }
      },
      hourlyOccupation: [
        { hour: '06:00', percentage: 0 },
        { hour: '08:00', percentage: 0 },
        { hour: '10:00', percentage: 0 },
        { hour: '12:00', percentage: 0 },
        { hour: '14:00', percentage: 0 },
        { hour: '16:00', percentage: 0 },
        { hour: '18:00', percentage: 0 },
        { hour: '20:00', percentage: 0 },
        { hour: '22:00', percentage: 0 }
      ],
      recentActivity: []
    };
  }

  refreshAnalytics(): void {
    if (!this.profileId) return;
    this.analyticsService.clearCache(this.profileId);
    this.loadAnalytics(this.profileId);
  }
}
