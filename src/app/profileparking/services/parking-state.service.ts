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
    filterSelection: 'all'
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

  clearState(): void {
    this.stateSubject.next({
      step: 1,
      basicInfo: null,
      spots: null,
      location: null,
      features: null,
      pricing: null,
      filterSelection: 'all'
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

export type SpotStatus = 'free' | 'occupied' | 'maintenance' | 'offline';
export type SpotFilterType = 'all' | 'free' | 'occupied' | 'maintenance' | 'offline';

