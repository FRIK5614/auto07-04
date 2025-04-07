
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
if (!isset($input['url']) || !isset($input['carId'])) {
    echo json_encode(['success' => false, 'message' => 'Необходимо указать URL изображения и ID автомобиля']);
    exit;
}

try {
    $url = $input['url'];
    $carId = $input['carId'];
    $alt = isset($input['alt']) ? $input['alt'] : 'Изображение автомобиля';
    $isMain = isset($input['isMain']) ? (bool)$input['isMain'] : false;
    
    // Проверяем, что URL относится к изображению
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $urlInfo = pathinfo($url);
    
    if (!isset($urlInfo['extension']) || !in_array(strtolower($urlInfo['extension']), $allowedExtensions)) {
        echo json_encode(['success' => false, 'message' => 'URL не является ссылкой на изображение']);
        exit;
    }
    
    // Добавляем запись об изображении в базу данных
    $imageId = generateUUID();
    
    // Если это главное изображение, сначала сбросим флаг isMain у всех изображений этого автомобиля
    if ($isMain) {
        $resetStmt = $pdo->prepare('UPDATE car_images SET isMain = 0 WHERE carId = ?');
        $resetStmt->execute([$carId]);
    }
    
    // Вставляем новое изображение
    $stmt = $pdo->prepare('
        INSERT INTO car_images (id, carId, url, alt, isMain) 
        VALUES (?, ?, ?, ?, ?)
    ');
    
    $stmt->execute([
        $imageId,
        $carId,
        $url,
        $alt,
        $isMain ? 1 : 0
    ]);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Изображение успешно добавлено', 
        'data' => [
            'id' => $imageId,
            'url' => $url,
            'alt' => $alt,
            'carId' => $carId,
            'isMain' => $isMain
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка при добавлении изображения: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
