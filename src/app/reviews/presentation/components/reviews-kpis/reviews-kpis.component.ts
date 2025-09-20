import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReviewKpis } from '../../../domain/dtos/review-kpis.dto';

@Component({
  selector: 'app-reviews-kpis',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="kpis-container">
      <!-- Average Rating KPI -->
      <mat-card class="kpi-card">
        <div class="kpi-header">
          <mat-icon class="kpi-icon">star</mat-icon>
          <span class="kpi-label">Average Rating</span>
        </div>
        <div class="kpi-value">{{ kpis?.averageRating?.toFixed(1) || '0.0' }}</div>
        <div class="kpi-delta" [class.positive]="(kpis?.averageRatingDelta || 0) > 0" [class.negative]="(kpis?.averageRatingDelta || 0) < 0">
          <mat-icon>{{ (kpis?.averageRatingDelta || 0) > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
          {{ Math.abs(kpis?.averageRatingDelta || 0).toFixed(1) }}
        </div>
        <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>
      </mat-card>

      <!-- Total Reviews KPI -->
      <mat-card class="kpi-card">
        <div class="kpi-header">
          <mat-icon class="kpi-icon">reviews</mat-icon>
          <span class="kpi-label">Total Reviews</span>
        </div>
        <div class="kpi-value">{{ (kpis?.totalReviews || 0).toLocaleString() }}</div>
        <div class="kpi-delta" [class.positive]="(kpis?.totalReviewsDelta || 0) > 0" [class.negative]="(kpis?.totalReviewsDelta || 0) < 0">
          <mat-icon>{{ (kpis?.totalReviewsDelta || 0) > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
          {{ (kpis?.totalReviewsDelta || 0) > 0 ? '+' : '' }}{{ Math.abs(kpis?.totalReviewsDelta || 0) }}
        </div>
        <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>
      </mat-card>

      <!-- Response Rate KPI -->
      <mat-card class="kpi-card">
        <div class="kpi-header">
          <mat-icon class="kpi-icon">reply</mat-icon>
          <span class="kpi-label">Response Rate</span>
        </div>
        <div class="kpi-value">{{ (kpis?.responseRate || 0).toFixed(0) }}%</div>
        <div class="kpi-delta" [class.positive]="(kpis?.responseRateDelta || 0) > 0" [class.negative]="(kpis?.responseRateDelta || 0) < 0">
          <mat-icon>{{ (kpis?.responseRateDelta || 0) > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
          {{ (kpis?.responseRateDelta || 0) > 0 ? '+' : '' }}{{ (kpis?.responseRateDelta || 0).toFixed(1) }}%
        </div>
        <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>
      </mat-card>

      <!-- Average Response Time KPI -->
      <mat-card class="kpi-card">
        <div class="kpi-header">
          <mat-icon class="kpi-icon">schedule</mat-icon>
          <span class="kpi-label">Avg Response Time</span>
        </div>
        <div class="kpi-value">{{ (kpis?.avgResponseTimeHours || 0).toFixed(1) }}h</div>
        <div class="kpi-delta" [class.positive]="(kpis?.avgResponseTimeDelta || 0) < 0" [class.negative]="(kpis?.avgResponseTimeDelta || 0) > 0">
          <mat-icon>{{ (kpis?.avgResponseTimeDelta || 0) < 0 ? 'trending_down' : 'trending_up' }}</mat-icon>
          {{ (kpis?.avgResponseTimeDelta || 0) < 0 ? '' : '+' }}{{ (kpis?.avgResponseTimeDelta || 0).toFixed(1) }}h
        </div>
        <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>
      </mat-card>
    </div>
  `,
  styleUrl: './reviews-kpis.component.css'
})
export class ReviewsKpisComponent {
  @Input() kpis: ReviewKpis | null = null;
  @Input() loading: boolean = false;

  Math = Math;
}
