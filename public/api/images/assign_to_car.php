
<?php
require_once '../config.php';

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

// Получаем данные из тела запроса
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Проверяем данные
if (!isset($input['carId']) || !isset($input['imageUrl'])) {
    echo json_encode(['success' => false, 'message' => 'Неверные данные запроса']);
    exit;
}

try {
    // Подготавливаем запрос для добавления изображения к автомобилю
    $stmt = $pdo->prepare('
        INSERT INTO car_images (id, carId, url, alt) 
        VALUES (:id, :carId, :url, :alt)
    ');
    
    // Выполняем запрос
    $success = $stmt->execute([
        'id' => generateUUID(),
        'carId' => $input['carId'],
        'url' => $input['imageUrl'],
        'alt' => $input['alt'] ?? "Изображение автомобиля"
    ]);
    
    if ($success) {
        echo json_encode(['success' => true, 'message' => 'Изображение успешно привязано к автомобилю']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Не удалось привязать изображение к автомобилю']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Ошибка базы данных: ' . $e->getMessage()]);
}
?>
