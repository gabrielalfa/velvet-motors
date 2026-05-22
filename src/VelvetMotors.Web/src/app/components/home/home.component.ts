import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-home',
  imports: [CurrencyPipe, DecimalPipe, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly inventoryService = inject(InventoryService);
  readonly brands = this.inventoryService.brands;
  readonly differences = this.inventoryService.differences;
  readonly vehicles = this.inventoryService.vehicles;
  readonly loading = this.inventoryService.loading;
  readonly activeSlide = signal(0);
  readonly fleetOffset = signal(0);

  readonly heroSlides = [
    '/images/banner/1.png',
    '/images/banner/2.png',
    '/images/banner/3.png'
  ];

  readonly visibleVehicles = computed(() => {
    const offset = this.fleetOffset();
    return [...this.vehicles.slice(offset), ...this.vehicles.slice(0, offset)];
  });

  constructor() {
    setInterval(() => {
      this.activeSlide.update((slide) => (slide + 1) % this.heroSlides.length);
    }, 5200);
  }

  nextVehicle(): void {
    this.fleetOffset.update((offset) => (offset + 1) % this.vehicles.length);
  }

  previousVehicle(): void {
    this.fleetOffset.update((offset) => (offset - 1 + this.vehicles.length) % this.vehicles.length);
  }
}
