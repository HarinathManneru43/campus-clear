<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';

if (!is_logged_in()) {
    echo json_encode(['unread_count' => 0]);
    exit;
}

$pdo = db();
$stmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = :uid AND is_read = 0");
$stmt->execute([':uid' => $_SESSION['user_id']]);
$count = (int)$stmt->fetchColumn();

echo json_encode(['unread_count' => $count]);
