
<?php
require_once '../config.php';

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

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
    
    echo json_encode(['success' => false, 'message' => $errorMessage]);
    exit;
}

try {
    // Проверяем тип файла
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $fileType = $_FILES['image']['type'];
    
    if (!in_array($fileType, $allowedTypes)) {
        echo json_encode(['success' => false, 'message' => 'Недопустимый тип файла. Разрешены только JPEG, PNG, GIF и WebP']);
        exit;
    }
    
    // Создаем директорию для загрузки изображений, если она не существует
    $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/uploads/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    // Генерируем уникальное имя файла
    $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
    $filePath = $uploadDir . $fileName;
    
    // Перемещаем загруженный файл
    if (!move_uploaded_file($_FILES['image']['tmp_name'], $filePath)) {
        echo json_encode(['success' => false, 'message' => 'Не удалось сохранить файл']);
        exit;
    }
    
    // Формируем URL изображения
    $publicUrl = '/uploads/' . $fileName;
    
    // Получаем идентификатор автомобиля, если он задан
    $carId = isset($_POST['carId']) ? $_POST['carId'] : null;
    
    // Если задан идентификатор автомобиля, то добавляем изображение в базу данных
    if ($carId) {
        $stmt = $pdo->prepare('
            INSERT INTO car_images (id, carId, url, alt, isMain) 
            VALUES (?, ?, ?, ?, ?)
        ');
        
        $imageId = generateUUID();
        $isMain = isset($_POST['isMain']) && $_POST['isMain'] === 'true';
        
        // Если это главное изображение, сначала сбросим флаг isMain у всех изображений этого автомобиля
        if ($isMain) {
            $resetStmt = $pdo->prepare('UPDATE car_images SET isMain = 0 WHERE carId = ?');
            $resetStmt->execute([$carId]);
        }
        
        $stmt->execute([
            $imageId,
            $carId,
            $publicUrl,
            isset($_POST['alt']) ? $_POST['alt'] : "Изображение автомобиля",
            $isMain ? 1 : 0
        ]);
    }
    
    echo json_encode(['success' => true, 'data' => [
        'url' => $publicUrl,
        'filename' => $fileName,
        'carId' => $carId,
        'id' => $imageId ?? null
    ]]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Ошибка при загрузке изображения: ' . $e->getMessage()]);
}
?>
