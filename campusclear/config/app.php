<?php
// Main Application Setup & Session Management

if (!ob_get_level()) {
    ob_start();
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/constants.php';
require_once __DIR__ . '/database.php';

// Calculate Base URL dynamically for portable deployment (XAMPP subfolders or root)
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$script_name = $_SERVER['SCRIPT_NAME'] ?? '';

$base_folder = '';
if (preg_match('#^(.*?/campusclear)(?:/|$)#i', $script_name, $m)) {
    $base_folder = $m[1];
}

define('BASE_URL', rtrim($protocol . '://' . $host . $base_folder, '/'));
define('SITE_URL', BASE_URL);

// Timezone setup
date_default_timezone_set('Asia/Kolkata');
