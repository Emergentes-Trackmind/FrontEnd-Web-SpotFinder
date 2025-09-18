import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ParkingCreateService } from '../../../../services/parking-create.service';
import { MapsService } from '../../../../services/maps.service';
import { MapComponent } from '../../../../components/map/map.component';
import { CreateLocationDto, MapCoordinates, GeocodeResult } from '../../../../services/create-types';

@Component({
  selector: 'app-step-location',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MapComponent
  ],
  templateUrl: './step-location.component.html',
  styleUrls: ['./step-location.component.css']
})
export class StepLocationComponent implements OnInit, OnDestroy {
  @ViewChild(MapComponent) mapComponent!: MapComponent;

  locationForm!: FormGroup;
  mapCenter: MapCoordinates = { lat: 40.4168, lng: -3.7038 }; // Madrid por defecto
  isGeocoding = false;
  isLoadingCurrentLocation = false;
  geocodeResults: GeocodeResult[] = [];

  private destroy$ = new Subject<void>();
  private geocodeInProgress = false;

  constructor(
    private fb: FormBuilder,
    private createService: ParkingCreateService,
    private mapsService: MapsService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSavedData();
    this.setupFormSubscription();
    this.setupGeocoding();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.locationForm = this.fb.group({
      addressLine: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      state: ['', [Validators.maxLength(100)]],
      country: ['España', [Validators.required]],
      latitude: [40.4168, [Validators.required]],
      longitude: [-3.7038, [Validators.required]]
    });
  }

  private loadSavedData(): void {
    this.createService.location$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.locationForm.patchValue(data, { emitEvent: false });

          if (data.latitude && data.longitude) {
            this.mapCenter = { lat: data.latitude, lng: data.longitude };
          }
        }
      });
  }

  private setupFormSubscription(): void {
    this.locationForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.createService.updateLocation(value);
      });
  }

  private setupGeocoding(): void {
    // Escuchar cambios en los campos de dirección para geocodificación automática
    const addressFields = ['addressLine', 'city', 'postalCode', 'state', 'country'];

    addressFields.forEach(field => {
      this.locationForm.get(field)?.valueChanges
        .pipe(
          debounceTime(800),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.geocodeAddress();
        });
    });
  }

  private geocodeAddress(): void {
    if (this.geocodeInProgress) return;

    const address = this.buildAddressQuery();
    if (!address.trim()) return;

    this.geocodeInProgress = true;
    this.isGeocoding = true;
    this.geocodeResults = [];

    this.mapsService.geocode(address)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.geocodeResults = results;

          if (results.length > 0) {
            const bestResult = results[0];
            this.updateMapLocation(bestResult.lat, bestResult.lng);
          }

          this.isGeocoding = false;
          this.geocodeInProgress = false;
        },
        error: (error) => {
          console.error('Error en geocodificación:', error);
          this.isGeocoding = false;
          this.geocodeInProgress = false;
        }
      });
  }

  private buildAddressQuery(): string {
    const formValue = this.locationForm.value;
    return this.mapsService.buildSearchQuery(formValue);
  }

  private updateMapLocation(lat: number, lng: number): void {
    this.mapCenter = { lat, lng };
    this.locationForm.patchValue({ latitude: lat, longitude: lng });

    if (this.mapComponent) {
      this.mapComponent.centerMap({ lat, lng });
    }
  }

  onMapClicked(coords: MapCoordinates): void {
    this.updateMapLocation(coords.lat, coords.lng);
    this.reverseGeocode(coords.lat, coords.lng);
  }

  onMarkerMoved(coords: MapCoordinates): void {
    this.updateMapLocation(coords.lat, coords.lng);
    this.reverseGeocode(coords.lat, coords.lng);
  }

  private reverseGeocode(lat: number, lng: number): void {
    this.mapsService.reverseGeocode(lat, lng)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result && result.address) {
            const currentForm = this.locationForm.value;
            const updates: any = {};

            // Solo actualizar campos vacíos
            if (!currentForm.addressLine && result.address.road) {
              updates.addressLine = result.address.road;
            }
            if (!currentForm.city && result.address.city) {
              updates.city = result.address.city;
            }
            if (!currentForm.postalCode && result.address.postcode) {
              updates.postalCode = result.address.postcode;
            }
            if (!currentForm.state && result.address.state) {
              updates.state = result.address.state;
            }

            if (Object.keys(updates).length > 0) {
              this.locationForm.patchValue(updates);
            }
          }
        },
        error: (error) => {
          console.error('Error en geocodificación inversa:', error);
        }
      });
  }

  async onUseCurrentLocation(): Promise<void> {
    this.isLoadingCurrentLocation = true;

    try {
      const coords = await this.mapsService.getCurrentLocation();
      this.updateMapLocation(coords.lat, coords.lng);
      this.reverseGeocode(coords.lat, coords.lng);
    } catch (error) {
      console.error('Error obteniendo ubicación actual:', error);
    } finally {
      this.isLoadingCurrentLocation = false;
    }
  }

  onGeocodeResultSelected(result: GeocodeResult): void {
    this.updateMapLocation(result.lat, result.lng);

    if (result.address) {
      const updates: any = {};

      if (result.address.road) updates.addressLine = result.address.road;
      if (result.address.city) updates.city = result.address.city;
      if (result.address.postcode) updates.postalCode = result.address.postcode;
      if (result.address.state) updates.state = result.address.state;
      if (result.address.country) updates.country = result.address.country;

      this.locationForm.patchValue(updates);
    }

    this.geocodeResults = [];
  }

  getErrorMessage(fieldName: string): string {
    const field = this.locationForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;

    switch (fieldName) {
      case 'addressLine':
        if (errors['required']) return 'La dirección es obligatoria';
        if (errors['minlength']) return 'La dirección debe tener al menos 5 caracteres';
        if (errors['maxlength']) return 'La dirección no puede exceder 200 caracteres';
        break;

      case 'city':
        if (errors['required']) return 'La ciudad es obligatoria';
        if (errors['minlength']) return 'La ciudad debe tener al menos 2 caracteres';
        if (errors['maxlength']) return 'La ciudad no puede exceder 100 caracteres';
        break;

      case 'postalCode':
        if (errors['required']) return 'El código postal es obligatorio';
        if (errors['pattern']) return 'Debe ser un código postal válido (5 dígitos)';
        break;

      case 'country':
        if (errors['required']) return 'El país es obligatorio';
        break;
    }

    return 'Campo inválido';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.locationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
