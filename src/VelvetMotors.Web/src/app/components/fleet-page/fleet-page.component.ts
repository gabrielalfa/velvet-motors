import { CurrencyPipe, DecimalPipe, DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private readonly document = inject(DOCUMENT);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly inventoryService = inject(InventoryService);
  readonly compareService = inject(CompareService);
  readonly vehicles = this.inventoryService.vehicles;
  readonly loading = this.inventoryService.loading;
  readonly filtersOpen = signal(false);
  readonly search = signal('');
  readonly brand = signal('Todos');
  readonly year = signal('Todos');
  readonly body = signal('Todos');
  readonly fuel = signal('Todos');
  readonly transmission = signal('Todos');
  readonly maxPrice = signal(700000);
  readonly sortBy = signal('newest');
  readonly viewMode = signal<'list' | 'grid'>('list');
  readonly visibleLimit = signal(10);
  readonly pageSize = 10;
  readonly compareFeedback = signal('');
  readonly sharedVehicleId = signal<number | null>(null);

  readonly brands = computed(() => ['Todos', ...new Set(this.vehicles().map((vehicle) => vehicle.name.split(' ')[0]))]);
  readonly years = computed(() => ['Todos', ...new Set(this.vehicles().map((vehicle) => String(vehicle.year)))]);
  readonly fuels = computed(() => ['Todos', ...new Set(this.vehicles().map((vehicle) => vehicle.fuel).filter(Boolean))]);
  readonly bodies = ['Todos', 'Sedan', 'SUV', 'Hatchback', 'Coupe'];
  readonly transmissions = ['Todos', 'Manual', 'Automático'];

  readonly filteredVehicles = computed(() => {
    const search = this.search().toLowerCase().trim();
    const brand = this.brand();
    const year = this.year();
    const body = this.body();
    const fuel = this.fuel();
    const transmission = this.transmission();
    const maxPrice = this.maxPrice();
    const sortBy = this.sortBy();

    const filtered = this.vehicles().filter((vehicle) => {
      const matchesSearch = !search || vehicle.name.toLowerCase().includes(search);
      const matchesBrand = brand === 'Todos' || vehicle.name.startsWith(brand);
      const matchesYear = year === 'Todos' || vehicle.year === Number(year);
      const matchesBody = body === 'Todos' || (vehicle.body || this.resolveBody(vehicle)).includes(body);
      const matchesFuel = fuel === 'Todos' || vehicle.fuel === fuel;
      const matchesTransmission = transmission === 'Todos' || this.matchesTransmission(vehicle.transmission, transmission);
      const matchesPrice = vehicle.price <= maxPrice;

      return matchesSearch && matchesBrand && matchesYear && matchesBody && matchesFuel && matchesTransmission && matchesPrice;
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
    this.body.set('Todos');
    this.fuel.set('Todos');
    this.transmission.set('Todos');
    this.maxPrice.set(700000);
    this.resetPage();
  }

  private applyInitialQueryFilters(): void {
    const params = this.route.snapshot.queryParamMap;
    const brand = params.get('marca');
    const model = params.get('modelo');
    const year = params.get('ano');

    if (brand) {
      this.brand.set(brand);
    }

    if (model) {
      this.search.set(model);
    }

    if (year) {
      this.year.set(year);
    }

  }

  closeFilters(): void {
    this.filtersOpen.set(false);
  }

  toggleCompare(vehicle: Vehicle, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const changed = this.compareService.add(vehicle.id);

    if (!changed) {
      this.compareFeedback.set('Você pode comparar até 3 veículos por vez.');
      return;
    }

    this.router.navigateByUrl('/comparar');
  }

  async shareVehicle(vehicle: Vehicle, event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const shareUrl = this.vehicleShareUrl(vehicle);
    const shareTitle = `${vehicle.name} | Velvet Motors`;
    const shareText = `Confira este ${vehicle.name} ${vehicle.year} na Velvet Motors.`;
    const navigator = this.document.defaultView?.navigator;

    try {
      if (navigator?.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        this.setSharedVehicle(vehicle.id);
        return;
      }

      await this.copyToClipboard(shareUrl);
      this.setSharedVehicle(vehicle.id);
    } catch {
      this.compareFeedback.set('Não foi possível gerar o link de compartilhamento agora.');
    }
  }

  resolveBody(vehicle: Vehicle): string {
    if (vehicle.body) {
      return vehicle.body;
    }

    return vehicle.name.toLowerCase().includes('q3') || vehicle.name.toLowerCase().includes('xc40') || vehicle.name.toLowerCase().includes('compass') ? 'SUV' : 'Sedan';
  }

  vehicleTrackBy(_: number, vehicle: Vehicle): number {
    return vehicle.id;
  }

  private matchesTransmission(vehicleTransmission: string, selectedTransmission: string): boolean {
    const normalizedVehicleTransmission = this.normalizeText(vehicleTransmission);
    const normalizedSelectedTransmission = this.normalizeText(selectedTransmission);

    if (normalizedSelectedTransmission === 'manual') {
      return normalizedVehicleTransmission.includes('manual');
    }

    if (normalizedSelectedTransmission === 'automatico') {
      return !normalizedVehicleTransmission.includes('manual');
    }

    return false;
  }

  private resetPage(): void {
    this.visibleLimit.set(this.pageSize);
  }

  private vehicleShareUrl(vehicle: Vehicle): string {
    const origin = this.document.location.origin;

    return `${origin}/veiculo/${vehicle.id}`;
  }

  private async copyToClipboard(value: string): Promise<void> {
    const navigator = this.document.defaultView?.navigator;

    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const input = this.document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', 'true');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    this.document.body.appendChild(input);
    input.select();
    this.document.execCommand('copy');
    this.document.body.removeChild(input);
  }

  private setSharedVehicle(vehicleId: number): void {
    this.sharedVehicleId.set(vehicleId);
    this.document.defaultView?.setTimeout(() => {
      if (this.sharedVehicleId() === vehicleId) {
        this.sharedVehicleId.set(null);
      }
    }, 4500);
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
