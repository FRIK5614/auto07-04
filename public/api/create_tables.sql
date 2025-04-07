
-- Create orders table with additional fields
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    carId VARCHAR(50) NOT NULL,
    customerName VARCHAR(100) NOT NULL,
    customerPhone VARCHAR(50) NOT NULL,
    customerEmail VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    createdAt DATETIME NOT NULL,
    message TEXT
);

-- Create car_images table
CREATE TABLE IF NOT EXISTS car_images (
    id VARCHAR(50) PRIMARY KEY,
    carId VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    alt VARCHAR(255),
    isMain BOOLEAN DEFAULT FALSE,
    uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX (carId)
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_group VARCHAR(50),
    setting_type VARCHAR(20) DEFAULT 'text'
);

-- Insert default settings
INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_group, setting_type) VALUES
('site_title', 'Автокаталог', 'general', 'text'),
('site_description', 'Каталог автомобилей', 'general', 'textarea'),
('catalog_items_per_page', '12', 'catalog', 'number'),
('homepage_featured_cars', '6', 'homepage', 'number'),
('enable_comparison', 'true', 'features', 'boolean'),
('enable_favorites', 'true', 'features', 'boolean'),
('primary_color', '#9b87f5', 'design', 'color'),
('secondary_color', '#7E69AB', 'design', 'color');
