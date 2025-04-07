
<?php
require_once '../config.php';

// Обрабатываем разные типы запросов
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Получить список автомобилей для сравнения
        handleGetComparisons();
        break;
    case 'POST':
        // Добавить/удалить из списка сравнения
        handleUpdateComparisons();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
        break;
}

function handleGetComparisons() {
    global $pdo;
    
    $userId = $_GET['userId'] ?? 'anonymous';
    
    try {
        // Подготавливаем запрос для получения автомобилей для сравнения
        $stmt = $pdo->prepare('SELECT carId FROM user_comparisons WHERE userId = :userId');
        $stmt->execute(['userId' => $userId]);
        $comparisons = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (!empty($comparisons)) {
            // Получаем данные об автомобилях
            $placeholders = implode(',', array_fill(0, count($comparisons), '?'));
            $carsStmt = $pdo->prepare("SELECT * FROM cars WHERE id IN ($placeholders)");
            
            // Привязываем параметры
            foreach ($comparisons as $index => $carId) {
                $carsStmt->bindValue($index + 1, $carId);
            }
            
            $carsStmt->execute();
            $cars = $carsStmt->fetchAll();
            
            // Преобразуем данные автомобилей в нужный формат
            // (аналогично тому, как это делается в get_cars.php)
            
            echo json_encode(['success' => true, 'data' => ['carIds' => $comparisons, 'cars' => $cars]]);
        } else {
            echo json_encode(['success' => true, 'data' => ['carIds' => [], 'cars' => []]]);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Ошибка при получении автомобилей для сравнения: ' . $e->getMessage()]);
    }
}

function handleUpdateComparisons() {
    global $pdo;
    
    // Получаем данные из тела запроса
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);
    
    // Проверяем данные
    if (!isset($input['carId'])) {
        echo json_encode(['success' => false, 'message' => 'Неверные данные запроса']);
        exit;
    }
    
    $userId = $input['userId'] ?? 'anonymous';
    $carId = $input['carId'];
    $action = $input['action'] ?? 'toggle'; // add, remove, toggle
    
    try {
        $checkStmt = $pdo->prepare('SELECT COUNT(*) FROM user_comparisons WHERE userId = :userId AND carId = :carId');
        $checkStmt->execute(['userId' => $userId, 'carId' => $carId]);
        $exists = (int)$checkStmt->fetchColumn() > 0;
        
        if ($action === 'add' || ($action === 'toggle' && !$exists)) {
            // Добавляем в сравнение
            $addStmt = $pdo->prepare('INSERT INTO user_comparisons (userId, carId) VALUES (:userId, :carId)');
            $addStmt->execute(['userId' => $userId, 'carId' => $carId]);
            echo json_encode(['success' => true, 'message' => 'Автомобиль добавлен к сравнению', 'action' => 'added']);
        } elseif ($action === 'remove' || ($action === 'toggle' && $exists)) {
            // Удаляем из сравнения
            $removeStmt = $pdo->prepare('DELETE FROM user_comparisons WHERE userId = :userId AND carId = :carId');
            $removeStmt->execute(['userId' => $userId, 'carId' => $carId]);
            echo json_encode(['success' => true, 'message' => 'Автомобиль удален из сравнения', 'action' => 'removed']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Неверное действие']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Ошибка при обновлении списка сравнения: ' . $e->getMessage()]);
    }
}
?>
