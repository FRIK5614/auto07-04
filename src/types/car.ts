
export interface CarImage {
  id: string;
  url: string;
  alt: string;
  isMain?: boolean;
}

export interface CarPrice {
  base: number;
  withOptions?: number;
  discount?: number;
  special?: number | boolean;
}

export interface CarEngine {
  type: string;
  displacement: number;
  power: number;
  torque: number;
  fuelType: string;
}

export interface CarTransmission {
  type: string;
  gears: number;
}

export interface CarDimensions {
  length: number;
  width: number;
  height: number;
  wheelbase: number;
  weight: number;
  trunkVolume: number;
}

export interface CarPerformance {
  acceleration: number;
  topSpeed: number;
  fuelConsumption: {
    city: number;
    highway: number;
    combined: number;
  };
}

export interface CarFeature {
  id: string;
  name: string;
  category: string;
  isStandard: boolean;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  bodyType: string;
  colors: string[];
  price: CarPrice;
  engine: CarEngine;
  transmission: CarTransmission;
  drivetrain: string;
  dimensions: CarDimensions;
  performance: CarPerformance;
  features?: CarFeature[];
  images?: CarImage[];
  description?: string;
  isNew?: boolean;
  isPopular?: boolean;
  trim?: string;
  exteriorColor?: string;
  interiorColor?: string;
  country?: string;
  viewCount?: number;
  mileage?: number;
  status?: 'published' | 'draft';
}

export interface CarFilter {
  brands?: string[];
  models?: string[];
  years?: number[];
  bodyTypes?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  engineTypes?: string[];
  drivetrains?: string[];
  isNew?: boolean;
  countries?: string[];
}

export interface Order {
  id: string;
  carId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  message?: string;
  status: 'new' | 'processing' | 'completed' | 'canceled';
  createdAt: string;
  syncStatus?: 'pending' | 'synced' | 'failed';
  jsonFilePath?: string;
  amount?: number;
  customerComment?: string;
}

export interface OrdersFile {
  orders: Order[];
  lastUpdated: string;
  version: string;
}
