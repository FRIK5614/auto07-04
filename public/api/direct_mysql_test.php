
<?php
header('Content-Type: application/json');

try {
    // Настройки подключения к базе данных
    $host = 'localhost';
    $db_name = 'amwomenr_autocatalog';
    $username = 'amwomenr_autocatalog';
    $password = 'Aa023126151';
    
    // Прямое подключение к MySQL без использования PDO
    $conn = mysqli_connect($host, $username, $password, $db_name);
    
    if (!$conn) {
        throw new Exception("Ошибка подключения: " . mysqli_connect_error());
    }
    
    // Выполняем простой запрос для тестирования
    $result = mysqli_query($conn, "SELECT 'Тест соединения' AS test_value");
    $row = mysqli_fetch_assoc($result);
    $test_value = $row['test_value'];
    
    // Закрываем соединение
    mysqli_close($conn);
    
    echo json_encode([
        'success' => true,
        'message' => 'Прямое подключение к MySQL успешно',
        'test_value' => $test_value,
        'connection_info' => [
            'host' => $host,
            'database' => $db_name,
            'driver' => 'mysqli'
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка прямого подключения: ' . $e->getMessage()
    ]);
}
?>
