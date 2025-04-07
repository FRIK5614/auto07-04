
<?php
require_once 'config.php';

// Явно указываем заголовок Content-Type для JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обработка предварительных запросов OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Получаем список таблиц в базе данных
    $tables = [];
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }
    
    // Проверяем наличие таблицы заказов
    $ordersTableExists = in_array('orders', $tables);
    
    // Проверяем структуру таблицы заказов, если она существует
    $orderColumns = [];
    if ($ordersTableExists) {
        $stmt = $pdo->query("DESCRIBE orders");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $orderColumns[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true, 
        'message' => 'Проверка таблиц завершена',
        'tables' => $tables,
        'orders_table_exists' => $ordersTableExists,
        'orders_columns' => $orderColumns,
        'php_version' => phpversion(),
        'server_name' => $_SERVER['SERVER_NAME'] ?? 'unknown',
        'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ], JSON_UNESCAPED_UNICODE);
    exit;
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка проверки таблиц: ' . $e->getMessage(),
        'php_version' => phpversion(),
        'server_name' => $_SERVER['SERVER_NAME'] ?? 'unknown'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>
