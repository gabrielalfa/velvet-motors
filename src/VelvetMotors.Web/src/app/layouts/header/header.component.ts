import { DOCUMENT } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteContentService } from '../../services/site-content.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private readonly document = inject(DOCUMENT);
  private readonly siteContentService = inject(SiteContentService);
  readonly content = this.siteContentService.content;
  readonly isScrolled = signal(false);
  readonly menuOpen = signal(false);

  readonly navItems = [
    { label: 'Home', href: '/' },
    { label: 'Veiculos', href: '/veiculos' },
    { label: 'Avaliação', href: '/vender-seu-carro' },
    { label: 'Diferenciais', href: '/#diferenciais' },
    { label: 'Contato', href: '/#contato' }
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
