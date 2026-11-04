<?php
$page_title = "Issue Student Due / Fine";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

require_role([ROLE_STAFF, ROLE_ADMIN]);

$staff_id = $_SESSION['staff_id'] ?? 1;
$staff_dept_id = $_SESSION['department_id'] ?? 1;
$preselected_student_id = (int)($_GET['student_id'] ?? 0);

$pdo = db();

// Fetch department details
$d_stmt = $pdo->prepare("SELECT name FROM departments WHERE id = :did");
$d_stmt->execute([':did' => $staff_dept_id]);
$dept_name = $d_stmt->fetchColumn();

// Fetch student list for dropdown
$stu_stmt = $pdo->query("SELECT id, roll_number, full_name FROM students ORDER BY roll_number ASC");
$students = $stu_stmt->fetchAll();

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $student_id = (int)($_POST['student_id'] ?? 0);
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $amount = (float)($_POST['amount'] ?? 0.00);
    $token = $_POST['csrf_token'] ?? '';

    if (!verify_csrf($token)) {
        $error = 'Security token error.';
    } elseif ($student_id <= 0 || empty($title)) {
        $error = 'Please select a student and provide a due title.';
    } else {
        try {
            $pdo->beginTransaction();

            // 1. Insert into dues
            $stmt = $pdo->prepare("
                INSERT INTO dues (student_id, department_id, title, description, amount, status, added_by_staff_id)
                VALUES (:sid, :did, :title, :desc, :amt, 'pending', :stfid)
            ");
            $stmt->execute([
                ':sid' => $student_id,
                ':did' => $staff_dept_id,
                ':title' => $title,
                ':desc' => $description,
                ':amt' => $amount,
                ':stfid' => $staff_id
            ]);
            $due_id = $pdo->lastInsertId();

            // 2. Trigger clearance engine update to mark student department clearance as PENDING
            update_department_clearance($student_id, $staff_dept_id, 'pending', "Pending Due: {$title}", $_SESSION['user_id']);

            $pdo->commit();

            log_audit('ISSUE_DUE', 'DUE', $due_id, "Issued due to student ID {$student_id} in department {$staff_dept_id}: {$title}");
            set_flash('success', "Due '{$title}' issued successfully! Student status updated to PENDING.");
            redirect(BASE_URL . "/staff/student_detail.php?id={$student_id}");

        } catch (\PDOException $e) {
            $pdo->rollBack();
            $error = 'Error issuing due: ' . $e->getMessage();
        }
    }
}
?>

<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-plus-circle me-2 text-danger"></i> Issue Due or Administrative Penalty</h2>
            <p class="text-muted mb-0">Department: <strong><?= sanitize($dept_name) ?></strong></p>
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
                <form method="POST" action="">
                    <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">

                    <div class="mb-4">
                        <label class="form-label fw-bold">Select Student <span class="text-danger">*</span></label>
                        <select class="form-select form-select-lg" name="student_id" required>
                            <option value="">-- Select Student by Roll No or Name --</option>
                            <?php foreach ($students as $st): ?>
                                <option value="<?= $st['id'] ?>" <?= $preselected_student_id === $st['id'] ? 'selected' : '' ?>>
                                    [<?= sanitize($st['roll_number']) ?>] <?= sanitize($st['full_name']) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">Due Title / Category <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="title" required placeholder="e.g. Overdue Library Book / Unpaid Mess Fee / Lab Equipment Damage">
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Amount Fine / Fee (₹)</label>
                        <input type="number" step="0.01" min="0" class="form-control" name="amount" value="0.00" placeholder="0.00">
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-semibold">Detailed Description / Accession No / Particulars</label>
                        <textarea class="form-control" name="description" rows="4" placeholder="Provide extra details such as book name, accession number, receipt ID, or equipment condition..."></textarea>
                    </div>

                    <div class="d-flex justify-content-between align-items-center">
                        <a href="<?= BASE_URL ?>/staff/students.php" class="btn btn-light rounded-pill px-4">Cancel</a>
                        <button type="submit" class="btn btn-danger rounded-pill px-5 py-2 fw-bold shadow-sm">
                            <i class="bi bi-exclamation-triangle me-2"></i> Issue Due & Update Status
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
