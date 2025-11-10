import { Component, Input, ViewChild, OnInit, OnChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { RpaExecution } from '../../pages/centro-automatizacion-robotica-page/centro-automatizacion-robotica-page.component';

@Component({
  selector: 'app-rpa-executions-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './rpa-executions-table.component.html',
  styleUrl: './rpa-executions-table.component.css'
})
export class RpaExecutionsTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() executions: RpaExecution[] = [];
  @Input() loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['date', 'botName', 'status', 'duration', 'message'];
  dataSource = new MatTableDataSource<RpaExecution>();

  ngOnInit(): void {
    this.updateDataSource();
  }

  ngOnChanges(): void {
    this.updateDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  private updateDataSource(): void {
    this.dataSource.data = this.executions;
  }

  getStatusColor(status: string): string {
    return status === 'success' ? 'primary' : 'warn';
  }

  getStatusText(status: string): string {
    return status === 'success' ? 'Éxito' : 'Error';
  }

  getStatusIcon(status: string): string {
    return status === 'success' ? 'check_circle' : 'error';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
