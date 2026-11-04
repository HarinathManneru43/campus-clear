<?php
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/audit.php';

if (is_logged_in()) {
    redirect(BASE_URL . '/index.php');
}

$pdo = db();

// Fetch active departments for dropdown
$dept_stmt = $pdo->prepare("SELECT id, name, code FROM departments WHERE is_active = 1 ORDER BY name ASC");
$dept_stmt->execute();
$departments = $dept_stmt->fetchAll();

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $roll_number = strtoupper(trim($_POST['roll_number'] ?? ''));
    $full_name = trim($_POST['full_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $department_id = (int)($_POST['department_id'] ?? 0);
    $batch = trim($_POST['batch'] ?? '2023-2027');
    $semester = (int)($_POST['semester'] ?? 1);
    $academic_year = trim($_POST['academic_year'] ?? '2025-2026');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $token = $_POST['csrf_token'] ?? '';

    if (!verify_csrf($token)) {
        $error = 'Invalid security token. Please try again.';
    } elseif (empty($roll_number) || empty($full_name) || empty($email) || empty($password) || $department_id <= 0) {
        $error = 'Please fill in all required fields marked with *.';
    } elseif ($password !== $confirm_password) {
        $error = 'Password and Confirm Password do not match.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters long.';
    } else {
        // Check uniqueness of roll number and email
        $chk_stmt = $pdo->prepare("SELECT id FROM users WHERE username = :roll OR email = :email LIMIT 1");
        $chk_stmt->execute([':roll' => $roll_number, ':email' => $email]);
        if ($chk_stmt->fetch()) {
            $error = 'A user with this Roll Number or Email already exists.';
        } else {
            try {
                $pdo->beginTransaction();

                $pass_hash = password_hash($password, PASSWORD_BCRYPT);
                
                // 1. Insert into users
                $u_stmt = $pdo->prepare("
                    INSERT INTO users (username, password_hash, email, role, status)
                    VALUES (:username, :pass, :email, 'student', 'active')
                ");
                $u_stmt->execute([
                    ':username' => $roll_number,
                    ':pass' => $pass_hash,
                    ':email' => $email
                ]);
                $user_id = $pdo->lastInsertId();

                // 2. Insert into students
                $s_stmt = $pdo->prepare("
                    INSERT INTO students (user_id, roll_number, full_name, email, phone, department_id, batch, semester, academic_year)
                    VALUES (:uid, :roll, :name, :email, :phone, :dept, :batch, :sem, :ayear)
                ");
                $s_stmt->execute([
                    ':uid' => $user_id,
                    ':roll' => $roll_number,
                    ':name' => $full_name,
                    ':email' => $email,
                    ':phone' => $phone,
                    ':dept' => $department_id,
                    ':batch' => $batch,
                    ':sem' => $semester,
                    ':ayear' => $academic_year
                ]);
                $student_id = $pdo->lastInsertId();

                // 3. Initialize default CLEARED status for all active departments
                $cs_stmt = $pdo->prepare("
                    INSERT INTO clearance_status (student_id, department_id, status, remarks, last_updated_by)
                    VALUES (:sid, :did, 'cleared', 'Initial student registration clearance', :uid)
                ");
                foreach ($departments as $dept) {
                    $cs_stmt->execute([
                        ':sid' => $student_id,
                        ':did' => $dept['id'],
                        ':uid' => $user_id
                    ]);
                }

                $pdo->commit();

                log_audit('STUDENT_REGISTRATION', 'STUDENT', $student_id, "New student registered: {$roll_number} - {$full_name}");

                set_flash('success', 'Registration successful! You can now log in with your Roll Number and Password.');
                redirect(BASE_URL . '/auth/login.php');

            } catch (\PDOException $e) {
                $pdo->rollBack();
                $error = 'Registration failed: ' . $e->getMessage();
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= APP_NAME ?> - Student Registration</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
    <style>
        body {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            padding: 40px 0;
        }
        .reg-card {
            max-width: 680px;
            border-radius: 1.25rem;
            background: rgba(255, 255, 255, 0.98);
        }
    </style>
</head>
<body>

<div class="container">
    <div class="card reg-card mx-auto p-4 p-md-5 shadow-2xl border-0">
        <div class="text-center mb-4">
            <a href="<?= BASE_URL ?>/index.php" class="text-decoration-none">
                <i class="bi bi-shield-check text-primary display-4 d-block mb-2"></i>
                <h3 class="fw-bold text-dark mb-0">Student Account Registration</h3>
            </a>
            <p class="text-muted small">CampusClear Continuous Clearance System</p>
        </div>

        <?php if (!empty($error)): ?>
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> <?= sanitize($error) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        <?php endif; ?>

        <form method="POST" action="">
            <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">

            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Roll Number / Student ID <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" name="roll_number" placeholder="e.g. TU6241103111002" required value="<?= sanitize($_POST['roll_number'] ?? '') ?>">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Full Name <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" name="full_name" placeholder="Full legal name" required value="<?= sanitize($_POST['full_name'] ?? '') ?>">
                </div>

                <div class="col-md-6">
                    <label class="form-label fw-semibold">Email Address <span class="text-danger">*</span></label>
                    <input type="email" class="form-control" name="email" placeholder="student@university.edu" required value="<?= sanitize($_POST['email'] ?? '') ?>">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Phone Number</label>
                    <input type="tel" class="form-control" name="phone" placeholder="Mobile number" value="<?= sanitize($_POST['phone'] ?? '') ?>">
                </div>

                <div class="col-md-6">
                    <label class="form-label fw-semibold">Academic Department <span class="text-danger">*</span></label>
                    <select class="form-select" name="department_id" required>
                        <option value="">Select Department...</option>
                        <?php foreach ($departments as $d): ?>
                            <option value="<?= $d['id'] ?>" <?= isset($_POST['department_id']) && $_POST['department_id'] == $d['id'] ? 'selected' : '' ?>>
                                <?= sanitize($d['name']) ?> (<?= sanitize($d['code']) ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Batch</label>
                    <input type="text" class="form-control" name="batch" value="<?= sanitize($_POST['batch'] ?? '2023-2027') ?>" placeholder="e.g. 2023-2027">
                </div>

                <div class="col-md-6">
                    <label class="form-label fw-semibold">Current Semester</label>
                    <select class="form-select" name="semester">
                        <?php for ($i = 1; $i <= 8; $i++): ?>
                            <option value="<?= $i ?>" <?= isset($_POST['semester']) && $_POST['semester'] == $i ? 'selected' : ($i == 6 ? 'selected' : '') ?>>Semester <?= $i ?></option>
                        <?php endfor; ?>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Academic Year</label>
                    <input type="text" class="form-control" name="academic_year" value="<?= sanitize($_POST['academic_year'] ?? '2025-2026') ?>">
                </div>

                <div class="col-md-6">
                    <label class="form-label fw-semibold">Password <span class="text-danger">*</span></label>
                    <input type="password" class="form-control" name="password" required placeholder="At least 6 characters">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Confirm Password <span class="text-danger">*</span></label>
                    <input type="password" class="form-control" name="confirm_password" required placeholder="Repeat password">
                </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm mt-4">
                <i class="bi bi-person-check me-2"></i> Register Student Account
            </button>
        </form>

        <div class="text-center pt-3 border-top mt-4">
            <span class="small text-muted">Already registered? </span>
            <a href="<?= BASE_URL ?>/auth/login.php" class="fw-bold text-primary text-decoration-none">Login Here</a>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/bootstrap.bundle.min.js"></script>
</body>
</html>
