import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { RpaSummary } from '../../pages/centro-automatizacion-robotica-page/centro-automatizacion-robotica-page.component';

interface RpaKpiCard {
  title: string;
  value: string;
  description: string;
  icon: string;
  color: string;
  trend?: number;
}

@Component({
  selector: 'app-rpa-summary-cards',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './rpa-summary-cards.component.html',
  styleUrl: './rpa-summary-cards.component.css'
})
export class RpaSummaryCardsComponent {
  @Input() summary!: RpaSummary;
  @Input() loading = false;

  get kpiCards(): RpaKpiCard[] {
    if (!this.summary) return [];

    return [
      {
        title: 'Robots Activos',
        value: this.summary.activeBots.toString(),
        description: 'Bots listos para ejecutar procesos',
        icon: 'smart_toy',
        color: '#6D5AE6',
        trend: 12
      },
      {
        title: 'Jobs Ejecutados Hoy',
        value: this.summary.jobsToday.toString(),
        description: 'Ejecuciones RPA completadas hoy',
        icon: 'play_circle',
        color: '#16A34A',
        trend: 8
      },
      {
        title: 'Tiempo Ahorrado',
        value: this.summary.timeSaved,
        description: 'Tiempo estimado ahorrado por RPA',
        icon: 'schedule',
        color: '#F59E0B',
        trend: 15
      },
      {
        title: 'Tasa de Éxito RPA',
        value: `${this.summary.successRate}%`,
        description: 'Porcentaje de jobs exitosos',
        icon: 'trending_up',
        color: '#8B5CF6',
        trend: 5
      }
    ];
  }
}
