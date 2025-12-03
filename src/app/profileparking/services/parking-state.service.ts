import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Servicio para mantener el estado del parking durante el flujo de creación
 * Guarda temporalmente los valores entre pasos del wizard
 */
@Injectable({
  providedIn: 'root'
})
export class ParkingStateService {
  private stateSubject = new BehaviorSubject<ParkingTemporaryState>({
    step: 1,
    basicInfo: null,
    spots: null,
    location: null,
    features: null,
    pricing: null,
    filterSelection: 'all',
    pendingSpotsCreation: null
  });

  state$: Observable<ParkingTemporaryState> = this.stateSubject.asObservable();

  get currentState(): ParkingTemporaryState {
    return this.stateSubject.value;
  }

  setBasicInfo(info: BasicInfoState): void {
    this.updateState({ basicInfo: info });
  }

  setSpotsData(spots: SpotData[]): void {
    this.updateState({ spots });
  }

  setCurrentStep(step: number): void {
    this.updateState({ step });
  }

  setFilterSelection(filter: SpotFilterType): void {
    this.updateState({ filterSelection: filter });
  }

  getTotalSpots(): number {
    return this.currentState.basicInfo?.totalSpaces || 0;
  }

  getBasicInfo(): BasicInfoState | null {
    return this.currentState.basicInfo;
  }

  getSpots(): SpotData[] | null {
    return this.currentState.spots;
  }

  setPendingSpotsCreation(pending: PendingSpotsCreation): void {
    this.updateState({ pendingSpotsCreation: pending });
    console.log('💾 ParkingStateService: Spots pendientes guardados:', pending);
  }

  getPendingSpotsCreation(): PendingSpotsCreation | null {
    return this.currentState.pendingSpotsCreation;
  }

  hasPendingSpotsCreation(): boolean {
    const pending = this.currentState.pendingSpotsCreation;
    return !!(pending && pending.confirmed);
  }

  clearPendingSpotsCreation(): void {
    this.updateState({ pendingSpotsCreation: null });
  }

  clearState(): void {
    this.stateSubject.next({
      step: 1,
      basicInfo: null,
      spots: null,
      location: null,
      features: null,
      pricing: null,
      filterSelection: 'all',
      pendingSpotsCreation: null
    });
  }

  private updateState(partial: Partial<ParkingTemporaryState>): void {
    this.stateSubject.next({
      ...this.currentState,
      ...partial
    });
  }
}

export interface ParkingTemporaryState {
  step: number;
  basicInfo: BasicInfoState | null;
  spots: SpotData[] | null;
  location: any | null;
  features: any | null;
  pricing: any | null;
  filterSelection: SpotFilterType;
  pendingSpotsCreation: PendingSpotsCreation | null;
}

export interface PendingSpotsCreation {
  totalSpots: number;
  spotsData: any[];
  confirmed: boolean;
  createdAt: Date;
}

export interface BasicInfoState {
  name: string;
  type: string;
  description: string;
  totalSpaces: number;
  accessibleSpaces: number;
  phone: string;
  email: string;
  website?: string;
}

export interface SpotData {
  id: number;
  spotNumber: number;
  status: SpotStatus;
  deviceId: string | null;
  inMaintenance: boolean;
  lastUpdated: Date;
}

export type SpotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
export type SpotFilterType = 'all' | 'available' | 'occupied' | 'reserved';

