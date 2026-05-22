import { DOCUMENT } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private readonly document = inject(DOCUMENT);
  readonly isScrolled = signal(false);
  readonly menuOpen = signal(false);

  readonly navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Estoque', href: '#estoque' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Diferenciais', href: '#diferenciais' },
    { label: 'Contato', href: '#contato' }
  ];

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    this.document.body.classList.toggle('nav-open', this.menuOpen());
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    this.document.body.classList.remove('nav-open');
  }
}
