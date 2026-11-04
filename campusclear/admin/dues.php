<?php
$page_title = "Master System Dues Overview";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

require_role(ROLE_ADMIN);

$pdo = db();

// Handle Waive Due by Admin
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'waive_due') {
    $due_id = (int)($_POST['due_id'] ?? 0);
    $student_id = (int)($_POST['student_id'] ?? 0);
    $token = $_POST['csrf_token'] ?? '';

    if (verify_csrf($token) && $due_id > 0) {
        $stmt = $pdo->prepare("UPDATE dues SET status = 'waived', resolved_at = CURRENT_TIMESTAMP WHERE id = :did");
        $stmt->execute([':did' => $due_id]);

        // Re-evaluate student continuous clearance
        get_student_clearance_summary($student_id);

        log_audit('ADMIN_WAIVE_DUE', 'DUE', $due_id, "Admin waived due ID {$due_id} for student ID {$student_id}");
        set_flash('success', "Due ID #{$due_id} waived successfully.");
        redirect(BASE_URL . '/admin/dues.php');
    }
}

// Fetch all dues
$dues = $pdo->query("
    SELECT du.*, s.full_name as student_name, s.roll_number, d.name as department_name
    FROM dues du
    JOIN students s ON du.student_id = s.id
    JOIN departments d ON du.department_id = d.id
    ORDER BY du.created_at DESC
")->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-wallet2 me-2 text-primary"></i> Master System Dues Directory</h2>
            <p class="text-muted mb-0">System-wide overview of active, resolved, and waived student penalties.</p>
        </div>
    </div>

    <div class="card card-glass border-0 shadow-sm">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Student</th>
                            <th>Department</th>
                            <th>Title & Particulars</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date Issued</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($dues as $d): ?>
                            <tr>
                                <td><code>#<?= $d['id'] ?></code></td>
                                <td>
                                    <strong class="text-dark d-block"><?= sanitize($d['student_name']) ?></strong>
                                    <small class="text-muted"><?= sanitize($d['roll_number']) ?></small>
                                </td>
                                <td><span class="badge bg-light text-secondary"><?= sanitize($d['department_name']) ?></span></td>
                                <td>
                                    <strong class="text-dark d-block"><?= sanitize($d['title']) ?></strong>
                                    <small class="text-muted"><?= sanitize($d['description']) ?></small>
                                </td>
                                <td class="fw-bold text-danger"><?= format_currency($d['amount']) ?></td>
                                <td><?= get_status_badge($d['status']) ?></td>
                                <td class="small text-muted"><?= format_date($d['created_at']) ?></td>
                                <td>
                                    <?php if ($d['status'] === 'pending'): ?>
                                        <form method="POST" action="" class="d-inline" onsubmit="return confirm('Waive this due for student?');">
                                            <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                                            <input type="hidden" name="action" value="waive_due">
                                            <input type="hidden" name="due_id" value="<?= $d['id'] ?>">
                                            <input type="hidden" name="student_id" value="<?= $d['student_id'] ?>">
                                            <button type="submit" class="btn btn-sm btn-outline-warning rounded-pill px-3">Waive Fine</button>
                                        </form>
                                    <?php else: ?>
                                        <span class="small text-muted">Settled</span>
                                    <?php endif; ?>
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
