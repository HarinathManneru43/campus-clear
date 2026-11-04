<?php
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/clearance_engine.php';

$token = trim($_GET['token'] ?? '');
$pdo = db();

$result = null;
if (!empty($token)) {
    // Check if token matches a service request or standard certificate token
    $stmt = $pdo->prepare("
        SELECT sr.*, s.full_name as student_name, s.roll_number, s.batch, s.semester, d.name as department_name, sc.name as service_name
        FROM service_requests sr
        JOIN students s ON sr.student_id = s.id
        JOIN departments d ON s.department_id = d.id
        JOIN service_categories sc ON sr.service_id = sc.id
        WHERE sr.qr_token = :t
    ");
    $stmt->execute([':t' => $token]);
    $req = $stmt->fetch();

    if ($req) {
        $clearance = get_student_clearance_summary($req['student_id']);
        $result = [
            'valid' => true,
            'token' => $token,
            'student_name' => $req['student_name'],
            'roll_number' => $req['roll_number'],
            'department' => $req['department_name'],
            'service_name' => $req['service_name'],
            'clearance_status' => $clearance['overall_status'],
            'is_cleared' => $clearance['is_cleared'],
            'issued_date' => format_date($req['created_at'])
        ];
    } else {
        // Fallback search for student by generated token or roll number
        $stu_stmt = $pdo->prepare("
            SELECT s.*, d.name as department_name FROM students s
            JOIN departments d ON s.department_id = d.id
            WHERE CONCAT('CERT-', UPPER(SUBSTRING(MD5(CONCAT('CAMPUSCLEAR_', s.roll_number, '_', DATE_FORMAT(NOW(), '%Y%m%d'))), 1, 16))) = :t
               OR s.roll_number = :t
            LIMIT 1
        ");
        $stu_stmt->execute([':t' => $token]);
        $st = $stu_stmt->fetch();

        if ($st) {
            $clearance = get_student_clearance_summary($st['id']);
            $result = [
                'valid' => true,
                'token' => $token,
                'student_name' => $st['full_name'],
                'roll_number' => $st['roll_number'],
                'department' => $st['department_name'],
                'service_name' => 'General No-Due Digital Clearance Certificate',
                'clearance_status' => $clearance['overall_status'],
                'is_cleared' => $clearance['is_cleared'],
                'issued_date' => date('d M Y')
            ];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= APP_NAME ?> - Digital Certificate Verification</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
    <style>
        body {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .verify-card {
            max-width: 580px;
            width: 100%;
            border-radius: 1.25rem;
            background: rgba(255, 255, 255, 0.98);
        }
    </style>
</head>
<body>

<div class="card verify-card p-4 p-md-5 shadow-2xl border-0">
    <div class="text-center mb-4">
        <a href="<?= BASE_URL ?>" class="text-decoration-none">
            <i class="bi bi-shield-check text-primary display-4 d-block mb-2"></i>
            <h3 class="fw-bold text-dark mb-0"><?= APP_NAME ?> Verification Portal</h3>
        </a>
        <p class="text-muted small">Official Digital Clearance Authenticity System</p>
    </div>

    <?php if ($result && $result['valid']): ?>
        <div class="alert <?= $result['is_cleared'] ? 'alert-success border-success' : 'alert-warning border-warning' ?> p-4 rounded-4 mb-4 text-center">
            <i class="bi <?= $result['is_cleared'] ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-warning' ?> display-4 d-block mb-2"></i>
            <h4 class="fw-bold mb-1">
                <?= $result['is_cleared'] ? 'VERIFIED AUTHENTIC & CLEARED' : 'DOCUMENT VALID - CLEARANCE PENDING' ?>
            </h4>
            <span class="badge bg-white text-dark border rounded-pill px-3 py-1 fw-bold">Token: <?= sanitize($result['token']) ?></span>
        </div>

        <div class="bg-light p-4 rounded-3 mb-4">
            <div class="row g-3">
                <div class="col-6">
                    <span class="small text-muted text-uppercase d-block fw-bold">Student Name</span>
                    <strong class="text-dark fs-6"><?= sanitize($result['student_name']) ?></strong>
                </div>
                <div class="col-6">
                    <span class="small text-muted text-uppercase d-block fw-bold">Roll Number</span>
                    <strong class="text-dark fs-6"><code><?= sanitize($result['roll_number']) ?></code></strong>
                </div>
                <div class="col-6">
                    <span class="small text-muted text-uppercase d-block fw-bold">Department</span>
                    <span class="text-dark"><?= sanitize($result['department']) ?></span>
                </div>
                <div class="col-6">
                    <span class="small text-muted text-uppercase d-block fw-bold">Service / Purpose</span>
                    <span class="text-dark"><?= sanitize($result['service_name']) ?></span>
                </div>
                <div class="col-12 border-top pt-2">
                    <span class="small text-muted text-uppercase d-block fw-bold">Continuous Clearance Result</span>
                    <?= get_status_badge($result['clearance_status']) ?>
                </div>
            </div>
        </div>
    <?php elseif (!empty($token)): ?>
        <div class="alert alert-danger p-4 rounded-4 text-center mb-4">
            <i class="bi bi-x-circle-fill text-danger display-4 d-block mb-2"></i>
            <h4 class="fw-bold mb-1">Invalid or Tampered Certificate Token</h4>
            <p class="mb-0 small">The provided token <code><?= sanitize($token) ?></code> could not be validated in the university database.</p>
        </div>
    <?php endif; ?>

    <!-- Verification Lookup Form -->
    <form method="GET" action="">
        <div class="mb-3">
            <label class="form-label fw-semibold">Enter Certificate Token Code / QR String</label>
            <div class="input-group input-group-lg">
                <input type="text" class="form-control" name="token" placeholder="e.g. TOKEN_PRIYA_PATEL_BONAFIDE_98231" value="<?= sanitize($token) ?>" required>
                <button type="submit" class="btn btn-primary fw-bold">Verify Now</button>
            </div>
        </div>
    </form>

    <div class="text-center mt-4">
        <a href="<?= BASE_URL ?>/index.php" class="small text-secondary text-decoration-none"><i class="bi bi-arrow-left me-1"></i> Return to CampusClear Home</a>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/bootstrap.bundle.min.js"></script>
</body>
</html>
