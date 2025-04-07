
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
if (!isset($input['id'])) {
    echo json_encode(['success' => false, 'message' => 'Неверные данные запроса']);
    exit;
}

try {
    // Начинаем транзакцию
    $pdo->beginTransaction();
    
    // Формируем SQL запрос для обновления автомобиля
    $updateFields = [];
    $params = ['id' => $input['id']];
    
    // Базовые поля
    $basicFields = ['brand', 'model', 'year', 'bodyType', 'description', 'drivetrain', 'country', 'viewCount'];
    foreach ($basicFields as $field) {
        if (isset($input[$field])) {
            $updateFields[] = "$field = :$field";
            $params[$field] = $input[$field];
        }
    }
    
    // Булевы поля
    $booleanFields = ['isNew', 'isPopular'];
    foreach ($booleanFields as $field) {
        if (isset($input[$field])) {
            $updateFields[] = "$field = :$field";
            $params[$field] = $input[$field] ? 1 : 0;
        }
    }
    
    // Обработка массивов и объектов
    if (isset($input['colors'])) {
        $updateFields[] = "colors = :colors";
        $params['colors'] = json_encode($input['colors']);
    }
    
    // Цены
    if (isset($input['price'])) {
        if (isset($input['price']['base'])) {
            $updateFields[] = "priceBase = :priceBase";
            $params['priceBase'] = $input['price']['base'];
        }
        if (isset($input['price']['discount'])) {
            $updateFields[] = "priceDiscount = :priceDiscount";
            $params['priceDiscount'] = $input['price']['discount'];
        }
        if (isset($input['price']['special'])) {
            $updateFields[] = "priceSpecial = :priceSpecial";
            $params['priceSpecial'] = $input['price']['special'];
        }
    }
    
    // Двигатель
    if (isset($input['engine'])) {
        if (isset($input['engine']['type'])) {
            $updateFields[] = "engineType = :engineType";
            $params['engineType'] = $input['engine']['type'];
        }
        if (isset($input['engine']['displacement'])) {
            $updateFields[] = "engineDisplacement = :engineDisplacement";
            $params['engineDisplacement'] = $input['engine']['displacement'];
        }
        if (isset($input['engine']['power'])) {
            $updateFields[] = "enginePower = :enginePower";
            $params['enginePower'] = $input['engine']['power'];
        }
        if (isset($input['engine']['torque'])) {
            $updateFields[] = "engineTorque = :engineTorque";
            $params['engineTorque'] = $input['engine']['torque'];
        }
        if (isset($input['engine']['fuelType'])) {
            $updateFields[] = "fuelType = :fuelType";
            $params['fuelType'] = $input['engine']['fuelType'];
        }
    }
    
    // Трансмиссия
    if (isset($input['transmission'])) {
        if (isset($input['transmission']['type'])) {
            $updateFields[] = "transmissionType = :transmissionType";
            $params['transmissionType'] = $input['transmission']['type'];
        }
        if (isset($input['transmission']['gears'])) {
            $updateFields[] = "transmissionGears = :transmissionGears";
            $params['transmissionGears'] = $input['transmission']['gears'];
        }
    }
    
    // Размеры
    if (isset($input['dimensions'])) {
        if (isset($input['dimensions']['length'])) {
            $updateFields[] = "dimensionsLength = :dimensionsLength";
            $params['dimensionsLength'] = $input['dimensions']['length'];
        }
        if (isset($input['dimensions']['width'])) {
            $updateFields[] = "dimensionsWidth = :dimensionsWidth";
            $params['dimensionsWidth'] = $input['dimensions']['width'];
        }
        if (isset($input['dimensions']['height'])) {
            $updateFields[] = "dimensionsHeight = :dimensionsHeight";
            $params['dimensionsHeight'] = $input['dimensions']['height'];
        }
        if (isset($input['dimensions']['wheelbase'])) {
            $updateFields[] = "dimensionsWheelbase = :dimensionsWheelbase";
            $params['dimensionsWheelbase'] = $input['dimensions']['wheelbase'];
        }
        if (isset($input['dimensions']['weight'])) {
            $updateFields[] = "dimensionsWeight = :dimensionsWeight";
            $params['dimensionsWeight'] = $input['dimensions']['weight'];
        }
        if (isset($input['dimensions']['trunkVolume'])) {
            $updateFields[] = "dimensionsTrunkVolume = :dimensionsTrunkVolume";
            $params['dimensionsTrunkVolume'] = $input['dimensions']['trunkVolume'];
        }
    }
    
    // Производительность
    if (isset($input['performance'])) {
        if (isset($input['performance']['acceleration'])) {
            $updateFields[] = "performanceAcceleration = :performanceAcceleration";
            $params['performanceAcceleration'] = $input['performance']['acceleration'];
        }
        if (isset($input['performance']['topSpeed'])) {
            $updateFields[] = "performanceTopSpeed = :performanceTopSpeed";
            $params['performanceTopSpeed'] = $input['performance']['topSpeed'];
        }
        if (isset($input['performance']['fuelConsumption'])) {
            if (isset($input['performance']['fuelConsumption']['city'])) {
                $updateFields[] = "performanceFuelConsumptionCity = :performanceFuelConsumptionCity";
                $params['performanceFuelConsumptionCity'] = $input['performance']['fuelConsumption']['city'];
            }
            if (isset($input['performance']['fuelConsumption']['highway'])) {
                $updateFields[] = "performanceFuelConsumptionHighway = :performanceFuelConsumptionHighway";
                $params['performanceFuelConsumptionHighway'] = $input['performance']['fuelConsumption']['highway'];
            }
            if (isset($input['performance']['fuelConsumption']['combined'])) {
                $updateFields[] = "performanceFuelConsumptionCombined = :performanceFuelConsumptionCombined";
                $params['performanceFuelConsumptionCombined'] = $input['performance']['fuelConsumption']['combined'];
            }
        }
    }
    
    // Если есть поля для обновления, формируем и выполняем запрос
    if (!empty($updateFields)) {
        $sql = "UPDATE cars SET " . implode(", ", $updateFields) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $success = $stmt->execute($params);
        
        if (!$success) {
            throw new PDOException("Не удалось обновить автомобиль");
        }
    }
    
    // Обновляем характеристики автомобиля, если они есть
    if (isset($input['features']) && is_array($input['features'])) {
        // Сначала удаляем существующие характеристики
        $deleteFeatureStmt = $pdo->prepare('DELETE FROM car_features WHERE carId = :carId');
        $deleteFeatureStmt->execute(['carId' => $input['id']]);
        
        // Затем добавляем новые
        if (!empty($input['features'])) {
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
    }
    
    // Обновляем изображения автомобиля, если они есть
    if (isset($input['images']) && is_array($input['images'])) {
        // Сначала удаляем существующие изображения
        $deleteImageStmt = $pdo->prepare('DELETE FROM car_images WHERE carId = :carId');
        $deleteImageStmt->execute(['carId' => $input['id']]);
        
        // Затем добавляем новые
        if (!empty($input['images'])) {
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
    }
    
    // Если все прошло успешно, фиксируем транзакцию
    $pdo->commit();
    
    echo json_encode(['success' => true, 'message' => 'Автомобиль успешно обновлен', 'carId' => $input['id']]);
} catch (PDOException $e) {
    // В случае ошибки отменяем транзакцию
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Ошибка при обновлении автомобиля: ' . $e->getMessage()]);
}
?>
