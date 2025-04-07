
<?php
require_once 'config.php';

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
    
    // Создаем таблицу заказов, если она не существует
    if (!$ordersTableExists) {
        $pdo->exec("CREATE TABLE orders (
            id VARCHAR(50) PRIMARY KEY,
            carId VARCHAR(50) NOT NULL,
            customerName VARCHAR(100) NOT NULL,
            customerPhone VARCHAR(50) NOT NULL,
            customerEmail VARCHAR(100),
            status VARCHAR(20) NOT NULL,
            createdAt DATETIME NOT NULL,
            message TEXT
        )");
        $ordersTableExists = true;
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
        'orders_columns' => $orderColumns
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка проверки таблиц: ' . $e->getMessage()
    ]);
}
?>
