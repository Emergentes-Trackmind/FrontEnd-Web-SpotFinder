import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthService } from '../../../iam/services/auth.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>¡Bienvenido de vuelta, {{ getUserFirstName() }}!</h1>
        <p>Aquí tienes un resumen rápido de tus parkings</p>
      </div>

      <div class="dashboard-content">
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-item">
                <mat-icon class="stat-icon primary">local_parking</mat-icon>
                <div class="stat-info">
                  <h3>Total Parkings</h3>
                  <p class="stat-number">{{ totalParkings }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-item">
                <mat-icon class="stat-icon success">trending_up</mat-icon>
                <div class="stat-info">
                  <h3>Ocupación Promedio</h3>
                  <p class="stat-number">{{ avgOccupation }}%</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-item">
                <mat-icon class="stat-icon accent">attach_money</mat-icon>
                <div class="stat-info">
                  <h3>Ingresos del Mes</h3>
                  <p class="stat-number">{{ formatCurrency(monthlyRevenue) }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-item">
                <mat-icon class="stat-icon warning">people</mat-icon>
                <div class="stat-info">
                  <h3>Usuarios Únicos</h3>
                  <p class="stat-number">{{ uniqueUsers }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="quick-actions">
          <h2>Acciones Rápidas</h2>
          <div class="actions-grid">
            <mat-card class="action-card" routerLink="/parkings/new">
              <mat-card-content>
                <mat-icon>add_location</mat-icon>
                <h3>Nuevo Parking</h3>
                <p>Registra un nuevo parking</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="action-card" routerLink="/parkings">
              <mat-card-content>
                <mat-icon>list</mat-icon>
                <h3>Mis Parkings</h3>
                <p>Ver todos mis parkings</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="action-card" routerLink="/me/profile">
              <mat-card-content>
                <mat-icon>account_circle</mat-icon>
                <h3>Mi Perfil</h3>
                <p>Actualizar información</p>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --card: #fff;
      --bg: #F9FAFB;
      --border: #E5E7EB;
      --text: #111827;
      --muted: #6B7280;
      --primary: #6D5AE6;
      --accent: #F59E0B;
      --success: #10B981;
      --warning: #F59E0B;
      --shadow: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.03);
    }

    .dashboard-container {
      padding: 24px;
      background: var(--bg);
      min-height: 100vh;
    }

    .dashboard-header h1 {
      color: var(--text);
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }

    .dashboard-header p {
      color: var(--muted);
      font-size: 16px;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: var(--shadow);
      transition: transform 0.2s ease;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .stat-icon.primary { background: var(--primary); color: white; }
    .stat-icon.success { background: var(--success); color: white; }
    .stat-icon.accent { background: var(--accent); color: white; }
    .stat-icon.warning { background: var(--warning); color: white; }

    .stat-number {
      color: var(--text);
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-card {
      border: 1px solid var(--border);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-card:hover {
      transform: translateY(-2px);
      border-color: var(--primary);
    }
  `]
})
export class HomePage implements OnInit {
  totalParkings = 0;
  avgOccupation = 0;
  monthlyRevenue = 0;
  uniqueUsers = 0;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.totalParkings = 6;
    this.avgOccupation = 78;
    this.monthlyRevenue = 24500;
    this.uniqueUsers = 1250;
  }

  getUserFirstName(): string {
    const user = this.authService.user();
    return user?.firstName || 'Usuario';
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }
}
