import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AnalyticsService, AnalyticsData } from '../../services/analytics.service';

@Component({
  selector: 'app-parking-analytics',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './parking-analytics.page.html',
  styleUrls: ['./parking-analytics.page.css']
})
export class ParkingAnalyticsPage implements OnInit, OnDestroy {

  parkingId: string = '';
  analyticsData: AnalyticsData | null = null;
  isLoading = true;
  hasError = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.parkingId = params['id'];
      this.loadAnalytics();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAnalytics() {
    if (!this.parkingId) {
      this.hasError = true;
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    this.analyticsService.getProfileAnalytics(this.parkingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: AnalyticsData) => {
          this.analyticsData = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading analytics:', error);
          this.hasError = true;
          this.isLoading = false;
        }
      });
  }

  onBackToEdit() {
    this.router.navigate(['/parkings', this.parkingId, 'edit']);
  }

  onRetry() {
    this.loadAnalytics();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getTrendIcon(trend: number): string {
    if (trend > 0) return 'trending_up';
    if (trend < 0) return 'trending_down';
    return 'trending_flat';
  }

  getTrendClass(trend: number): string {
    if (trend > 0) return 'trend-up';
    if (trend < 0) return 'trend-down';
    return 'trend-neutral';
  }

  formatTrend(trend: number): string {
    const sign = trend > 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  }

  getOccupationBarWidth(percentage: number): string {
    return `${Math.max(percentage, 2)}%`;
  }

  getOccupationBarColor(percentage: number): string {
    if (percentage >= 80) return 'var(--primary)';
    if (percentage >= 60) return 'var(--accent)';
    if (percentage >= 40) return '#10B981';
    return '#6B7280';
  }
}
