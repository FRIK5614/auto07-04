
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
if (
    !isset($input['id']) || 
    !isset($input['customerName']) || 
    !isset($input['customerPhone']) || 
    !isset($input['carId']) || 
    !isset($input['status'])
) {
    echo json_encode(['success' => false, 'message' => 'Неверные данные запроса']);
    exit;
}

try {
    // Подготавливаем запрос
    $stmt = $pdo->prepare('
        INSERT INTO orders (
            id, 
            carId, 
            customerName, 
            customerPhone, 
            customerEmail, 
            status, 
            createdAt, 
            message
        ) VALUES (
            :id,
            :carId,
            :customerName,
            :customerPhone,
            :customerEmail,
            :status,
            :createdAt,
            :message
        )
    ');

    // Выполняем запрос с данными
    $success = $stmt->execute([
        'id' => $input['id'],
        'carId' => $input['carId'],
        'customerName' => sanitizeInput($input['customerName']),
        'customerPhone' => sanitizeInput($input['customerPhone']),
        'customerEmail' => isset($input['customerEmail']) ? sanitizeInput($input['customerEmail']) : null,
        'status' => $input['status'],
        'createdAt' => isset($input['createdAt']) ? $input['createdAt'] : date('Y-m-d H:i:s'),
        'message' => isset($input['message']) ? sanitizeInput($input['message']) : null
    ]);

    if ($success) {
        echo json_encode([
            'success' => true, 
            'message' => 'Заказ успешно создан', 
            'orderId' => $input['id']
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ошибка при создании заказа']);
    }
    exit;
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Ошибка базы данных: ' . $e->getMessage()]);
    exit;
}
?>
