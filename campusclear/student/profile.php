<?php
$page_title = "My Student Profile";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';

require_role(ROLE_STUDENT);

$student_id = $_SESSION['student_id'];
$pdo = db();

$stmt = $pdo->prepare("
    SELECT s.*, d.name as department_name, d.code as department_code, u.username, u.email as user_email, u.created_at as account_created
    FROM students s
    JOIN users u ON s.user_id = u.id
    JOIN departments d ON s.department_id = d.id
    WHERE s.id = :sid
");
$stmt->execute([':sid' => $student_id]);
$student = $stmt->fetch();
?>

<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-12">
            <h2 class="fw-bold text-dark"><i class="bi bi-person-circle me-2 text-primary"></i> Student Profile</h2>
            <p class="text-muted">Manage your personal and academic information on record.</p>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-4 mb-4">
            <div class="card card-glass text-center p-4">
                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold display-4 shadow-sm" style="width: 100px; height: 100px;">
                    <?= strtoupper(substr($student['full_name'], 0, 1)) ?>
                </div>
                <h4 class="fw-bold mb-1"><?= sanitize($student['full_name']) ?></h4>
                <p class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fs-6 mb-3">Roll No: <?= sanitize($student['roll_number']) ?></p>
                <div class="text-muted small">
                    <p class="mb-1"><i class="bi bi-building me-1"></i> <?= sanitize($student['department_name']) ?></p>
                    <p class="mb-0"><i class="bi bi-calendar-event me-1"></i> Account Active Since <?= format_date($student['account_created']) ?></p>
                </div>
            </div>
        </div>

        <div class="col-lg-8">
            <div class="card card-glass p-4 border-0 shadow-sm">
                <h5 class="fw-bold border-bottom pb-3 mb-4 text-primary"><i class="bi bi-card-heading me-2"></i> Academic & Personal Records</h5>
                <div class="row g-4">
                    <div class="col-md-6">
                        <label class="small text-muted text-uppercase d-block fw-semibold">Full Legal Name</label>
                        <span class="fs-6 fw-bold text-dark"><?= sanitize($student['full_name']) ?></span>
                    </div>
                    <div class="col-md-6">
                        <label class="small text-muted text-uppercase d-block fw-semibold">Roll Number / Student ID</label>
                        <span class="fs-6 fw-bold text-dark"><code><?= sanitize($student['roll_number']) ?></code></span>
                    </div>

                    <div class="col-md-6">
                        <label class="small text-muted text-uppercase d-block fw-semibold">Email Address</label>
                        <span class="fs-6 fw-bold text-dark"><?= sanitize($student['email']) ?></span>
                    </div>
                    <div class="col-md-6">
                        <label class="small text-muted text-uppercase d-block fw-semibold">Contact Phone</label>
                        <span class="fs-6 fw-bold text-dark"><?= sanitize($student['phone'] ?: 'Not Provided') ?></span>
                    </div>

                    <div class="col-md-6">
                        <label class="small text-muted text-uppercase d-block fw-semibold">Department</label>
                        <span class="fs-6 fw-bold text-dark"><?= sanitize($student['department_name']) ?> (<?= sanitize($student['department_code']) ?>)</span>
                    </div>
                    <div class="col-md-6">
                        <label class="small text-muted text-uppercase d-block fw-semibold">Batch</label>
                        <span class="fs-6 fw-bold text-dark"><?= sanitize($student['batch']) ?></span>
                    </div>

                    <div class="col-md-6">
                        <label class="small text-muted text-uppercase d-block fw-semibold">Current Semester</label>
                        <span class="fs-6 fw-bold text-dark">Semester <?= $student['semester'] ?></span>
                    </div>
                    <div class="col-md-6">
                        <label class="small text-muted text-uppercase d-block fw-semibold">Academic Year</label>
                        <span class="fs-6 fw-bold text-dark"><?= sanitize($student['academic_year']) ?></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
