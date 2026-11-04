<?php
$page_title = "Staff Department Dashboard";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';

require_role(ROLE_STAFF);

$staff_id = $_SESSION['staff_id'];
$dept_id = $_SESSION['department_id'];
$pdo = db();

// Fetch department details
$d_stmt = $pdo->prepare("SELECT * FROM departments WHERE id = :did");
$d_stmt->execute([':did' => $dept_id]);
$department = $d_stmt->fetch();

// Count total students
$total_students = (int)$pdo->query("SELECT COUNT(*) FROM students")->fetchColumn();

// Count pending clearance cases in staff's department
$pending_cases_stmt = $pdo->prepare("
    SELECT COUNT(*) FROM clearance_status 
    WHERE department_id = :did AND status IN ('pending', 'blocked')
");
$pending_cases_stmt->execute([':did' => $dept_id]);
$pending_cases = (int)$pending_cases_stmt->fetchColumn();

// Count pending dues in staff department
$pending_dues_stmt = $pdo->prepare("
    SELECT COUNT(*), COALESCE(SUM(amount), 0) as total_amt FROM dues 
    WHERE department_id = :did AND status = 'pending'
");
$pending_dues_stmt->execute([':did' => $dept_id]);
$dues_data = $pending_dues_stmt->fetch();
$pending_dues_count = (int)$dues_data['COUNT(*)'];
$total_due_amount = (float)$dues_data['total_amt'];

// Count open disputes for staff department
$dispute_stmt = $pdo->prepare("SELECT COUNT(*) FROM disputes WHERE department_id = :did AND status = 'open'");
$dispute_stmt->execute([':did' => $dept_id]);
$open_disputes = (int)$dispute_stmt->fetchColumn();

// Fetch recently updated student clearance statuses in staff department
$recent_updates_stmt = $pdo->prepare("
    SELECT cs.*, s.full_name as student_name, s.roll_number, d.name as student_dept
    FROM clearance_status cs
    JOIN students s ON cs.student_id = s.id
    JOIN departments d ON s.department_id = d.id
    WHERE cs.department_id = :did
    ORDER BY cs.updated_at DESC LIMIT 6
");
$recent_updates_stmt->execute([':did' => $dept_id]);
$recent_updates = $recent_updates_stmt->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark mb-1">Department Portal: <?= sanitize($department['name']) ?></h2>
            <p class="text-muted mb-0">Department Code: <strong><?= sanitize($department['code']) ?></strong> | Role: <strong><?= sanitize($_SESSION['designation']) ?></strong></p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="<?= BASE_URL ?>/staff/add_due.php" class="btn btn-danger rounded-pill px-4 py-2 shadow-sm fw-bold me-2">
                <i class="bi bi-plus-circle me-1"></i> Issue New Due
            </a>
        </div>
    </div>

    <!-- KPI Metric Widgets -->
    <div class="row g-4 mb-4">
        <div class="col-md-3">
            <div class="kpi-card d-flex align-items-center">
                <div class="kpi-icon bg-primary-subtle text-primary me-3">
                    <i class="bi bi-people"></i>
                </div>
                <div>
                    <h3 class="fw-bold mb-0 text-dark"><?= $total_students ?></h3>
                    <span class="text-muted small">Total Campus Students</span>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="kpi-card d-flex align-items-center">
                <div class="kpi-icon bg-warning-subtle text-warning-emphasis me-3">
                    <i class="bi bi-clock-history"></i>
                </div>
                <div>
                    <h3 class="fw-bold mb-0 text-dark"><?= $pending_cases ?></h3>
                    <span class="text-muted small">Pending Clearance Holds</span>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="kpi-card d-flex align-items-center">
                <div class="kpi-icon bg-danger-subtle text-danger me-3">
                    <i class="bi bi-wallet2"></i>
                </div>
                <div>
                    <h3 class="fw-bold mb-0 text-dark"><?= format_currency($total_due_amount) ?></h3>
                    <span class="text-muted small"><?= $pending_dues_count ?> Unresolved Dues</span>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="kpi-card d-flex align-items-center">
                <div class="kpi-icon bg-info-subtle text-info me-3">
                    <i class="bi bi-chat-left-dots"></i>
                </div>
                <div>
                    <h3 class="fw-bold mb-0 text-dark"><?= $open_disputes ?></h3>
                    <span class="text-muted small">Open Department Disputes</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Student Search & Quick Options -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card card-glass border-0 shadow-sm p-4">
                <h5 class="fw-bold mb-3 text-dark"><i class="bi bi-search me-2 text-primary"></i> Quick Student Clearance Search</h5>
                <form action="<?= BASE_URL ?>/staff/students.php" method="GET" class="row g-3">
                    <div class="col-md-9">
                        <input type="text" class="form-control form-control-lg" name="search" placeholder="Enter Student Roll Number (e.g. TU6241103111088) or Full Name..." required>
                    </div>
                    <div class="col-md-3">
                        <button type="submit" class="btn btn-primary btn-lg w-100 rounded-3 fw-bold">Search Student</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Recent Clearance Updates in Staff Department -->
    <div class="row">
        <div class="col-12">
            <div class="card card-glass border-0 shadow-sm">
                <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-clock-history me-2 text-primary"></i> Recent Department Status Updates</h5>
                    <a href="<?= BASE_URL ?>/staff/clearance_management.php" class="btn btn-sm btn-outline-primary rounded-pill">Manage All Statuses</a>
                </div>
                <div class="card-body p-0">
                    <?php if (empty($recent_updates)): ?>
                        <div class="text-center py-4 text-muted">
                            <p class="mb-0">No recent updates in this department.</p>
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Roll Number</th>
                                        <th>Student Name</th>
                                        <th>Academic Dept</th>
                                        <th>Current Department Status</th>
                                        <th>Remarks</th>
                                        <th>Last Updated</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($recent_updates as $u): ?>
                                        <tr>
                                            <td class="fw-bold"><code><?= sanitize($u['roll_number']) ?></code></td>
                                            <td><strong class="text-dark"><?= sanitize($u['student_name']) ?></strong></td>
                                            <td><span class="badge bg-light text-secondary"><?= sanitize($u['student_dept']) ?></span></td>
                                            <td><?= get_status_badge($u['status']) ?></td>
                                            <td class="small text-muted" style="max-width:250px;"><?= sanitize($u['remarks']) ?></td>
                                            <td class="small text-muted"><?= format_date($u['updated_at']) ?></td>
                                            <td>
                                                <a href="<?= BASE_URL ?>/staff/student_detail.php?id=<?= $u['student_id'] ?>" class="btn btn-sm btn-outline-primary rounded-pill">
                                                    Manage Student
                                                </a>
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
