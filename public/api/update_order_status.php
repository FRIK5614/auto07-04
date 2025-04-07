
<?php
require_once 'config.php';

// Явно указываем заголовок Content-Type для JSON
header('Content-Type: application/json');

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

// Получаем данные из тела запроса
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Проверяем данные
if (!isset($input['id']) || !isset($input['status'])) {
    echo json_encode(['success' => false, 'message' => 'Неверные данные запроса']);
    exit;
}

// Проверяем допустимость статуса
$allowedStatuses = ['new', 'processing', 'completed', 'canceled'];
if (!in_array($input['status'], $allowedStatuses)) {
    echo json_encode(['success' => false, 'message' => 'Недопустимый статус']);
    exit;
}

try {
    // Подготавливаем запрос
    $stmt = $pdo->prepare('UPDATE orders SET status = :status WHERE id = :id');
    
    // Выполняем запрос с данными
    $success = $stmt->execute([
        'id' => $input['id'],
        'status' => $input['status']
    ]);

    if ($success && $stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Статус заказа обновлен']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Заказ не найден или статус не изменился']);
    }
    exit;
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Ошибка базы данных: ' . $e->getMessage()]);
    exit;
}
?>
