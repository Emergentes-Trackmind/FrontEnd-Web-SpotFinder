import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../iam/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

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
