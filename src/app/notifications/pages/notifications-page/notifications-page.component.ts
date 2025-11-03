import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationsPanelHeaderComponent } from '../../components/notifications-panel-header/notifications-panel-header.component';
import { NotificationItemComponent } from '../../components/notification-item/notification-item.component';
import { NotificationsService } from '../../services/notifications.service';
import { AppNotification } from '../../models/notification.models';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Página principal del panel de notificaciones
 * Permite buscar, filtrar, marcar como leídas y eliminar notificaciones
 */
@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    NotificationsPanelHeaderComponent,
    NotificationItemComponent
  ],
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.css']
})
export class NotificationsPageComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);

  protected readonly notifications = this.notificationsService.notifications;
  protected readonly loading = this.notificationsService.loading;
  protected readonly unreadCount = this.notificationsService.unreadCount;

  // Getters seguros
  protected get safeNotifications(): AppNotification[] {
    return this.notifications() || [];
  }

  protected get safeUnreadCount(): number {
    return this.unreadCount() || 0;
  }

  protected searchQuery = signal('');
  protected filter = signal<'all' | 'unread' | 'read'>('all');

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    // Cargar notificaciones iniciales
    this.reload();

    // Configurar búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.reload();
    });

    // Si hay no leídas, mostrar ese filtro por defecto
    if (this.safeUnreadCount > 0) {
      this.filter.set('unread');
    }
  }

  onSearch(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.reload();
  }

  onFilterChange(value: 'all' | 'unread' | 'read'): void {
    this.filter.set(value);
    this.reload();
  }

  reload(): void {
    const params: any = {};

    if (this.searchQuery()) {
      params.q = this.searchQuery();
    }

    const filterValue = this.filter();
    if (filterValue === 'unread') {
      params.read = false;
    } else if (filterValue === 'read') {
      params.read = true;
    }

    this.notificationsService.reload(params).subscribe({
      error: (err) => console.error('Error al cargar notificaciones:', err)
    });
  }

  markRead(id: string): void {
    this.notificationsService.markRead(id).subscribe({
      error: (err) => console.error('Error al marcar como leída:', err)
    });
  }

  remove(id: string): void {
    this.notificationsService.delete(id).subscribe({
      error: (err) => console.error('Error al eliminar notificación:', err)
    });
  }

  markAllRead(): void {
    this.notificationsService.markAllRead().subscribe({
      error: (err) => console.error('Error al marcar todas como leídas:', err)
    });
  }

  confirmDeleteAll(): void {
    const confirmed = confirm(
      '¿Estás seguro de que deseas eliminar todas las notificaciones? Esta acción no se puede deshacer.'
    );

    if (confirmed) {
      this.notificationsService.deleteAll().subscribe({
        error: (err) => console.error('Error al eliminar todas:', err)
      });
    }
  }

  trackById(index: number, item: any): string {
    return item.id;
  }
}

