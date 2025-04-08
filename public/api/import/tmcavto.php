
<?php
require_once '../config.php';

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

// Получаем данные из тела запроса
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Проверяем данные
if (!isset($input['cars']) || !is_array($input['cars']) || empty($input['cars'])) {
    echo json_encode(['success' => false, 'message' => 'Неверные данные запроса']);
    exit;
}

try {
    // Начинаем транзакцию
    $pdo->beginTransaction();
    
    $imported = 0;
    $errors = [];
    
    foreach ($input['cars'] as $car) {
        // Проверяем обязательные поля
        if (!isset($car['id']) || !isset($car['brand']) || !isset($car['model'])) {
            $errors[] = 'Отсутствуют обязательные поля у автомобиля';
            continue;
        }
        
        try {
            // Проверяем, существует ли автомобиль с таким внешним ID в таблице импорта
            $checkStmt = $pdo->prepare('SELECT carId FROM imported_cars WHERE externalId = :externalId AND source = :source');
            $checkStmt->execute([
                'externalId' => $car['id'],
                'source' => 'tmcavto'
            ]);
            $existingCarId = $checkStmt->fetchColumn();
            
            // Если автомобиль уже был импортирован, обновляем его
            if ($existingCarId) {
                // Обновляем данные импорта
                $updateImportStmt = $pdo->prepare('
                    UPDATE imported_cars 
                    SET importedData = :importedData
                    WHERE externalId = :externalId AND source = :source
                ');
                $updateImportStmt->execute([
                    'importedData' => json_encode($car),
                    'externalId' => $car['id'],
                    'source' => 'tmcavto'
                ]);
                
                // Здесь можно также обновить данные автомобиля в таблице cars
                
                $imported++;
            } else {
                // Создаем новый ID для автомобиля
                $newCarId = generateUUID();
                
                // Вставляем новый автомобиль
                $insertCarStmt = $pdo->prepare('
                    INSERT INTO cars (
                        id, brand, model, year, country, priceBase,
                        engineType, engineDisplacement, enginePower, engineTorque, fuelType,
                        transmissionType, transmissionGears, drivetrain,
                        dimensionsLength, dimensionsWidth, dimensionsHeight,
                        bodyType, isNew, viewCount
                    ) VALUES (
                        :id, :brand, :model, :year, :country, :priceBase,
                        :engineType, :engineDisplacement, :enginePower, :engineTorque, :fuelType,
                        :transmissionType, :transmissionGears, :drivetrain,
                        :dimensionsLength, :dimensionsWidth, :dimensionsHeight,
                        :bodyType, :isNew, :viewCount
                    )
                ');
                
                $insertCarStmt->execute([
                    'id' => $newCarId,
                    'brand' => $car['brand'],
                    'model' => $car['model'],
                    'year' => $car['year'] ?? 2023,
                    'country' => $car['country'] ?? null,
                    'priceBase' => $car['price'] ?? 0,
                    'engineType' => $car['engineType'] ?? 'unknown',
                    'engineDisplacement' => $car['engineDisplacement'] ?? 2.0,
                    'enginePower' => $car['enginePower'] ?? 150,
                    'engineTorque' => $car['engineTorque'] ?? 200,
                    'fuelType' => $car['fuelType'] ?? 'petrol',
                    'transmissionType' => $car['transmissionType'] ?? 'automatic',
                    'transmissionGears' => $car['transmissionGears'] ?? 6,
                    'drivetrain' => $car['drivetrain'] ?? 'front',
                    'dimensionsLength' => $car['dimensionsLength'] ?? 4500,
                    'dimensionsWidth' => $car['dimensionsWidth'] ?? 1800,
                    'dimensionsHeight' => $car['dimensionsHeight'] ?? 1500,
                    'bodyType' => $car['bodyType'] ?? 'sedan',
                    'isNew' => $car['isNew'] ?? true,
                    'viewCount' => 0
                ]);
                
                // Если у автомобиля есть изображение, добавляем его
                if (isset($car['imageUrl']) && $car['imageUrl']) {
                    $insertImageStmt = $pdo->prepare('
                        INSERT INTO car_images (id, carId, url, alt)
                        VALUES (:id, :carId, :url, :alt)
                    ');
                    $insertImageStmt->execute([
                        'id' => generateUUID(),
                        'carId' => $newCarId,
                        'url' => $car['imageUrl'],
                        'alt' => "{$car['brand']} {$car['model']}"
                    ]);
                }
                
                // Добавляем запись в таблицу импорта
                $insertImportStmt = $pdo->prepare('
                    INSERT INTO imported_cars (externalId, source, carId, importedData)
                    VALUES (:externalId, :source, :carId, :importedData)
                ');
                $insertImportStmt->execute([
                    'externalId' => $car['id'],
                    'source' => 'tmcavto',
                    'carId' => $newCarId,
                    'importedData' => json_encode($car)
                ]);
                
                $imported++;
            }
        } catch (Exception $e) {
            $errors[] = 'Ошибка при импорте автомобиля ' . ($car['brand'] ?? '') . ' ' . ($car['model'] ?? '') . ': ' . $e->getMessage();
        }
    }
    
    // Если все прошло успешно, фиксируем транзакцию
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => "Импортировано $imported автомобилей",
        'data' => [
            'imported' => $imported,
            'errors' => $errors
        ]
    ]);
} catch (PDOException $e) {
    // В случае ошибки отменяем транзакцию
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Ошибка при импорте данных: ' . $e->getMessage()]);
}
?>
