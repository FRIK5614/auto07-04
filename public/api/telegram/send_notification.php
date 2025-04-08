
<?php
require_once '../config.php';

// Function to send Telegram message
function sendTelegramMessage($botToken, $chatId, $message) {
    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
    
    $params = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    curl_close($ch);
    
    return [
        'success' => ($httpCode === 200),
        'response' => json_decode($response, true)
    ];
}

// Function to notify admins about new order
function notifyAdminsAboutNewOrder($orderId) {
    global $pdo;
    
    try {
        // Get bot token from settings
        $stmt = $pdo->prepare('SELECT setting_value FROM site_settings WHERE setting_key = ?');
        $stmt->execute(['telegram_bot_token']);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $botToken = $result ? $result['setting_value'] : null;
        
        if (!$botToken) {
            return [
                'success' => false,
                'message' => 'Токен бота не найден в настройках'
            ];
        }
        
        // Get admin usernames from settings
        $stmt = $pdo->prepare('SELECT setting_value FROM site_settings WHERE setting_key = ?');
        $stmt->execute(['telegram_admin_usernames']);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $adminUsernames = $result ? $result['setting_value'] : '';
        
        if (empty($adminUsernames)) {
            return [
                'success' => false,
                'message' => 'Список администраторов пуст'
            ];
        }
        
        // Get order details
        $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
        $stmt->execute([$orderId]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$order) {
            return [
                'success' => false,
                'message' => 'Заказ не найден'
            ];
        }
        
        // Get car details
        $carId = $order['carId'];
        $carDetails = [];
        
        if ($carId) {
            $stmt = $pdo->prepare('SELECT brand, model, year FROM cars WHERE id = ?');
            $stmt->execute([$carId]);
            $carDetails = $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        // Format message
        $message = "🔔 <b>Новый заказ #{$order['id']}</b>\n\n";
        
        if (!empty($carDetails)) {
            $message .= "🚗 <b>Автомобиль:</b> {$carDetails['brand']} {$carDetails['model']} {$carDetails['year']}\n\n";
        }
        
        $message .= "<b>Клиент:</b> {$order['name']}\n";
        $message .= "<b>Телефон:</b> {$order['phone']}\n";
        
        if (!empty($order['email'])) {
            $message .= "<b>Email:</b> {$order['email']}\n";
        }
        
        if (!empty($order['message'])) {
            $message .= "\n<b>Сообщение:</b>\n{$order['message']}\n";
        }
        
        $message .= "\n<b>Дата заказа:</b> " . date('d.m.Y H:i', strtotime($order['createdAt']));
        $message .= "\n\n<i>Для управления заказами перейдите в панель администратора.</i>";
        
        // Send notification to each admin
        $admins = array_map('trim', explode(',', $adminUsernames));
        $results = [];
        
        foreach ($admins as $admin) {
            if (empty($admin)) continue;
            
            $result = sendTelegramMessage($botToken, '@' . $admin, $message);
            $results[$admin] = $result;
        }
        
        return [
            'success' => true,
            'results' => $results
        ];
        
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => 'Ошибка базы данных: ' . $e->getMessage()
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Произошла ошибка: ' . $e->getMessage()
        ];
    }
}

// This file can be included in create_order.php to send notifications
?>
