import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../iam/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  // Helper para usar en la plantilla
  t(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  getUserInitials(): string {
    return 'PJ'; // Por ahora fijo, luego se puede hacer dinámico
  }

  getUserFullName(): string {
    return 'Pedro Juan'; // Por ahora fijo, luego se puede hacer dinámico
  }

  getUserEmail(): string {
    return 'pedro@gmail.com'; // Por ahora fijo, luego se puede hacer dinámico
  }

  onLogout(): void {
    // Limpiar localStorage y redirigir
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}
