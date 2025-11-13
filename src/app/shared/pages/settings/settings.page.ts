import { Component } from '@angular/core';
import { ComingSoonComponent } from '../../components/coming-soon/coming-soon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ComingSoonComponent, TranslateModule],
  template: `<app-coming-soon></app-coming-soon>`
})
export class SettingsPage {
  constructor() {
    setTimeout(() => {
      const comingSoon = document.querySelector('app-coming-soon') as any;
      if (comingSoon?.component) {
        comingSoon.component.icon = 'settings';
        comingSoon.component.title = 'Configuración';
        comingSoon.component.description = 'Configura aspectos avanzados de tu cuenta y la plataforma según tus necesidades.';
        comingSoon.component.features = [
          'Configuración avanzada de notificaciones',
          'Gestión de integraciones con terceros',
          'Configuración de facturación y pagos',
          'Políticas de privacidad personalizadas',
          'Configuración de API y webhooks'
        ];
      }
    });
  }
}
