import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LocationData } from '../../../model/profileparking.entity';
import { ParkingProfileService } from '../../../services/parking-profile.service';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-location-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './location-tab.html',
  styleUrls: ['./location-tab.css']
})
export class LocationTabComponent implements OnInit, OnChanges {
  @Input() profileId?: string | null;
  locationForm!: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private service: ParkingProfileService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.locationForm = this.fb.group({
      addressLine: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{0,10}$/)]],
      state: ['', [Validators.required]],
      country: ['', [Validators.required]],
      latitude: [0, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [0, [Validators.required, Validators.min(-180), Validators.max(180)]]
    });

    if (this.profileId) this.loadLocation(this.profileId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profileId'] && !changes['profileId'].isFirstChange()) {
      const id = changes['profileId'].currentValue as string | null;
      if (id) this.loadLocation(id);
    }
  }

  private loadLocation(id: string): void {
    this.isLoading = true;
    this.service.getLocation(id).pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: (loc: LocationData) => {
        this.locationForm.patchValue(loc);
      },
      error: (err) => {
        console.error('Error loading location', err);
        this.snackBar.open('No se pudo cargar la ubicación', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onSave(): void {
    if (!this.profileId) return;
    if (this.locationForm.valid) {
      const payload: LocationData = this.locationForm.value;
      this.service.updateLocation(this.profileId, payload).subscribe({
        next: () => this.snackBar.open('Ubicación actualizada', 'Cerrar', { duration: 2000 }),
        error: (err) => {
          console.error('Update location error', err);
          this.snackBar.open('Error al actualizar ubicación', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.locationForm.controls).forEach((field) => {
      const control = this.locationForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
}
