import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-home',
  imports: [CurrencyPipe, DecimalPipe, FormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnDestroy {
  private readonly inventoryService = inject(InventoryService);
  private readonly heroIntervalId: ReturnType<typeof setInterval>;
  private readonly inventoryIntervalId: ReturnType<typeof setInterval>;
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
  readonly featuredVehicle = computed(() => this.visibleVehicles()[0]);
  readonly secondaryVehicles = computed(() => this.visibleVehicles().slice(1, 4));

  constructor() {
    this.inventoryService.loadHomeData();

    this.heroIntervalId = setInterval(() => {
      const totalSlides = this.heroSlides().length || 1;
      this.activeSlide.update((slide) => (slide + 1) % totalSlides);
    }, 5200);

    this.inventoryIntervalId = setInterval(() => {
      this.inventoryService.loadHomeData();
    }, 30000);
  }

  ngOnDestroy(): void {
    clearInterval(this.heroIntervalId);
    clearInterval(this.inventoryIntervalId);
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
