<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

$roll_number = trim($_GET['roll_number'] ?? '');
if (empty($roll_number)) {
    echo json_encode(['status' => 'error', 'message' => 'roll_number parameter is required']);
    exit;
}

$pdo = db();
$stmt = $pdo->prepare("SELECT id, full_name, roll_number FROM students WHERE roll_number = :roll");
$stmt->execute([':roll' => $roll_number]);
$student = $stmt->fetch();

if (!$student) {
    echo json_encode(['status' => 'error', 'message' => 'Student not found']);
    exit;
}

$summary = get_student_clearance_summary($student['id']);

echo json_encode([
    'status' => 'success',
    'student' => [
        'id' => $student['id'],
        'full_name' => $student['full_name'],
        'roll_number' => $student['roll_number']
    ],
    'clearance' => $summary
], JSON_PRETTY_PRINT);
