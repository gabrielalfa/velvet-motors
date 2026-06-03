import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { apiConfig } from '../config/api.config';
import { SiteContent } from '../models/site-content.model';
import { BrandLogo, Difference, HeroBanner, Vehicle, VehicleBrand, VelvetHomeResponse, VelvetOperationResult } from '../models/vehicle.model';
import { SiteContentService } from './site-content.service';

type ApiHomeResponse = {
  Banners?: ApiBanner[];
  FeaturedCars?: ApiVehicle[];
  SiteContent?: Partial<SiteContent> & Record<string, unknown>;
  banners?: ApiBanner[];
  featuredCars?: ApiVehicle[];
  siteContent?: Partial<SiteContent> & Record<string, unknown>;
};

type ApiBanner = {
  Id?: number;
  Title?: string;
  Headline?: string;
  Image?: string;
  SortOrder?: number;
  Active?: boolean;
  id?: number;
  title?: string;
  headline?: string;
  image?: string;
  sortOrder?: number;
  active?: boolean;
};

type ApiVehicle = {
  Id?: number;
  Name?: string;
  Year?: number;
  Km?: number;
  Price?: number;
  Image?: string;
  GalleryImages?: string;
  VideoUrl?: string;
  Badge?: string;
  Brand?: string;
  Condition?: string;
  DisplayTag?: string;
  ListingStatus?: string;
  Transmission?: string;
  Fuel?: string;
  Body?: string;
  Engine?: string;
  Drive?: string;
  Description?: string;
  TechnicalDescription?: string;
  FeaturesOptions?: string;
  CityMpg?: number;
  HighwayMpg?: number;
  TopSpeed?: string;
  Acceleration?: string;
  ExteriorColor?: string;
  InteriorColor?: string;
  Featured?: boolean;
  Active?: boolean;
  SortOrder?: number;
  id?: number;
  name?: string;
  year?: number;
  km?: number;
  price?: number;
  image?: string;
  galleryImages?: string;
  videoUrl?: string;
  badge?: string;
  brand?: string;
  condition?: string;
  displayTag?: string;
  listingStatus?: string;
  transmission?: string;
  fuel?: string;
  body?: string;
  engine?: string;
  drive?: string;
  description?: string;
  technicalDescription?: string;
  featuresOptions?: string;
  cityMpg?: number;
  highwayMpg?: number;
  topSpeed?: string;
  acceleration?: string;
  exteriorColor?: string;
  interiorColor?: string;
  featured?: boolean;
  active?: boolean;
  sortOrder?: number;
};

