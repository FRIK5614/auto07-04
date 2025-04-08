
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
    // Проверяем соединение выполнив простой запрос
    $stmt = $pdo->query("SELECT 1");
    
    // Получаем информацию о сервере MySQL
    $serverInfo = $pdo->getAttribute(PDO::ATTR_SERVER_VERSION);
    $connectionInfo = $pdo->getAttribute(PDO::ATTR_CONNECTION_STATUS);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Прямое подключение к MySQL установлено успешно',
        'server_info' => $serverInfo,
        'connection_info' => $connectionInfo,
        'php_version' => phpversion(),
        'server_name' => $_SERVER['SERVER_NAME'] ?? 'unknown',
        'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ], JSON_UNESCAPED_UNICODE);
    exit;
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка при установке прямого подключения к MySQL: ' . $e->getMessage(),
        'error_code' => $e->getCode(),
        'php_version' => phpversion(),
        'server_name' => $_SERVER['SERVER_NAME'] ?? 'unknown',
        'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>
