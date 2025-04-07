export interface CarImage {
  id: string;
  url: string;
  alt: string;
}

export interface CarPrice {
  base: number;
  withOptions?: number;
  discount?: number;
  special?: number;
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
  acceleration: number; // 0-100 km/h in seconds
  topSpeed: number; // km/h
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
  features: CarFeature[];
  images: CarImage[];
  description: string;
  isNew: boolean;
  isPopular?: boolean;
  country?: string; // Country field for car origin
  viewCount?: number; // Track number of views
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
  countries?: string[]; // Countries filter
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
  image?: string; // Field for storing image in base64 format
  syncStatus?: 'pending' | 'synced' | 'failed'; // Synchronization status
  jsonFilePath?: string; // Path to the JSON file where the order is saved
}

export interface OrdersFile {
  orders: Order[];
  lastUpdated: string;
  version: string;
}
