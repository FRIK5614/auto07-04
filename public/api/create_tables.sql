
-- Создаем таблицу заказов
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  carId VARCHAR(255) NOT NULL,
  customerName VARCHAR(255) NOT NULL,
  customerPhone VARCHAR(50) NOT NULL,
  customerEmail VARCHAR(255),
  status ENUM('new', 'processing', 'completed', 'canceled') NOT NULL DEFAULT 'new',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  message TEXT,
  INDEX idx_carId (carId),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
);

-- Создаем таблицу автомобилей, если ее еще нет
CREATE TABLE IF NOT EXISTS cars (
  id VARCHAR(255) PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  bodyType VARCHAR(50) NOT NULL,
  colors JSON,
  priceBase DECIMAL(12,2) NOT NULL,
  priceDiscount DECIMAL(12,2),
  priceSpecial DECIMAL(12,2),
  engineType VARCHAR(50) NOT NULL,
  engineDisplacement DECIMAL(4,2) NOT NULL,
  enginePower INT NOT NULL,
  engineTorque INT NOT NULL,
  fuelType VARCHAR(50) NOT NULL,
  transmissionType VARCHAR(50) NOT NULL,
  transmissionGears INT NOT NULL,
  drivetrain VARCHAR(50) NOT NULL,
  dimensionsLength INT NOT NULL,
  dimensionsWidth INT NOT NULL,
  dimensionsHeight INT NOT NULL,
  dimensionsWheelbase INT NOT NULL,
  dimensionsWeight INT NOT NULL,
  dimensionsTrunkVolume INT NOT NULL,
  performanceAcceleration DECIMAL(4,2) NOT NULL,
  performanceTopSpeed INT NOT NULL,
  performanceFuelConsumptionCity DECIMAL(4,2) NOT NULL,
  performanceFuelConsumptionHighway DECIMAL(4,2) NOT NULL,
  performanceFuelConsumptionCombined DECIMAL(4,2) NOT NULL,
  description TEXT,
  isNew BOOLEAN NOT NULL DEFAULT FALSE,
  isPopular BOOLEAN NOT NULL DEFAULT FALSE,
  country VARCHAR(100),
  viewCount INT NOT NULL DEFAULT 0,
  INDEX idx_brand (brand),
  INDEX idx_model (model),
  INDEX idx_year (year),
  INDEX idx_bodyType (bodyType),
  INDEX idx_isNew (isNew),
  INDEX idx_country (country),
  INDEX idx_isPopular (isPopular)
);

-- Создаем таблицу для характеристик автомобилей
CREATE TABLE IF NOT EXISTS car_features (
  id VARCHAR(255) PRIMARY KEY,
  carId VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  isStandard BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (carId) REFERENCES cars(id) ON DELETE CASCADE,
  INDEX idx_carId (carId),
  INDEX idx_category (category)
);

-- Создаем таблицу для изображений автомобилей
CREATE TABLE IF NOT EXISTS car_images (
  id VARCHAR(255) PRIMARY KEY,
  carId VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  alt VARCHAR(255),
  FOREIGN KEY (carId) REFERENCES cars(id) ON DELETE CASCADE,
  INDEX idx_carId (carId)
);
