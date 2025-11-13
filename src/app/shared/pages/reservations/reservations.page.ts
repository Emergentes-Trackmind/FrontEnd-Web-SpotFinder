import { Component } from '@angular/core';
import { ComingSoonComponent } from '../../components/coming-soon/coming-soon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [ComingSoonComponent, TranslateModule],
  template: `<app-coming-soon></app-coming-soon>`
})
export class ReservationsPage {
  constructor() {
    // Configurar el componente coming-soon para reservaciones
    setTimeout(() => {
      const comingSoon = document.querySelector('app-coming-soon') as any;
      if (comingSoon?.component) {
        comingSoon.component.icon = 'event_available';
        comingSoon.component.title = 'Reservaciones';
        comingSoon.component.description = 'Gestiona todas las reservaciones de tus parkings desde una interfaz centralizada.';
        comingSoon.component.features = [
          'Lista completa de reservaciones activas',
          'Calendario interactivo de disponibilidad',
          'Gestión de check-in/check-out',
          'Notificaciones automáticas a clientes',
          'Reportes de ocupación en tiempo real'
        ];
      }
    });
  }
}
