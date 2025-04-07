
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
if (!isset($input['id'])) {
    echo json_encode(['success' => false, 'message' => 'Неверные данные запроса']);
    exit;
}

try {
    // Начинаем транзакцию
    $pdo->beginTransaction();
    
    // Удаляем характеристики автомобиля
    $deleteFeatureStmt = $pdo->prepare('DELETE FROM car_features WHERE carId = :carId');
    $deleteFeatureStmt->execute(['carId' => $input['id']]);
    
    // Удаляем изображения автомобиля
    $deleteImageStmt = $pdo->prepare('DELETE FROM car_images WHERE carId = :carId');
    $deleteImageStmt->execute(['carId' => $input['id']]);
    
    // Удаляем автомобиль
    $deleteCarStmt = $pdo->prepare('DELETE FROM cars WHERE id = :id');
    $success = $deleteCarStmt->execute(['id' => $input['id']]);
    
    if (!$success) {
        throw new PDOException("Не удалось удалить автомобиль");
    }
    
    // Если все прошло успешно, фиксируем транзакцию
    $pdo->commit();
    
    echo json_encode(['success' => true, 'message' => 'Автомобиль успешно удален', 'carId' => $input['id']]);
} catch (PDOException $e) {
    // В случае ошибки отменяем транзакцию
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Ошибка при удалении автомобиля: ' . $e->getMessage()]);
}
?>
