
<?php
// Настройки подключения к базе данных
$host = 'localhost';
$db_name = 'amwomenr_autocatalog';
$username = 'amwomenr_autocatalog';
$password = 'Aa023126151';
$charset = 'utf8mb4';

// Настройка CORS для API
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обработка предварительных запросов OPTIONS 
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Создание PDO соединения
try {
    $dsn = "mysql:host=$host;dbname=$db_name;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    // Явно указываем заголовок для JSON ответа при ошибке
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка подключения к базе данных: ' . $e->getMessage(),
        'error_code' => $e->getCode(),
        'connection_info' => [
            'host' => $host,
            'database' => $db_name,
            'php_version' => phpversion(),
            'server_name' => $_SERVER['SERVER_NAME'] ?? 'unknown',
            'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Функция для генерации UUID (для совместимости с клиентским кодом)
function generateUUID() {
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

// Функция для очистки входных данных
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}
?>
