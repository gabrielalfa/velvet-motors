import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly theme = signal<Theme>('dark');

  constructor() {
    const storedTheme = this.document.defaultView?.localStorage.getItem('velvet-theme') as Theme | null;
    this.setTheme(storedTheme === 'light' ? 'light' : 'dark');
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.document.body.classList.toggle('theme-light', theme === 'light');
    this.document.body.classList.toggle('theme-dark', theme === 'dark');
    this.document.defaultView?.localStorage.setItem('velvet-theme', theme);
  }
}
