
<?php
require_once '../config.php';

// Явно указываем заголовок Content-Type для JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обработка предварительных запросов OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Получаем данные из тела запроса
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);
    
    if (!isset($input['adminNotifyList']) && !isset($input['telegramToken']) && !isset($input['telegramChannel'])) {
        echo json_encode([
            'success' => false, 
            'message' => 'Отсутствуют необходимые параметры'
        ]);
        exit;
    }
    
    try {
        // Проверяем, существует ли таблица настроек
        $stmt = $pdo->query("SHOW TABLES LIKE 'site_settings'");
        $tableExists = $stmt->rowCount() > 0;
        
        if (!$tableExists) {
            // Создаем таблицу настроек
            $pdo->exec("CREATE TABLE site_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) NOT NULL UNIQUE,
                setting_value TEXT,
                setting_group VARCHAR(50),
                setting_type VARCHAR(20) DEFAULT 'text'
            )");
        }
        
        // Обновляем или добавляем настройки
        if (isset($input['adminNotifyList'])) {
            $stmt = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value, setting_group, setting_type) 
                VALUES ('adminNotifyList', :value, 'telegram', 'text') 
                ON DUPLICATE KEY UPDATE setting_value = :value");
            $stmt->execute(['value' => $input['adminNotifyList']]);
        }
        
        if (isset($input['telegramToken'])) {
            $stmt = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value, setting_group, setting_type) 
                VALUES ('telegramToken', :value, 'telegram', 'text') 
                ON DUPLICATE KEY UPDATE setting_value = :value");
            $stmt->execute(['value' => $input['telegramToken']]);
        }
        
        if (isset($input['telegramChannel'])) {
            $stmt = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value, setting_group, setting_type) 
                VALUES ('telegramChannel', :value, 'telegram', 'text') 
                ON DUPLICATE KEY UPDATE setting_value = :value");
            $stmt->execute(['value' => $input['telegramChannel']]);
        }
        
        echo json_encode([
            'success' => true, 
            'message' => 'Настройки Telegram успешно обновлены'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false, 
            'message' => 'Ошибка при обновлении настроек Telegram: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'Метод не поддерживается'
    ]);
}
?>
