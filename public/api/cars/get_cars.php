
<?php
require_once '../config.php';

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

try {
    // Настраиваем PDO для использования буферизованных запросов
    $pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
    
    // Базовый запрос к таблице автомобилей
    $query = 'SELECT * FROM cars';
    
    // Подготавливаем условия WHERE, если есть параметры фильтрации
    $conditions = [];
    $params = [];
    
    // Фильтрация по бренду
    if (isset($_GET['brand']) && !empty($_GET['brand'])) {
        $conditions[] = 'brand = :brand';
        $params[':brand'] = $_GET['brand'];
    }
    
    // Фильтрация по модели
    if (isset($_GET['model']) && !empty($_GET['model'])) {
        $conditions[] = 'model = :model';
        $params[':model'] = $_GET['model'];
    }
    
    // Фильтрация по году
    if (isset($_GET['year']) && !empty($_GET['year'])) {
        $conditions[] = 'year = :year';
        $params[':year'] = intval($_GET['year']);
    }
    
    // Фильтрация по типу кузова
    if (isset($_GET['bodyType']) && !empty($_GET['bodyType'])) {
        $conditions[] = 'bodyType = :bodyType';
        $params[':bodyType'] = $_GET['bodyType'];
    }
    
    // Фильтрация по новизне
    if (isset($_GET['isNew'])) {
        $isNew = filter_var($_GET['isNew'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        $conditions[] = 'isNew = :isNew';
        $params[':isNew'] = $isNew;
    }
    
    // Фильтрация по популярности
    if (isset($_GET['isPopular'])) {
        $isPopular = filter_var($_GET['isPopular'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        $conditions[] = 'isPopular = :isPopular';
        $params[':isPopular'] = $isPopular;
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
            default:
                // По умолчанию без сортировки
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
    
    // Выполняем запрос
    $stmt->execute();
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Получаем изображения для каждого автомобиля
    $carIds = array_column($cars, 'id');
    
    if (!empty($carIds)) {
        // Получаем изображения
        $imagePlaceholders = implode(',', array_fill(0, count($carIds), '?'));
        $imageQuery = "SELECT * FROM car_images WHERE carId IN ($imagePlaceholders)";
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
        
        // Получаем характеристики для каждого автомобиля
        $featurePlaceholders = implode(',', array_fill(0, count($carIds), '?'));
        $featuresQuery = "SELECT * FROM car_features WHERE carId IN ($featurePlaceholders)";
        $featuresStmt = $pdo->prepare($featuresQuery);
        
        // Привязываем идентификаторы автомобилей
        foreach ($carIds as $index => $id) {
            $featuresStmt->bindValue($index + 1, $id);
        }
        
        $featuresStmt->execute();
        $features = $featuresStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Группируем характеристики по идентификатору автомобиля
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
        
        // Добавляем изображения и характеристики к автомобилям
        foreach ($cars as &$car) {
            $car['images'] = isset($carImages[$car['id']]) ? $carImages[$car['id']] : [];
            $car['features'] = isset($carFeatures[$car['id']]) ? $carFeatures[$car['id']] : [];
            
            // Устанавливаем статус если его нет (по умолчанию published)
            if (!isset($car['status'])) {
                $car['status'] = 'published';
            }
            
            // Конвертируем JSON-поля в массивы
            if (isset($car['colors'])) {
                $car['colors'] = json_decode($car['colors'], true) ?? [];
            }
            
            // Формируем структуру цен
            $car['price'] = [
                'base' => (float)$car['priceBase'],
                'discount' => isset($car['priceDiscount']) ? (float)$car['priceDiscount'] : null,
                'special' => isset($car['priceSpecial']) ? (float)$car['priceSpecial'] : null
            ];
            
            // Формируем структуру двигателя
            $car['engine'] = [
                'type' => $car['engineType'] ?? '',
                'displacement' => (float)($car['engineDisplacement'] ?? 0),
                'power' => (int)($car['enginePower'] ?? 0),
                'torque' => (int)($car['engineTorque'] ?? 0),
                'fuelType' => $car['fuelType'] ?? ''
            ];
            
            // Формируем структуру трансмиссии
            $car['transmission'] = [
                'type' => $car['transmissionType'] ?? '',
                'gears' => (int)($car['transmissionGears'] ?? 0)
            ];
            
            // Формируем структуру размеров
            $car['dimensions'] = [
                'length' => (int)($car['dimensionsLength'] ?? 0),
                'width' => (int)($car['dimensionsWidth'] ?? 0),
                'height' => (int)($car['dimensionsHeight'] ?? 0),
                'wheelbase' => (int)($car['dimensionsWheelbase'] ?? 0),
                'weight' => (int)($car['dimensionsWeight'] ?? 0),
                'trunkVolume' => (int)($car['dimensionsTrunkVolume'] ?? 0)
            ];
            
            // Формируем структуру производительности
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
            unset(
                $car['priceBase'], 
                $car['priceDiscount'], 
                $car['priceSpecial'],
                $car['engineType'],
                $car['engineDisplacement'],
                $car['enginePower'],
                $car['engineTorque'],
                $car['fuelType'],
                $car['transmissionType'],
                $car['transmissionGears'],
                $car['dimensionsLength'],
                $car['dimensionsWidth'],
                $car['dimensionsHeight'],
                $car['dimensionsWheelbase'],
                $car['dimensionsWeight'],
                $car['dimensionsTrunkVolume'],
                $car['performanceAcceleration'],
                $car['performanceTopSpeed'],
                $car['performanceFuelConsumptionCity'],
                $car['performanceFuelConsumptionHighway'],
                $car['performanceFuelConsumptionCombined']
            );
            
            // Конвертируем булевы поля
            $car['isNew'] = (bool)($car['isNew'] ?? false);
            $car['isPopular'] = (bool)($car['isPopular'] ?? false);
        }
    }
    
    echo json_encode(['success' => true, 'data' => array_values($cars)]);
} catch (PDOException $e) {
    error_log("Database error in get_cars.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Ошибка при получении автомобилей: ' . $e->getMessage(), 'trace' => $e->getTraceAsString()]);
}
?>
