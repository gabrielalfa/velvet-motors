import { CurrencyPipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, computed, inject, signal } from '@angular/core';
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
export class FleetPageComponent implements OnDestroy {
  private readonly inventoryService = inject(InventoryService);
  private readonly inventoryIntervalId: ReturnType<typeof setInterval>;

  readonly vehicles = this.inventoryService.vehicles;
  readonly loading = this.inventoryService.loading;
  readonly filtersOpen = signal(false);
  readonly search = signal('');
  readonly brand = signal('Todos');
  readonly year = signal('Todos');
  readonly condition = signal('Todos');
  readonly body = signal('Todos');
  readonly transmission = signal('Todos');
  readonly status = signal('Todos');
  readonly maxMileage = signal(80000);
  readonly maxPrice = signal(200000);
  readonly sortBy = signal('newest');

  readonly brands = computed(() => ['Todos', ...new Set(this.vehicles().map((vehicle) => vehicle.name.split(' ')[0]))]);
  readonly years = computed(() => ['Todos', ...new Set(this.vehicles().map((vehicle) => String(vehicle.year)))]);
  readonly conditions = ['Todos', 'Selecionado', 'Unico dono', 'Garantia ativa', 'Baixa quilometragem'];
  readonly bodies = ['Todos', 'Sedan', 'SUV', 'Hatchback', 'Coupe'];
  readonly transmissions = ['Todos', 'Automatico', 'S tronic', '9G-Tronic', 'PDK'];
  readonly statuses = ['Todos', 'Disponivel', 'Reservado', 'Novidade'];

  readonly filteredVehicles = computed(() => {
    const search = this.search().toLowerCase().trim();
    const brand = this.brand();
    const year = this.year();
    const condition = this.condition();
    const body = this.body();
    const transmission = this.transmission();
    const status = this.status();
    const maxMileage = this.maxMileage();
    const maxPrice = this.maxPrice();
    const sortBy = this.sortBy();

    const filtered = this.vehicles().filter((vehicle) => {
      const matchesSearch = !search || vehicle.name.toLowerCase().includes(search);
      const matchesBrand = brand === 'Todos' || vehicle.name.startsWith(brand);
      const matchesYear = year === 'Todos' || vehicle.year === Number(year);
      const matchesCondition = condition === 'Todos' || vehicle.badge === condition;
      const matchesBody = body === 'Todos' || (vehicle.body || this.resolveBody(vehicle)).includes(body);
      const matchesTransmission = transmission === 'Todos' || vehicle.transmission === transmission;
      const matchesStatus = status === 'Todos' || this.resolveStatus(vehicle) === status;
      const matchesMileage = vehicle.km <= maxMileage;
      const matchesPrice = vehicle.price <= maxPrice;

      return matchesSearch && matchesBrand && matchesYear && matchesCondition && matchesBody && matchesTransmission && matchesStatus && matchesMileage && matchesPrice;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.price - b.price;
      }

      if (sortBy === 'price-high') {
        return b.price - a.price;
      }

      if (sortBy === 'mileage-low') {
        return a.km - b.km;
      }

      return b.year - a.year;
    });
  });

  constructor() {
    this.inventoryService.loadHomeData();

    this.inventoryIntervalId = setInterval(() => {
      this.inventoryService.loadHomeData();
    }, 30000);
  }

  ngOnDestroy(): void {
    clearInterval(this.inventoryIntervalId);
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

  setCondition(value: string): void {
    this.condition.set(value);
  }

  setBody(value: string): void {
    this.body.set(value);
  }

  setTransmission(value: string): void {
    this.transmission.set(value);
  }

  setStatus(value: string): void {
    this.status.set(value);
  }

  setMaxMileage(value: string): void {
    this.maxMileage.set(Number(value));
  }

  setMaxPrice(value: string): void {
    this.maxPrice.set(Number(value));
  }

  setSortBy(value: string): void {
    this.sortBy.set(value);
  }

  resetFilters(): void {
    this.search.set('');
    this.brand.set('Todos');
    this.year.set('Todos');
    this.condition.set('Todos');
    this.body.set('Todos');
    this.transmission.set('Todos');
    this.status.set('Todos');
    this.maxMileage.set(80000);
    this.maxPrice.set(200000);
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
  }

  resolveBody(vehicle: Vehicle): string {
    if (vehicle.body) {
      return vehicle.body;
    }

    return vehicle.name.toLowerCase().includes('q3') || vehicle.name.toLowerCase().includes('xc40') || vehicle.name.toLowerCase().includes('compass') ? 'SUV' : 'Sedan';
  }

  resolveStatus(vehicle: Vehicle): string {
    return vehicle.year >= 2024 ? 'Novidade' : vehicle.km < 20000 ? 'Disponivel' : 'Reservado';
  }

  vehicleTrackBy(_: number, vehicle: Vehicle): number {
    return vehicle.id;
  }
}
