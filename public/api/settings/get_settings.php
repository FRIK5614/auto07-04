
<?php
require_once '../config.php';

// Явно указываем заголовок Content-Type для JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обработка предварительных запросов OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $group = isset($_GET['group']) ? $_GET['group'] : null;
    
    $query = 'SELECT * FROM site_settings';
    $params = [];
    
    if ($group) {
        $query .= ' WHERE setting_group = ?';
        $params[] = $group;
    }
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $settings = $stmt->fetchAll();
    
    // Преобразуем результат в ассоциативный массив ключ => значение
    $settingsArray = [];
    foreach ($settings as $setting) {
        // Преобразуем значение в соответствии с типом
        $value = $setting['setting_value'];
        
        switch ($setting['setting_type']) {
            case 'number':
                $value = (int)$value;
                break;
            case 'boolean':
                $value = $value === 'true';
                break;
            // Остальные типы оставляем как есть (text, textarea, color)
        }
        
        $settingsArray[$setting['setting_key']] = $value;
    }
    
    echo json_encode([
        'success' => true, 
        'data' => $settingsArray
    ], JSON_UNESCAPED_UNICODE);
    exit;
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка получения настроек: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>
