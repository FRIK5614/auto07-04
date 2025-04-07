
<?php
require_once 'config.php';

try {
    // Проверяем подключение
    $stmt = $pdo->query('SELECT 1');
    
    echo json_encode([
        'success' => true, 
        'message' => 'Успешное подключение к базе данных',
        'server_info' => [
            'version' => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION),
            'driver' => $pdo->getAttribute(PDO::ATTR_DRIVER_NAME)
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка подключения к базе данных: ' . $e->getMessage()
    ]);
}
?>
