
<?php
require_once '../config.php';

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

// Логирование для отладки
error_log("Upload request received");

// Проверяем, был ли загружен файл
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errorMessage = 'Ошибка загрузки файла';
    
    if (isset($_FILES['image']['error'])) {
        switch ($_FILES['image']['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $errorMessage = 'Файл слишком большой';
                break;
            case UPLOAD_ERR_PARTIAL:
                $errorMessage = 'Файл был загружен только частично';
                break;
            case UPLOAD_ERR_NO_FILE:
                $errorMessage = 'Файл не был загружен';
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                $errorMessage = 'Отсутствует временная директория';
                break;
            case UPLOAD_ERR_CANT_WRITE:
                $errorMessage = 'Не удалось записать файл на диск';
                break;
            case UPLOAD_ERR_EXTENSION:
                $errorMessage = 'Загрузка файла остановлена расширением PHP';
                break;
        }
    }
    
    error_log("Upload error: " . $errorMessage . ", Error code: " . ($_FILES['image']['error'] ?? 'no error code'));
    error_log("FILES array: " . print_r($_FILES, true));
    
    echo json_encode(['success' => false, 'message' => $errorMessage]);
    exit;
}

try {
    // Настраиваем PDO для использования буферизованных запросов
    $pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
    
    // Проверяем тип файла
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $fileType = $_FILES['image']['type'];
    
    error_log("File type: " . $fileType);
    
    if (!in_array($fileType, $allowedTypes)) {
        error_log("Invalid file type: " . $fileType);
        echo json_encode(['success' => false, 'message' => 'Недопустимый тип файла. Разрешены только JPEG, PNG, GIF и WebP']);
        exit;
    }
    
    // Создаем директорию для загрузки изображений, если она не существует
    $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/uploads/';
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            error_log("Failed to create directory: " . $uploadDir);
            echo json_encode(['success' => false, 'message' => 'Не удалось создать директорию для загрузки']);
            exit;
        }
    }
    
    // Генерируем уникальное имя файла
    $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
    $filePath = $uploadDir . $fileName;
    
    // Перемещаем загруженный файл
    if (!move_uploaded_file($_FILES['image']['tmp_name'], $filePath)) {
        error_log("Failed to move uploaded file from {$_FILES['image']['tmp_name']} to {$filePath}");
        echo json_encode(['success' => false, 'message' => 'Не удалось сохранить файл']);
        exit;
    }
    
    error_log("File successfully moved to: " . $filePath);
    
    // Формируем URL изображения
    $publicUrl = '/uploads/' . $fileName;
    
    // Получаем идентификатор автомобиля, если он задан
    $carId = isset($_POST['carId']) ? $_POST['carId'] : null;
    $imageId = generateUUID();
    
    error_log("carId: " . ($carId ?? 'not set'));
    
    // Если задан идентификатор автомобиля, то добавляем изображение в базу данных
    if ($carId) {
        // Проверяем существование таблицы car_images
        $checkTable = $pdo->query("SHOW TABLES LIKE 'car_images'");
        if ($checkTable->rowCount() === 0) {
            // Создаем таблицу car_images
            $pdo->exec("
                CREATE TABLE car_images (
                    id VARCHAR(36) PRIMARY KEY,
                    carId VARCHAR(36) NOT NULL,
                    url VARCHAR(255) NOT NULL,
                    alt VARCHAR(255),
                    isMain TINYINT(1) DEFAULT 0,
                    INDEX (carId)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");
            error_log("Created car_images table");
        }
        
        $stmt = $pdo->prepare('
            INSERT INTO car_images (id, carId, url, alt, isMain) 
            VALUES (?, ?, ?, ?, ?)
        ');
        
        $isMain = isset($_POST['isMain']) && $_POST['isMain'] === 'true';
        
        // Если это главное изображение, сначала сбросим флаг isMain у всех изображений этого автомобиля
        if ($isMain) {
            $resetStmt = $pdo->prepare('UPDATE car_images SET isMain = 0 WHERE carId = ?');
            $resetStmt->execute([$carId]);
            error_log("Reset isMain flag for all images of car: " . $carId);
        }
        
        $alt = isset($_POST['alt']) ? $_POST['alt'] : "Изображение автомобиля";
        $stmt->execute([
            $imageId,
            $carId,
            $publicUrl,
            $alt,
            $isMain ? 1 : 0
        ]);
        
        error_log("Image added to database: id={$imageId}, carId={$carId}, url={$publicUrl}, isMain=" . ($isMain ? "true" : "false"));
    } else {
        error_log("No carId provided, image not linked to any car");
    }
    
    echo json_encode(['success' => true, 'data' => [
        'url' => $publicUrl,
        'filename' => $fileName,
        'carId' => $carId,
        'id' => $imageId,
        'isMain' => isset($_POST['isMain']) && $_POST['isMain'] === 'true'
    ]]);
} catch (Exception $e) {
    error_log("Error in upload.php: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка при загрузке изображения: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
