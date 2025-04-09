
<?php
require_once 'config.php';

// Устанавливаем заголовок для JSON-ответа
header('Content-Type: application/json');

// Обрабатываем только GET запросы
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

try {
    // Настраиваем PDO для использования буферизованных запросов
    $pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
    
    // Запрос для получения количества автомобилей
    $countStmt = $pdo->query('SELECT COUNT(*) as count FROM cars');
    $countResult = $countStmt->fetch(PDO::FETCH_ASSOC);
    $totalCars = $countResult['count'];
    
    // Запрос для получения списка автомобилей с основной информацией
    $stmt = $pdo->query('
        SELECT 
            id, 
            brand, 
            model, 
            year,
            bodyType,
            priceBase,
            engineType,
            engineDisplacement,
            status,
            transmissionType
        FROM cars 
        ORDER BY brand, model
    ');
    
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Получаем основные изображения для автомобилей
    $carImages = [];
    if (!empty($cars)) {
        $carIds = array_column($cars, 'id');
        $placeholders = implode(',', array_fill(0, count($carIds), '?'));
        
        $imageStmt = $pdo->prepare("
            SELECT carId, url 
            FROM car_images 
            WHERE carId IN ($placeholders) AND isMain = 1
        ");
        
        foreach ($carIds as $index => $id) {
            $imageStmt->bindValue($index + 1, $id);
        }
        
        $imageStmt->execute();
        while ($image = $imageStmt->fetch(PDO::FETCH_ASSOC)) {
            $carImages[$image['carId']] = $image['url'];
        }
    }
    
    // Форматируем данные для удобства чтения
    $formattedCars = [];
    foreach ($cars as $car) {
        $formattedCars[] = [
            'id' => $car['id'],
            'brand' => $car['brand'],
            'model' => $car['model'],
            'year' => $car['year'],
            'bodyType' => $car['bodyType'],
            'price' => number_format($car['priceBase'], 0, '.', ' ') . ' ₽',
            'engine' => $car['engineType'] . ' ' . $car['engineDisplacement'] . 'л',
            'transmission' => $car['transmissionType'],
            'status' => $car['status'],
            'imageUrl' => $carImages[$car['id']] ?? null
        ];
    }
    
    // Формируем ответ
    $response = [
        'success' => true,
        'totalCars' => $totalCars,
        'message' => "Найдено автомобилей в базе данных: $totalCars",
        'cars' => $formattedCars
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    error_log("Error in check_cars.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка при проверке автомобилей: ' . $e->getMessage()
    ]);
}
?>
