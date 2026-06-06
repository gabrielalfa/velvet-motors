import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompareService } from '../../services/compare.service';
import { InventoryService } from '../../services/inventory.service';
import { Vehicle } from '../../models/vehicle.model';
import { SiteContentService } from '../../services/site-content.service';

type CompareRow = {
  label: string;
  icon: string;
  value: (vehicle: Vehicle) => string;
};

@Component({
  selector: 'app-compare-page',
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './compare-page.component.html',
  styleUrl: './compare-page.component.scss'
})
export class ComparePageComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly siteContentService = inject(SiteContentService);
  readonly compareService = inject(CompareService);
  readonly content = this.siteContentService.content;

  readonly allVehicles = this.inventoryService.vehicles;
  readonly selectedVehicles = computed(() => {
    const vehicles = this.allVehicles();
    return this.compareService.selectedIds()
      .map((id) => vehicles.find((vehicle) => vehicle.id === id))
      .filter((vehicle): vehicle is Vehicle => Boolean(vehicle));
  });
  readonly slots = computed<Array<Vehicle | null>>(() => {
    const vehicles = this.selectedVehicles();
    return [vehicles[0] ?? null, vehicles[1] ?? null, vehicles[2] ?? null];
  });
  readonly availableVehicles = computed(() => {
    const selectedIds = this.compareService.selectedIds();
    return this.allVehicles().filter((vehicle) => !selectedIds.includes(vehicle.id)).slice(0, 6);
  });

  readonly rows: CompareRow[] = [
    { label: 'Condição', icon: 'lucide:badge-check', value: (vehicle) => vehicle.badge || 'Selecionado' },
    { label: 'Carroceria', icon: 'lucide:car-front', value: (vehicle) => vehicle.body || 'Sedan' },
    { label: 'Marca', icon: 'lucide:landmark', value: (vehicle) => vehicle.name.split(' ')[0] },
    { label: 'Modelo', icon: 'lucide:signature', value: (vehicle) => vehicle.name },
    { label: 'Combustível', icon: 'lucide:fuel', value: (vehicle) => vehicle.fuel || '-' },
    { label: 'Motor', icon: 'lucide:cpu', value: (vehicle) => vehicle.engine || '2.0 Turbo' },
    { label: 'Ano', icon: 'lucide:calendar-days', value: (vehicle) => String(vehicle.year) },
    { label: 'Câmbio', icon: 'lucide:settings', value: (vehicle) => vehicle.transmission || '-' },
    { label: 'Quilometragem', icon: 'lucide:gauge', value: (vehicle) => `${vehicle.km.toLocaleString('pt-BR')} km` },
    { label: 'Valor', icon: 'lucide:badge-dollar-sign', value: (vehicle) => `R$ ${vehicle.price.toLocaleString('pt-BR')}` },
    { label: 'Cor externa', icon: 'lucide:sparkles', value: (vehicle) => vehicle.exteriorColor || 'Sob consulta' },
    { label: 'Cor interna', icon: 'lucide:armchair', value: (vehicle) => vehicle.interiorColor || 'Sob consulta' }
  ];

  constructor() {
    this.inventoryService.loadVehicles();
  }

  addVehicle(vehicle: Vehicle): void {
    this.compareService.add(vehicle.id);
  }

  removeVehicle(vehicle: Vehicle): void {
    this.compareService.remove(vehicle.id);
  }

  clearComparison(): void {
    this.compareService.clear();
  }

  isDifferent(row: CompareRow): boolean {
    const values = this.selectedVehicles().map((vehicle) => row.value(vehicle));
    return values.length > 1 && new Set(values).size > 1;
  }
}
