import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from './iam/services/auth.service';
import { ProfileService } from './Profile/services/profile.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-debug-profile',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>🔍 Debug Profile Data</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div style="margin: 10px 0;">
          <button mat-raised-button color="primary" (click)="debugAuth()">
            Debug Auth State
          </button>
          <button mat-raised-button color="accent" (click)="testProfileAPI()">
            Test Profile API
          </button>
          <button mat-raised-button color="warn" (click)="forceLoadProfile()">
            Force Load Profile
          </button>
        </div>

        <div style="margin-top: 20px;">
          <h4>Auth Status:</h4>
          <p>Authenticated: {{ authService.isAuthenticated() }}</p>
          <p>User ID: {{ authService.user()?.id || 'N/A' }}</p>
          <p>User Email: {{ authService.user()?.email || 'N/A' }}</p>
          <p>Has Token: {{ !!authService.accessToken() }}</p>
        </div>

        <div style="margin-top: 20px;">
          <h4>Profile Data:</h4>
          <pre>{{ profileData | json }}</pre>
        </div>

        <div style="margin-top: 20px;" *ngIf="testResult">
          <h4>Test Result:</h4>
          <pre>{{ testResult | json }}</pre>
        </div>
      </mat-card-content>
    </mat-card>
  `
})
export class DebugProfileComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly http = inject(HttpClient);

  profileData: any = null;
  testResult: any = null;

  ngOnInit() {
    this.profileData = this.profileService.profile();
  }

  debugAuth() {
    this.authService.debugAuthState();
    console.log('📊 localStorage contents:', {
      token: localStorage.getItem('auth_token'),
      user: localStorage.getItem('auth_user'),
      refresh: localStorage.getItem('auth_refresh')
    });
  }

  testProfileAPI() {
    const token = this.authService.accessToken();
    console.log('🧪 Testing profile API with token:', !!token);

    if (token) {
      // Test directo al API
      this.http.get('http://localhost:3001/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: (result) => {
          console.log('✅ Profile API success:', result);
          this.testResult = result;
        },
        error: (error) => {
          console.error('❌ Profile API error:', error);
          this.testResult = { error: error.message, status: error.status };
        }
      });
    } else {
      console.log('❌ No token available');
      this.testResult = { error: 'No token available' };
    }
  }

  forceLoadProfile() {
    console.log('🚀 Forcing profile load...');
    this.profileService.loadProfile().subscribe({
      next: (profile) => {
        console.log('✅ Profile loaded:', profile);
        this.profileData = profile;
      },
      error: (error) => {
        console.error('❌ Profile load error:', error);
        this.testResult = { error: error.message, status: error.status };
      }
    });
  }
}
