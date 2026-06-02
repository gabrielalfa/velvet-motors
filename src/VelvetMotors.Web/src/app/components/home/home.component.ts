import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Vehicle } from '../../models/vehicle.model';
import { InventoryService } from '../../services/inventory.service';
import { SiteContentService } from '../../services/site-content.service';

@Component({
  selector: 'app-home',
  imports: [CurrencyPipe, DecimalPipe, FormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnDestroy {
  private readonly inventoryService = inject(InventoryService);
  private readonly siteContentService = inject(SiteContentService);
  private readonly router = inject(Router);
  private readonly heroIntervalId: ReturnType<typeof setInterval>;
  private readonly quickSearchSubscription = new Subscription();
  readonly content = this.siteContentService.content;
  readonly brands = this.inventoryService.brands;
  readonly differences = this.inventoryService.differences;
  readonly vehicles = this.inventoryService.vehicles;
  readonly banners = this.inventoryService.banners;
  readonly loading = this.inventoryService.loading;
  readonly activeSlide = signal(0);
  readonly fleetOffset = signal(0);
  readonly quickBrand = signal('Todos');
  readonly quickModel = signal('');
  readonly quickYear = signal('Todos');
  readonly quickCondition = signal('Todos');
  readonly quickSearchVehicles = signal<Vehicle[]>([]);

  readonly heroBanners = computed(() => this.banners()
    .filter((banner) => banner.active ?? true)
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)));
  readonly heroSlides = computed(() => this.heroBanners().map((banner) => banner.image));
  readonly quickBrands = computed(() => ['Todos', ...new Set(this.quickSearchVehicles().map((vehicle) => vehicle.name.split(' ')[0]).filter(Boolean))]);
  readonly quickYears = computed(() => ['Todos', ...new Set(this.quickSearchVehicles().map((vehicle) => String(vehicle.year)).filter(Boolean))]);
  readonly quickConditions = computed(() => ['Todos', ...new Set(this.quickSearchVehicles().map((vehicle) => vehicle.badge).filter(Boolean))]);

  readonly visibleVehicles = computed(() => {
    const offset = this.fleetOffset();
    const vehicles = this.vehicles();
    return [...vehicles.slice(offset), ...vehicles.slice(0, offset)];
  });
  readonly featuredVehicle = computed(() => this.visibleVehicles()[0]);
  readonly secondaryVehicles = computed(() => this.visibleVehicles().slice(1, 6));

  constructor() {
    this.inventoryService.loadHomeData();
    this.loadQuickSearchOptions();

    this.heroIntervalId = setInterval(() => {
      const totalSlides = this.heroSlides().length || 1;
      this.activeSlide.update((slide) => (slide + 1) % totalSlides);
    }, 5200);
  }

  ngOnDestroy(): void {
    clearInterval(this.heroIntervalId);
    this.quickSearchSubscription.unsubscribe();
  }

  nextVehicle(): void {
    const totalVehicles = this.vehicles().length || 1;
    this.fleetOffset.update((offset) => (offset + 1) % totalVehicles);
  }

  previousVehicle(): void {
    const totalVehicles = this.vehicles().length || 1;
    this.fleetOffset.update((offset) => (offset - 1 + totalVehicles) % totalVehicles);
  }

  searchVehicles(): void {
    this.router.navigate(['/veiculos'], {
      queryParams: {
        marca: this.quickBrand() === 'Todos' ? null : this.quickBrand(),
        modelo: this.quickModel().trim() || null,
        ano: this.quickYear() === 'Todos' ? null : this.quickYear(),
        condicao: this.quickCondition() === 'Todos' ? null : this.quickCondition()
      }
    });
  }

  private loadQuickSearchOptions(): void {
    this.quickSearchSubscription.add(
      this.inventoryService.getVehicles().subscribe((vehicles) => this.quickSearchVehicles.set(vehicles))
    );
  }
}
