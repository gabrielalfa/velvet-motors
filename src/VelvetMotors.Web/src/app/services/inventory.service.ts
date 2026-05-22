import { Injectable, signal } from '@angular/core';
import { BrandLogo, Difference, Vehicle } from '../models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  readonly loading = signal(true);

  readonly brands: BrandLogo[] = [
    { name: 'BMW' },
    { name: 'Audi' },
    { name: 'Mercedes' },
    { name: 'Porsche' },
    { name: 'Volvo' },
    { name: 'Jeep' },
    { name: 'Toyota' },
    { name: 'Land Rover' }
  ];

  readonly differences: Difference[] = [
    {
      icon: 'verified',
      title: 'Procedencia garantida',
      description: 'Curadoria documental, historico revisado e vistoria criteriosa antes de cada anuncio.'
    },
    {
      icon: 'concierge',
      title: 'Atendimento personalizado',
      description: 'Consultoria sob medida para conectar perfil, desejo e melhor oportunidade de compra.'
    },
    {
      icon: 'diamond',
      title: 'Veiculos selecionados',
      description: 'Estoque enxuto, elegante e focado em carros com presenca, estado e liquidez.'
    }
  ];

  readonly vehicles: Vehicle[] = [
    {
      id: 1,
      name: 'BMW 320i M Sport',
      year: 2023,
      km: 18400,
      price: 189900,
      image: '/images/cars/car-1.jpg',
      badge: 'Blindagem opcional',
      transmission: 'Automatico',
      fuel: 'Flex'
    },
    {
      id: 2,
      name: 'Audi Q3 Performance',
      year: 2022,
      km: 22100,
      price: 176900,
      image: '/images/cars/car-2.jpg',
      badge: 'Unico dono',
      transmission: 'S tronic',
      fuel: 'Gasolina'
    },
    {
      id: 3,
      name: 'Mercedes C180 Avantgarde',
      year: 2021,
      km: 31200,
      price: 159900,
      image: '/images/cars/car-3.jpg',
      badge: 'Revisoes na marca',
      transmission: '9G-Tronic',
      fuel: 'Flex'
    },
    {
      id: 4,
      name: 'Volvo XC40 T5 Momentum',
      year: 2022,
      km: 26500,
      price: 194900,
      image: '/images/cars/car-4.jpg',
      badge: 'Pacote safety',
      transmission: 'Automatico',
      fuel: 'Hibrido'
    },
    {
      id: 5,
      name: 'Jeep Compass Limited',
      year: 2024,
      km: 9200,
      price: 172900,
      image: '/images/cars/car-5.jpg',
      badge: 'Garantia ativa',
      transmission: 'Automatico',
      fuel: 'Diesel'
    }
  ];

  constructor() {
    setTimeout(() => this.loading.set(false), 650);
  }
}
