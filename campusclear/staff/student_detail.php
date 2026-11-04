<?php
$page_title = "Manage Student Record";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

require_role([ROLE_STAFF, ROLE_ADMIN]);

$student_id = (int)($_GET['id'] ?? 0);
$staff_user_id = $_SESSION['user_id'];
$staff_dept_id = $_SESSION['department_id'] ?? 1;

$pdo = db();

// Fetch student profile
$stu_stmt = $pdo->prepare("
    SELECT s.*, d.name as department_name, d.code as department_code
    FROM students s
    JOIN departments d ON s.department_id = d.id
    WHERE s.id = :sid
");
$stu_stmt->execute([':sid' => $student_id]);
$student = $stu_stmt->fetch();

if (!$student) {
    die("Student not found.");
}

// Handle Clearance Status Toggle Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_status') {
    $new_status = $_POST['new_status'] ?? 'cleared';
    $remarks = trim($_POST['remarks'] ?? '');
    $token = $_POST['csrf_token'] ?? '';

    if (!verify_csrf($token)) {
        set_flash('danger', 'Security token error.');
    } else {
        update_department_clearance($student_id, $staff_dept_id, $new_status, $remarks, $staff_user_id);
        set_flash('success', 'Student clearance status updated successfully.');
        redirect(BASE_URL . "/staff/student_detail.php?id={$student_id}");
    }
}

