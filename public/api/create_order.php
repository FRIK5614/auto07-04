
<?php
require_once 'config.php';
require_once 'telegram/send_notification.php'; // Include the notification script

// Явно указываем заголовок Content-Type для JSON
header('Content-Type: application/json');

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

try {
    // Получаем данные из тела запроса
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);
    
    // Проверка наличия обязательных полей
    if (!isset($input['name']) || !isset($input['phone'])) {
        echo json_encode(['success' => false, 'message' => 'Недостаточно данных для создания заказа']);
        exit;
    }
    
    // Генерируем UUID для заказа
    $orderId = generateUUID();
    
    // Подготавливаем запрос для создания заказа
    $stmt = $pdo->prepare('INSERT INTO orders (id, name, email, phone, message, carId, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())');
    
    // Выполняем запрос с данными
    $stmt->execute([
        $orderId,
        sanitizeInput($input['name']),
        isset($input['email']) ? sanitizeInput($input['email']) : null,
        sanitizeInput($input['phone']),
        isset($input['message']) ? sanitizeInput($input['message']) : null,
        isset($input['carId']) ? sanitizeInput($input['carId']) : null,
        'new'
    ]);
    
    // Проверяем, удалось ли добавить запись
    if ($stmt->rowCount() > 0) {
        // Send notification to Telegram admins
        $notificationResult = notifyAdminsAboutNewOrder($orderId);
        
        echo json_encode([
            'success' => true, 
            'id' => $orderId, 
            'message' => 'Заказ успешно создан',
            'notification' => $notificationResult['success']
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Не удалось создать заказ']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Ошибка базы данных: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Произошла ошибка: ' . $e->getMessage()]);
}
?>
