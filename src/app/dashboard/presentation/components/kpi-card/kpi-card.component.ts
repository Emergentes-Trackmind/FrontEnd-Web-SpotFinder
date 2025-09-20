import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface KpiData {
  title: string;
  value: string;
  delta: number;
  deltaText: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="kpi-card">
      <div class="kpi-header">
        <div class="kpi-icon" [style.background-color]="kpi.color">
          <mat-icon>{{ kpi.icon }}</mat-icon>
        </div>
        <div class="kpi-info">
          <h3 class="kpi-title">{{ kpi.title }}</h3>
          <div class="kpi-value">{{ kpi.value }}</div>
        </div>
      </div>
      <div class="kpi-footer">
        <span class="kpi-delta" [class.positive]="kpi.delta > 0" [class.negative]="kpi.delta < 0">
          <mat-icon class="delta-icon">{{ getDeltaIcon() }}</mat-icon>
          {{ Math.abs(kpi.delta) }}%
        </span>
        <span class="kpi-delta-text">{{ kpi.deltaText }}</span>
      </div>
    </mat-card>
  `,
  styleUrl: './kpi-card.component.css'
})
export class KpiCardComponent {
  @Input() kpi!: KpiData;

  Math = Math;

  getDeltaIcon(): string {
    if (this.kpi.delta > 0) return 'trending_up';
    if (this.kpi.delta < 0) return 'trending_down';
    return 'trending_flat';
  }
}
