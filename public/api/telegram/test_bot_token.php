
<?php
require_once '../config.php';

// Set headers for JSON response
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Метод не поддерживается'
    ]);
    exit;
}

// Get request body
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Validate input
if (!isset($input['token']) || empty($input['token'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Токен не указан'
    ]);
    exit;
}

$botToken = $input['token'];

try {
    // Test the bot token by getting bot info
    $url = "https://api.telegram.org/bot{$botToken}/getMe";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        echo json_encode([
            'success' => false,
            'message' => 'Ошибка соединения: ' . curl_error($ch)
        ]);
        exit;
    }
    
    curl_close($ch);
    
    // Parse response
    $data = json_decode($response, true);
    
    if ($httpCode !== 200 || !isset($data['ok']) || $data['ok'] !== true) {
        echo json_encode([
            'success' => false,
            'message' => $data['description'] ?? 'Недействительный токен бота'
        ]);
        exit;
    }
    
    // Token is valid, get bot info
    $botUsername = $data['result']['username'] ?? 'Unknown';
    $botFirstName = $data['result']['first_name'] ?? 'Bot';
    
    echo json_encode([
        'success' => true,
        'message' => "Подключение успешно! Бот @{$botUsername} ({$botFirstName}) готов к использованию.",
        'bot_info' => $data['result']
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Произошла ошибка: ' . $e->getMessage()
    ]);
}
?>
