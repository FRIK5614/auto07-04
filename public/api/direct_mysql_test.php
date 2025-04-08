
<?php
// Force UTF-8 encoding and CORS headers
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
    // Database connection settings
    $host = 'localhost';
    $db_name = 'amwomenr_autocatalog';
    $username = 'amwomenr_autocatalog';
    $password = 'Aa023126151';
    
    // Выводим диагностическую информацию
    $connection_info = [
        'script_path' => __FILE__,
        'server_name' => $_SERVER['SERVER_NAME'] ?? 'unknown',
        'request_time' => date('Y-m-d H:i:s'),
        'php_version' => phpversion(),
        'host' => $host,
        'database' => $db_name,
        'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ];
    
    // Direct connection to MySQL without using PDO
    $conn = mysqli_connect($host, $username, $password, $db_name);
    
    if (!$conn) {
        throw new Exception("Connection error: " . mysqli_connect_error());
    }
    
    // Set character set to UTF-8
    mysqli_set_charset($conn, 'utf8mb4');
    
    // Execute a simple query for testing
    $result = mysqli_query($conn, "SELECT 'Connection test successful' AS test_value");
    
    if (!$result) {
        throw new Exception("Query error: " . mysqli_error($conn));
    }
    
    $row = mysqli_fetch_assoc($result);
    $test_value = $row['test_value'];
    
    // Get server information
    $server_version = mysqli_get_server_info($conn);
    
    // Show tables
    $tables = [];
    $tables_result = mysqli_query($conn, "SHOW TABLES");
    if ($tables_result) {
        while ($table_row = mysqli_fetch_array($tables_result)) {
            $tables[] = $table_row[0];
        }
    }
    
    // Close connection
    mysqli_close($conn);
    
    echo json_encode([
        'success' => true,
        'message' => 'Direct MySQL connection successful',
        'test_value' => $test_value,
        'connection_info' => $connection_info,
        'server_version' => $server_version,
        'tables' => $tables
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Direct connection error: ' . $e->getMessage(),
        'error_details' => [
            'error_code' => mysqli_connect_errno(),
            'connection_info' => $connection_info ?? [
                'php_version' => phpversion(),
                'host' => $host ?? 'not set',
                'database' => $db_name ?? 'not set',
                'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
            ]
        ]
    ], JSON_UNESCAPED_UNICODE);
}
?>
