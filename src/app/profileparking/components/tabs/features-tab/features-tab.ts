import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FeaturesData } from '../../../model/profileparking.entity';
import { ParkingProfileService } from '../../../services/parking-profile.service';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-features-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './features-tab.html',
  styleUrls: ['./features-tab.css']
})
export class FeaturesTabComponent implements OnInit, OnChanges {
  @Input() profileId?: string | null;

  featuresForm!: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private service: ParkingProfileService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.featuresForm = this.fb.group({
      security: this.fb.group({
        security24h: [false],
        cameras: [false],
        lighting: [false],
        accessControl: [false]
      }),
      amenities: this.fb.group({
        covered: [false],
        elevator: [false],
        bathrooms: [false],
        carWash: [false]
      }),
      services: this.fb.group({
        electricCharging: [false],
        freeWifi: [false],
        valetService: [false],
        maintenance: [false]
      }),
      payments: this.fb.group({
        cardPayment: [false],
        mobilePayment: [false],
        monthlyPasses: [false],
        corporateRates: [false]
      })
    });

    if (this.profileId) this.loadFeatures(this.profileId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profileId'] && !changes['profileId'].isFirstChange()) {
      const id = changes['profileId'].currentValue as string | null;
      if (id) this.loadFeatures(id);
    }
  }

  private loadFeatures(id: string): void {
    this.isLoading = true;
    this.service.getFeatures(id).pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: (f: FeaturesData) => {
        this.featuresForm.patchValue(f);
      },
      error: (err) => {
        console.error('Error loading features', err);
        this.snackBar.open('No se pudieron cargar las características', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onSave(): void {
    if (!this.profileId) return;
    if (this.featuresForm.valid) {
      const value = this.featuresForm.value as FeaturesData;
      this.service.updateFeatures(this.profileId, value).subscribe({
        next: () => this.snackBar.open('Características actualizadas', 'Cerrar', { duration: 2000 }),
        error: (err) => {
          console.error('Update features error', err);
          this.snackBar.open('Error al actualizar características', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}
