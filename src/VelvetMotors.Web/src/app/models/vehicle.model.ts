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
}

export interface BrandLogo {
  name: string;
}

export interface Difference {
  icon: string;
  title: string;
  description: string;
}
