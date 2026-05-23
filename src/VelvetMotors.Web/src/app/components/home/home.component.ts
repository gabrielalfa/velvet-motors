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
  readonly banners = this.inventoryService.banners;
  readonly loading = this.inventoryService.loading;
  readonly activeSlide = signal(0);
  readonly fleetOffset = signal(0);

  readonly heroSlides = computed(() => this.banners().map((banner) => banner.image));

  readonly visibleVehicles = computed(() => {
    const offset = this.fleetOffset();
    const vehicles = this.vehicles();
    return [...vehicles.slice(offset), ...vehicles.slice(0, offset)];
  });

  constructor() {
    this.inventoryService.loadHomeData();

    setInterval(() => {
      const totalSlides = this.heroSlides().length || 1;
      this.activeSlide.update((slide) => (slide + 1) % totalSlides);
    }, 5200);
  }

  nextVehicle(): void {
    const totalVehicles = this.vehicles().length || 1;
    this.fleetOffset.update((offset) => (offset + 1) % totalVehicles);
  }

  previousVehicle(): void {
    const totalVehicles = this.vehicles().length || 1;
    this.fleetOffset.update((offset) => (offset - 1 + totalVehicles) % totalVehicles);
  }
}
