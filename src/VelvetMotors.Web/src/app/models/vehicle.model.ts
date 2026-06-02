import { SiteContent } from './site-content.model';

export interface Vehicle {
  id: number;
  name: string;
  year: number;
  km: number;
  price: number;
  image: string;
  galleryImages?: string;
  videoUrl?: string;
  badge: string;
  brand?: string;
  condition?: string;
  displayTag?: string;
  listingStatus?: string;
  transmission: string;
  fuel: string;
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
  vin?: string;
  featured?: boolean;
  active?: boolean;
  sortOrder?: number;
}

export interface HeroBanner {
  id: number;
  title: string;
  headline: string;
  image: string;
  sortOrder?: number;
  active?: boolean;
}

export interface VelvetHomeResponse {
  banners: HeroBanner[];
  featuredCars: Vehicle[];
  siteContent?: SiteContent;
}

export interface BrandLogo {
  name: string;
}

export interface Difference {
  icon: string;
  title: string;
  description: string;
}

export interface VelvetOperationResult {
  success?: boolean;
  Success?: boolean;
  message?: string;
  Message?: string;
  id?: number;
  Id?: number;
}

export interface VelvetAuthResult {
  success?: boolean;
  Success?: boolean;
  message?: string;
  Message?: string;
  token?: string;
  Token?: string;
  name?: string;
  Name?: string;
  email?: string;
  Email?: string;
  expiresAt?: string;
  ExpiresAt?: string;
}
