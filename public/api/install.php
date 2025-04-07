
<?php
require_once 'config.php';

// Явно указываем заголовок Content-Type для JSON
header('Content-Type: application/json');

try {
    // Читаем SQL файл
    $sql = file_get_contents('create_tables.sql');

    // Выполняем запросы
    $pdo->exec($sql);
    
    echo json_encode([
        'success' => true, 
        'message' => 'База данных успешно настроена. Таблицы созданы или уже существуют.'
    ]);
    exit;
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка при настройке базы данных: ' . $e->getMessage()
    ]);
    exit;
}
?>
