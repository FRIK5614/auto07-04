
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
if (!isset($input['carId'])) {
    echo json_encode(['success' => false, 'message' => 'Неверные данные запроса']);
    exit;
}

$carId = $input['carId'];
$userId = $input['userId'] ?? 'anonymous';

try {
    // Начинаем транзакцию
    $pdo->beginTransaction();
    
    // Увеличиваем счетчик просмотров автомобиля
    $updateStmt = $pdo->prepare('UPDATE cars SET viewCount = viewCount + 1 WHERE id = :id');
    $updateStmt->execute(['id' => $carId]);
    
    // Записываем информацию о просмотре
    $viewStmt = $pdo->prepare('INSERT INTO car_views (carId, userId) VALUES (:carId, :userId)');
    $viewStmt->execute(['carId' => $carId, 'userId' => $userId]);
    
    // Получаем обновленное количество просмотров
    $countStmt = $pdo->prepare('SELECT viewCount FROM cars WHERE id = :id');
    $countStmt->execute(['id' => $carId]);
    $viewCount = $countStmt->fetchColumn();
    
    // Если все прошло успешно, фиксируем транзакцию
    $pdo->commit();
    
    echo json_encode(['success' => true, 'data' => ['viewCount' => $viewCount]]);
} catch (PDOException $e) {
    // В случае ошибки отменяем транзакцию
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Ошибка при регистрации просмотра: ' . $e->getMessage()]);
}
?>
