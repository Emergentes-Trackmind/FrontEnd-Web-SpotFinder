import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import { RevenueByMonthDTO } from '../../../domain/dtos/metrics.dto';

Chart.register(...registerables);

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule, BaseChartDirective],
  template: `
    <mat-card class="revenue-chart-card">
      <div class="chart-header">
        <div class="chart-title-section">
          <h3 class="chart-title">Ingresos Mensuales</h3>
          <p class="chart-subtitle">Comparación de ingresos vs objetivos durante el último año</p>
        </div>
        <div class="chart-actions">
          <button mat-icon-button>
            <mat-icon>more_vert</mat-icon>
          </button>
        </div>
      </div>

      <div class="chart-container" *ngIf="chartData">
        <canvas
          baseChart
          [data]="chartData"
          [options]="chartOptions"
          [type]="'line'"
          class="revenue-chart">
        </canvas>
      </div>

      <div class="loading-container" *ngIf="!chartData">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        <p>Cargando datos de ingresos...</p>
      </div>
    </mat-card>
  `,
  styleUrl: './revenue-chart.component.css'
})
export class RevenueChartComponent implements OnInit {
  @Input() data: RevenueByMonthDTO[] = [];
  @Input() loading: boolean = false;

  chartData: ChartConfiguration<'line'>['data'] | null = null;
  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `Ingresos: $${value.toLocaleString('es-ES')}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6'
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          callback: (value) => {
            return '$' + Number(value).toLocaleString('es-ES');
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
        borderColor: '#6D5AE6',
        backgroundColor: 'rgba(109, 90, 230, 0.1)',
        fill: true
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: '#6D5AE6',
        borderColor: '#fff',
        borderWidth: 2
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  ngOnInit() {
    this.updateChart();
  }

  ngOnChanges() {
    this.updateChart();
  }

  private updateChart(): void {
    if (this.data && this.data.length > 0) {
      this.chartData = {
        labels: this.data.map(item => this.formatMonth(item.month)),
        datasets: [{
          data: this.data.map(item => item.revenue),
          borderColor: '#6D5AE6',
          backgroundColor: 'rgba(109, 90, 230, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#6D5AE6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      };
    }
  }

  private formatMonth(month: string): string {
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    const date = new Date(month);
    return months[date.getMonth()];
  }
}
