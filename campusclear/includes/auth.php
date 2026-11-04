<?php
// Session Authentication & Role-Based Access Control (RBAC)

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/db.php';

/**
 * Check if user is logged in
 */
function is_logged_in() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Require login, redirect to login page if unauthenticated
 */
function require_login() {
    if (!is_logged_in()) {
        $_SESSION['redirect_after_login'] = $_SERVER['REQUEST_URI'];
        header("Location: " . BASE_URL . "/auth/login.php");
        exit;
    }
}

/**
 * Require specific user role
 */
function require_role($allowed_roles) {
    require_login();
    if (!is_array($allowed_roles)) {
        $allowed_roles = [$allowed_roles];
    }
    
    $user_role = $_SESSION['user_role'] ?? '';
    if (!in_array($user_role, $allowed_roles)) {
        http_response_code(403);
        die("<div style='font-family:sans-serif; text-align:center; padding:50px;'>
                <h1 style='color:#dc3545;'>403 - Access Denied</h1>
                <p>You do not have permission to view this page.</p>
                <a href='" . BASE_URL . "/index.php'>Return to Dashboard</a>
             </div>");
    }
}

/**
 * Get current logged in user metadata
 */
function current_user() {
    if (!is_logged_in()) return null;
    
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'] ?? '',
        'email' => $_SESSION['email'] ?? '',
        'role' => $_SESSION['user_role'] ?? '',
        'full_name' => $_SESSION['full_name'] ?? $_SESSION['username'],
        'department_id' => $_SESSION['department_id'] ?? null,
        'student_id' => $_SESSION['student_id'] ?? null,
        'staff_id' => $_SESSION['staff_id'] ?? null,
    ];
}
