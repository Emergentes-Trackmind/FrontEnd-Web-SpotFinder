import { Routes } from '@angular/router';
import { AuthGuard } from '../iam/guards/auth.guard';

export const IOT_ROUTES: Routes = [
  {
    path: 'devices',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./presentation/pages/devices-dashboard/devices-dashboard.component').then(
            (m) => m.DevicesDashboardComponent
          ),
        title: 'Dispositivos IoT'
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./presentation/pages/device-detail/device-detail.component').then(
            (m) => m.DeviceDetailComponent
          ),
        title: 'Nuevo Dispositivo'
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./presentation/pages/device-detail/device-detail.component').then(
            (m) => m.DeviceDetailComponent
          ),
        title: 'Detalle Dispositivo'
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./presentation/pages/device-detail/device-detail.component').then(
            (m) => m.DeviceDetailComponent
          ),
        title: 'Editar Dispositivo'
      }
    ]
  },
  {
    path: 'simulation',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./presentation/components/sensor-simulation/sensor-simulation.component').then(
        (m) => m.SensorSimulationComponent
      ),
    title: 'Simulación de Sensores IoT'
  }
];

