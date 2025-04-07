
<?php
// Force UTF-8 encoding
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Database connection settings
    $host = 'localhost';
    $db_name = 'amwomenr_autocatalog';
    $username = 'amwomenr_autocatalog';
    $password = 'Aa023126151';
    
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
    
    // Close connection
    mysqli_close($conn);
    
    echo json_encode([
        'success' => true,
        'message' => 'Direct MySQL connection successful',
        'test_value' => $test_value,
        'connection_info' => [
            'host' => $host,
            'database' => $db_name,
            'driver' => 'mysqli',
            'server_version' => $server_version
        ]
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Direct connection error: ' . $e->getMessage(),
        'error_details' => [
            'error_code' => mysqli_connect_errno(),
            'php_version' => phpversion()
        ]
    ], JSON_UNESCAPED_UNICODE);
}
?>
