import { Component } from '@angular/core';
import { ComingSoonComponent } from '../../components/coming-soon/coming-soon.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [ComingSoonComponent],
  template: `<app-coming-soon></app-coming-soon>`
})
export class ReviewsPage {
  constructor() {
    // Configurar el componente coming-soon para reseñas
    setTimeout(() => {
      const comingSoon = document.querySelector('app-coming-soon') as any;
      if (comingSoon?.component) {
        comingSoon.component.icon = 'star_rate';
        comingSoon.component.title = 'Reseñas';
        comingSoon.component.description = 'Administra las reseñas y calificaciones de tus parkings para mejorar la experiencia del cliente.';
        comingSoon.component.features = [
          'Dashboard de reseñas y calificaciones',
          'Respuestas a comentarios de clientes',
          'Análisis de sentimientos automático',
          'Alertas de reseñas negativas',
          'Reportes de satisfacción del cliente'
        ];
      }
    });
  }
}
