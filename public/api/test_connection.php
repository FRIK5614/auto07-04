
<?php
require_once 'config.php';

// Явно указываем заголовок Content-Type для JSON
header('Content-Type: application/json');

try {
    // Проверяем подключение
    $stmt = $pdo->query('SELECT 1');
    
    // Пробуем выполнить тестовую запись и чтение из базы данных
    $testTable = "test_connection";
    
    // Создаем временную тестовую таблицу, если она не существует
    $pdo->exec("CREATE TABLE IF NOT EXISTS $testTable (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_value VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Добавляем тестовую запись
    $testValue = "Test " . date('Y-m-d H:i:s');
    $insertStmt = $pdo->prepare("INSERT INTO $testTable (test_value) VALUES (?)");
    $insertSuccess = $insertStmt->execute([$testValue]);
    
    // Получаем последнюю добавленную запись
    $lastId = $pdo->lastInsertId();
    $selectStmt = $pdo->prepare("SELECT * FROM $testTable WHERE id = ?");
    $selectStmt->execute([$lastId]);
    $result = $selectStmt->fetch();
    
    // Удаляем тестовую запись
    $pdo->exec("DELETE FROM $testTable WHERE id = $lastId");
    
    echo json_encode([
        'success' => true, 
        'message' => 'Успешное подключение и тест записи в базу данных',
        'server_info' => [
            'version' => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION),
            'driver' => $pdo->getAttribute(PDO::ATTR_DRIVER_NAME)
        ],
        'test_result' => [
            'insert' => $insertSuccess ? 'Успешно' : 'Ошибка',
            'read_data' => $result ? $result : 'Нет данных'
        ]
    ]);
    exit;
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка подключения к базе данных: ' . $e->getMessage()
    ]);
    exit;
}
?>
