import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { BehaviorSubject, interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Analytics Port
import { AnalyticsPort } from '../../domain/services/analytics.port';

// DTOs
import {
  TotalsKpiDTO,
  RevenueByMonthDTO,
  OccupancyByHourDTO,
  ActivityItemDTO,
  TopParkingDTO
} from '../../domain/dtos/metrics.dto';

// Presentation Components
import { KpiCardComponent, KpiData } from '../../presentation/components/kpi-card/kpi-card.component';
import { RevenueChartComponent } from '../../presentation/components/revenue-chart/revenue-chart.component';
import { OccupancyChartComponent } from '../../presentation/components/occupancy-chart/occupancy-chart.component';
import { RecentActivityComponent } from '../../presentation/components/recent-activity/recent-activity.component';
import { TopParkingsComponent } from '../../presentation/components/top-parkings/top-parkings.component';
import { TranslateModule } from '@ngx-translate/core';

interface KpiCard {
  id: string;
  title: string;
  value: string;
  delta: string;
  deltaType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
  loading?: boolean;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    KpiCardComponent,
    RevenueChartComponent,
    OccupancyChartComponent,
    RecentActivityComponent,
    TopParkingsComponent,
    TranslateModule
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage implements OnInit, OnDestroy {
  private analyticsService = inject(AnalyticsPort);
  private router = inject(Router);

  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading = this.loadingSubject.asObservable();

  // Auto-refresh control
  private destroy$ = new Subject<void>();
  private autoRefreshInterval = 60000; // Refresh each 60 seconds
  isAutoRefreshEnabled = signal(true);

  // Signals for reactive data
  private totalsKpi = signal<TotalsKpiDTO | null>(null);
  revenueByMonth = signal<RevenueByMonthDTO[]>([]);
  occupancyByHour = signal<OccupancyByHourDTO[]>([]);
  recentActivity = signal<ActivityItemDTO[]>([]);
  topParkings = signal<TopParkingDTO[]>([]);

  // Computed KPI cards from the totals data
  kpiCards = computed<KpiCard[]>(() => {
    const totals = this.totalsKpi();
    if (!totals) {
      // Return default placeholder cards when no data
      return [
        {
          id: 'revenue',
          title: 'Ingresos Totales',
          value: '$0',
          delta: '+0%',
          deltaType: 'neutral',
          icon: 'attach_money',
          color: '#16A34A',
          loading: true
        },
        {
          id: 'occupancy',
          title: 'Espacios Ocupados',
          value: '0/0',
          delta: '0%',
          deltaType: 'neutral',
          icon: 'local_parking',
          color: '#6D5AE6',
          loading: true
        },
        {
          id: 'users',
          title: 'Usuarios Activos',
          value: '0',
          delta: '+0%',
          deltaType: 'neutral',
          icon: 'people',
          color: '#F59E0B',
          loading: true
        },
        {
          id: 'parkings',
          title: 'Parkings Registrados',
          value: '0',
          delta: '+0 este mes',
          deltaType: 'neutral',
          icon: 'business',
          color: '#EF4444',
          loading: true
        }
      ];
    }

    return [
      {
        id: 'revenue',
        title: 'Ingresos Totales',
        value: `${totals.totalRevenue.currency}${totals.totalRevenue.value.toLocaleString()}`,
        delta: totals.totalRevenue.deltaText,
        deltaType: totals.totalRevenue.deltaPercentage >= 0 ? 'positive' : 'negative',
        icon: 'attach_money',
        color: '#16A34A'
      },
      {
        id: 'occupancy',
        title: 'Espacios Ocupados',
        value: `${totals.occupiedSpaces.occupied}/${totals.occupiedSpaces.total}`,
        delta: `${totals.occupiedSpaces.percentage}%`,
        deltaType: totals.occupiedSpaces.percentage >= 70 ? 'positive' : 'neutral',
        icon: 'local_parking',
        color: '#6D5AE6'
      },
      {
        id: 'users',
        title: 'Usuarios Activos',
        value: totals.activeUsers.count.toLocaleString(),
        delta: totals.activeUsers.deltaText,
        deltaType: totals.activeUsers.deltaPercentage >= 0 ? 'positive' : 'negative',
        icon: 'people',
        color: '#F59E0B'
      },
      {
        id: 'parkings',
        title: 'Parkings Registrados',
        value: totals.registeredParkings.total.toString(),
        delta: totals.registeredParkings.deltaText,
        deltaType: totals.registeredParkings.newThisMonth > 0 ? 'positive' : 'neutral',
        icon: 'business',
        color: '#EF4444'
      }
    ];
  });

  ngOnInit() {
    console.log('🏠 HomePage initialized - Loading dashboard data...');
    this.initializeDashboard();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    console.log('🏠 HomePage destroyed - Cleaning up...');
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Start auto-refresh interval for dashboard data
   */
  private startAutoRefresh() {
    if (this.isAutoRefreshEnabled()) {
      console.log('🔄 Starting auto-refresh every', this.autoRefreshInterval / 1000, 'seconds');

      interval(this.autoRefreshInterval)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.isAutoRefreshEnabled()) {
            console.log('🔄 Auto-refreshing dashboard data...');
            this.loadDashboardData();
          }
        });
    }
  }

  /**
   * Toggle auto-refresh functionality
   */
  toggleAutoRefresh() {
    this.isAutoRefreshEnabled.set(!this.isAutoRefreshEnabled());
    console.log('🔄 Auto-refresh', this.isAutoRefreshEnabled() ? 'enabled' : 'disabled');

    if (this.isAutoRefreshEnabled()) {
      this.startAutoRefresh();
    }
  }

  /**
   * Initialize dashboard with default data and then load real data
   */
  private initializeDashboard() {
    // Set default empty arrays for components
    this.revenueByMonth.set([]);
    this.occupancyByHour.set([]);
    this.recentActivity.set([]);
    this.topParkings.set([]);

    // Load real data
    this.loadDashboardData();
  }

  /**
   * Loads all dashboard data from the analytics service
   */
  private async loadDashboardData() {
    this.loadingSubject.next(true);

    try {
      console.log('🔄 Loading dashboard data...');

      // Load all dashboard data in parallel
      await Promise.allSettled([
        this.loadTotalsKpi(),
        this.loadRevenueByMonth(),
        this.loadOccupancyByHour(),
        this.loadRecentActivity(),
        this.loadTopParkings()
      ]);

      console.log('✅ Dashboard data loading completed');
    } catch (error) {
      console.error('❌ Critical error loading dashboard data:', error);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Load totals KPI data
   */
  private async loadTotalsKpi(): Promise<void> {
    try {
      this.analyticsService.getTotalsKpis().subscribe({
        next: (data: TotalsKpiDTO) => {
          console.log('📊 Totals KPI loaded:', data);
          this.totalsKpi.set(data);
        },
        error: (error: any) => {
          console.error('❌ Error loading totals KPI:', error);
        }
      });
    } catch (error) {
      console.error('❌ Failed to subscribe to totals KPI:', error);
    }
  }

  /**
   * Load revenue by month data
   */
  private async loadRevenueByMonth(): Promise<void> {
    try {
      this.analyticsService.getRevenueByMonth().subscribe({
        next: (data: RevenueByMonthDTO[]) => {
          console.log('💰 Revenue by month loaded:', data);
          this.revenueByMonth.set(data);
        },
        error: (error: any) => {
          console.error('❌ Error loading revenue data:', error);
          this.revenueByMonth.set([]);
        }
      });
    } catch (error) {
      console.error('❌ Failed to subscribe to revenue data:', error);
    }
  }

  /**
   * Load occupancy by hour data
   */
  private async loadOccupancyByHour(): Promise<void> {
    try {
      this.analyticsService.getOccupancyByHour().subscribe({
        next: (data: OccupancyByHourDTO[]) => {
          console.log('⏰ Occupancy by hour loaded:', data);
          this.occupancyByHour.set(data);
        },
        error: (error: any) => {
          console.error('❌ Error loading occupancy data:', error);
          this.occupancyByHour.set([]);
        }
      });
    } catch (error) {
      console.error('❌ Failed to subscribe to occupancy data:', error);
    }
  }

  /**
   * Load recent activity data
   */
  private async loadRecentActivity(): Promise<void> {
    try {
      this.analyticsService.getRecentActivity().subscribe({
        next: (data: ActivityItemDTO[]) => {
          console.log('📋 Recent activity loaded:', data);
          this.recentActivity.set(data);
        },
        error: (error: any) => {
          console.error('❌ Error loading recent activity:', error);
          this.recentActivity.set([]);
        }
      });
    } catch (error) {
      console.error('❌ Failed to subscribe to recent activity:', error);
    }
  }

  /**
   * Load top parkings data
   */
  private async loadTopParkings(): Promise<void> {
    try {
      this.analyticsService.getTopParkings().subscribe({
        next: (data: TopParkingDTO[]) => {
          console.log('🏆 Top parkings loaded:', data);
          this.topParkings.set(data);
        },
        error: (error: any) => {
          console.error('❌ Error loading top parkings:', error);
          this.topParkings.set([]);
        }
      });
    } catch (error) {
      console.error('❌ Failed to subscribe to top parkings:', error);
    }
  }

  // ========================================
  // HEADER BUTTON HANDLERS FOR THE HTML
  // ========================================

  /**
   * Refresh all dashboard data - Handler for refresh button in HTML
   */
  onRefreshData() {
    console.log('🔄 Manual refresh triggered...');

    // Reset all signals to force refresh
    this.totalsKpi.set(null);
    this.revenueByMonth.set([]);
    this.occupancyByHour.set([]);
    this.recentActivity.set([]);
    this.topParkings.set([]);

    // Force reload
    this.loadDashboardData();
  }

  /**
   * Handle search action - Handler for search button in HTML
   */
  onSearch() {
    console.log('🔍 Search functionality triggered');
    // TODO: Implement search functionality
    alert('Funcionalidad de búsqueda próximamente');
  }

  /**
   * Handle notifications action - Handler for notifications button in HTML
   */
  onNotifications() {
    console.log('🔔 Notifications panel triggered');
    // TODO: Implement notifications panel
    alert('Panel de notificaciones próximamente');
  }

  /**
   * Handle profile action - Handler for profile button in HTML
   */
  onProfile() {
    console.log('👤 Profile navigation triggered');
    // Navigate to profile page
    this.router.navigate(['/me/profile']);
  }

  // ========================================
  // UTILITY METHODS FOR THE NEW HTML
  // ========================================

  /**
   * Get revenue percentage for chart visualization
   */
  getRevenuePercentage(revenue: number): number {
    const revenues = this.revenueByMonth();
    if (revenues.length === 0) return 0;

    const maxRevenue = Math.max(...revenues.map(r => r.revenue));
    return maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
  }

  /**
   * Get appropriate icon for activity type
   */
  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'reservation_confirmed': 'check_circle',
      'payment_processed': 'payment',
      'reservation_cancelled': 'cancel',
      'parking_created': 'add_location',
      'review_added': 'star'
    };

    return iconMap[type] || 'info';
  }

  /**
   * Get human readable status text
   */
  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'confirmed': 'Confirmado',
      'paid': 'Pagado',
      'cancelled': 'Cancelado',
      'created': 'Creado',
      'pending': 'Pendiente',
      'active': 'Activo',
      'maintenance': 'Mantenimiento',
      'inactive': 'Inactivo'
    };

    return statusMap[status] || status;
  }
}
