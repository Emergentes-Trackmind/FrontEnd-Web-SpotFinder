import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <div class="unauthorized-container">
      <mat-card class="unauthorized-card">
        <mat-card-content>
          <div class="unauthorized-content">
            <mat-icon class="unauthorized-icon">block</mat-icon>
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos suficientes para acceder a esta página</p>
            <div class="unauthorized-actions">
              <button mat-raised-button class="primary-button" routerLink="/parkings">
                Ir a Mis Parkings
              </button>
              <button mat-stroked-button routerLink="/auth/login">
                Iniciar Sesión
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      --card: #fff;
      --bg: #F9FAFB;
      --border: #E5E7EB;
      --text: #111827;
      --muted: #6B7280;
      --accent: #F59E0B;
      --danger: #EF4444;
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05);
    }

    .unauthorized-container {
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .unauthorized-card {
      max-width: 420px;
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
    }

    .unauthorized-content {
      text-align: center;
      padding: 32px;
    }

    .unauthorized-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--danger);
      margin-bottom: 16px;
    }

    h1 {
      color: var(--text);
      margin: 0 0 12px 0;
      font-size: 24px;
      font-weight: 600;
    }

    p {
      color: var(--muted);
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .unauthorized-actions {
      display: grid;
      gap: 12px;
    }

    .primary-button {
      background: var(--accent) !important;
      color: white !important;
      border-radius: 8px !important;
      height: 48px;
    }
  `]
})
export class UnauthorizedPage {}
