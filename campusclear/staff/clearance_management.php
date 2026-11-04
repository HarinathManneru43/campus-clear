<?php
$page_title = "Bulk Department Clearance Toggle";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

require_role([ROLE_STAFF, ROLE_ADMIN]);

$staff_dept_id = $_SESSION['department_id'] ?? 1;
$staff_user_id = $_SESSION['user_id'];
$pdo = db();

// Handle bulk clearance status update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'bulk_update') {
    $student_ids = $_POST['student_ids'] ?? [];
    $target_status = $_POST['target_status'] ?? 'cleared';
    $remarks = trim($_POST['remarks'] ?? '');
    $token = $_POST['csrf_token'] ?? '';

    if (!verify_csrf($token)) {
        set_flash('danger', 'Security token error.');
    } elseif (empty($student_ids)) {
        set_flash('warning', 'Please select at least one student.');
    } else {
        $count = 0;
        foreach ($student_ids as $sid) {
            update_department_clearance((int)$sid, $staff_dept_id, $target_status, $remarks, $staff_user_id);
            $count++;
        }
        set_flash('success', "Clearance status updated for {$count} student(s).");
        redirect(BASE_URL . '/staff/clearance_management.php');
    }
}

// Fetch department roster
$stmt = $pdo->prepare("
    SELECT s.*, d.code as dept_code, COALESCE(cs.status, 'cleared') as current_status, cs.remarks
    FROM students s
    JOIN departments d ON s.department_id = d.id
    LEFT JOIN clearance_status cs ON s.id = cs.student_id AND cs.department_id = :did
    ORDER BY s.roll_number ASC
");
$stmt->execute([':did' => $staff_dept_id]);
$students = $stmt->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-toggle-on me-2 text-primary"></i> Department Clearance Management</h2>
            <p class="text-muted">Batch update or toggle student clearance statuses for your department.</p>
        </div>
    </div>

    <div class="card card-glass border-0 shadow-sm mb-4">
        <form method="POST" action="">
            <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
            <input type="hidden" name="action" value="bulk_update">

            <div class="card-header bg-white py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div class="d-flex align-items-center gap-3">
                    <span class="fw-bold text-dark">Set Selected To:</span>
                    <select class="form-select w-auto" name="target_status" required>
                        <option value="cleared">CLEARED</option>
                        <option value="pending">PENDING</option>
                        <option value="blocked">BLOCKED</option>
                    </select>
                    <input type="text" class="form-control w-auto" name="remarks" placeholder="Batch remarks...">
                </div>
                <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold">
                    <i class="bi bi-check-all me-1"></i> Apply Batch Update
                </button>
            </div>

            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 40px;"><input type="checkbox" class="form-check-input" id="selectAll"></th>
                                <th>Roll Number</th>
                                <th>Student Name</th>
                                <th>Dept</th>
                                <th>Current Status</th>
                                <th>Remarks</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($students as $st): ?>
                                <tr>
                                    <td><input type="checkbox" class="form-check-input student-checkbox" name="student_ids[]" value="<?= $st['id'] ?>"></td>
                                    <td class="fw-bold"><code><?= sanitize($st['roll_number']) ?></code></td>
                                    <td><strong class="text-dark"><?= sanitize($st['full_name']) ?></strong></td>
                                    <td><span class="badge bg-light text-secondary"><?= sanitize($st['dept_code']) ?></span></td>
                                    <td><?= get_status_badge($st['current_status']) ?></td>
                                    <td class="small text-muted"><?= sanitize($st['remarks']) ?></td>
                                    <td>
                                        <a href="<?= BASE_URL ?>/staff/student_detail.php?id=<?= $st['id'] ?>" class="btn btn-sm btn-outline-primary rounded-pill">
                                            Single Update
                                        </a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </form>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.student-checkbox');
    if (selectAll) {
        selectAll.addEventListener('change', function () {
            checkboxes.forEach(cb => cb.checked = selectAll.checked);
        });
    }
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
