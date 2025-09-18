import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ParkingStatus, ParkingType} from '../../../model/profileparking.entity';
import { finalize } from 'rxjs/operators';
import {ParkingProfileService} from '../../../services/parking-profile.service';

@Component({
  selector: 'app-basic-info-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './basic-info-tab.html',
  styleUrls: ['./basic-info-tab.css']
})
export class BasicInfoTabComponent implements OnInit, OnChanges {
  @Input() profileId?: string | null;

  basicInfoForm!: FormGroup;
  parkingTypes = Object.values(ParkingType);
  parkingStatuses = Object.values(ParkingStatus);
  selectedFileName: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private parkingService: ParkingProfileService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.profileId) {
      this.loadProfileData(this.profileId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profileId'] && !changes['profileId'].isFirstChange()) {
      const id = changes['profileId'].currentValue as string | null;
      if (id) this.loadProfileData(id);
    }
  }

  private initForm(): void {
    this.basicInfoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: [ParkingType.Comercial, [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: [ParkingStatus.Activo, [Validators.required]],
      totalSpaces: [0, [Validators.required, Validators.min(1)]],
      accessibleSpaces: [0, [Validators.required, Validators.min(0)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s()\-]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      website: ['', [Validators.pattern(/^https?:\/\/.*/)]]
    });
  }

  private loadProfileData(id: string): void {
    this.isLoading = true;
    this.parkingService.getProfileById(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (profile) => {
          this.basicInfoForm.patchValue(profile);
        },
        error: (err: any) => {
          console.error('Error loading profile:', err);
          this.snackBar.open('Error al cargar los datos del perfil', 'Cerrar', { duration: 3000 });
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files && input.files.length ? input.files[0] : undefined;
    if (file) {
      this.selectedFileName = file.name;
      if (file.size <= 5 * 1024 * 1024) {
        this.uploadImage(file);
      } else {
        this.snackBar.open('El archivo es demasiado grande (máximo 5MB)', 'Cerrar', { duration: 3000 });
      }
    }
  }

  private uploadImage(file: File): void {
    if (!this.profileId) return;
    this.parkingService.uploadImage(this.profileId, file).subscribe({
      next: (imageUrl: string) => {
        this.snackBar.open('Imagen subida correctamente', 'Cerrar', { duration: 2000 });
      },
      error: (err: any) => {
        console.error('Upload error:', err);
        this.snackBar.open('Error al subir la imagen', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onSave(): void {
    if (!this.profileId) {
      this.snackBar.open('Seleccione un parking antes de guardar', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.basicInfoForm.valid) {
      this.isLoading = true;
      const formData = this.basicInfoForm.value;

      this.parkingService.updateBasicInfo(this.profileId, formData)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            this.snackBar.open('Información básica actualizada correctamente', 'Cerrar', { duration: 2000 });
          },
          error: (err: any) => {
            console.error('Update error:', err);
            this.snackBar.open('Error al guardar los cambios', 'Cerrar', { duration: 3000 });
          }
        });
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Por favor, corrige los errores en el formulario', 'Cerrar', { duration: 3000 });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.basicInfoForm.controls).forEach((field) => {
      const control = this.basicInfoForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
}
