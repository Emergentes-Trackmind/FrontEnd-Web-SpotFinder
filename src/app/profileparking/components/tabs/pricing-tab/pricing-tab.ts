import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PricingData } from '../../../model/profileparking.entity';
import { ParkingProfileService } from '../../../services/parking-profile.service';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pricing-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSlideToggleModule
  ],
  templateUrl: './pricing-tab.html',
  styleUrls: ['./pricing-tab.css']
})
export class PricingTabComponent implements OnInit, OnChanges {
  @Input() profileId?: string | null;

  pricingForm!: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private service: ParkingProfileService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.pricingForm = this.fb.group({
      hourlyRate: [0, [Validators.required, Validators.min(0)]],
      dailyRate: [0, [Validators.required, Validators.min(0)]],
      monthlyRate: [0, [Validators.required, Validators.min(0)]],
      open24h: [false],
      operatingDays: this.fb.group({
        monday: [false],
        tuesday: [false],
        wednesday: [false],
        thursday: [false],
        friday: [false],
        saturday: [false],
        sunday: [false]
      }),
      promotions: this.fb.group({
        earlyBird: [false],
        weekend: [false],
        longStay: [false]
      })
    });

    if (this.profileId) this.loadPricing(this.profileId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profileId'] && !changes['profileId'].isFirstChange()) {
      const id = changes['profileId'].currentValue as string | null;
      if (id) this.loadPricing(id);
    }
  }

  private loadPricing(id: string): void {
    this.isLoading = true;
    this.service.getPricing(id).pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: (pricing: PricingData) => {
        // convertir operatingDays back a group
        this.pricingForm.patchValue({
          hourlyRate: pricing.hourlyRate,
          dailyRate: pricing.dailyRate,
          monthlyRate: pricing.monthlyRate,
          open24h: pricing.open24h,
          operatingDays: pricing.operatingDays,
          promotions: pricing.promotions
        });
      },
      error: (err) => {
        console.error('Error loading pricing', err);
        this.snackBar.open('No se pudieron cargar las tarifas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onSave(): void {
    if (!this.profileId) return;
    if (this.pricingForm.valid) {
      const formValue = this.pricingForm.value as any;
      const pricing: PricingData = {
        hourlyRate: formValue.hourlyRate,
        dailyRate: formValue.dailyRate,
        monthlyRate: formValue.monthlyRate,
        open24h: formValue.open24h,
        operatingDays: formValue.operatingDays,
        promotions: formValue.promotions
      };
      this.service.updatePricing(this.profileId, pricing).subscribe({
        next: () => this.snackBar.open('Tarifas actualizadas', 'Cerrar', { duration: 2000 }),
        error: (err) => {
          console.error('Update pricing error', err);
          this.snackBar.open('Error al actualizar tarifas', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.pricingForm.controls).forEach(field => {
      const control = this.pricingForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
}
