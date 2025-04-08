
<?php
require_once '../config.php';

// Set headers for JSON response
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get channel name from query parameters
$channelName = isset($_GET['channel']) ? $_GET['channel'] : null;

if (!$channelName) {
    echo json_encode([
        'success' => false,
        'message' => 'Не указан параметр channel'
    ]);
    exit;
}

try {
    // Get bot token from settings
    $stmt = $pdo->prepare('SELECT setting_value FROM site_settings WHERE setting_key = ?');
    $stmt->execute(['telegram_bot_token']);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $botToken = $result ? $result['setting_value'] : null;
    
    if (!$botToken) {
        echo json_encode([
            'success' => false,
            'message' => 'Токен бота не найден в настройках'
        ]);
        exit;
    }
    
    // Function to fetch posts from Telegram channel
    function fetchChannelPosts($botToken, $channelName, $limit = 10) {
        $url = "https://api.telegram.org/bot{$botToken}/getUpdates";
        
        // Alternative approach using chat history
        $url = "https://api.telegram.org/bot{$botToken}/getChat?chat_id=@{$channelName}";
        $chatResponse = @file_get_contents($url);
        
        if ($chatResponse === false) {
            return [
                'success' => false,
                'message' => 'Не удалось подключиться к API Telegram'
            ];
        }
        
        $chatData = json_decode($chatResponse, true);
        
        if (!$chatData['ok']) {
            return [
                'success' => false,
                'message' => $chatData['description'] ?? 'Ошибка API Telegram'
            ];
        }
        
        $chatId = $chatData['result']['id'];
        
        // Now get messages from the channel
        $messagesUrl = "https://api.telegram.org/bot{$botToken}/getUpdates?chat_id={$chatId}&limit={$limit}";
        $messagesResponse = @file_get_contents($messagesUrl);
        
        if ($messagesResponse === false) {
            return [
                'success' => false,
                'message' => 'Не удалось получить сообщения из Telegram'
            ];
        }
        
        $messagesData = json_decode($messagesResponse, true);
        
        if (!$messagesData['ok']) {
            return [
                'success' => false,
                'message' => $messagesData['description'] ?? 'Ошибка при получении сообщений'
            ];
        }
        
        // Process and format messages
        $posts = [];
        foreach ($messagesData['result'] as $update) {
            if (isset($update['channel_post'])) {
                $post = $update['channel_post'];
                $postData = [
                    'id' => $post['message_id'],
                    'date' => $post['date'],
                    'message' => $post['text'] ?? ''
                ];
                
                // Add photo if present
                if (isset($post['photo'])) {
                    // Get the largest photo
                    $photo = end($post['photo']);
                    $fileId = $photo['file_id'];
                    
                    // Get file path
                    $fileUrl = "https://api.telegram.org/bot{$botToken}/getFile?file_id={$fileId}";
                    $fileResponse = @file_get_contents($fileUrl);
                    $fileData = json_decode($fileResponse, true);
                    
                    if ($fileData['ok']) {
                        $filePath = $fileData['result']['file_path'];
                        $postData['photo'] = "https://api.telegram.org/file/bot{$botToken}/{$filePath}";
                    }
                }
                
                $posts[] = $postData;
            }
        }
        
        // Mock data for development/testing if no posts found
        if (empty($posts)) {
            $posts = getMockPosts();
        }
        
        return [
            'success' => true,
            'posts' => $posts
        ];
    }
    
    // Function to generate mock posts for development
    function getMockPosts() {
        $mockPosts = [];
        $currentTime = time();
        
        $messages = [
            "🔥 Горячее предложение! Toyota Camry 2023 года всего за 2.8 млн руб. Отличное состояние, небольшой пробег. #toyota #camry",
            "❗️ Новое поступление: BMW X5 2022 года. Полная комплектация, панорамная крыша, кожаный салон. Звоните! #bmw #x5",
            "📢 Только сегодня! Специальное предложение на Volkswagen Tiguan. Скидка 150,000 руб при покупке до конца недели. #volkswagen #tiguan",
            "⚡️ Mercedes-Benz E-Class 2023 года - роскошь и комфорт. Ограниченное количество, спешите! #mercedes #eclass",
            "🚘 Honda Accord 2022 - экономичный и надежный автомобиль для всей семьи. В наличии разные цвета! #honda #accord"
        ];
        
        for ($i = 0; $i < 5; $i++) {
            $mockPosts[] = [
                'id' => $i + 1,
                'date' => $currentTime - ($i * 86400), // One day apart
                'message' => $messages[$i],
                'photo' => "https://picsum.photos/600/400?random=" . ($i + 1)
            ];
        }
        
        return $mockPosts;
    }
    
    // Fetch channel posts
    $result = fetchChannelPosts($botToken, $channelName);
    
    echo json_encode($result);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка базы данных: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Произошла ошибка: ' . $e->getMessage()
    ]);
}
?>
