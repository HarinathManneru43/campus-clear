<?php
$page_title = "Emergency Administrative Clearance Override";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

require_role(ROLE_ADMIN);

$pdo = db();

// Fetch student list for dropdown
$students = $pdo->query("SELECT id, roll_number, full_name FROM students ORDER BY roll_number ASC")->fetchAll();
$departments = $pdo->query("SELECT id, name FROM departments WHERE is_active = 1 ORDER BY name ASC")->fetchAll();

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $student_id = (int)($_POST['student_id'] ?? 0);
    $department_id = $_POST['department_id'] ?? 'ALL'; // ALL or specific ID
    $target_status = $_POST['target_status'] ?? 'cleared';
    $justification = trim($_POST['justification'] ?? '');
    $token = $_POST['csrf_token'] ?? '';

    if (!verify_csrf($token)) {
        $error = 'Security token error.';
    } elseif ($student_id <= 0 || empty($justification)) {
        $error = 'Please select a student and provide a mandatory written justification for emergency override.';
    } else {
        try {
            $pdo->beginTransaction();

            $remarks = "ADMIN OVERRIDE: " . $justification;

            if ($department_id === 'ALL') {
                foreach ($departments as $d) {
                    update_department_clearance($student_id, $d['id'], $target_status, $remarks, $_SESSION['user_id']);
                }
                // Also resolve/waive all active dues for student
                if ($target_status === 'cleared') {
                    $pdo->prepare("UPDATE dues SET status = 'waived', resolved_at = CURRENT_TIMESTAMP WHERE student_id = :sid AND status = 'pending'")
                        ->execute([':sid' => $student_id]);
                }
            } else {
                update_department_clearance($student_id, (int)$department_id, $target_status, $remarks, $_SESSION['user_id']);
            }

            $pdo->commit();

            log_audit('ADMIN_CLEARANCE_OVERRIDE', 'STUDENT', $student_id, "Emergency Override: Status set to {$target_status}. Justification: {$justification}");
            set_flash('success', "Emergency Administrative Clearance Override completed successfully.");
            redirect(BASE_URL . "/staff/student_detail.php?id={$student_id}");

        } catch (\PDOException $e) {
            $pdo->rollBack();
            $error = 'Override execution failed: ' . $e->getMessage();
        }
    }
}
?>

<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-key me-2 text-danger"></i> Emergency Administrative Clearance Override</h2>
            <p class="text-muted">Force-update clearance status for emergency cases (e.g. Discretionary Registrar Approval).</p>
        </div>
    </div>

    <div class="alert alert-warning border border-warning-subtle rounded-3 p-4 mb-4">
        <div class="d-flex align-items-center">
            <i class="bi bi-exclamation-triangle-fill text-warning fs-3 me-3"></i>
            <div>
                <h5 class="fw-bold mb-1 text-warning-emphasis">Administrative Override Policy</h5>
                <p class="mb-0 small text-muted">
                    This tool bypasses normal department staff review. Every override action is recorded in the permanent audit logs with your user ID and IP address.
                </p>
            </div>
        </div>
    </div>

    <?php if (!empty($error)): ?>
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> <?= sanitize($error) ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <div class="row">
        <div class="col-lg-8">
            <div class="card card-glass p-4 border-0 shadow-sm">
                <form method="POST" action="" onsubmit="return confirm('WARNING: Are you sure you want to execute an administrative clearance override?');">
                    <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">

                    <div class="mb-3">
                        <label class="form-label fw-bold">Select Target Student <span class="text-danger">*</span></label>
                        <select class="form-select form-select-lg" name="student_id" required>
                            <option value="">-- Select Student --</option>
                            <?php foreach ($students as $st): ?>
                                <option value="<?= $st['id'] ?>">[<?= sanitize($st['roll_number']) ?>] <?= sanitize($st['full_name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">Department Scope</label>
                        <select class="form-select" name="department_id">
                            <option value="ALL">ALL DEPARTMENTS (Full Campus Clear)</option>
                            <?php foreach ($departments as $d): ?>
                                <option value="<?= $d['id'] ?>"><?= sanitize($d['name']) ?> Only</option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">Target Status</label>
                        <select class="form-select" name="target_status">
                            <option value="cleared">FORCE CLEARED</option>
                            <option value="pending">FORCE PENDING</option>
                            <option value="blocked">FORCE BLOCKED</option>
                        </select>
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-bold">Mandatory Administrative Justification <span class="text-danger">*</span></label>
                        <textarea class="form-control" name="justification" rows="4" required placeholder="State official reason, committee resolution number, or Vice-Chancellor order details for audit trail..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-danger w-100 py-3 rounded-3 fw-bold shadow-lg">
                        <i class="bi bi-shield-lock me-2"></i> Execute Emergency Clearance Override
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
