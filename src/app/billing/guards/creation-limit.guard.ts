import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LimitsService } from '../services/limits.service';
import { UpgradeDialogComponent } from '../components/upgrade-dialog/upgrade-dialog.component';

/**
 * Guard/Helper para bloquear acciones de creación cuando se alcanza el límite
 */
@Injectable({
  providedIn: 'root'
})
export class CreationLimitGuard {
  private limitsService = inject(LimitsService);
  private dialog = inject(MatDialog);

  /**
   * Verifica si se puede crear un parking
   * Si no se puede, muestra el diálogo de upgrade
   * @returns true si puede crear, false si no
   */
  canCreateParking(): boolean {
    const canCreate = this.limitsService.canCreateParking();

    if (!canCreate) {
      this.showUpgradeDialog('parking');
    }

    return canCreate;
  }

  /**
   * Verifica si se puede crear un dispositivo IoT
   * Si no se puede, muestra el diálogo de upgrade
   * @returns true si puede crear, false si no
   */
  canCreateDevice(): boolean {
    const canCreate = this.limitsService.canCreateDevice();

    if (!canCreate) {
      this.showUpgradeDialog('iot');
    }

    return canCreate;
  }

  /**
   * Muestra el diálogo de upgrade
   */
  private showUpgradeDialog(type: 'parking' | 'iot') {
    const upgradeCta = this.limitsService.getUpgradeCta();

    if (!upgradeCta) {
      console.warn('⚠️ No se encontró plan de upgrade disponible');
      return;
    }

    this.dialog.open(UpgradeDialogComponent, {
      width: '500px',
      data: {
        type,
        plan: upgradeCta.plan,
        priceId: upgradeCta.priceId
      }
    });
  }
}

