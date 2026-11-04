<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

if (!is_logged_in() || !in_array($_SESSION['user_role'], [ROLE_STAFF, ROLE_ADMIN])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$student_id = (int)($input['student_id'] ?? 0);
$department_id = (int)($input['department_id'] ?? ($_SESSION['department_id'] ?? 0));
$new_status = trim($input['status'] ?? 'cleared');
$remarks = trim($input['remarks'] ?? '');

if ($student_id <= 0 || $department_id <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid parameters']);
    exit;
}

$summary = update_department_clearance($student_id, $department_id, $new_status, $remarks, $_SESSION['user_id']);

echo json_encode([
    'status' => 'success',
    'message' => 'Clearance status updated successfully',
    'clearance_summary' => $summary
]);
