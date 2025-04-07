
<?php
require_once '../config.php';

// Явно указываем заголовок Content-Type для JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обработка предварительных запросов OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

// Получаем данные из тела запроса
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Проверяем данные
if (!isset($input['key']) || !isset($input['value'])) {
    echo json_encode(['success' => false, 'message' => 'Неверные данные запроса']);
    exit;
}

try {
    $stmt = $pdo->prepare('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?');
    $stmt->execute([$input['value'], $input['key']]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Настройка обновлена']);
    } else {
        // Если настройка не найдена, попробуем ее создать
        $stmt = $pdo->prepare('INSERT INTO site_settings (setting_key, setting_value, setting_group, setting_type) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $input['key'], 
            $input['value'], 
            $input['group'] ?? 'general',
            $input['type'] ?? 'text'
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Настройка создана']);
    }
    exit;
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка обновления настроек: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>