// Handle Resolving a Due
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'resolve_due') {
    $due_id = (int)($_POST['due_id'] ?? 0);
    $token = $_POST['csrf_token'] ?? '';

    if (verify_csrf($token) && $due_id > 0) {
        if ($_SESSION['user_role'] === ROLE_ADMIN) {
            $r_stmt = $pdo->prepare("
                UPDATE dues SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP, resolved_by_staff_id = :stfid
                WHERE id = :due_id
            ");
            $r_stmt->execute([':stfid' => $_SESSION['staff_id'] ?? null, ':due_id' => $due_id]);
        } else {
            $r_stmt = $pdo->prepare("
                UPDATE dues SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP, resolved_by_staff_id = :stfid
                WHERE id = :due_id AND department_id = :did
            ");
            $r_stmt->execute([':stfid' => $_SESSION['staff_id'] ?? null, ':due_id' => $due_id, ':did' => $staff_dept_id]);
        }
        
        // Re-evaluate continuous clearance
        get_student_clearance_summary($student_id);

        log_audit('RESOLVE_DUE', 'DUE', $due_id, "Due ID {$due_id} resolved for student ID {$student_id}");
        set_flash('success', 'Due marked as resolved.');
        redirect(BASE_URL . "/staff/student_detail.php?id={$student_id}");
    }
}

// Compute continuous clearance
$clearance = get_student_clearance_summary($student_id);

// Fetch dues for this student in staff's department
$dues_stmt = $pdo->prepare("
    SELECT du.*, d.name as department_name
    FROM dues du
    JOIN departments d ON du.department_id = d.id
    WHERE du.student_id = :sid AND du.department_id = :did
    ORDER BY du.created_at DESC
");
$dues_stmt->execute([':sid' => $student_id, ':did' => $staff_dept_id]);
$staff_dues = $dues_stmt->fetchAll();

// Fetch department status record
$curr_status_stmt = $pdo->prepare("SELECT * FROM clearance_status WHERE student_id = :sid AND department_id = :did");
$curr_status_stmt->execute([':sid' => $student_id, ':did' => $staff_dept_id]);
$dept_status_record = $curr_status_stmt->fetch();
$current_dept_status = $dept_status_record['status'] ?? 'cleared';
$current_dept_remarks = $dept_status_record['remarks'] ?? '';
?>

<div class="container-fluid">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark mb-1">Student Record: <?= sanitize($student['full_name']) ?></h2>
            <p class="text-muted mb-0">Roll No: <code><?= sanitize($student['roll_number']) ?></code> | Dept: <?= sanitize($student['department_name']) ?> | Semester <?= $student['semester'] ?></p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <span class="fs-6 me-2">Overall Clearance:</span>
            <?= get_status_badge($clearance['overall_status']) ?>
        </div>
    </div>

    <div class="row g-4">
        <!-- Status Update Control Form -->
        <div class="col-lg-5">
            <div class="card card-glass p-4 border-0 shadow-sm mb-4">
                <h5 class="fw-bold text-dark border-bottom pb-3 mb-3"><i class="bi bi-toggle-on text-primary me-2"></i> Update Clearance for Your Dept</h5>
                <form method="POST" action="">
                    <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                    <input type="hidden" name="action" value="update_status">

                    <div class="mb-3">
                        <label class="form-label fw-bold">Department Clearance Status</label>
                        <select class="form-select form-select-lg" name="new_status" required>
                            <option value="cleared" <?= $current_dept_status === 'cleared' ? 'selected' : '' ?>>CLEARED (No Dues / Full Approval)</option>
                            <option value="pending" <?= $current_dept_status === 'pending' ? 'selected' : '' ?>>PENDING (Unresolved Fines / Issues)</option>
                            <option value="blocked" <?= $current_dept_status === 'blocked' ? 'selected' : '' ?>>BLOCKED (Administrative Hold)</option>
                        </select>
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-semibold">Staff Remarks / Reason</label>
                        <textarea class="form-control" name="remarks" rows="3" placeholder="Provide reason or details for pending/blocked status..."><?= sanitize($current_dept_remarks) ?></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm">
                        <i class="bi bi-save me-2"></i> Save Clearance Status
                    </button>
                </form>
            </div>

            <!-- Quick Add Due Button -->
            <div class="card card-glass p-4 border-0 shadow-sm text-center">
                <h5 class="fw-bold mb-2">Issue New Fine or Due</h5>
                <p class="small text-muted mb-3">Add unpaid fine or unreturned item for this student.</p>
                <a href="<?= BASE_URL ?>/staff/add_due.php?student_id=<?= $student_id ?>" class="btn btn-danger rounded-pill px-4 fw-bold">
                    <i class="bi bi-plus-circle me-1"></i> Issue Due to Student
                </a>
            </div>
        </div>

        <!-- Dues & Issue History for Staff Department -->
        <div class="col-lg-7">
            <div class="card card-glass border-0 shadow-sm">
                <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-receipt me-2 text-danger"></i> Dues Issued by Your Department</h5>
                    <span class="badge bg-secondary"><?= count($staff_dues) ?> Record(s)</span>
                </div>
                <div class="card-body p-0">
                    <?php if (empty($staff_dues)): ?>
                        <div class="text-center py-5">
                            <i class="bi bi-check-circle text-success display-3 d-block mb-2"></i>
                            <p class="text-muted mb-0">Zero dues issued by your department for this student.</p>
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Issued Date</th>
                                        <th>Title & Details</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($staff_dues as $d): ?>
                                        <tr>
                                            <td class="small fw-semibold"><?= format_date($d['created_at']) ?></td>
                                            <td>
                                                <strong class="text-dark d-block"><?= sanitize($d['title']) ?></strong>
                                                <small class="text-muted"><?= sanitize($d['description']) ?></small>
                                            </td>
                                            <td class="fw-bold text-danger"><?= format_currency($d['amount']) ?></td>
                                            <td><?= get_status_badge($d['status']) ?></td>
                                            <td>
                                                <?php if ($d['status'] === 'pending'): ?>
                                                    <form method="POST" action="" class="d-inline">
                                                        <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                                                        <input type="hidden" name="action" value="resolve_due">
                                                        <input type="hidden" name="due_id" value="<?= $d['id'] ?>">
                                                        <button type="submit" class="btn btn-sm btn-success rounded-pill px-3">Mark Resolved</button>
                                                    </form>
                                                <?php else: ?>
                                                    <span class="small text-muted"><i class="bi bi-check-all text-success"></i> Resolved</span>
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
