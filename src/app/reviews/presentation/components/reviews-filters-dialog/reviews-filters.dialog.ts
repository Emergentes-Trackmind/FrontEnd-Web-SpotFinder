import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { ReviewFilters } from '../../../domain/dtos/review-kpis.dto';
import { Parking } from '../../../domain/entities/parking.entity';
import { ReviewStatus } from '../../../domain/enums/review-status.enum';

export interface ReviewsFiltersDialogData {
  filters: ReviewFilters;
  parkings: Parking[];
}

@Component({
  selector: 'app-reviews-filters-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule,
    MatIconModule
  ],
  template: `
    <div class="filters-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>Advanced Filters</h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div mat-dialog-content class="dialog-content">
        <!-- Date Range -->
        <div class="filter-section">
          <h3 class="section-title">Date Range</h3>
          <div class="date-range">
            <mat-form-field appearance="outline">
              <mat-label>From Date</mat-label>
              <input matInput [matDatepicker]="fromPicker" [(ngModel)]="fromDate">
              <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
              <mat-datepicker #fromPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>To Date</mat-label>
              <input matInput [matDatepicker]="toPicker" [(ngModel)]="toDate">
              <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
              <mat-datepicker #toPicker></mat-datepicker>
            </mat-form-field>
          </div>
        </div>

        <!-- Parking Selection -->
        <div class="filter-section">
          <h3 class="section-title">Parking</h3>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Select Parking</mat-label>
            <mat-select [(ngModel)]="selectedParkingId" [compareWith]="compareParkings">
              <mat-option [value]="null">All Parkings</mat-option>
              <mat-option *ngFor="let parking of data.parkings" [value]="parking.id">
                {{ parking.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Minimum Rating -->
        <div class="filter-section">
          <h3 class="section-title">Minimum Rating</h3>
          <div class="rating-slider">
            <mat-slider
              min="1"
              max="5"
              step="1"
              discrete
              [(ngModel)]="minRating">
              <input matSliderThumb [(ngModel)]="minRating">
            </mat-slider>
            <div class="rating-display">
              <span>{{ minRating || 1 }} stars and above</span>
              <div class="stars">
                <mat-icon
                  *ngFor="let star of getStarsArray(minRating || 1)"
                  class="star-filled">
                  star
                </mat-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- Response Status -->
        <div class="filter-section">
          <h3 class="section-title">Response Status</h3>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="responseStatus">
              <mat-option *ngFor="let statusOption of statusOptions" [value]="statusOption.value">
                {{ statusOption.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onReset()" class="reset-btn">
          <mat-icon>refresh</mat-icon>
          Reset
        </button>
        <div class="action-buttons">
          <button mat-button mat-dialog-close>Cancel</button>
          <button mat-raised-button color="primary" (click)="onApply()">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './reviews-filters.dialog.css'
})
export class ReviewsFiltersDialog {
  fromDate: Date | null = null;
  toDate: Date | null = null;
  selectedParkingId: string | null = null;
  minRating: number | null = null;
  responseStatus: ReviewStatus = ReviewStatus.ALL;

  // Status options using enum
  statusOptions = [
    { label: 'All Reviews', value: ReviewStatus.ALL },
    { label: 'Pending Response', value: ReviewStatus.PENDING_RESPONSE },
    { label: 'Responded', value: ReviewStatus.RESPONDED }
  ];

  constructor(
    public dialogRef: MatDialogRef<ReviewsFiltersDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewsFiltersDialogData
  ) {
    this.initializeFilters();
  }

  private initializeFilters(): void {
    const filters = this.data.filters;

    if (filters.dateFrom) {
      this.fromDate = new Date(filters.dateFrom);
    }

    if (filters.dateTo) {
      this.toDate = new Date(filters.dateTo);
    }

    if (filters.parkingId) {
      this.selectedParkingId = filters.parkingId;
    }

    if (filters.rating) {
      this.minRating = filters.rating;
    }

    if (filters.status) {
      this.responseStatus = filters.status;
    }
  }

  getStarsArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  compareParkings(p1: string | null, p2: string | null): boolean {
    return p1 === p2;
  }

  onReset(): void {
    this.fromDate = null;
    this.toDate = null;
    this.selectedParkingId = null;
    this.minRating = null;
    this.responseStatus = ReviewStatus.ALL;
  }

  onApply(): void {
    const filters: ReviewFilters = {
      dateFrom: this.fromDate?.toISOString(),
      dateTo: this.toDate?.toISOString(),
      parkingId: this.selectedParkingId || undefined,
      rating: this.minRating || undefined,
      status: this.responseStatus === ReviewStatus.ALL ? undefined : this.responseStatus,
      page: 1, // Reset to first page when applying filters
      pageSize: this.data.filters.pageSize || 10
    };

    this.dialogRef.close(filters);
  }
}
