<?php
// Helper Utilities & Formatting Functions

require_once __DIR__ . '/../config/app.php';

/**
 * Sanitize string for HTML output
 */
function sanitize($data) {
    return htmlspecialchars(trim((string)$data), ENT_QUOTES, 'UTF-8');
}

/**
 * Generate CSRF Token
 */
function csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF Token
 */
function verify_csrf($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Set flash message
 */
function set_flash($type, $message) {
    $_SESSION['flash_message'] = [
        'type' => $type, // success, danger, warning, info
        'message' => $message
    ];
}

/**
 * Render flash message
 */
function render_flash() {
    if (isset($_SESSION['flash_message'])) {
        $flash = $_SESSION['flash_message'];
        unset($_SESSION['flash_message']);
        $type = sanitize($flash['type']);
        $msg = sanitize($flash['message']);
        echo "<div class='alert alert-{$type} alert-dismissible fade show shadow-sm' role='alert'>
                {$msg}
                <button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>
              </div>";
    }
}

/**
 * Redirect utility
 */
function redirect($url) {
    header("Location: " . $url);
    exit;
}

/**
 * Format currency
 */
function format_currency($amount) {
    return '₹' . number_format((float)$amount, 2);
}

/**
 * Format date nicely
 */
function format_date($date_string) {
    if (!$date_string) return 'N/A';
    return date('d M Y, h:i A', strtotime($date_string));
}

/**
 * Status Badge HTML generator
 */
function get_status_badge($status) {
    $status_clean = strtolower(trim((string)$status));
    switch ($status_clean) {
        case 'cleared':
        case 'approved':
        case 'resolved':
        case 'active':
            return '<span class="badge bg-success-subtle text-success px-3 py-2 border border-success-subtle rounded-pill fw-semibold"><i class="bi bi-check-circle-fill me-1"></i> ' . strtoupper($status) . '</span>';
        case 'pending':
        case 'submitted':
        case 'in_progress':
        case 'open':
        case 'under_review':
            return '<span class="badge bg-warning-subtle text-warning-emphasis px-3 py-2 border border-warning-subtle rounded-pill fw-semibold"><i class="bi bi-clock-history me-1"></i> ' . strtoupper(str_replace('_', ' ', $status)) . '</span>';
        case 'blocked':
        case 'rejected':
        case 'cancelled':
        case 'inactive':
            return '<span class="badge bg-danger-subtle text-danger px-3 py-2 border border-danger-subtle rounded-pill fw-semibold"><i class="bi bi-exclamation-triangle-fill me-1"></i> ' . strtoupper($status) . '</span>';
        case 'waived':
            return '<span class="badge bg-info-subtle text-info px-3 py-2 border border-info-subtle rounded-pill fw-semibold"><i class="bi bi-shield-check me-1"></i> WAIVED</span>';
        default:
            return '<span class="badge bg-secondary px-3 py-2 rounded-pill">' . strtoupper($status) . '</span>';
    }
}
