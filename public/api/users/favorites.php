
<?php
require_once '../config.php';

// Обрабатываем разные типы запросов
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Получить избранные по ID пользователя
        handleGetFavorites();
        break;
    case 'POST':
        // Добавить/удалить из избранного
        handleUpdateFavorites();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
        break;
}

function handleGetFavorites() {
    global $pdo;
    
    // В простой версии мы будем использовать cookie или локальное хранилище на клиенте
    // Но можно также добавить пользовательский ID, если есть система аутентификации
    $userId = $_GET['userId'] ?? 'anonymous';
    
    try {
        // Подготавливаем запрос для получения избранных автомобилей
        $stmt = $pdo->prepare('SELECT carId FROM user_favorites WHERE userId = :userId');
        $stmt->execute(['userId' => $userId]);
        $favorites = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (!empty($favorites)) {
            // Получаем данные о избранных автомобилях
            $placeholders = implode(',', array_fill(0, count($favorites), '?'));
            $carsStmt = $pdo->prepare("SELECT * FROM cars WHERE id IN ($placeholders)");
            
            // Привязываем параметры
            foreach ($favorites as $index => $carId) {
                $carsStmt->bindValue($index + 1, $carId);
            }
            
            $carsStmt->execute();
            $cars = $carsStmt->fetchAll();
            
            // Преобразуем данные автомобилей в нужный формат
            // (аналогично тому, как это делается в get_cars.php)
            
            echo json_encode(['success' => true, 'data' => ['carIds' => $favorites, 'cars' => $cars]]);
        } else {
            echo json_encode(['success' => true, 'data' => ['carIds' => [], 'cars' => []]]);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Ошибка при получении избранных автомобилей: ' . $e->getMessage()]);
    }
}

function handleUpdateFavorites() {
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
        $checkStmt = $pdo->prepare('SELECT COUNT(*) FROM user_favorites WHERE userId = :userId AND carId = :carId');
        $checkStmt->execute(['userId' => $userId, 'carId' => $carId]);
        $exists = (int)$checkStmt->fetchColumn() > 0;
        
        if ($action === 'add' || ($action === 'toggle' && !$exists)) {
            // Добавляем в избранное
            $addStmt = $pdo->prepare('INSERT INTO user_favorites (userId, carId) VALUES (:userId, :carId)');
            $addStmt->execute(['userId' => $userId, 'carId' => $carId]);
            echo json_encode(['success' => true, 'message' => 'Автомобиль добавлен в избранное', 'action' => 'added']);
        } elseif ($action === 'remove' || ($action === 'toggle' && $exists)) {
            // Удаляем из избранного
            $removeStmt = $pdo->prepare('DELETE FROM user_favorites WHERE userId = :userId AND carId = :carId');
            $removeStmt->execute(['userId' => $userId, 'carId' => $carId]);
            echo json_encode(['success' => true, 'message' => 'Автомобиль удален из избранного', 'action' => 'removed']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Неверное действие']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Ошибка при обновлении избранных автомобилей: ' . $e->getMessage()]);
    }
}
?>
