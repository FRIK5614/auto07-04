
<?php
require_once 'config.php';

// Явно указываем заголовок Content-Type для JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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
        $defaultSettings = [
            ['companyName', 'Автокаталог', 'main', 'text'],
            ['companyLogo', 'https://example.com/logo.png', 'main', 'text'],
            ['companyPhone', '+7 (800) 123-45-67', 'main', 'text'],
            ['companyEmail', 'info@example.com', 'main', 'text'],
            ['companyAddress', 'г. Москва, ул. Примерная, д. 1', 'main', 'textarea'],
            ['telegramToken', '7816899565:AAF_OIH114D1Ijlg_r6_xAq1un5jy5X4w7Y', 'telegram', 'text'],
            ['telegramChannel', '@VoeAVTO', 'telegram', 'text'],
            ['adminNotifyList', '123456789,987654321', 'telegram', 'text'],
            ['primaryColor', '#0078FA', 'design', 'color'],
            ['backgroundColor', '#F5F7FA', 'design', 'color']
        ];
        
        $stmt = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value, setting_group, setting_type) VALUES (?, ?, ?, ?)");
        foreach ($defaultSettings as $setting) {
            $stmt->execute($setting);
        }
        
        echo json_encode([
            'success' => true, 
            'message' => 'Таблица настроек создана и заполнена стандартными значениями.'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => true, 
            'message' => 'Таблица настроек уже существует.'
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка при создании таблицы настроек: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>