type ApiVehicleBrand = {
  Id?: number;
  Name?: string;
  Active?: boolean;
  SortOrder?: number;
  id?: number;
  name?: string;
  active?: boolean;
  sortOrder?: number;
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

const fallbackVehicleBrands: VehicleBrand[] = [
  { id: 1, name: 'BMW', active: true, sortOrder: 1 },
  { id: 2, name: 'Audi', active: true, sortOrder: 2 },
  { id: 3, name: 'Mercedes', active: true, sortOrder: 3 },
  { id: 4, name: 'Porsche', active: true, sortOrder: 4 },
  { id: 5, name: 'Volvo', active: true, sortOrder: 5 },
  { id: 6, name: 'Jeep', active: true, sortOrder: 6 },
  { id: 7, name: 'Toyota', active: true, sortOrder: 7 },
  { id: 8, name: 'Land Rover', active: true, sortOrder: 8 }
];

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly siteContentService = inject(SiteContentService);

  readonly loading = signal(true);
  readonly banners = signal<HeroBanner[]>(fallbackBanners);
  readonly vehicles = signal<Vehicle[]>(fallbackVehicles);
  readonly vehicleBrands = signal<VehicleBrand[]>(this.createDefaultVehicleBrands());
  readonly selectedVehicle = signal<Vehicle | null>(null);

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
      description: 'Selecao enxuta, elegante e focada em carros com presenca, estado e liquidez.'
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
          featuredCars: [],
          siteContent: undefined
        } satisfies VelvetHomeResponse);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe((homeData) => {
      if (homeData.siteContent) {
        this.siteContentService.applyRemoteContent(homeData.siteContent);
      }

      this.banners.set(homeData.banners.length ? homeData.banners : fallbackBanners);
      this.vehicles.set(homeData.featuredCars.length ? homeData.featuredCars : fallbackVehicles);
      this.mergeVehicleBrandsFromVehicles(this.vehicles());
    });
  }

  loadVehicles(): void {
    this.loading.set(true);

    this.getVehicles().pipe(
      finalize(() => this.loading.set(false))
    ).subscribe((vehicles) => {
      this.vehicles.set(vehicles.length ? vehicles : fallbackVehicles);
      this.mergeVehicleBrandsFromVehicles(this.vehicles());
    });
  }

  loadAdminVehicles(token: string): void {
    this.loading.set(true);

    this.http.post<ApiVehicle[] | VelvetOperationResult>(apiConfig.velvetAdminVehiclesUrl, { token }).pipe(
      map((response) => {
        if (!Array.isArray(response)) {
          throw new Error(response.Message ?? response.message ?? 'Resposta administrativa invalida.');
        }

        return response
          .filter((vehicle) => !this.isDeletedVehicle(vehicle))
          .map((vehicle) => this.normalizeVehicle(vehicle));
      }),
      catchError((error) => {
        console.error('Falha ao carregar veiculos administrativos da API Velvet/AdminVehicles. Tentando lista publica.', error);
        return this.getVehicles();
      }),
      finalize(() => this.loading.set(false))
    ).subscribe((vehicles) => {
      this.vehicles.set(vehicles);
      this.mergeVehicleBrandsFromVehicles(vehicles);
    });
  }

  loadVehicleBrands(): void {
    this.http.get<ApiVehicleBrand[]>(apiConfig.velvetBrandsUrl).pipe(
      map((brands) => brands.map((brand) => this.normalizeVehicleBrand(brand))),
      catchError((error) => {
        console.error('Falha ao carregar marcas da API Velvet/Brands. Usando marcas da frota atual.', error);
        return of(this.createVehicleBrandsFromVehicles(this.vehicles()));
      })
    ).subscribe((brands) => {
      this.vehicleBrands.set(this.mergeVehicleBrands([...this.vehicleBrands(), ...brands]));
    });
  }

  loadBanners(): void {
    this.http.get<ApiBanner[]>(apiConfig.velvetBannersUrl).pipe(
      map((banners) => banners.map((banner) => this.normalizeBanner(banner))),
      catchError((error) => {
        console.error('Falha ao carregar banners da API Velvet/Banners.', error);
        return of(fallbackBanners);
      })
    ).subscribe((banners) => this.banners.set(banners.length ? banners : fallbackBanners));
  }

  loadVehicle(id: number): void {
    this.loading.set(true);

    this.getVehicle(id).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe((vehicle) => this.selectedVehicle.set(vehicle));
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<ApiVehicle[]>(apiConfig.velvetVehiclesUrl).pipe(
      map((vehicles) => vehicles.map((vehicle) => this.normalizeVehicle(vehicle))),
      catchError((error) => {
        console.error('Falha ao carregar veiculos da API Velvet/Vehicles.', error);
        return of(fallbackVehicles);
      })
    );
  }

  getVehicle(id: number): Observable<Vehicle | null> {
    return this.http.get<ApiVehicle | VelvetOperationResult>(`${apiConfig.velvetVehicleUrl}?id=${id}`).pipe(
      map((response) => this.isOperationFailure(response) ? null : this.normalizeVehicle(response as ApiVehicle)),
      catchError((error) => {
        console.error('Falha ao carregar veiculo da API Velvet/Vehicle.', error);
        return of(fallbackVehicles.find((vehicle) => vehicle.id === id) ?? null);
      })
    );
  }

  saveVehicle(vehicle: Vehicle, token: string, reloadPublicList = true): Observable<VelvetOperationResult> {
    const endpoint = vehicle.id > 0 ? apiConfig.velvetUpdateVehicleUrl : apiConfig.velvetInsertVehicleUrl;
    const body = this.toVehicleRequest(vehicle, token);

    return this.http.post<VelvetOperationResult>(endpoint, body).pipe(
      tap((result) => {
        if (reloadPublicList && this.operationSucceeded(result)) {
          this.loadVehicles();
        }
      })
    );
  }

  saveVehicleBrand(name: string, token: string): Observable<VelvetOperationResult> {
    const normalizedName = this.normalizeBrandName(name);

    if (!normalizedName) {
      return of({ success: false, message: 'Informe o nome da marca.' });
    }

    const existing = this.vehicleBrands().find((brand) => this.brandKey(brand.name) === this.brandKey(normalizedName));

    if (existing) {
      return of({ success: false, message: 'Esta marca ja esta cadastrada.' });
    }

    return this.http.post<VelvetOperationResult>(apiConfig.velvetInsertBrandUrl, {
      token,
      name: normalizedName,
      active: true
    }).pipe(
      tap((result) => {
        if (this.operationSucceeded(result)) {
          const id = result.Id ?? result.id ?? 0;
          this.addVehicleBrand({ id, name: normalizedName, active: true });
        }
      }),
      catchError((error) => {
        console.error('Falha ao cadastrar marca na API Velvet/InsertBrand.', error);
        this.addVehicleBrand({ id: 0, name: normalizedName, active: true });
        return of({
          ...this.createOperationResultFromError(error, 'Nao foi possivel cadastrar a marca agora.'),
          success: true,
          message: `${this.errorMessage(error, 'Nao foi possivel cadastrar a marca agora.')} Marca adicionada apenas neste cadastro ate o endpoint InsertBrand ser publicado.`
        });
      })
    );
  }

  addVehicleBrand(brand: VehicleBrand): void {
    this.vehicleBrands.set(this.mergeVehicleBrands([
      ...this.vehicleBrands(),
      {
        ...brand,
        name: this.normalizeBrandName(brand.name)
      }
    ]));
  }

  deleteVehicle(id: number, token: string): Observable<VelvetOperationResult> {
    const endpoint = `${apiConfig.velvetDeleteVehicleUrl}?id=${id}&token=${encodeURIComponent(token)}`;

    return this.http.post<VelvetOperationResult>(endpoint, {}).pipe(
      tap((result) => {
        if (this.operationSucceeded(result)) {
          this.vehicles.update((items) => items.filter((vehicle) => vehicle.id !== id));
          this.loadAdminVehicles(token);
        }
      })
    );
  }

  saveBanner(banner: HeroBanner, token: string): Observable<VelvetOperationResult> {
    const endpoint = banner.id > 0 ? apiConfig.velvetUpdateBannerUrl : apiConfig.velvetInsertBannerUrl;
    const body = {
      token,
      id: banner.id,
      title: banner.title,
      headline: banner.headline,
      image: banner.image,
      sortOrder: banner.sortOrder ?? banner.id,
      active: banner.active ?? true
    };

    return this.http.post<VelvetOperationResult>(endpoint, body).pipe(
      tap((result) => {
        if (this.operationSucceeded(result)) {
          if (banner.id > 0) {
            const savedBanner = this.normalizeBanner({
              ...body,
              Id: banner.id,
              SortOrder: body.sortOrder,
              Active: body.active
            });

            this.banners.update((items) => items.map((item) => item.id === banner.id ? savedBanner : item));
            return;
          }

          this.loadBanners();
        }
      })
    );
  }

  deleteBanner(id: number, token: string): Observable<VelvetOperationResult> {
    return this.http.post<VelvetOperationResult>(apiConfig.velvetDeleteBannerUrl, { id, token }).pipe(
      tap((result) => {
        if (this.operationSucceeded(result)) {
          this.banners.update((items) => items.filter((banner) => banner.id !== id));
        }
      })
    );
  }

  operationSucceeded(result: VelvetOperationResult): boolean {
    return result.Success ?? result.success ?? false;
  }

  operationMessage(result: VelvetOperationResult): string {
    return result.Message ?? result.message ?? '';
  }

  private createOperationResultFromError(error: unknown, fallbackMessage: string): VelvetOperationResult {
    return {
      success: false,
      message: this.errorMessage(error, fallbackMessage)
    };
  }

  private errorMessage(error: unknown, fallbackMessage: string): string {
    const payload = (error as { error?: unknown })?.error;

    if (payload && typeof payload === 'object') {
      const message = (payload as VelvetOperationResult).Message ?? (payload as VelvetOperationResult).message;

      if (message) {
        return message;
      }
    }

    if (typeof payload === 'string') {
      const title = payload.match(/<title>(.*?)<\/title>/i)?.[1]
        ?.replace(/&#225;/g, 'á')
        ?.replace(/&#227;/g, 'ã')
        ?.replace(/&#234;/g, 'ê')
        ?.replace(/&nbsp;/g, ' ')
        ?.trim();

      if (title) {
        return title;
      }
    }

    return fallbackMessage;
  }

  private normalizeHomeResponse(response: ApiHomeResponse): VelvetHomeResponse {
    const banners = response.Banners ?? response.banners ?? [];
    const featuredCars = response.FeaturedCars ?? response.featuredCars ?? [];
    const siteContent = response.SiteContent ?? response.siteContent;

    return {
      banners: banners.map((banner) => ({
        ...this.normalizeBanner(banner)
      })),
      featuredCars: featuredCars.map((vehicle) => this.normalizeVehicle(vehicle)),
      siteContent: siteContent ? this.siteContentService.normalizeContent(siteContent) : undefined
    };
  }

  private normalizeBanner(banner: ApiBanner): HeroBanner {
    return {
      id: banner.Id ?? banner.id ?? 0,
      title: banner.Title ?? banner.title ?? '',
      headline: banner.Headline ?? banner.headline ?? '',
      image: this.resolveMediaUrl(banner.Image ?? banner.image ?? ''),
      sortOrder: banner.SortOrder ?? banner.sortOrder ?? 0,
      active: banner.Active ?? banner.active ?? true
    };
  }

  private normalizeVehicle(vehicle: ApiVehicle): Vehicle {
    return {
      id: vehicle.Id ?? vehicle.id ?? 0,
      name: vehicle.Name ?? vehicle.name ?? '',
      year: vehicle.Year ?? vehicle.year ?? new Date().getFullYear(),
      km: vehicle.Km ?? vehicle.km ?? 0,
      price: vehicle.Price ?? vehicle.price ?? 0,
      image: this.resolveMediaUrl(vehicle.Image ?? vehicle.image ?? ''),
      galleryImages: this.resolveGalleryUrls(vehicle.GalleryImages ?? vehicle.galleryImages ?? ''),
      videoUrl: vehicle.VideoUrl ?? vehicle.videoUrl ?? '',
      badge: vehicle.Badge ?? vehicle.badge ?? 'Destaque Velvet',
      brand: vehicle.Brand ?? vehicle.brand ?? '',
      condition: vehicle.Condition ?? vehicle.condition ?? '',
      displayTag: vehicle.DisplayTag ?? vehicle.displayTag ?? vehicle.Badge ?? vehicle.badge ?? '',
      listingStatus: vehicle.ListingStatus ?? vehicle.listingStatus ?? ((vehicle.Active ?? vehicle.active ?? true) ? 'Publicado' : 'Rascunho'),
      transmission: vehicle.Transmission ?? vehicle.transmission ?? 'Automatico',
      fuel: vehicle.Fuel ?? vehicle.fuel ?? 'Flex',
      body: vehicle.Body ?? vehicle.body ?? 'Sedan',
      engine: vehicle.Engine ?? vehicle.engine ?? '',
      drive: vehicle.Drive ?? vehicle.drive ?? '',
      description: vehicle.Description ?? vehicle.description ?? '',
      technicalDescription: vehicle.TechnicalDescription ?? vehicle.technicalDescription ?? '',
      featuresOptions: vehicle.FeaturesOptions ?? vehicle.featuresOptions ?? '',
      cityMpg: vehicle.CityMpg ?? vehicle.cityMpg ?? 0,
      highwayMpg: vehicle.HighwayMpg ?? vehicle.highwayMpg ?? 0,
      topSpeed: vehicle.TopSpeed ?? vehicle.topSpeed ?? '',
      acceleration: vehicle.Acceleration ?? vehicle.acceleration ?? '',
      exteriorColor: vehicle.ExteriorColor ?? vehicle.exteriorColor ?? '',
      interiorColor: vehicle.InteriorColor ?? vehicle.interiorColor ?? '',
      featured: vehicle.Featured ?? vehicle.featured ?? true,
      active: vehicle.Active ?? vehicle.active ?? true,
      sortOrder: vehicle.SortOrder ?? vehicle.sortOrder ?? 0
    };
  }

  private normalizeVehicleBrand(brand: ApiVehicleBrand): VehicleBrand {
    return {
      id: brand.Id ?? brand.id ?? 0,
      name: this.normalizeBrandName(brand.Name ?? brand.name ?? ''),
      active: brand.Active ?? brand.active ?? true,
      sortOrder: brand.SortOrder ?? brand.sortOrder ?? 0
    };
  }

  private isDeletedVehicle(vehicle: ApiVehicle): boolean {
    const active = vehicle.Active ?? vehicle.active ?? true;
    const listingStatus = (vehicle.ListingStatus ?? vehicle.listingStatus ?? '').trim();

    return active === false && listingStatus === 'Publicado';
  }

  private toVehicleRequest(vehicle: Vehicle, token: string): Record<string, string | number | boolean> {
    return {
      token,
      id: vehicle.id,
      name: vehicle.name,
      year: vehicle.year,
      km: vehicle.km,
      price: vehicle.price,
      image: vehicle.image,
      galleryImages: vehicle.galleryImages ?? '',
      videoUrl: vehicle.videoUrl ?? '',
      badge: vehicle.badge,
      brand: vehicle.brand ?? '',
      condition: vehicle.condition ?? '',
      displayTag: vehicle.displayTag ?? '',
      listingStatus: vehicle.listingStatus ?? 'Publicado',
      transmission: vehicle.transmission,
      fuel: vehicle.fuel,
      body: vehicle.body ?? '',
      engine: vehicle.engine ?? '',
      drive: vehicle.drive ?? '',
      description: vehicle.description ?? '',
      technicalDescription: vehicle.technicalDescription ?? '',
      featuresOptions: vehicle.featuresOptions ?? '',
      cityMpg: vehicle.cityMpg ?? 0,
      highwayMpg: vehicle.highwayMpg ?? 0,
      topSpeed: vehicle.topSpeed ?? '',
      acceleration: vehicle.acceleration ?? '',
      exteriorColor: vehicle.exteriorColor ?? '',
      interiorColor: vehicle.interiorColor ?? '',
      featured: vehicle.featured ?? true,
      active: vehicle.active ?? true,
      sortOrder: vehicle.sortOrder ?? vehicle.id
    };
  }

  private createDefaultVehicleBrands(): VehicleBrand[] {
    return [...fallbackVehicleBrands];
  }

  private createVehicleBrandsFromVehicles(vehicles: Vehicle[]): VehicleBrand[] {
    return vehicles
      .map((vehicle) => (vehicle.brand ?? '').trim())
      .filter(Boolean)
      .map((name, index) => ({ id: index + 1, name, active: true, sortOrder: index + 1 }));
  }

  private mergeVehicleBrandsFromVehicles(vehicles: Vehicle[]): void {
    this.vehicleBrands.set(this.mergeVehicleBrands([
      ...this.vehicleBrands(),
      ...this.createVehicleBrandsFromVehicles(vehicles)
    ]));
  }

  private mergeVehicleBrands(brands: VehicleBrand[]): VehicleBrand[] {
    const mapByName = new Map<string, VehicleBrand>();

    brands
      .filter((brand) => brand.name.trim())
      .forEach((brand) => {
        const key = this.brandKey(brand.name);
        const current = mapByName.get(key);
        const normalizedName = this.normalizeBrandName(current?.name ?? brand.name);

        mapByName.set(key, {
          ...current,
          ...brand,
          name: normalizedName,
          id: brand.id || current?.id || 0,
          active: brand.active ?? current?.active ?? true,
          sortOrder: brand.sortOrder ?? current?.sortOrder ?? 99
        });
      });

    return [...mapByName.values()]
      .filter((brand) => brand.active ?? true)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  private normalizeBrandName(name: string): string {
    return name.trim().replace(/\s+/g, ' ');
  }

  private brandKey(name: string): string {
    return this.normalizeBrandName(name)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  uploadVehicleMedia(file: File, token: string, scope = 'vehicles'): Observable<VelvetOperationResult & { url?: string; Url?: string }> {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('scope', scope);
    formData.append('file', file);

    return this.http.post<VelvetOperationResult & { url?: string; Url?: string }>(apiConfig.velvetUploadVehicleMediaUrl, formData);
  }

  resolveMediaUrl(url: string): string {
    if (!url) {
      return '';
    }

    if (/^https?:\/\//i.test(url) || url.startsWith('/images/')) {
      return url;
    }

    if (url.startsWith('/uploads/')) {
      return `${apiConfig.velvetAssetBaseUrl}${url}`;
    }

    return url;
  }

  private resolveGalleryUrls(value: string): string {
    return (value ?? '')
      .split('\n')
      .map((image) => this.resolveMediaUrl(image.trim()))
      .filter(Boolean)
      .join('\n');
  }

  private isOperationFailure(response: ApiVehicle | VelvetOperationResult): boolean {
    if ('Success' in response || 'success' in response) {
      return !(response.Success ?? response.success);
    }

    return false;
  }
}
