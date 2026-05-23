export interface Vehicle {
  id: number;
  name: string;
  year: number;
  km: number;
  price: number;
  image: string;
  badge: string;
  transmission: string;
  fuel: string;
  body?: string;
  engine?: string;
  drive?: string;
  exteriorColor?: string;
  interiorColor?: string;
  vin?: string;
}

export interface HeroBanner {
  id: number;
  title: string;
  headline: string;
  image: string;
}

export interface VelvetHomeResponse {
  banners: HeroBanner[];
  featuredCars: Vehicle[];
}

export interface BrandLogo {
  name: string;
}

export interface Difference {
  icon: string;
  title: string;
  description: string;
}
