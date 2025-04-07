
<?php
require_once 'config.php';

try {
    // Читаем SQL файл
    $sql = file_get_contents('create_tables.sql');

    // Выполняем запросы
    $pdo->exec($sql);
    
    echo json_encode([
        'success' => true, 
        'message' => 'База данных успешно настроена. Таблицы созданы или уже существуют.'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка при настройке базы данных: ' . $e->getMessage()
    ]);
}
?>
