import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { NuevoRobotRpaDialogComponent } from '../../components/nuevo-robot-rpa-dialog/nuevo-robot-rpa-dialog.component';

import { RpaSummaryCardsComponent } from '../../components/rpa-summary-cards/rpa-summary-cards.component';
import { RpaBotsListComponent } from '../../components/rpa-bots-list/rpa-bots-list.component';
import { RpaExecutionsTableComponent } from '../../components/rpa-executions-table/rpa-executions-table.component';

// Interfaces
export interface RpaSummary {
  activeBots: number;
  jobsToday: number;
  timeSaved: string;
  successRate: number;
}

export interface RpaBot {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'error';
  executionsToday: number;
  lastRunRelative: string;
}

export interface RpaExecution {
  id: string;
  date: Date;
  botName: string;
  status: 'success' | 'error';
  duration: string;
  message: string;
}

@Component({
  selector: 'app-centro-automatizacion-robotica-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    RpaSummaryCardsComponent,
    RpaBotsListComponent,
    RpaExecutionsTableComponent
  ],
  templateUrl: './centro-automatizacion-robotica-page.component.html',
  styleUrl: './centro-automatizacion-robotica-page.component.css'
})
export class CentroAutomatizacionRoboticaPageComponent implements OnInit {
  constructor(private dialog: MatDialog) {}

  loading = signal(false);

  // Summary data
  rpaSummary = signal<RpaSummary>({
    activeBots: 5,
    jobsToday: 42,
    timeSaved: '12h 30m',
    successRate: 98.5
  });

  // Bots data
  rpaBots = signal<RpaBot[]>([
    {
      id: 'bot-001',
      name: 'Bot Facturación SUNAT',
      description: 'Genera factura electrónica en SUNAT al confirmarse un pago en el sistema',
      status: 'active',
      executionsToday: 12,
      lastRunRelative: 'Hace 5 min'
    },
    {
      id: 'bot-002',
      name: 'Bot Conciliación Bancaria',
      description: 'Concilia automáticamente los movimientos bancarios con las transacciones del sistema',
      status: 'active',
      executionsToday: 8,
      lastRunRelative: 'Hace 15 min'
    },
    {
      id: 'bot-003',
      name: 'Bot Reporte Diario Excel',
      description: 'Genera y envía por email el reporte diario de ingresos y ocupación en formato Excel',
      status: 'paused',
      executionsToday: 0,
      lastRunRelative: 'Hace 2 horas'
    },
    {
      id: 'bot-004',
      name: 'Bot Actualización ERP',
      description: 'Sincroniza los datos de reservas y pagos con el sistema ERP empresarial',
      status: 'error',
      executionsToday: 3,
      lastRunRelative: 'Hace 1 hora'
    }
  ]);

  // Executions data
  rpaExecutions = signal<RpaExecution[]>([
    {
      id: 'exec-001',
      date: new Date('2025-11-10T14:30:00'),
      botName: 'Bot Facturación SUNAT',
      status: 'success',
      duration: '2m 15s',
      message: 'Factura F001-00012345 registrada correctamente en SUNAT'
    },
    {
      id: 'exec-002',
      date: new Date('2025-11-10T14:25:00'),
      botName: 'Bot Conciliación Bancaria',
      status: 'success',
      duration: '45s',
      message: 'Conciliadas 15 transacciones del BCP correctamente'
    },
    {
      id: 'exec-003',
      date: new Date('2025-11-10T14:20:00'),
      botName: 'Bot Facturación SUNAT',
      status: 'success',
      duration: '1m 50s',
      message: 'Factura F001-00012344 registrada correctamente en SUNAT'
    },
    {
      id: 'exec-004',
      date: new Date('2025-11-10T14:15:00'),
      botName: 'Bot Actualización ERP',
      status: 'error',
      duration: '30s',
      message: 'Error de conexión con el servidor ERP. Timeout después de 30s'
    },
    {
      id: 'exec-005',
      date: new Date('2025-11-10T14:10:00'),
      botName: 'Bot Conciliación Bancaria',
      status: 'success',
      duration: '1m 20s',
      message: 'Conciliadas 8 transacciones de Interbank correctamente'
    },
    {
      id: 'exec-006',
      date: new Date('2025-11-10T14:05:00'),
      botName: 'Bot Facturación SUNAT',
      status: 'success',
      duration: '2m 05s',
      message: 'Factura F001-00012343 registrada correctamente en SUNAT'
    },
    {
      id: 'exec-007',
      date: new Date('2025-11-10T14:00:00'),
      botName: 'Bot Actualización ERP',
      status: 'success',
      duration: '3m 10s',
      message: 'Sincronizadas 25 reservas con el sistema ERP'
    },
    {
      id: 'exec-008',
      date: new Date('2025-11-10T13:55:00'),
      botName: 'Bot Conciliación Bancaria',
      status: 'success',
      duration: '55s',
      message: 'Conciliadas 12 transacciones de BBVA correctamente'
    },
    {
      id: 'exec-009',
      date: new Date('2025-11-10T13:50:00'),
      botName: 'Bot Facturación SUNAT',
      status: 'success',
      duration: '1m 45s',
      message: 'Factura F001-00012342 registrada correctamente en SUNAT'
    },
    {
      id: 'exec-010',
      date: new Date('2025-11-10T13:45:00'),
      botName: 'Bot Actualización ERP',
      status: 'error',
      duration: '15s',
      message: 'Credenciales de API inválidas. Verificar configuración'
    }
  ]);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);

    // Simulate API call delay
    setTimeout(() => {
      this.loading.set(false);
    }, 800);
  }

  onCreateNewBot(): void {
    const dialogRef = this.dialog.open(NuevoRobotRpaDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      disableClose: true,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('🤖 Nuevo robot RPA creado:', result);
        // TODO: Aquí se podría actualizar la lista de bots o mostrar un mensaje de éxito
        // this.loadBots(); // Recargar la lista de bots
        // this.showSuccessMessage('Robot RPA creado exitosamente');
      }
    });
  }

  onRefreshData(): void {
    this.loadData();
  }
}
