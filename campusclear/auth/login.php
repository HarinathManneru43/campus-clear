<?php
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/audit.php';

// If already logged in, redirect
if (is_logged_in()) {
    $role = $_SESSION['user_role'];
    if ($role === ROLE_STUDENT) redirect(BASE_URL . '/student/dashboard.php');
    if ($role === ROLE_STAFF) redirect(BASE_URL . '/staff/dashboard.php');
    if ($role === ROLE_ADMIN) redirect(BASE_URL . '/admin/dashboard.php');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username_email = trim($_POST['username_email'] ?? '');
    $password = $_POST['password'] ?? '';
    $token = $_POST['csrf_token'] ?? '';

    if (!verify_csrf($token)) {
        $error = 'Invalid security token. Please try again.';
    } elseif (empty($username_email) || empty($password)) {
        $error = 'Please enter both Username/Email and Password.';
    } else {
        $pdo = db();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE (username = :u OR email = :e) AND status = 'active' LIMIT 1");
        $stmt->execute([':u' => $username_email, ':e' => $username_email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            // Regeneration of session ID for session fixation protection
            session_regenerate_id(true);
            
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['user_role'] = $user['role'];

            // Fetch extra profile data based on role
            if ($user['role'] === ROLE_STUDENT) {
                $st_stmt = $pdo->prepare("SELECT id, full_name, department_id, roll_number FROM students WHERE user_id = :uid");
                $st_stmt->execute([':uid' => $user['id']]);
                $student = $st_stmt->fetch();
                if ($student) {
                    $_SESSION['student_id'] = $student['id'];
                    $_SESSION['full_name'] = $student['full_name'];
                    $_SESSION['department_id'] = $student['department_id'];
                    $_SESSION['roll_number'] = $student['roll_number'];
                }
                log_audit('LOGIN_SUCCESS', 'USER', $user['id'], 'Student Login Successful');
                redirect(BASE_URL . '/student/dashboard.php');

            } elseif ($user['role'] === ROLE_STAFF) {
                $sf_stmt = $pdo->prepare("SELECT id, full_name, department_id, designation FROM staff WHERE user_id = :uid");
                $sf_stmt->execute([':uid' => $user['id']]);
                $staff = $sf_stmt->fetch();
                if ($staff) {
                    $_SESSION['staff_id'] = $staff['id'];
                    $_SESSION['full_name'] = $staff['full_name'];
                    $_SESSION['department_id'] = $staff['department_id'];
                    $_SESSION['designation'] = $staff['designation'];
                }
                log_audit('LOGIN_SUCCESS', 'USER', $user['id'], 'Staff Login Successful');
                redirect(BASE_URL . '/staff/dashboard.php');

            } elseif ($user['role'] === ROLE_ADMIN) {
                $_SESSION['full_name'] = 'System Administrator';
                log_audit('LOGIN_SUCCESS', 'USER', $user['id'], 'Admin Login Successful');
                redirect(BASE_URL . '/admin/dashboard.php');
            }
        } else {
            $error = 'Invalid credentials or inactive user account.';
            log_audit('LOGIN_FAILED', 'USER', null, "Failed login attempt for: {$username_email}");
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= APP_NAME ?> - User Authentication</title>
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
        }
        .login-card {
            width: 100%;
            max-width: 440px;
            border-radius: 1.25rem;
            box-shadow: 0 20px 30px -10px rgba(0,0,0,0.5);
            background: rgba(255, 255, 255, 0.98);
        }
    </style>
</head>
<body>

<div class="container p-3">
    <div class="login-card mx-auto p-4 p-md-5">
        <div class="text-center mb-4">
            <a href="<?= BASE_URL ?>/index.php" class="text-decoration-none">
                <i class="bi bi-shield-check text-primary display-4 d-block mb-2"></i>
                <h3 class="fw-bold text-dark mb-0"><?= APP_NAME ?></h3>
            </a>
            <p class="text-muted small">Centralized Clearance Portal</p>
        </div>

        <?php if (!empty($error)): ?>
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> <?= sanitize($error) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        <?php endif; ?>

        <?php render_flash(); ?>

        <!-- Quick 1-Click Demo Accounts -->
        <div class="mb-4 p-3 bg-light rounded-3 border">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-xs fw-bold text-uppercase text-secondary" style="font-size:0.75rem;">
                    <i class="bi bi-key-fill text-warning me-1"></i> Quick Demo Logins
                </span>
                <span class="badge bg-secondary-subtle text-secondary" style="font-size:0.65rem;">Click to Fill</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
                <button type="button" class="btn btn-sm btn-outline-danger rounded-pill fw-semibold py-1 px-2" style="font-size:0.75rem;" onclick="fillDemo('admin', 'Admin@123')">
                    <i class="bi bi-shield-lock me-1"></i> Admin
                </button>
                <button type="button" class="btn btn-sm btn-outline-primary rounded-pill fw-semibold py-1 px-2" style="font-size:0.75rem;" onclick="fillDemo('staff_lib', 'Staff@123')">
                    <i class="bi bi-book me-1"></i> Staff (Lib)
                </button>
                <button type="button" class="btn btn-sm btn-outline-info rounded-pill fw-semibold py-1 px-2" style="font-size:0.75rem;" onclick="fillDemo('staff_acc', 'Staff@123')">
                    <i class="bi bi-cash-coin me-1"></i> Staff (Acc)
                </button>
                <button type="button" class="btn btn-sm btn-outline-success rounded-pill fw-semibold py-1 px-2" style="font-size:0.75rem;" onclick="fillDemo('TU6241103111002', 'Student@123')">
                    <i class="bi bi-mortarboard me-1"></i> Student
                </button>
            </div>
        </div>

        <form method="POST" action="">
            <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">

            <div class="mb-3">
                <label for="username_email" class="form-label fw-semibold">Username / Roll Number / Email</label>
                <div class="input-group">
                    <span class="input-group-text bg-light"><i class="bi bi-person text-secondary"></i></span>
                    <input type="text" class="form-control" id="username_email" name="username_email" placeholder="e.g. TU6241103111088 or admin" required autofocus>
                </div>
            </div>

            <div class="mb-4">
                <label for="password" class="form-label fw-semibold">Password</label>
                <div class="input-group">
                    <span class="input-group-text bg-light"><i class="bi bi-lock text-secondary"></i></span>
                    <input type="password" class="form-control" id="password" name="password" placeholder="Enter password" required>
                </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm mb-3">
                <i class="bi bi-box-arrow-in-right me-2"></i> Secure Login
            </button>
        </form>

        <div class="text-center pt-3 border-top">
            <p class="small text-muted mb-1">Are you a new student?</p>
            <a href="<?= BASE_URL ?>/auth/register.php" class="fw-bold text-primary text-decoration-none">Register New Student Account</a>
        </div>

        <div class="text-center mt-3">
            <a href="<?= BASE_URL ?>/index.php" class="small text-secondary text-decoration-none"><i class="bi bi-arrow-left me-1"></i> Back to Homepage</a>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/bootstrap.bundle.min.js"></script>
<script>
function fillDemo(username, password) {
    document.getElementById('username_email').value = username;
    document.getElementById('password').value = password;
}
</script>
</body>
</html>
