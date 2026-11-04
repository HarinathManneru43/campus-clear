<?php
$page_title = "Assigned Students Directory";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';

require_role([ROLE_STAFF, ROLE_ADMIN]);

$staff_dept_id = $_SESSION['department_id'] ?? null;
$search = trim($_GET['search'] ?? '');
$status_filter = trim($_GET['status'] ?? '');
$pdo = db();

// Query student roster with department clearance status attached
$sql = "
    SELECT s.*, d.name as student_dept_name, d.code as student_dept_code,
           COALESCE(cs.status, 'cleared') as dept_status,
           cs.remarks as dept_remarks
    FROM students s
    JOIN departments d ON s.department_id = d.id
    LEFT JOIN clearance_status cs ON s.id = cs.student_id AND cs.department_id = :dept_id
    WHERE 1=1
";

$params = [':dept_id' => $staff_dept_id ?: 1];

if (!empty($search)) {
    $sql .= " AND (s.roll_number LIKE :q OR s.full_name LIKE :q OR s.email LIKE :q)";
    $params[':q'] = "%{$search}%";
}

if (!empty($status_filter)) {
    $sql .= " AND COALESCE(cs.status, 'cleared') = :st";
    $params[':st'] = $status_filter;
}

$sql .= " ORDER BY s.roll_number ASC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$students = $stmt->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-people me-2 text-primary"></i> Student Roster & Department Clearance</h2>
            <p class="text-muted mb-0">View all students and manage clearance status for your department.</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="<?= BASE_URL ?>/staff/add_due.php" class="btn btn-danger rounded-pill px-4 shadow-sm fw-bold">
                <i class="bi bi-plus-circle me-1"></i> Issue Due / Fine
            </a>
        </div>
    </div>

    <!-- Filters -->
    <div class="card card-glass border-0 shadow-sm p-4 mb-4">
        <form method="GET" action="" class="row g-3">
            <div class="col-md-6">
                <input type="text" class="form-control" name="search" placeholder="Search by Roll Number, Name, or Email..." value="<?= sanitize($search) ?>">
            </div>
            <div class="col-md-4">
                <select class="form-select" name="status">
                    <option value="">All Department Statuses</option>
                    <option value="cleared" <?= $status_filter === 'cleared' ? 'selected' : '' ?>>Cleared</option>
                    <option value="pending" <?= $status_filter === 'pending' ? 'selected' : '' ?>>Pending / Hold</option>
                    <option value="blocked" <?= $status_filter === 'blocked' ? 'selected' : '' ?>>Blocked</option>
                </select>
            </div>
            <div class="col-md-2">
                <button type="submit" class="btn btn-primary w-100 rounded-3 fw-bold">Filter</button>
            </div>
        </form>
    </div>

    <!-- Roster Table -->
    <div class="card card-glass border-0 shadow-sm">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Roll Number</th>
                            <th>Student Name</th>
                            <th>Academic Dept</th>
                            <th>Semester</th>
                            <th>Status in Your Dept</th>
                            <th>Remarks</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($students as $st): ?>
                            <tr>
                                <td class="fw-bold"><code><?= sanitize($st['roll_number']) ?></code></td>
                                <td>
                                    <strong class="text-dark d-block"><?= sanitize($st['full_name']) ?></strong>
                                    <small class="text-muted"><?= sanitize($st['email']) ?></small>
                                </td>
                                <td><span class="badge bg-light text-secondary"><?= sanitize($st['student_dept_code']) ?></span></td>
                                <td>Sem <?= $st['semester'] ?></td>
                                <td><?= get_status_badge($st['dept_status']) ?></td>
                                <td class="small text-muted" style="max-width: 250px;"><?= sanitize($st['dept_remarks'] ?: 'No issues') ?></td>
                                <td>
                                    <a href="<?= BASE_URL ?>/staff/student_detail.php?id=<?= $st['id'] ?>" class="btn btn-sm btn-primary rounded-pill px-3">
                                        Manage
                                    </a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
