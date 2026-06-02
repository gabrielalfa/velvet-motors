import { CurrencyPipe, DOCUMENT, DecimalPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CompareService } from '../../services/compare.service';
import { InventoryService } from '../../services/inventory.service';
import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-vehicle-details',
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.scss'
})
export class VehicleDetailsComponent {
  private readonly document = inject(DOCUMENT);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly inventoryService = inject(InventoryService);
  readonly compareService = inject(CompareService);

  readonly vehicleId = signal(Number(this.route.snapshot.paramMap.get('id') ?? 1));
  readonly vehicles = this.inventoryService.vehicles;
  readonly vehicle = computed(() => this.inventoryService.selectedVehicle() ?? this.vehicles().find((item) => item.id === this.vehicleId()) ?? this.vehicles()[0]);

  readonly gallery = computed(() => {
    const vehicle = this.vehicle();
    return [vehicle?.image, ...(vehicle?.galleryImages ?? '').split('\n')]
      .map((image) => image?.trim())
      .filter((image): image is string => Boolean(image));
  });

  readonly features = computed(() => (this.vehicle()?.featuresOptions ?? '')
    .split('\n')
    .map((feature) => feature.trim())
    .filter(Boolean));
  readonly featureGroups = computed(() => {
    const features = this.features();
    const size = Math.ceil(features.length / 3) || 1;

    return [features.slice(0, size), features.slice(size, size * 2), features.slice(size * 2)].filter((group) => group.length);
  });

  constructor() {
    this.inventoryService.loadVehicles();

    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = Number(params.get('id') ?? 1);
      this.vehicleId.set(id);
      this.inventoryService.selectedVehicle.set(null);
      this.inventoryService.loadVehicle(id);
      this.scrollToTop();
    });
  }

  compareVehicle(vehicle: Vehicle): void {
    this.compareService.add(vehicle.id);
    this.router.navigateByUrl('/comparar');
  }

  private scrollToTop(): void {
    this.document.defaultView?.requestAnimationFrame(() => {
      this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
