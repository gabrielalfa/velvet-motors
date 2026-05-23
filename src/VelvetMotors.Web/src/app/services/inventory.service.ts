import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, of } from 'rxjs';
import { apiConfig } from '../config/api.config';
import { BrandLogo, Difference, HeroBanner, Vehicle, VelvetHomeResponse } from '../models/vehicle.model';

type ApiHomeResponse = {
  Banners?: ApiBanner[];
  FeaturedCars?: ApiVehicle[];
  banners?: ApiBanner[];
  featuredCars?: ApiVehicle[];
};

type ApiBanner = {
  Id?: number;
  Title?: string;
  Headline?: string;
  Image?: string;
  id?: number;
  title?: string;
  headline?: string;
  image?: string;
};

type ApiVehicle = {
  Id?: number;
  Name?: string;
  Year?: number;
  Km?: number;
  Price?: number;
  Image?: string;
  Badge?: string;
  Transmission?: string;
  Fuel?: string;
  id?: number;
  name?: string;
  year?: number;
  km?: number;
  price?: number;
  image?: string;
  badge?: string;
  transmission?: string;
  fuel?: string;
};

const fallbackBanners: HeroBanner[] = [
  {
    id: 1,
    title: 'Showroom cinematografico',
    headline: 'Seu proximo destino comeca aqui.',
    image: '/images/banner/1.png'
  },
  {
    id: 2,
    title: 'Luz quente e cobre metalico',
    headline: 'Mais do que veiculos. Uma experiencia Velvet.',
    image: '/images/banner/2.png'
  },
  {
    id: 3,
    title: 'Experiencia premium',
    headline: 'Curadoria, procedencia e presenca em cada detalhe.',
    image: '/images/banner/3.png'
  }
];

const fallbackVehicles: Vehicle[] = [
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

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);

  readonly loading = signal(true);
  readonly banners = signal<HeroBanner[]>(fallbackBanners);
  readonly vehicles = signal<Vehicle[]>(fallbackVehicles);

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

  loadHomeData(): void {
    this.loading.set(true);

    this.http.get<ApiHomeResponse>(apiConfig.velvetHomeUrl).pipe(
      map((response) => this.normalizeHomeResponse(response)),
      catchError((error) => {
        console.error('Falha ao carregar dados da API Velvet/Home.', error);

        return of({
          banners: fallbackBanners,
          featuredCars: []
        });
      }),
      finalize(() => this.loading.set(false))
    ).subscribe((homeData) => {
      this.banners.set(homeData.banners.length ? homeData.banners : fallbackBanners);
      this.vehicles.set(homeData.featuredCars);
    });
  }

  private normalizeHomeResponse(response: ApiHomeResponse): VelvetHomeResponse {
    const banners = response.Banners ?? response.banners ?? [];
    const featuredCars = response.FeaturedCars ?? response.featuredCars ?? [];

    return {
      banners: banners.map((banner) => ({
        id: banner.Id ?? banner.id ?? 0,
        title: banner.Title ?? banner.title ?? '',
        headline: banner.Headline ?? banner.headline ?? '',
        image: banner.Image ?? banner.image ?? ''
      })),
      featuredCars: featuredCars.map((vehicle) => ({
        id: vehicle.Id ?? vehicle.id ?? 0,
        name: vehicle.Name ?? vehicle.name ?? '',
        year: vehicle.Year ?? vehicle.year ?? new Date().getFullYear(),
        km: vehicle.Km ?? vehicle.km ?? 0,
        price: vehicle.Price ?? vehicle.price ?? 0,
        image: vehicle.Image ?? vehicle.image ?? '',
        badge: vehicle.Badge ?? vehicle.badge ?? 'Destaque Velvet',
        transmission: vehicle.Transmission ?? vehicle.transmission ?? 'Automatico',
        fuel: vehicle.Fuel ?? vehicle.fuel ?? 'Flex'
      }))
    };
  }

}
