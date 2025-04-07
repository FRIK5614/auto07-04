
<?php
require_once '../config.php';

// Явно указываем заголовок Content-Type для JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обработка предварительных запросов OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $carId = isset($_GET['carId']) ? $_GET['carId'] : null;
    
    if (!$carId) {
        echo json_encode(['success' => false, 'message' => 'ID автомобиля не указан']);
        exit;
    }
    
    $stmt = $pdo->prepare('SELECT * FROM car_images WHERE carId = ? ORDER BY isMain DESC, uploadDate DESC');
    $stmt->execute([$carId]);
    $images = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true, 
        'data' => $images
    ], JSON_UNESCAPED_UNICODE);
    exit;
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка получения изображений: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>
