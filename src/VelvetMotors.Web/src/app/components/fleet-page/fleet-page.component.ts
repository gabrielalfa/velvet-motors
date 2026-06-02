import { CurrencyPipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompareService } from '../../services/compare.service';
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
  private readonly route = inject(ActivatedRoute);
  private readonly inventoryService = inject(InventoryService);
  readonly compareService = inject(CompareService);
  readonly vehicles = this.inventoryService.vehicles;
  readonly loading = this.inventoryService.loading;
  readonly filtersOpen = signal(false);
  readonly search = signal('');
  readonly brand = signal('Todos');
  readonly year = signal('Todos');
  readonly condition = signal('Todos');
  readonly body = signal('Todos');
  readonly fuel = signal('Todos');
  readonly transmission = signal('Todos');
  readonly status = signal('Todos');
  readonly maxMileage = signal(200000);
  readonly maxPrice = signal(700000);
  readonly sortBy = signal('newest');
  readonly viewMode = signal<'list' | 'grid'>('list');
  readonly visibleLimit = signal(10);
  readonly pageSize = 10;
  readonly compareFeedback = signal('');

  readonly brands = computed(() => ['Todos', ...new Set(this.vehicles().map((vehicle) => vehicle.name.split(' ')[0]))]);
  readonly years = computed(() => ['Todos', ...new Set(this.vehicles().map((vehicle) => String(vehicle.year)))]);
  readonly conditions = computed(() => ['Todos', ...new Set(this.vehicles().map((vehicle) => vehicle.badge).filter(Boolean))]);
  readonly fuels = computed(() => ['Todos', ...new Set(this.vehicles().map((vehicle) => vehicle.fuel).filter(Boolean))]);
  readonly bodies = ['Todos', 'Sedan', 'SUV', 'Hatchback', 'Coupe'];
  readonly transmissions = ['Todos', 'Automatico', 'S tronic', '9G-Tronic', 'PDK'];
  readonly statuses = ['Todos', 'Disponivel', 'Reservado', 'Novidade'];

  readonly filteredVehicles = computed(() => {
    const search = this.search().toLowerCase().trim();
    const brand = this.brand();
    const year = this.year();
    const condition = this.condition();
    const body = this.body();
    const fuel = this.fuel();
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
      const matchesFuel = fuel === 'Todos' || vehicle.fuel === fuel;
      const matchesTransmission = transmission === 'Todos' || vehicle.transmission === transmission;
      const matchesStatus = status === 'Todos' || this.resolveStatus(vehicle) === status;
      const matchesMileage = vehicle.km <= maxMileage;
      const matchesPrice = vehicle.price <= maxPrice;

      return matchesSearch && matchesBrand && matchesYear && matchesCondition && matchesBody && matchesFuel && matchesTransmission && matchesStatus && matchesMileage && matchesPrice;
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

  readonly visibleVehicles = computed(() => this.filteredVehicles().slice(0, this.visibleLimit()));
  readonly hasMoreVehicles = computed(() => this.visibleVehicles().length < this.filteredVehicles().length);

  constructor() {
    this.applyInitialQueryFilters();
    this.inventoryService.loadVehicles();
  }

  setSearch(value: string): void {
    this.search.set(value);
    this.resetPage();
  }

  setBrand(value: string): void {
    this.brand.set(value);
    this.resetPage();
  }

  setYear(value: string): void {
    this.year.set(value);
    this.resetPage();
  }

  setCondition(value: string): void {
    this.condition.set(value);
    this.resetPage();
  }

  setBody(value: string): void {
    this.body.set(value);
    this.resetPage();
  }

  setFuel(value: string): void {
    this.fuel.set(value);
    this.resetPage();
  }

  setTransmission(value: string): void {
    this.transmission.set(value);
    this.resetPage();
  }

  setStatus(value: string): void {
    this.status.set(value);
    this.resetPage();
  }

  setMaxMileage(value: string): void {
    this.maxMileage.set(Number(value));
    this.resetPage();
  }

  setMaxPrice(value: string): void {
    this.maxPrice.set(Number(value));
    this.resetPage();
  }

  setSortBy(value: string): void {
    this.sortBy.set(value);
    this.resetPage();
  }

  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode.set(mode);
  }

  loadMoreVehicles(): void {
    this.visibleLimit.update((limit) => limit + this.pageSize);
  }

  resetFilters(): void {
    this.search.set('');
    this.brand.set('Todos');
    this.year.set('Todos');
    this.condition.set('Todos');
    this.body.set('Todos');
    this.fuel.set('Todos');
    this.transmission.set('Todos');
    this.status.set('Todos');
    this.maxMileage.set(200000);
    this.maxPrice.set(700000);
    this.resetPage();
  }

  private applyInitialQueryFilters(): void {
    const params = this.route.snapshot.queryParamMap;
    const brand = params.get('marca');
    const model = params.get('modelo');
    const year = params.get('ano');
    const condition = params.get('condicao');

    if (brand) {
      this.brand.set(brand);
    }

    if (model) {
      this.search.set(model);
    }

    if (year) {
      this.year.set(year);
    }

    if (condition) {
      this.condition.set(condition);
    }
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
  }

  toggleCompare(vehicle: Vehicle, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const changed = this.compareService.toggle(vehicle.id);

    if (!changed) {
      this.compareFeedback.set('Voce pode comparar ate 3 veiculos por vez.');
      return;
    }

    this.compareFeedback.set(this.compareService.isSelected(vehicle.id) ? 'Veiculo adicionado a comparacao.' : 'Veiculo removido da comparacao.');
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

  private resetPage(): void {
    this.visibleLimit.set(this.pageSize);
  }
}
