import { CurrencyPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-compare-page',
  imports: [CurrencyPipe, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './compare-page.component.html',
  styleUrl: './compare-page.component.scss'
})
export class ComparePageComponent implements OnDestroy {
  private readonly inventoryService = inject(InventoryService);
  private readonly inventoryIntervalId: ReturnType<typeof setInterval>;

  readonly vehicles = computed(() => this.inventoryService.vehicles().slice(0, 3));
  readonly rows = [
    { label: 'Condition', value: (vehicle: Vehicle) => vehicle.badge || 'Selecionado' },
    { label: 'Body', value: (vehicle: Vehicle) => vehicle.body || 'Sedan' },
    { label: 'Make', value: (vehicle: Vehicle) => vehicle.name.split(' ')[0] },
    { label: 'Model', value: (vehicle: Vehicle) => vehicle.name },
    { label: 'Fuel type', value: (vehicle: Vehicle) => vehicle.fuel },
    { label: 'Engine', value: (vehicle: Vehicle) => vehicle.engine || '2.0 Turbo' },
    { label: 'Year', value: (vehicle: Vehicle) => String(vehicle.year) },
    { label: 'Transmission', value: (vehicle: Vehicle) => vehicle.transmission },
    { label: 'Mileage', value: (vehicle: Vehicle) => `${vehicle.km.toLocaleString('pt-BR')} km` },
    { label: 'Price', value: (vehicle: Vehicle) => `R$ ${vehicle.price.toLocaleString('pt-BR')}` },
    { label: 'Exterior color', value: (vehicle: Vehicle) => vehicle.exteriorColor || 'Pearl White' },
    { label: 'Interior color', value: (vehicle: Vehicle) => vehicle.interiorColor || 'Jet Black' }
  ];

  constructor() {
    this.inventoryService.loadHomeData();

    this.inventoryIntervalId = setInterval(() => {
      this.inventoryService.loadHomeData();
    }, 30000);
  }

  ngOnDestroy(): void {
    clearInterval(this.inventoryIntervalId);
  }
}
