import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import { OccupancyByHourDTO } from '../../../domain/dtos/metrics.dto';

Chart.register(...registerables);

@Component({
  selector: 'app-occupancy-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule, BaseChartDirective],
  template: `
    <mat-card class="occupancy-chart-card">
      <div class="chart-header">
        <div class="chart-title-section">
          <h3 class="chart-title">Ocupación por Hora</h3>
          <p class="chart-subtitle">Porcentaje de ocupación promedio durante el día de hoy</p>
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
          [type]="'bar'"
          class="occupancy-chart">
        </canvas>
      </div>

      <div class="loading-container" *ngIf="!chartData">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        <p>Cargando datos de ocupación...</p>
      </div>
    </mat-card>
  `,
  styleUrl: './occupancy-chart.component.css'
})
export class OccupancyChartComponent implements OnInit {
  @Input() data: OccupancyByHourDTO[] = [];
  @Input() loading: boolean = false;

  chartData: ChartConfiguration<'bar'>['data'] | null = null;
  chartOptions: ChartOptions<'bar'> = {
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
            const hourData = this.data[context.dataIndex];
            return [
              `Ocupación: ${value}%`,
              `Ocupados: ${hourData?.occupied || 0}`,
              `Total: ${hourData?.total || 0}`
            ];
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
            size: 10
          }
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
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
            return value + '%';
          }
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false
      }
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
        labels: this.data.map(item => this.formatHour(item.hour)),
        datasets: [{
          data: this.data.map(item => item.percentage),
          backgroundColor: this.data.map(item => this.getBarColor(item.percentage)),
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 4,
          borderSkipped: false
        }]
      };
    }
  }

  private formatHour(hour: number): string {
    return hour.toString().padStart(2, '0') + ':00';
  }

  private getBarColor(percentage: number): string {
    if (percentage >= 90) return '#EF4444'; // Rojo - muy ocupado
    if (percentage >= 70) return '#F59E0B'; // Amarillo - ocupado
    if (percentage >= 50) return '#6D5AE6'; // Morado - moderado
    return '#16A34A'; // Verde - disponible
  }
}
