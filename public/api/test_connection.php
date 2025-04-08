
<?php
require_once 'config.php';

// This file has been disabled as per client request
header('Content-Type: application/json');
echo json_encode([
  'success' => false,
  'message' => 'Функция отключена администратором'
]);
exit;
?>
