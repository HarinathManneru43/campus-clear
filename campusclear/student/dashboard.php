<?php
$page_title = "Student Clearance Dashboard";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

require_role(ROLE_STUDENT);

$student_id = $_SESSION['student_id'];
$pdo = db();

// Fetch student full profile
$stu_stmt = $pdo->prepare("
    SELECT s.*, d.name as department_name, d.code as department_code
    FROM students s
    JOIN departments d ON s.department_id = d.id
    WHERE s.id = :sid
");
$stu_stmt->execute([':sid' => $student_id]);
$student = $stu_stmt->fetch();

// Compute continuous clearance
$clearance = get_student_clearance_summary($student_id);

// Fetch pending dues
$dues_stmt = $pdo->prepare("
    SELECT du.*, d.name as department_name
    FROM dues du
    JOIN departments d ON du.department_id = d.id
    WHERE du.student_id = :sid AND du.status = 'pending'
    ORDER BY du.created_at DESC
");
$dues_stmt->execute([':sid' => $student_id]);
$pending_dues = $dues_stmt->fetchAll();

// Fetch recent service requests
$req_stmt = $pdo->prepare("
    SELECT sr.*, sc.name as service_name
    FROM service_requests sr
    JOIN service_categories sc ON sr.service_id = sc.id
    WHERE sr.student_id = :sid
    ORDER BY sr.created_at DESC LIMIT 5
");
$req_stmt->execute([':sid' => $student_id]);
$recent_requests = $req_stmt->fetchAll();
?>

<div class="container-fluid">
    <!-- Welcome Header -->
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark mb-1">Welcome back, <?= sanitize($student['full_name']) ?>! 👋</h2>
            <p class="text-muted mb-0">Roll No: <strong><?= sanitize($student['roll_number']) ?></strong> | Department: <strong><?= sanitize($student['department_name']) ?></strong> | Semester <?= $student['semester'] ?></p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <?php if ($clearance['is_cleared']): ?>
                <a href="<?= BASE_URL ?>/student/certificate.php" class="btn btn-success rounded-pill px-4 py-2 shadow-sm fw-bold">
                    <i class="bi bi-award me-2"></i> Download Digital Clearance Cert
                </a>
            <?php else: ?>
                <a href="<?= BASE_URL ?>/student/dues.php" class="btn btn-warning rounded-pill px-4 py-2 shadow-sm fw-bold">
                    <i class="bi bi-exclamation-triangle me-2"></i> Resolve Pending Dues
                </a>
            <?php endif; ?>
        </div>
    </div>

    <!-- Overall Clearance Hero Status Card -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card card-glass overflow-hidden border-0 shadow-lg">
                <div class="card-body p-4 p-md-5 <?= $clearance['is_cleared'] ? 'bg-gradient-success' : 'bg-gradient-warning' ?> text-white">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <span class="badge bg-white text-dark px-3 py-2 rounded-pill fw-bold text-uppercase mb-2 shadow-sm">Continuous Clearance Monitor</span>
                            <h1 class="display-5 fw-extrabold mb-2 text-white">
                                Overall Status: <?= $clearance['overall_status'] ?>
                            </h1>
                            <p class="fs-5 opacity-90 mb-0">
                                <?php if ($clearance['is_cleared']): ?>
                                    <i class="bi bi-check-circle-fill me-2"></i> All <?= $clearance['total_departments'] ?> departments have approved your clearance. You are eligible for all college services & exams.
                                <?php else: ?>
                                    <i class="bi bi-exclamation-octagon-fill me-2"></i> You have pending clearances or dues in <?= $clearance['pending_count'] ?> department(s). Please review details below.
                                <?php endif; ?>
                            </p>
                        </div>
                        <div class="col-md-4 text-center text-md-end mt-4 mt-md-0">
                            <div class="d-inline-block bg-white text-dark p-4 rounded-4 shadow-lg text-center" style="min-width: 180px;">
                                <div class="display-4 fw-bold text-primary"><?= $clearance['cleared_count'] ?> / <?= $clearance['total_departments'] ?></div>
                                <span class="small fw-semibold text-muted text-uppercase">Departments Cleared</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Department-wise Live Status Breakdown -->
    <div class="row mb-4">
        <div class="col-lg-8 mb-4 mb-lg-0">
            <div class="card card-glass border-0 shadow-sm h-100">
                <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-building me-2 text-primary"></i> Department Clearance Status</h5>
                    <a href="<?= BASE_URL ?>/student/clearance_status.php" class="btn btn-sm btn-outline-primary rounded-pill">View Detailed History</a>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Pending Dues</th>
                                    <th>Remarks / Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($clearance['department_details'] as $dept): ?>
                                    <tr>
                                        <td class="fw-bold">
                                            <?= sanitize($dept['name']) ?>
                                            <small class="text-muted d-block"><?= sanitize($dept['code']) ?></small>
                                        </td>
                                        <td><?= get_status_badge($dept['effective_status']) ?></td>
                                        <td>
                                            <?php if ($dept['pending_dues_count'] > 0): ?>
                                                <span class="badge bg-danger rounded-pill"><?= $dept['pending_dues_count'] ?> Due(s)</span>
                                                <small class="text-muted d-block"><?= format_currency($dept['total_due_amount']) ?></small>
                                            <?php else: ?>
                                                <span class="text-success small fw-semibold"><i class="bi bi-check-lg"></i> Nil</span>
                                            <?php endif; ?>
                                        </td>
                                        <td class="small text-muted">
                                            <?= sanitize($dept['remarks']) ?>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pending Dues Card -->
        <div class="col-lg-4">
            <div class="card card-glass border-0 shadow-sm h-100">
                <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-receipt me-2 text-danger"></i> Active Dues</h5>
                    <span class="badge bg-danger rounded-pill"><?= count($pending_dues) ?></span>
                </div>
                <div class="card-body p-3">
                    <?php if (empty($pending_dues)): ?>
                        <div class="text-center py-4 text-muted">
                            <i class="bi bi-check-circle text-success display-4 d-block mb-2"></i>
                            <p class="mb-0">No pending dues found! You're completely clear.</p>
                        </div>
                    <?php else: ?>
                        <?php foreach ($pending_dues as $due): ?>
                            <div class="p-3 bg-light rounded-3 mb-3 border border-danger-subtle">
                                <div class="d-flex justify-content-between align-items-start mb-1">
                                    <h6 class="fw-bold mb-0 text-dark"><?= sanitize($due['title']) ?></h6>
                                    <span class="fw-bold text-danger"><?= format_currency($due['amount']) ?></span>
                                </div>
                                <p class="small text-muted mb-2"><?= sanitize($due['description']) ?></p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="badge bg-secondary-subtle text-secondary small"><?= sanitize($due['department_name']) ?></span>
                                    <a href="<?= BASE_URL ?>/student/dues.php" class="btn btn-sm btn-outline-danger py-0 px-2 rounded-2 small">Raise Dispute</a>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Active Service Requests Section -->
    <div class="row">
        <div class="col-12">
            <div class="card card-glass border-0 shadow-sm">
                <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-file-earmark-text me-2 text-info"></i> Recent Service Requests</h5>
                    <a href="<?= BASE_URL ?>/student/new_request.php" class="btn btn-primary btn-sm rounded-pill"><i class="bi bi-plus-lg me-1"></i> Submit New Request</a>
                </div>
                <div class="card-body p-0">
                    <?php if (empty($recent_requests)): ?>
                        <div class="text-center py-4 text-muted">
                            <p class="mb-0">No service requests submitted yet.</p>
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Request No</th>
                                        <th>Service Category</th>
                                        <th>Purpose</th>
                                        <th>Clearance Snapshot</th>
                                        <th>Status</th>
                                        <th>Submitted On</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($recent_requests as $req): ?>
                                        <tr>
                                            <td class="fw-bold"><code><?= sanitize($req['request_number']) ?></code></td>
                                            <td><?= sanitize($req['service_name']) ?></td>
                                            <td class="small text-muted"><?= sanitize($req['purpose']) ?></td>
                                            <td>
                                                <span class="badge <?= $req['clearance_snapshot'] === 'cleared' ? 'bg-success' : 'bg-warning text-dark' ?>">
                                                    <?= strtoupper($req['clearance_snapshot']) ?>
                                                </span>
                                            </td>
                                            <td><?= get_status_badge($req['status']) ?></td>
                                            <td class="small"><?= format_date($req['created_at']) ?></td>
                                            <td>
                                                <?php if ($req['status'] === 'approved'): ?>
                                                    <a href="<?= BASE_URL ?>/student/certificate.php" class="btn btn-sm btn-outline-success">View Certificate</a>
                                                <?php else: ?>
                                                    <span class="text-muted small">In Review</span>
                                                <?php endif; ?>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
