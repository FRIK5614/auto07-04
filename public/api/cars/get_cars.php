
<?php
require_once '../config.php';

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

try {
    // Логируем начало запроса
    error_log("Starting get_cars request with params: " . json_encode($_GET));
    
    // Оптимизированный запрос - используем подготовленные запросы и улучшаем производительность
    $query = 'SELECT * FROM cars';
    
    // Подготавливаем условия WHERE, если есть параметры фильтрации
    $conditions = [];
    $params = [];
    
    // Фильтрация по ключевым полям
    $filterFields = [
        'brand' => 'brand = :brand',
        'model' => 'model = :model',
        'year' => 'year = :year',
        'bodyType' => 'bodyType = :bodyType',
        'country' => 'country = :country',
        'status' => 'status = :status'
    ];
    
    foreach ($filterFields as $field => $condition) {
        if (isset($_GET[$field]) && !empty($_GET[$field])) {
            $conditions[] = $condition;
            $params[":$field"] = $_GET[$field];
        }
    }
    
    // Фильтрация по булевым полям
    $booleanFields = ['isNew', 'isPopular'];
    
    foreach ($booleanFields as $field) {
        if (isset($_GET[$field])) {
            $value = filter_var($_GET[$field], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
            $conditions[] = "$field = :$field";
            $params[":$field"] = $value;
        }
    }
    
    // По умолчанию показываем только опубликованные автомобили, если не указан другой статус
    if (!isset($_GET['status']) && !isset($_GET['admin'])) {
        $conditions[] = "status = :status";
        $params[':status'] = 'published';
    }
    
    // Добавляем условия к запросу, если они есть
    if (!empty($conditions)) {
        $query .= ' WHERE ' . implode(' AND ', $conditions);
    }
    
    // Сортировка
    if (isset($_GET['sort']) && !empty($_GET['sort'])) {
        switch ($_GET['sort']) {
            case 'priceAsc':
                $query .= ' ORDER BY priceBase ASC';
                break;
            case 'priceDesc':
                $query .= ' ORDER BY priceBase DESC';
                break;
            case 'yearAsc':
                $query .= ' ORDER BY year ASC';
                break;
            case 'yearDesc':
                $query .= ' ORDER BY year DESC';
                break;
        }
    }
    
    // Лимит и смещение для пагинации
    if (isset($_GET['limit']) && is_numeric($_GET['limit'])) {
        $limit = intval($_GET['limit']);
        $query .= ' LIMIT :limit';
        $params[':limit'] = $limit;
        
        if (isset($_GET['offset']) && is_numeric($_GET['offset'])) {
            $offset = intval($_GET['offset']);
            $query .= ' OFFSET :offset';
            $params[':offset'] = $offset;
        }
    }
    
    // Логируем построенный запрос
    error_log("Built query: $query");
    error_log("With params: " . json_encode($params));
    
    // Улучшаем производительность запроса, добавляем индексацию
    $pdo->exec('ANALYZE TABLE cars, car_images, car_features');
    
    // Подготавливаем запрос
    $stmt = $pdo->prepare($query);
    
    // Привязываем параметры
    foreach ($params as $key => $value) {
        // Для LIMIT и OFFSET используем специальную привязку для PDO
        if ($key === ':limit' || $key === ':offset') {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    
    // Выполняем запрос с измерением времени
    $startTime = microtime(true);
    $stmt->execute();
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $queryTime = microtime(true) - $startTime;
    
    // Если нет автомобилей, возвращаем пустой массив
    if (empty($cars)) {
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'data' => [], 'queryTime' => $queryTime]);
        exit;
    }
    
    // Получаем идентификаторы автомобилей
    $carIds = array_column($cars, 'id');
    
    // Оптимизируем загрузку изображений - используем один запрос для всех автомобилей
    if (!empty($carIds)) {
        $placeholders = implode(',', array_fill(0, count($carIds), '?'));
        
        // Подготавливаем запросы с использованием JOIN для изображений
        $imageQuery = "SELECT ci.* FROM car_images ci WHERE ci.carId IN ($placeholders) ORDER BY ci.isMain DESC";
        $imageStmt = $pdo->prepare($imageQuery);
        
        // Привязываем идентификаторы автомобилей
        foreach ($carIds as $index => $id) {
            $imageStmt->bindValue($index + 1, $id);
        }
        
        $imageStmt->execute();
        $images = $imageStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Группируем изображения по идентификатору автомобиля
        $carImages = [];
        foreach ($images as $image) {
            if (!isset($carImages[$image['carId']])) {
                $carImages[$image['carId']] = [];
            }
            $carImages[$image['carId']][] = [
                'id' => $image['id'],
                'url' => $image['url'],
                'alt' => $image['alt'],
                'isMain' => (bool)$image['isMain']
            ];
        }
        
        // То же самое для характеристик
        $featuresQuery = "SELECT cf.* FROM car_features cf WHERE cf.carId IN ($placeholders)";
        $featuresStmt = $pdo->prepare($featuresQuery);
        
        foreach ($carIds as $index => $id) {
            $featuresStmt->bindValue($index + 1, $id);
        }
        
        $featuresStmt->execute();
        $features = $featuresStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Группируем характеристики
        $carFeatures = [];
        foreach ($features as $feature) {
            if (!isset($carFeatures[$feature['carId']])) {
                $carFeatures[$feature['carId']] = [];
            }
            $carFeatures[$feature['carId']][] = [
                'id' => $feature['id'],
                'name' => $feature['name'],
                'category' => $feature['category'],
                'isStandard' => (bool)$feature['isStandard']
            ];
        }
        
        // Преобразуем структуру данных для каждого автомобиля
        foreach ($cars as &$car) {
            // Добавляем изображения и характеристики
            $car['images'] = isset($carImages[$car['id']]) ? $carImages[$car['id']] : [];
            $car['features'] = isset($carFeatures[$car['id']]) ? $carFeatures[$car['id']] : [];
            
            // Преобразуем JSON-поля
            if (isset($car['colors']) && !empty($car['colors'])) {
                $car['colors'] = json_decode($car['colors'], true) ?? [];
            } else {
                $car['colors'] = [];
            }
            
            // Формируем структуры для объектов
            $car['price'] = [
                'base' => (float)$car['priceBase'],
                'withOptions' => isset($car['priceWithOptions']) ? (float)$car['priceWithOptions'] : null,
                'discount' => isset($car['priceDiscount']) ? (float)$car['priceDiscount'] : null,
                'special' => isset($car['priceSpecial']) ? (float)$car['priceSpecial'] : null
            ];
            
            // Соберем данные о двигателе в единый объект
            $car['engine'] = [
                'type' => $car['engineType'] ?? '',
                'displacement' => (float)($car['engineDisplacement'] ?? 0),
                'power' => (int)($car['enginePower'] ?? 0),
                'torque' => (int)($car['engineTorque'] ?? 0),
                'fuelType' => $car['fuelType'] ?? ''
            ];
            
            // Соберем данные о трансмиссии
            $car['transmission'] = [
                'type' => $car['transmissionType'] ?? '',
                'gears' => (int)($car['transmissionGears'] ?? 0)
            ];
            
            // Соберем данные о размерах
            $car['dimensions'] = [
                'length' => (int)($car['dimensionsLength'] ?? 0),
                'width' => (int)($car['dimensionsWidth'] ?? 0),
                'height' => (int)($car['dimensionsHeight'] ?? 0),
                'wheelbase' => (int)($car['dimensionsWheelbase'] ?? 0),
                'weight' => (int)($car['dimensionsWeight'] ?? 0),
                'trunkVolume' => (int)($car['dimensionsTrunkVolume'] ?? 0)
            ];
            
            // Соберем данные о производительности
            $car['performance'] = [
                'acceleration' => (float)($car['performanceAcceleration'] ?? 0),
                'topSpeed' => (int)($car['performanceTopSpeed'] ?? 0),
                'fuelConsumption' => [
                    'city' => (float)($car['performanceFuelConsumptionCity'] ?? 0),
                    'highway' => (float)($car['performanceFuelConsumptionHighway'] ?? 0),
                    'combined' => (float)($car['performanceFuelConsumptionCombined'] ?? 0)
                ]
            ];
            
            // Удаляем поля, которые уже включены в структуру
            $fieldsToRemove = [
                'priceBase', 'priceWithOptions', 'priceDiscount', 'priceSpecial',
                'engineType', 'engineDisplacement', 'enginePower', 'engineTorque', 'fuelType',
                'transmissionType', 'transmissionGears',
                'dimensionsLength', 'dimensionsWidth', 'dimensionsHeight', 'dimensionsWheelbase', 'dimensionsWeight', 'dimensionsTrunkVolume',
                'performanceAcceleration', 'performanceTopSpeed', 'performanceFuelConsumptionCity', 'performanceFuelConsumptionHighway', 'performanceFuelConsumptionCombined'
            ];
            
            foreach ($fieldsToRemove as $field) {
                if (isset($car[$field])) {
                    unset($car[$field]);
                }
            }
            
            // Конвертируем булевы поля
            $car['isNew'] = (bool)($car['isNew'] ?? false);
            $car['isPopular'] = (bool)($car['isPopular'] ?? false);
            
            // Проверяем, имеется ли поле status
            if (!isset($car['status']) || empty($car['status'])) {
                $car['status'] = 'published'; // Устанавливаем значение по умолчанию
            }
        }
    }
    
    // Возвращаем результат с информацией о времени выполнения запроса
    header('Content-Type: application/json');
    header('X-Query-Time: ' . $queryTime);
    echo json_encode([
        'success' => true, 
        'data' => array_values($cars),
        'count' => count($cars),
        'queryTime' => $queryTime
    ]);
    
} catch (PDOException $e) {
    header('Content-Type: application/json');
    error_log("PDO Exception in get_cars: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка при получении автомобилей: ' . $e->getMessage(),
        'trace' => DEBUG_MODE ? $e->getTraceAsString() : null
    ]);
}
?>
