import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BasicInfoTabComponent } from '../tabs/basic-info-tab/basic-info-tab';
import { LocationTabComponent } from '../tabs/location-tab/location-tab';
import { PricingTabComponent } from '../tabs/pricing-tab/pricing-tab';
import { FeaturesTabComponent } from '../tabs/features-tab/features-tab';
import { ParkingProfileService } from '../../services/parking-profile.service';
import { ProfileParking, ParkingType, ParkingStatus } from '../../model/profileparking.entity';

@Component({
  selector: 'app-parking-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    BasicInfoTabComponent,
    MatListModule,
    LocationTabComponent,
    PricingTabComponent,
    FeaturesTabComponent
  ],
  providers: [ParkingProfileService],
  templateUrl: './parking-profile.html',
  styleUrls: ['./parking-profile.css']
})
export class ParkingProfileComponent implements OnInit, OnDestroy {
  selectedProfile: ProfileParking | null = null;
  selectedProfileId: string = '';
  selectedTabIndex: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private parkingService: ParkingProfileService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Obtener el ID de la URL y cargar el perfil directamente
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.selectedProfileId = params['id'];
      if (this.selectedProfileId) {
        this.loadSelectedProfile(this.selectedProfileId);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSelectedProfile(profileId: string) {
    this.parkingService.getProfileById(profileId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: ProfileParking) => {
          this.selectedProfile = profile;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          // Crear perfil mock si no se encuentra
          this.selectedProfile = this.createMockProfile(profileId);
        }
      });
  }

  private createMockProfile(id: string): ProfileParking {
    return {
      id: id,
      name: `Parking ${id}`,
      type: ParkingType.Comercial,
      status: ParkingStatus.Activo,
      description: 'Parking moderno con todas las comodidades',
      totalSpaces: 150,
      accessibleSpaces: 12,
      phone: '+34 911 123 456',
      email: 'info@parking.com',
      website: 'https://parking.com',
      image: undefined
    };
  }

  onTabChanged(tabIndex: number) {
    this.selectedTabIndex = tabIndex;
  }
}
