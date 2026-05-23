import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-vehicle-details',
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.scss'
})
export class VehicleDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly inventoryService = inject(InventoryService);

  readonly vehicleId = Number(this.route.snapshot.paramMap.get('id') ?? 1);
  readonly vehicles = this.inventoryService.vehicles;
  readonly vehicle = computed(() => this.vehicles().find((item) => item.id === this.vehicleId) ?? this.vehicles()[0]);

  readonly gallery = computed(() => {
    const vehicle = this.vehicle();
    return [
      vehicle?.image,
      '/images/cars/car-2.jpg',
      '/images/cars/car-3.jpg',
      '/images/cars/car-4.jpg',
      '/images/cars/car-5.jpg'
    ].filter(Boolean);
  });

  readonly featureGroups = [
    ['ABS', 'Bluetooth', 'Bancos em couro', 'Controle de estabilidade', 'Camera de ré'],
    ['Ar digital', 'Piloto automatico', 'Assistente de faixa', 'Sensor de chuva', 'Chave presencial'],
    ['Farol full LED', 'Rodas esportivas', 'Multimidia premium', 'CarPlay', 'Som ambiente']
  ];

  constructor() {
    this.inventoryService.loadHomeData();
  }
}
