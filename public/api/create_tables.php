
<?php
require_once 'config.php';

try {
    // Создаем таблицу заказов
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        carId VARCHAR(50) NOT NULL,
        customerName VARCHAR(100) NOT NULL,
        customerPhone VARCHAR(50) NOT NULL,
        customerEmail VARCHAR(100),
        status VARCHAR(20) NOT NULL,
        createdAt DATETIME NOT NULL,
        message TEXT
    )");
    
    echo json_encode([
        'success' => true, 
        'message' => 'Таблицы успешно созданы или уже существуют'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка создания таблиц: ' . $e->getMessage()
    ]);
}
?>
