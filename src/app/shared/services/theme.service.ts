import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly currentTheme = signal<Theme>(this.getInitialTheme());
  private mediaQuery: MediaQueryList;

  constructor() {
    // Detectar preferencia del sistema
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Aplicar tema inicial
    this.applyTheme(this.currentTheme());

    // Escuchar cambios en la preferencia del sistema
    this.mediaQuery.addEventListener('change', (e) => {
      if (this.currentTheme() === 'auto') {
        this.applyTheme('auto');
      }
    });

    // Efecto para aplicar cambios de tema
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      localStorage.setItem(this.THEME_KEY, theme);
    });
  }

  get theme() {
    return this.currentTheme;
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  private getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    return savedTheme || 'light';
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    // Remover clases previas
    root.classList.remove('light-theme', 'dark-theme');

    let effectiveTheme: 'light' | 'dark';

    if (theme === 'auto') {
      effectiveTheme = this.mediaQuery.matches ? 'dark' : 'light';
    } else {
      effectiveTheme = theme;
    }

    // Aplicar la clase del tema
    root.classList.add(`${effectiveTheme}-theme`);

    // Actualizar el atributo data-theme para Material
    root.setAttribute('data-theme', effectiveTheme);
  }

  isDarkMode(): boolean {
    const theme = this.currentTheme();
    if (theme === 'auto') {
      return this.mediaQuery.matches;
    }
    return theme === 'dark';
  }
}

