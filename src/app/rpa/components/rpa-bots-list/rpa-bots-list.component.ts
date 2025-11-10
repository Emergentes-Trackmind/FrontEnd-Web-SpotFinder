import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { RpaBot } from '../../pages/centro-automatizacion-robotica-page/centro-automatizacion-robotica-page.component';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-rpa-bots-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule,
    MatDivider
  ],
  templateUrl: './rpa-bots-list.component.html',
  styleUrl: './rpa-bots-list.component.css'
})
export class RpaBotsListComponent {
  @Input() bots: RpaBot[] = [];
  @Input() loading = false;

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'paused': return 'accent';
      case 'error': return 'warn';
      default: return 'primary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'paused': return 'Pausado';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return 'play_circle';
      case 'paused': return 'pause_circle';
      case 'error': return 'error';
      default: return 'help';
    }
  }

  onViewDetail(bot: RpaBot): void {
    console.log('Ver detalle del bot:', bot);
    // TODO: Implementar navegación o modal de detalle
  }

  onRunNow(bot: RpaBot): void {
    console.log('Ejecutar bot ahora:', bot);
    // TODO: Implementar ejecución manual del bot
  }

  onEditBot(bot: RpaBot): void {
    console.log('Editar bot:', bot);
    // TODO: Implementar edición del bot
  }

  onDeleteBot(bot: RpaBot): void {
    console.log('Eliminar bot:', bot);
    // TODO: Implementar confirmación y eliminación
  }
}
