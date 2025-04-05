
import { Car } from "../types/car";

export const carsData: Car[] = [
  {
    id: "1",
    brand: "Toyota",
    model: "Camry",
    year: 2023,
    bodyType: "Sedan",
    colors: ["White", "Black", "Silver", "Red"],
    price: {
      base: 2850000,
      withOptions: 3050000,
      discount: 100000
    },
    engine: {
      type: "V6",
      displacement: 3.5,
      power: 301,
      torque: 362,
      fuelType: "Gasoline"
    },
    transmission: {
      type: "Automatic",
      gears: 8
    },
    drivetrain: "FWD",
    dimensions: {
      length: 4885,
      width: 1840,
      height: 1455,
      wheelbase: 2825,
      weight: 1590,
      trunkVolume: 493
    },
    performance: {
      acceleration: 7.1,
      topSpeed: 220,
      fuelConsumption: {
        city: 10.8,
        highway: 6.2,
        combined: 8.1
      }
    },
    features: [
      { id: "f1", name: "Leather Seats", category: "Interior", isStandard: true },
      { id: "f2", name: "Adaptive Cruise Control", category: "Safety", isStandard: true },
      { id: "f3", name: "Blind Spot Monitor", category: "Safety", isStandard: true },
      { id: "f4", name: "Sunroof", category: "Comfort", isStandard: false },
      { id: "f5", name: "Heated Seats", category: "Comfort", isStandard: false }
    ],
    images: [
      { id: "img1", url: "/placeholder.svg", alt: "Toyota Camry Front" },
      { id: "img2", url: "/placeholder.svg", alt: "Toyota Camry Side" },
      { id: "img3", url: "/placeholder.svg", alt: "Toyota Camry Rear" }
    ],
    description: "The Toyota Camry is a reliable midsize sedan with a spacious interior, smooth ride, and excellent fuel efficiency. It comes with Toyota's Safety Sense suite of safety features as standard.",
    isNew: true,
    isPopular: true
  },
  {
    id: "2",
    brand: "Honda",
    model: "Accord",
    year: 2023,
    bodyType: "Sedan",
    colors: ["White", "Black", "Blue", "Gray"],
    price: {
      base: 2750000,
      withOptions: 2950000
    },
    engine: {
      type: "Inline-4 Turbo",
      displacement: 1.5,
      power: 192,
      torque: 260,
      fuelType: "Gasoline"
    },
    transmission: {
      type: "CVT",
      gears: 0
    },
    drivetrain: "FWD",
    dimensions: {
      length: 4895,
      width: 1860,
      height: 1450,
      wheelbase: 2830,
      weight: 1530,
      trunkVolume: 473
    },
    performance: {
      acceleration: 7.3,
      topSpeed: 210,
      fuelConsumption: {
        city: 8.2,
        highway: 6.0,
        combined: 7.0
      }
    },
    features: [
      { id: "f1", name: "Cloth Seats", category: "Interior", isStandard: true },
      { id: "f2", name: "Honda Sensing", category: "Safety", isStandard: true },
      { id: "f3", name: "Apple CarPlay", category: "Technology", isStandard: true },
      { id: "f4", name: "Leather Seats", category: "Interior", isStandard: false },
      { id: "f5", name: "Wireless Charging", category: "Technology", isStandard: false }
    ],
    images: [
      { id: "img1", url: "/placeholder.svg", alt: "Honda Accord Front" },
      { id: "img2", url: "/placeholder.svg", alt: "Honda Accord Side" },
      { id: "img3", url: "/placeholder.svg", alt: "Honda Accord Rear" }
    ],
    description: "The Honda Accord offers a comfortable ride, excellent fuel economy, and a spacious interior. Standard features include the Honda Sensing suite of safety technologies and a user-friendly infotainment system.",
    isNew: true
  },
  {
    id: "3",
    brand: "Volkswagen",
    model: "Tiguan",
    year: 2023,
    bodyType: "SUV",
    colors: ["White", "Black", "Gray", "Blue"],
    price: {
      base: 3300000,
      withOptions: 3650000,
      discount: 150000
    },
    engine: {
      type: "Inline-4 Turbo",
      displacement: 2.0,
      power: 184,
      torque: 300,
      fuelType: "Gasoline"
    },
    transmission: {
      type: "Automatic",
      gears: 8
    },
    drivetrain: "AWD",
    dimensions: {
      length: 4509,
      width: 1839,
      height: 1675,
      wheelbase: 2681,
      weight: 1750,
      trunkVolume: 615
    },
    performance: {
      acceleration: 8.2,
      topSpeed: 200,
      fuelConsumption: {
        city: 10.6,
        highway: 7.1,
        combined: 8.5
      }
    },
    features: [
      { id: "f1", name: "Leatherette Seats", category: "Interior", isStandard: true },
      { id: "f2", name: "Adaptive Cruise Control", category: "Safety", isStandard: true },
      { id: "f3", name: "Panoramic Sunroof", category: "Comfort", isStandard: false },
      { id: "f4", name: "Digital Cockpit", category: "Technology", isStandard: false },
      { id: "f5", name: "Harman Kardon Sound System", category: "Technology", isStandard: false }
    ],
    images: [
      { id: "img1", url: "/placeholder.svg", alt: "Volkswagen Tiguan Front" },
      { id: "img2", url: "/placeholder.svg", alt: "Volkswagen Tiguan Side" },
      { id: "img3", url: "/placeholder.svg", alt: "Volkswagen Tiguan Rear" }
    ],
    description: "The Volkswagen Tiguan is a versatile compact SUV with optional third-row seating, making it one of the few in its class to offer seating for seven. It provides a comfortable ride, refined handling, and a premium interior.",
    isNew: false,
    isPopular: true
  },
  {
    id: "4",
    brand: "BMW",
    model: "X5",
    year: 2023,
    bodyType: "SUV",
    colors: ["White", "Black", "Blue", "Silver"],
    price: {
      base: 7500000,
      withOptions: 8500000
    },
    engine: {
      type: "Inline-6 Turbo",
      displacement: 3.0,
      power: 335,
      torque: 450,
      fuelType: "Gasoline"
    },
    transmission: {
      type: "Automatic",
      gears: 8
    },
    drivetrain: "AWD",
    dimensions: {
      length: 4935,
      width: 2004,
      height: 1765,
      wheelbase: 2975,
      weight: 2130,
      trunkVolume: 650
    },
    performance: {
      acceleration: 5.5,
      topSpeed: 250,
      fuelConsumption: {
        city: 12.5,
        highway: 9.2,
        combined: 10.5
      }
    },
    features: [
      { id: "f1", name: "Leather Seats", category: "Interior", isStandard: true },
      { id: "f2", name: "Panoramic Sunroof", category: "Comfort", isStandard: true },
      { id: "f3", name: "Head-Up Display", category: "Technology", isStandard: false },
      { id: "f4", name: "Harman Kardon Sound System", category: "Technology", isStandard: false },
      { id: "f5", name: "Massage Seats", category: "Comfort", isStandard: false }
    ],
    images: [
      { id: "img1", url: "/placeholder.svg", alt: "BMW X5 Front" },
      { id: "img2", url: "/placeholder.svg", alt: "BMW X5 Side" },
      { id: "img3", url: "/placeholder.svg", alt: "BMW X5 Rear" }
    ],
    description: "The BMW X5 is a luxury SUV that combines impressive performance with a premium interior and the latest technology features. It offers a refined driving experience, powerful engine options, and excellent build quality.",
    isNew: true
  },
  {
    id: "5",
    brand: "Audi",
    model: "A6",
    year: 2023,
    bodyType: "Sedan",
    colors: ["White", "Black", "Gray", "Blue"],
    price: {
      base: 6800000,
      withOptions: 7500000
    },
    engine: {
      type: "V6 Turbo",
      displacement: 3.0,
      power: 340,
      torque: 500,
      fuelType: "Gasoline"
    },
    transmission: {
      type: "Automatic",
      gears: 7
    },
    drivetrain: "AWD",
    dimensions: {
      length: 4939,
      width: 1886,
      height: 1457,
      wheelbase: 2924,
      weight: 1825,
      trunkVolume: 530
    },
    performance: {
      acceleration: 5.1,
      topSpeed: 250,
      fuelConsumption: {
        city: 11.8,
        highway: 7.5,
        combined: 9.1
      }
    },
    features: [
      { id: "f1", name: "Leather Seats", category: "Interior", isStandard: true },
      { id: "f2", name: "Virtual Cockpit", category: "Technology", isStandard: true },
      { id: "f3", name: "Bang & Olufsen Sound System", category: "Technology", isStandard: false },
      { id: "f4", name: "Massage Seats", category: "Comfort", isStandard: false },
      { id: "f5", name: "Adaptive Cruise Control", category: "Safety", isStandard: false }
    ],
    images: [
      { id: "img1", url: "/placeholder.svg", alt: "Audi A6 Front" },
      { id: "img2", url: "/placeholder.svg", alt: "Audi A6 Side" },
      { id: "img3", url: "/placeholder.svg", alt: "Audi A6 Rear" }
    ],
    description: "The Audi A6 is a midsize luxury sedan with a sophisticated design, high-quality interior, and advanced technology features. It offers a smooth and refined driving experience with optional Quattro all-wheel drive.",
    isNew: false,
    isPopular: true
  },
  {
    id: "6",
    brand: "Mercedes-Benz",
    model: "E-Class",
    year: 2023,
    bodyType: "Sedan",
    colors: ["White", "Black", "Silver", "Blue"],
    price: {
      base: 7000000,
      withOptions: 7800000
    },
    engine: {
      type: "Inline-6 Turbo",
      displacement: 3.0,
      power: 362,
      torque: 500,
      fuelType: "Gasoline"
    },
    transmission: {
      type: "Automatic",
      gears: 9
    },
    drivetrain: "RWD",
    dimensions: {
      length: 4935,
      width: 1852,
      height: 1468,
      wheelbase: 2939,
      weight: 1850,
      trunkVolume: 540
    },
    performance: {
      acceleration: 4.9,
      topSpeed: 250,
      fuelConsumption: {
        city: 12.1,
        highway: 7.8,
        combined: 9.5
      }
    },
    features: [
      { id: "f1", name: "Leather Seats", category: "Interior", isStandard: true },
      { id: "f2", name: "MBUX Infotainment System", category: "Technology", isStandard: true },
      { id: "f3", name: "Burmester Surround Sound", category: "Technology", isStandard: false },
      { id: "f4", name: "Massage Seats", category: "Comfort", isStandard: false },
      { id: "f5", name: "Driver Assistance Package", category: "Safety", isStandard: false }
    ],
    images: [
      { id: "img1", url: "/placeholder.svg", alt: "Mercedes-Benz E-Class Front" },
      { id: "img2", url: "/placeholder.svg", alt: "Mercedes-Benz E-Class Side" },
      { id: "img3", url: "/placeholder.svg", alt: "Mercedes-Benz E-Class Rear" }
    ],
    description: "The Mercedes-Benz E-Class is a midsize luxury sedan that offers a perfect blend of comfort, technology, and performance. It features a sophisticated interior, advanced safety features, and a smooth ride quality.",
    isNew: true
  }
];

// Helper functions for filtering cars
export const getAllBrands = (): string[] => {
  return [...new Set(carsData.map(car => car.brand))].sort();
};

export const getAllModels = (): string[] => {
  return [...new Set(carsData.map(car => car.model))].sort();
};

export const getAllBodyTypes = (): string[] => {
  return [...new Set(carsData.map(car => car.bodyType))].sort();
};

export const getYearRange = (): { min: number; max: number } => {
  const years = carsData.map(car => car.year);
  return {
    min: Math.min(...years),
    max: Math.max(...years)
  };
};

export const getPriceRange = (): { min: number; max: number } => {
  const prices = carsData.map(car => car.price.base);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
};

export const getEngineTypes = (): string[] => {
  return [...new Set(carsData.map(car => car.engine.type))].sort();
};

export const getDrivetrains = (): string[] => {
  return [...new Set(carsData.map(car => car.drivetrain))].sort();
};

export const getNewCars = (): Car[] => {
  return carsData.filter(car => car.isNew);
};

export const getPopularCars = (): Car[] => {
  return carsData.filter(car => car.isPopular);
};
