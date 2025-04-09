
<?php
require_once 'config.php';

// SQL-запрос для проверки существующих автомобилей
try {
    header('Content-Type: application/json');
    
    $sqlCheck = "SELECT COUNT(*) as count FROM cars";
    $stmtCheck = $pdo->query($sqlCheck);
    $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'В базе данных уже есть автомобили (' . $result['count'] . ' шт.)',
            'existingCars' => $result['count']
        ]);
        exit;
    }
    
    // Начинаем транзакцию для безопасного добавления данных
    $pdo->beginTransaction();
    
    // SQL-запросы для добавления 6 автомобилей
    $sqlInserts = [
        // Автомобиль 1
        "INSERT INTO cars (id, brand, model, year, bodyType, priceBase, engineType, engineDisplacement, enginePower, engineTorque, fuelType, transmissionType, transmissionGears, drivetrain, status) 
         VALUES (UUID(), 'Toyota', 'Camry', 2023, 'Седан', 2850000, 'Бензиновый', 2.5, 200, 250, 'АИ-95', 'Автомат', 8, 'Передний', 'published')",
         
        // Автомобиль 2
        "INSERT INTO cars (id, brand, model, year, bodyType, priceBase, engineType, engineDisplacement, enginePower, engineTorque, fuelType, transmissionType, transmissionGears, drivetrain, status) 
         VALUES (UUID(), 'Kia', 'Rio', 2023, 'Седан', 1750000, 'Бензиновый', 1.6, 123, 150, 'АИ-92', 'Автомат', 6, 'Передний', 'published')",
         
        // Автомобиль 3
        "INSERT INTO cars (id, brand, model, year, bodyType, priceBase, engineType, engineDisplacement, enginePower, engineTorque, fuelType, transmissionType, transmissionGears, drivetrain, status) 
         VALUES (UUID(), 'Volkswagen', 'Tiguan', 2023, 'Кроссовер', 3200000, 'Бензиновый', 2.0, 180, 320, 'АИ-95', 'Автомат', 7, 'Полный', 'published')",
         
        // Автомобиль 4
        "INSERT INTO cars (id, brand, model, year, bodyType, priceBase, engineType, engineDisplacement, enginePower, engineTorque, fuelType, transmissionType, transmissionGears, drivetrain, status) 
         VALUES (UUID(), 'Hyundai', 'Tucson', 2023, 'Кроссовер', 2900000, 'Бензиновый', 2.0, 150, 192, 'АИ-92', 'Автомат', 6, 'Полный', 'published')",
         
        // Автомобиль 5
        "INSERT INTO cars (id, brand, model, year, bodyType, priceBase, engineType, engineDisplacement, enginePower, engineTorque, fuelType, transmissionType, transmissionGears, drivetrain, status) 
         VALUES (UUID(), 'Skoda', 'Octavia', 2023, 'Лифтбек', 2100000, 'Бензиновый', 1.4, 150, 250, 'АИ-95', 'Робот', 7, 'Передний', 'published')",
         
        // Автомобиль 6
        "INSERT INTO cars (id, brand, model, year, bodyType, priceBase, engineType, engineDisplacement, enginePower, engineTorque, fuelType, transmissionType, transmissionGears, drivetrain, status) 
         VALUES (UUID(), 'BMW', 'X5', 2023, 'Кроссовер', 7500000, 'Бензиновый', 3.0, 340, 450, 'АИ-98', 'Автомат', 8, 'Полный', 'published')"
    ];
    
    $insertCount = 0;
    
    // Выполняем запросы на вставку
    foreach ($sqlInserts as $sql) {
        $stmt = $pdo->exec($sql);
        $insertCount++;
    }
    
    // Добавляем изображения для автомобилей (одно главное изображение для каждого)
    $getIdsQuery = "SELECT id, brand, model FROM cars ORDER BY brand, model";
    $carsStmt = $pdo->query($getIdsQuery);
    $cars = $carsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($cars as $index => $car) {
        $imageNumber = $index + 1;
        $imagePath = "https://placehold.co/600x400/webp?text=" . urlencode($car['brand'] . " " . $car['model']);
        
        $imageId = generateUUID();
        $imageSQL = "INSERT INTO car_images (id, carId, url, alt, isMain) VALUES (?, ?, ?, ?, 1)";
        $imageStmt = $pdo->prepare($imageSQL);
        $imageStmt->execute([$imageId, $car['id'], $imagePath, $car['brand'] . ' ' . $car['model']]);
    }
    
    // Если всё прошло успешно, фиксируем транзакцию
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Добавлено автомобилей: ' . $insertCount,
        'insertedCars' => $insertCount
    ]);
} catch (PDOException $e) {
    // В случае ошибки отменяем транзакцию
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка при добавлении автомобилей: ' . $e->getMessage(),
        'error' => $e->getMessage()
    ]);
}

// Функция для генерации UUID, если её нет в config.php
if (!function_exists('generateUUID')) {
    function generateUUID() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
?>
