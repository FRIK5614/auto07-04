
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
if (!isset($input['id']) || !isset($input['carId'])) {
    echo json_encode(['success' => false, 'message' => 'Недостаточно данных']);
    exit;
}

try {
    // Начинаем транзакцию
    $pdo->beginTransaction();
    
    // Сначала сбрасываем флаг isMain у всех изображений этого автомобиля
    $resetStmt = $pdo->prepare('UPDATE car_images SET isMain = 0 WHERE carId = ?');
    $resetStmt->execute([$input['carId']]);
    
    // Затем устанавливаем флаг isMain для выбранного изображения
    $setStmt = $pdo->prepare('UPDATE car_images SET isMain = 1 WHERE id = ? AND carId = ?');
    $setStmt->execute([$input['id'], $input['carId']]);
    
    if ($setStmt->rowCount() === 0) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Изображение не найдено']);
        exit;
    }
    
    // Если все прошло успешно, фиксируем транзакцию
    $pdo->commit();
    
    echo json_encode(['success' => true, 'message' => 'Главное изображение установлено']);
    exit;
} catch (Exception $e) {
    // В случае ошибки отменяем транзакцию
    $pdo->rollBack();
    
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка при установке главного изображения: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>
