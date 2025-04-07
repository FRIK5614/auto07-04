
<?php
require_once '../config.php';

// Явно указываем заголовок Content-Type для JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обработка предварительных запросов OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

// Получаем данные из тела запроса
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Проверяем данные
if (!isset($input['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID изображения не указан']);
    exit;
}

try {
    // Получаем информацию об изображении перед удалением
    $stmt = $pdo->prepare('SELECT url FROM car_images WHERE id = ?');
    $stmt->execute([$input['id']]);
    $image = $stmt->fetch();
    
    if (!$image) {
        echo json_encode(['success' => false, 'message' => 'Изображение не найдено']);
        exit;
    }
    
    // Удаляем запись из базы данных
    $stmt = $pdo->prepare('DELETE FROM car_images WHERE id = ?');
    $stmt->execute([$input['id']]);
    
    // Пытаемся удалить физический файл, если он существует
    $filePath = $_SERVER['DOCUMENT_ROOT'] . $image['url'];
    if (file_exists($filePath)) {
        unlink($filePath);
    }
    
    echo json_encode(['success' => true, 'message' => 'Изображение успешно удалено']);
    exit;
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка удаления изображения: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>
