
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
if (!isset($input['id']) || !isset($input['brand']) || !isset($input['model']) || !isset($input['year'])) {
    echo json_encode(['success' => false, 'message' => 'Неверные данные запроса']);
    exit;
}

try {
    // Начинаем транзакцию
    $pdo->beginTransaction();
    
    // Подготавливаем запрос для добавления автомобиля
    $stmt = $pdo->prepare('
        INSERT INTO cars (
            id, brand, model, year, bodyType, colors, 
            priceBase, priceDiscount, priceSpecial,
            engineType, engineDisplacement, enginePower, engineTorque, fuelType,
            transmissionType, transmissionGears, drivetrain,
            dimensionsLength, dimensionsWidth, dimensionsHeight, dimensionsWheelbase, dimensionsWeight, dimensionsTrunkVolume,
            performanceAcceleration, performanceTopSpeed, 
            performanceFuelConsumptionCity, performanceFuelConsumptionHighway, performanceFuelConsumptionCombined,
            description, isNew, isPopular, country, viewCount
        ) VALUES (
            :id, :brand, :model, :year, :bodyType, :colors, 
            :priceBase, :priceDiscount, :priceSpecial,
            :engineType, :engineDisplacement, :enginePower, :engineTorque, :fuelType,
            :transmissionType, :transmissionGears, :drivetrain,
            :dimensionsLength, :dimensionsWidth, :dimensionsHeight, :dimensionsWheelbase, :dimensionsWeight, :dimensionsTrunkVolume,
            :performanceAcceleration, :performanceTopSpeed, 
            :performanceFuelConsumptionCity, :performanceFuelConsumptionHighway, :performanceFuelConsumptionCombined,
            :description, :isNew, :isPopular, :country, :viewCount
        )
    ');
    
    // Подготавливаем данные для запроса
    $carData = [
        'id' => $input['id'],
        'brand' => $input['brand'],
        'model' => $input['model'],
        'year' => $input['year'],
        'bodyType' => $input['bodyType'] ?? '',
        'colors' => isset($input['colors']) ? json_encode($input['colors']) : null,
        'priceBase' => isset($input['price']['base']) ? $input['price']['base'] : 0,
        'priceDiscount' => isset($input['price']['discount']) ? $input['price']['discount'] : null,
        'priceSpecial' => isset($input['price']['special']) ? $input['price']['special'] : null,
        'engineType' => isset($input['engine']['type']) ? $input['engine']['type'] : '',
        'engineDisplacement' => isset($input['engine']['displacement']) ? $input['engine']['displacement'] : 0,
        'enginePower' => isset($input['engine']['power']) ? $input['engine']['power'] : 0,
        'engineTorque' => isset($input['engine']['torque']) ? $input['engine']['torque'] : 0,
        'fuelType' => isset($input['engine']['fuelType']) ? $input['engine']['fuelType'] : '',
        'transmissionType' => isset($input['transmission']['type']) ? $input['transmission']['type'] : '',
        'transmissionGears' => isset($input['transmission']['gears']) ? $input['transmission']['gears'] : 0,
        'drivetrain' => $input['drivetrain'] ?? '',
        'dimensionsLength' => isset($input['dimensions']['length']) ? $input['dimensions']['length'] : 0,
        'dimensionsWidth' => isset($input['dimensions']['width']) ? $input['dimensions']['width'] : 0,
        'dimensionsHeight' => isset($input['dimensions']['height']) ? $input['dimensions']['height'] : 0,
        'dimensionsWheelbase' => isset($input['dimensions']['wheelbase']) ? $input['dimensions']['wheelbase'] : 0,
        'dimensionsWeight' => isset($input['dimensions']['weight']) ? $input['dimensions']['weight'] : 0,
        'dimensionsTrunkVolume' => isset($input['dimensions']['trunkVolume']) ? $input['dimensions']['trunkVolume'] : 0,
        'performanceAcceleration' => isset($input['performance']['acceleration']) ? $input['performance']['acceleration'] : 0,
        'performanceTopSpeed' => isset($input['performance']['topSpeed']) ? $input['performance']['topSpeed'] : 0,
        'performanceFuelConsumptionCity' => isset($input['performance']['fuelConsumption']['city']) ? $input['performance']['fuelConsumption']['city'] : 0,
        'performanceFuelConsumptionHighway' => isset($input['performance']['fuelConsumption']['highway']) ? $input['performance']['fuelConsumption']['highway'] : 0,
        'performanceFuelConsumptionCombined' => isset($input['performance']['fuelConsumption']['combined']) ? $input['performance']['fuelConsumption']['combined'] : 0,
        'description' => $input['description'] ?? null,
        'isNew' => isset($input['isNew']) ? ($input['isNew'] ? 1 : 0) : 0,
        'isPopular' => isset($input['isPopular']) ? ($input['isPopular'] ? 1 : 0) : 0,
        'country' => $input['country'] ?? null,
        'viewCount' => $input['viewCount'] ?? 0
    ];
    
    // Выполняем запрос
    $success = $stmt->execute($carData);
    
    if (!$success) {
        throw new PDOException("Не удалось добавить автомобиль");
    }
    
    // Добавляем характеристики автомобиля, если они есть
    if (isset($input['features']) && is_array($input['features']) && !empty($input['features'])) {
        $featureStmt = $pdo->prepare('
            INSERT INTO car_features (id, carId, name, category, isStandard) 
            VALUES (:id, :carId, :name, :category, :isStandard)
        ');
        
        foreach ($input['features'] as $feature) {
            $featureStmt->execute([
                'id' => isset($feature['id']) ? $feature['id'] : generateUUID(),
                'carId' => $input['id'],
                'name' => $feature['name'],
                'category' => $feature['category'] ?? 'Общие',
                'isStandard' => isset($feature['isStandard']) ? ($feature['isStandard'] ? 1 : 0) : 0
            ]);
        }
    }
    
    // Добавляем изображения автомобиля, если они есть
    if (isset($input['images']) && is_array($input['images']) && !empty($input['images'])) {
        $imageStmt = $pdo->prepare('
            INSERT INTO car_images (id, carId, url, alt) 
            VALUES (:id, :carId, :url, :alt)
        ');
        
        foreach ($input['images'] as $image) {
            $imageStmt->execute([
                'id' => isset($image['id']) ? $image['id'] : generateUUID(),
                'carId' => $input['id'],
                'url' => $image['url'],
                'alt' => $image['alt'] ?? "{$input['brand']} {$input['model']}"
            ]);
        }
    }
    
    // Если все прошло успешно, фиксируем транзакцию
    $pdo->commit();
    
    echo json_encode(['success' => true, 'message' => 'Автомобиль успешно добавлен', 'carId' => $input['id']]);
} catch (PDOException $e) {
    // В случае ошибки отменяем транзакцию
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Ошибка при добавлении автомобиля: ' . $e->getMessage()]);
}
?>
