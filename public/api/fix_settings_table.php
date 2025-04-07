
<?php
require_once 'config.php';

// Явно указываем заголовок Content-Type для JSON
header('Content-Type: application/json');

try {
    // Проверяем существует ли таблица site_settings
    $stmt = $pdo->query("SHOW TABLES LIKE 'site_settings'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        // Создаем таблицу site_settings
        $pdo->exec("CREATE TABLE IF NOT EXISTS site_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) NOT NULL UNIQUE,
            setting_value TEXT,
            setting_group VARCHAR(50),
            setting_type VARCHAR(20) DEFAULT 'text'
        )");
        
        // Вставляем стандартные настройки
        $pdo->exec("INSERT INTO site_settings (setting_key, setting_value, setting_group, setting_type) VALUES
            ('site_title', 'Автокаталог', 'general', 'text'),
            ('site_description', 'Каталог автомобилей', 'general', 'textarea'),
            ('catalog_items_per_page', '12', 'catalog', 'number'),
            ('homepage_featured_cars', '6', 'homepage', 'number'),
            ('enable_comparison', 'true', 'features', 'boolean'),
            ('enable_favorites', 'true', 'features', 'boolean'),
            ('primary_color', '#9b87f5', 'design', 'color'),
            ('secondary_color', '#7E69AB', 'design', 'color')");
        
        echo json_encode([
            'success' => true, 
            'message' => 'Таблица настроек успешно создана и заполнена стандартными значениями.'
        ]);
    } else {
        echo json_encode([
            'success' => true, 
            'message' => 'Таблица настроек уже существует.'
        ]);
    }
    exit;
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка при работе с базой данных: ' . $e->getMessage()
    ]);
    exit;
}
?>
