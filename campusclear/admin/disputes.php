<?php
$page_title = "Escalated Disputes Control";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

require_role(ROLE_ADMIN);

$pdo = db();

// Handle Admin Resolution
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $dispute_id = (int)($_POST['dispute_id'] ?? 0);
    $due_id = (int)($_POST['due_id'] ?? 0);
    $student_id = (int)($_POST['student_id'] ?? 0);
    $action_status = $_POST['action'] === 'resolve' ? 'resolved' : 'rejected';
    $remarks = trim($_POST['resolution_remarks'] ?? '');
    $token = $_POST['csrf_token'] ?? '';

    if (verify_csrf($token) && $dispute_id > 0) {
        $pdo->beginTransaction();

        $disp_upd = $pdo->prepare("
            UPDATE disputes 
            SET status = :st, resolution_remarks = :remarks, resolved_by_user_id = :uid, updated_at = CURRENT_TIMESTAMP
            WHERE id = :dispid
        ");
        $disp_upd->execute([
            ':st' => $action_status,
            ':remarks' => 'ADMIN OVERRIDE: ' . $remarks,
            ':uid' => $_SESSION['user_id'],
            ':dispid' => $dispute_id
        ]);

        if ($action_status === 'resolved' && $due_id > 0) {
            $pdo->prepare("UPDATE dues SET status = 'waived', resolved_at = CURRENT_TIMESTAMP WHERE id = :due_id")->execute([':due_id' => $due_id]);
            get_student_clearance_summary($student_id);
        }

        $pdo->commit();

        log_audit('ADMIN_RESOLVE_DISPUTE', 'DISPUTE', $dispute_id, "Admin marked dispute ID {$dispute_id} as {$action_status}");
        set_flash('success', "Dispute updated successfully.");
        redirect(BASE_URL . '/admin/disputes.php');
    }
}

// Fetch all disputes
$disputes = $pdo->query("
    SELECT disp.*, s.full_name as student_name, s.roll_number, d.name as department_name, du.title as due_title
    FROM disputes disp
    JOIN students s ON disp.student_id = s.id
    JOIN departments d ON disp.department_id = d.id
    LEFT JOIN dues du ON disp.due_id = du.id
    ORDER BY disp.created_at DESC
")->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-shield-exclamation me-2 text-warning"></i> System Disputes Control Center</h2>
            <p class="text-muted">Master escalation review panel for all department student disputes.</p>
        </div>
    </div>

    <div class="card card-glass border-0 shadow-sm">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Date</th>
                            <th>Student</th>
                            <th>Department</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Resolution Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($disputes as $dp): ?>
                            <tr>
                                <td class="small fw-semibold"><?= format_date($dp['created_at']) ?></td>
                                <td>
                                    <strong class="text-dark d-block"><?= sanitize($dp['student_name']) ?></strong>
                                    <small class="text-muted"><?= sanitize($dp['roll_number']) ?></small>
                                </td>
                                <td><span class="badge bg-light text-secondary"><?= sanitize($dp['department_name']) ?></span></td>
                                <td>
                                    <strong class="text-dark d-block"><?= sanitize($dp['subject']) ?></strong>
                                    <small class="text-muted" style="max-width: 250px;"><?= sanitize($dp['description']) ?></small>
                                </td>
                                <td><?= get_status_badge($dp['status']) ?></td>
                                <td class="small"><?= sanitize($dp['resolution_remarks'] ?: 'Awaiting Review') ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
