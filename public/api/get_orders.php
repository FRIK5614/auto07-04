
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
    // Настраиваем PDO для использования буферизованных запросов
    $pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
    
    // Проверяем существование таблицы orders
    $checkTable = $pdo->query("SHOW TABLES LIKE 'orders'");
    if ($checkTable->rowCount() === 0) {
        // Если таблица не существует, создаем ее
        $createTableSQL = "
        CREATE TABLE orders (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            email VARCHAR(255),
            message TEXT,
            carId VARCHAR(36),
            status ENUM('new', 'processing', 'completed', 'canceled') DEFAULT 'new',
            processed TINYINT(1) DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            syncStatus VARCHAR(20) DEFAULT 'synced',
            jsonFilePath VARCHAR(255) DEFAULT NULL,
            INDEX (carId),
            INDEX (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ";
        $pdo->exec($createTableSQL);
        echo json_encode(['success' => true, 'data' => [], 'message' => 'Таблица заказов создана']);
        exit;
    }
    
    // Подготавливаем и выполняем запрос
    $stmt = $pdo->prepare('SELECT * FROM orders ORDER BY createdAt DESC');
    $stmt->execute();
    
    // Забираем все результаты сразу (избегаем ошибки с активными запросами)
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
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
    error_log("Database error in get_orders.php: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка базы данных: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    exit;
}
?>
