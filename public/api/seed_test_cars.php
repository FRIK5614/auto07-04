
<?php
require_once 'config.php';

// Устанавливаем заголовки для JSON ответа
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Проверяем, что запрос пришел методом GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

try {
    // Проверяем количество существующих автомобилей в базе данных
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM cars");
    $existingCarsCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($existingCarsCount >= 30) {
        echo json_encode(['success' => true, 'message' => 'База уже содержит достаточное количество тестовых автомобилей', 'count' => $existingCarsCount]);
        exit;
    }
    
    // Массивы данных для генерации случайных автомобилей
    $brands = ['Toyota', 'Honda', 'Volkswagen', 'Ford', 'Mazda', 'BMW', 'Mercedes-Benz', 'Audi', 'Kia', 'Hyundai'];
    $models = [
        'Toyota' => ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Highlander'],
        'Honda' => ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V'],
        'Volkswagen' => ['Golf', 'Passat', 'Tiguan', 'Polo', 'Touareg'],
        'Ford' => ['Focus', 'Mondeo', 'Kuga', 'Explorer', 'Mustang'],
        'Mazda' => ['3', '6', 'CX-5', 'CX-9', 'MX-5'],
        'BMW' => ['3 Series', '5 Series', 'X3', 'X5', '7 Series'],
        'Mercedes-Benz' => ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
        'Audi' => ['A3', 'A4', 'Q3', 'Q5', 'A6'],
        'Kia' => ['Rio', 'Ceed', 'Sportage', 'Sorento', 'Optima'],
        'Hyundai' => ['Solaris', 'Elantra', 'Tucson', 'Santa Fe', 'i30']
    ];
    $colors = ['Белый', 'Черный', 'Серебристый', 'Красный', 'Синий', 'Зеленый', 'Серый', 'Коричневый'];
    $bodyTypes = ['Седан', 'Хэтчбек', 'Универсал', 'Кроссовер', 'Внедорожник', 'Купе', 'Кабриолет'];
    $transmissions = ['Автоматическая', 'Механическая', 'Вариатор', 'Робот'];
    $drivetrains = ['Передний', 'Задний', 'Полный'];
    $engineTypes = ['Бензиновый', 'Дизельный', 'Гибрид', 'Электро'];
    $fuelTypes = ['Бензин', 'Дизель', 'Гибрид', 'Электро'];
    $countries = ['Германия', 'Япония', 'США', 'Корея', 'Китай', 'Франция'];
    $statuses = ['published', 'draft', 'archived'];
    
    $carsAdded = 0;
    $carsToAdd = 30 - $existingCarsCount;
    
    // Подготавливаем запрос для вставки автомобилей
    $stmt = $pdo->prepare("INSERT INTO cars (
        brand, model, year, vin, bodyType, mileage, 
        engineType, engineDisplacement, enginePower, engineTorque,
        fuelType, transmissionType, transmissionGears, drivetrain,
        dimensionsLength, dimensionsWidth, dimensionsHeight, dimensionsWheelbase,
        dimensionsWeight, dimensionsTrunkVolume, 
        performanceAcceleration, performanceTopSpeed, 
        performanceFuelConsumptionCity, performanceFuelConsumptionHighway, performanceFuelConsumptionCombined,
        colors, status, country, description, priceBase, priceDiscount, 
        isNew, isPopular, views
    ) VALUES (
        ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, 
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, 
        ?, ?, 
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?, 
        ?, ?, ?
    )");

    // Генерируем и добавляем случайные автомобили
    for ($i = 0; $i < $carsToAdd; $i++) {
        $brand = $brands[array_rand($brands)];
        $modelArray = $models[$brand];
        $model = $modelArray[array_rand($modelArray)];
        $year = rand(2015, 2023);
        $vin = strtoupper(substr(md5(uniqid()), 0, 17));
        $bodyType = $bodyTypes[array_rand($bodyTypes)];
        $mileage = $year > 2021 ? rand(0, 15000) : rand(15000, 100000);
        
        $engineType = $engineTypes[array_rand($engineTypes)];
        $engineDisplacement = rand(10, 50) / 10;
        $enginePower = rand(100, 350);
        $engineTorque = rand(150, 500);
        
        $fuelType = $fuelTypes[array_rand($fuelTypes)];
        $transmissionType = $transmissions[array_rand($transmissions)];
        $transmissionGears = rand(5, 8);
        $drivetrain = $drivetrains[array_rand($drivetrains)];
        
        $dimensionsLength = rand(4000, 5500);
        $dimensionsWidth = rand(1700, 2100);
        $dimensionsHeight = rand(1400, 2000);
        $dimensionsWheelbase = rand(2500, 3300);
        $dimensionsWeight = rand(1300, 2500);
        $dimensionsTrunkVolume = rand(300, 700);
        
        $performanceAcceleration = rand(60, 140) / 10;
        $performanceTopSpeed = rand(160, 250);
        $performanceFuelConsumptionCity = rand(60, 150) / 10;
        $performanceFuelConsumptionHighway = rand(40, 100) / 10;
        $performanceFuelConsumptionCombined = ($performanceFuelConsumptionCity + $performanceFuelConsumptionHighway) / 2;
        
        // Генерируем случайные цвета
        $carColors = [];
        $colorCount = rand(3, 6);
        for ($j = 0; $j < $colorCount; $j++) {
            $carColors[] = $colors[array_rand($colors)];
        }
        $colorsJson = json_encode(array_unique($carColors));
        
        $status = $statuses[array_rand($statuses)];
        $country = $countries[array_rand($countries)];
        
        // Генерируем случайное описание
        $description = "$brand $model $year года выпуска в отличном состоянии. ";
        $description .= "Двигатель: $engineType, $engineDisplacement л, $enginePower л.с. ";
        $description .= "Коробка передач: $transmissionType. Пробег: $mileage км. ";
        
        // Цена и скидка
        $priceBase = rand(1000000, 5000000);
        $priceDiscount = rand(0, 1) ? rand(50000, 300000) : 0;
        
        // Флаги новинок и популярных
        $isNew = $year >= 2022 ? 1 : 0;
        $isPopular = rand(0, 3) === 0 ? 1 : 0; // 25% шанс быть популярным
        
        // Количество просмотров
        $views = rand(10, 1000);
        
        // Выполняем запрос на добавление автомобиля
        $stmt->execute([
            $brand, $model, $year, $vin, $bodyType, $mileage,
            $engineType, $engineDisplacement, $enginePower, $engineTorque,
            $fuelType, $transmissionType, $transmissionGears, $drivetrain,
            $dimensionsLength, $dimensionsWidth, $dimensionsHeight, $dimensionsWheelbase,
            $dimensionsWeight, $dimensionsTrunkVolume,
            $performanceAcceleration, $performanceTopSpeed,
            $performanceFuelConsumptionCity, $performanceFuelConsumptionHighway, $performanceFuelConsumptionCombined,
            $colorsJson, $status, $country, $description, $priceBase, $priceDiscount,
            $isNew, $isPopular, $views
        ]);
        
        $carId = $pdo->lastInsertId();
        $carsAdded++;
        
        // Добавляем случайные изображения для автомобиля
        $imageCount = rand(3, 6);
        for ($j = 0; $j < $imageCount; $j++) {
            $isMain = ($j === 0) ? 1 : 0;
            $imageUrl = "https://source.unsplash.com/random/800x600/?car," . $brand . "," . $model;
            $imageAlt = "$brand $model изображение $j";
            
            $pdo->prepare("INSERT INTO car_images (carId, url, alt, isMain) VALUES (?, ?, ?, ?)")
                ->execute([$carId, $imageUrl, $imageAlt, $isMain]);
        }
        
        // Добавляем случайные характеристики
        $features = [
            ["Климат-контроль", "Комфорт", 1],
            ["Подогрев сидений", "Комфорт", rand(0, 1)],
            ["Круиз-контроль", "Комфорт", rand(0, 1)],
            ["Камера заднего вида", "Безопасность", rand(0, 1)],
            ["Датчики парковки", "Безопасность", rand(0, 1)],
            ["Кожаный салон", "Интерьер", rand(0, 1)],
            ["Навигация", "Мультимедиа", rand(0, 1)],
            ["Bluetooth", "Мультимедиа", 1],
            ["ABS", "Безопасность", 1],
            ["ESP", "Безопасность", 1]
        ];
        
        foreach ($features as $feature) {
            if ($feature[2] === 1) {
                $pdo->prepare("INSERT INTO car_features (carId, name, category, isStandard) VALUES (?, ?, ?, ?)")
                    ->execute([$carId, $feature[0], $feature[1], $feature[2]]);
            }
        }
    }
    
    // Возвращаем успешный результат
    echo json_encode([
        'success' => true, 
        'message' => "Успешно добавлено $carsAdded тестовых автомобилей",
        'total_cars' => $existingCarsCount + $carsAdded
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка при добавлении тестовых автомобилей: ' . $e->getMessage()
    ]);
}
?>
