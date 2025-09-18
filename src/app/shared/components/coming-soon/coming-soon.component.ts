import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="coming-soon-container">
      <mat-card class="coming-soon-card">
        <mat-card-content>
          <div class="coming-soon-content">
            <mat-icon class="coming-soon-icon">{{ icon }}</mat-icon>
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
            <div class="coming-soon-features">
              <h3>Próximamente:</h3>
              <ul>
                @for (feature of features; track feature) {
                  <li>{{ feature }}</li>
                }
              </ul>
            </div>
            <div class="coming-soon-actions">
              <button mat-raised-button class="primary-button" routerLink="/parkings">
                Volver a Mis Parkings
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
      --primary: #6D5AE6;
      --accent: #F59E0B;
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05);
    }

    .coming-soon-container {
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .coming-soon-card {
      max-width: 500px;
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
    }

    .coming-soon-content {
      text-align: center;
      padding: 32px;
    }

    .coming-soon-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: var(--primary);
      margin-bottom: 24px;
    }

    h1 {
      color: var(--text);
      margin: 0 0 12px 0;
      font-size: 32px;
      font-weight: 700;
    }

    p {
      color: var(--muted);
      margin: 0 0 32px 0;
      font-size: 16px;
      line-height: 1.5;
    }

    .coming-soon-features {
      text-align: left;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 32px;
    }

    .coming-soon-features h3 {
      color: var(--text);
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .coming-soon-features ul {
      margin: 0;
      padding-left: 20px;
      color: var(--muted);
    }

    .coming-soon-features li {
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .primary-button {
      background: var(--accent) !important;
      color: white !important;
      border-radius: 8px !important;
      padding: 14px 32px !important;
      font-weight: 600 !important;
      height: 48px;
    }
  `]
})
export class ComingSoonComponent {
  icon = 'construction';
  title = 'Próximamente';
  description = 'Esta funcionalidad estará disponible muy pronto. Estamos trabajando para brindarte la mejor experiencia.';
  features = [
    'Interfaz intuitiva y moderna',
    'Funcionalidades avanzadas',
    'Integración completa con el sistema',
    'Notificaciones en tiempo real'
  ];
}
