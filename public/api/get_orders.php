
<?php
require_once 'config.php';

// Явно указываем заголовок Content-Type для JSON
header('Content-Type: application/json');

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

try {
    // Подготавливаем запрос с использованием fetchAll для избежания ошибок с активными запросами
    $stmt = $pdo->prepare('SELECT * FROM orders ORDER BY createdAt DESC');
    $stmt->execute(); // Сначала выполняем запрос
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC); // Затем забираем все результаты сразу

    // Форматируем даты и обрабатываем данные
    foreach ($orders as &$order) {
        // Преобразование даты в ISO формат для совместимости с фронтендом
        if (isset($order['createdAt'])) {
            $date = new DateTime($order['createdAt']);
            $order['createdAt'] = $date->format('c');
        }
        
        // Преобразуем булевы поля и числовые значения
        if (isset($order['processed'])) {
            $order['processed'] = (bool)$order['processed'];
        }
        
        // Если есть поле carId, убедимся что оно строка
        if (isset($order['carId'])) {
            $order['carId'] = (string)$order['carId'];
        }
        
        // Добавляем статус, если его нет
        if (!isset($order['status'])) {
            $order['status'] = 'new';
        }
        
        // Добавляем поля syncStatus и jsonFilePath если их нет
        if (!isset($order['syncStatus'])) {
            $order['syncStatus'] = 'synced';
        }
        
        if (!isset($order['jsonFilePath'])) {
            $order['jsonFilePath'] = null;
        }
    }

    echo json_encode(['success' => true, 'data' => $orders]);
    exit;
} catch (PDOException $e) {
    error_log("Database error in get_orders.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Ошибка базы данных: ' . $e->getMessage()]);
    exit;
}
?>
