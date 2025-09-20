import { Injectable } from '@angular/core';
import { Reservation } from '../../domain/entities/reservation.entity';

@Injectable({ providedIn: 'root' })
export class ExportReservationsCsvUseCase {
  execute(reservations: Reservation[] | Reservation, filename = 'reservas'): void {
    const data = Array.isArray(reservations) ? reservations : [reservations];

    const headers = [
      'ID',
      'Usuario',
      'Email',
      'Parking',
      'Espacio',
      'Fecha Inicio',
      'Fecha Fin',
      'Monto',
      'Moneda',
      'Estado',
      'Creado',
      'Actualizado'
    ];

    const rows = data.map(reservation => [
      reservation.id,
      reservation.userName || 'N/A',
      reservation.userEmail || 'N/A',
      reservation.parkingName || 'N/A',
      reservation.space || 'N/A',
      new Date(reservation.startTime).toLocaleString('es-ES'),
      new Date(reservation.endTime).toLocaleString('es-ES'),
      reservation.totalPrice,
      reservation.currency,
      reservation.status,
      new Date(reservation.createdAt).toLocaleString('es-ES'),
      new Date(reservation.updatedAt).toLocaleString('es-ES')
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}
