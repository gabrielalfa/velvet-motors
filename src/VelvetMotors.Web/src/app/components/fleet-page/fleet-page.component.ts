import { CurrencyPipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-fleet-page',
  imports: [CurrencyPipe, DecimalPipe, FormsModule, RouterLink, NgTemplateOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './fleet-page.component.html',
  styleUrl: './fleet-page.component.scss'
})
export class FleetPageComponent {
  private readonly inventoryService = inject(InventoryService);

  readonly vehicles = this.inventoryService.vehicles;
  readonly loading = this.inventoryService.loading;
  readonly filtersOpen = signal(false);
  readonly search = signal('');
  readonly brand = signal('Todos');
  readonly year = signal('Todos');
  readonly maxPrice = signal(200000);

  readonly brands = computed(() => ['Todos', ...new Set(this.vehicles().map((vehicle) => vehicle.name.split(' ')[0]))]);
  readonly years = computed(() => ['Todos', ...new Set(this.vehicles().map((vehicle) => String(vehicle.year)))]);

  readonly filteredVehicles = computed(() => {
    const search = this.search().toLowerCase().trim();
    const brand = this.brand();
    const year = this.year();
    const maxPrice = this.maxPrice();

    return this.vehicles().filter((vehicle) => {
      const matchesSearch = !search || vehicle.name.toLowerCase().includes(search);
      const matchesBrand = brand === 'Todos' || vehicle.name.startsWith(brand);
      const matchesYear = year === 'Todos' || vehicle.year === Number(year);
      const matchesPrice = vehicle.price <= maxPrice;

      return matchesSearch && matchesBrand && matchesYear && matchesPrice;
    });
  });

  constructor() {
    this.inventoryService.loadHomeData();
  }

  setSearch(value: string): void {
    this.search.set(value);
  }

  setBrand(value: string): void {
    this.brand.set(value);
  }

  setYear(value: string): void {
    this.year.set(value);
  }

  setMaxPrice(value: string): void {
    this.maxPrice.set(Number(value));
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
  }

  vehicleTrackBy(_: number, vehicle: Vehicle): number {
    return vehicle.id;
  }
}
