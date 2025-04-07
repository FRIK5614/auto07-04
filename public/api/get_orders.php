
<?php
require_once 'config.php';

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

try {
    // Подготавливаем запрос
    $stmt = $pdo->query('SELECT * FROM orders ORDER BY createdAt DESC');
    $orders = $stmt->fetchAll();

    // Форматируем даты и обрабатываем данные
    foreach ($orders as &$order) {
        // Преобразование даты в ISO формат для совместимости с фронтендом
        if (isset($order['createdAt'])) {
            $date = new DateTime($order['createdAt']);
            $order['createdAt'] = $date->format('c');
        }
        
        // Добавляем syncStatus для совместимости с фронтендом
        $order['syncStatus'] = 'synced';
    }

    echo json_encode(['success' => true, 'data' => $orders]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Ошибка базы данных: ' . $e->getMessage()]);
}
?>
