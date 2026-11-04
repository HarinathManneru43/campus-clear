<?php
$page_title = "Department Disputes Management";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

require_role([ROLE_STAFF, ROLE_ADMIN]);

$staff_dept_id = $_SESSION['department_id'] ?? 1;
$staff_user_id = $_SESSION['user_id'];
$pdo = db();

// Handle Dispute Action
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
            WHERE id = :dispid AND department_id = :did
        ");
        $disp_upd->execute([
            ':st' => $action_status,
            ':remarks' => $remarks,
            ':uid' => $staff_user_id,
            ':dispid' => $dispute_id,
            ':did' => $staff_dept_id
        ]);

        // If dispute resolved -> waive/resolve associated due if any
        if ($action_status === 'resolved' && $due_id > 0) {
            $due_upd = $pdo->prepare("UPDATE dues SET status = 'waived', resolved_at = CURRENT_TIMESTAMP WHERE id = :due_id");
            $due_upd->execute([':due_id' => $due_id]);

            // Re-evaluate continuous clearance status for student
            get_student_clearance_summary($student_id);
        }

        $pdo->commit();

        log_audit('RESOLVE_DISPUTE', 'DISPUTE', $dispute_id, "Dispute ID {$dispute_id} marked as {$action_status}");
        set_flash('success', "Dispute status updated to " . strtoupper($action_status) . ".");
        redirect(BASE_URL . '/staff/disputes.php');
    }
}

// Fetch disputes for staff department
$stmt = $pdo->prepare("
    SELECT disp.*, s.full_name as student_name, s.roll_number, du.title as due_title, du.amount as due_amount
    FROM disputes disp
    JOIN students s ON disp.student_id = s.id
    LEFT JOIN dues du ON disp.due_id = du.id
    WHERE disp.department_id = :did
    ORDER BY disp.created_at DESC
");
$stmt->execute([':did' => $staff_dept_id]);
$disputes = $stmt->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-chat-left-dots me-2 text-warning"></i> Department Disputes Review</h2>
            <p class="text-muted">Review student claims and resolve or waive questioned dues.</p>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card card-glass border-0 shadow-sm">
                <div class="card-body p-0">
                    <?php if (empty($disputes)): ?>
                        <div class="text-center py-5">
                            <i class="bi bi-check-circle text-success display-3 d-block mb-2"></i>
                            <p class="text-muted mb-0">No disputes filed against your department.</p>
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Student</th>
                                        <th>Subject</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Action / Resolution</th>
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
                                            <td>
                                                <strong class="text-dark"><?= sanitize($dp['subject']) ?></strong>
                                                <?php if (!empty($dp['due_title'])): ?>
                                                    <small class="d-block text-danger">Due: <?= sanitize($dp['due_title']) ?> (<?= format_currency($dp['due_amount']) ?>)</small>
                                                <?php endif; ?>
                                            </td>
                                            <td class="small text-muted" style="max-width: 250px;"><?= sanitize($dp['description']) ?></td>
                                            <td><?= get_status_badge($dp['status']) ?></td>
                                            <td>
                                                <?php if ($dp['status'] === 'open' || $dp['status'] === 'under_review'): ?>
                                                    <button type="button" class="btn btn-sm btn-primary rounded-pill px-3"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#resolveModal"
                                                            data-dispid="<?= $dp['id'] ?>"
                                                            data-dueid="<?= $dp['due_id'] ?>"
                                                            data-stuid="<?= $dp['student_id'] ?>"
                                                            data-subject="<?= sanitize($dp['subject']) ?>">
                                                        Process Dispute
                                                    </button>
                                                <?php else: ?>
                                                    <span class="small text-muted"><?= sanitize($dp['resolution_remarks'] ?: 'Resolved') ?></span>
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

<!-- Modal: Process Dispute -->
<div class="modal fade" id="resolveModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg">
            <form method="POST" action="">
                <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                <input type="hidden" name="dispute_id" id="modal_disp_id">
                <input type="hidden" name="due_id" id="modal_due_id">
                <input type="hidden" name="student_id" id="modal_stu_id">

                <div class="modal-header border-bottom py-3">
                    <h5 class="modal-title fw-bold text-dark"><i class="bi bi-shield-check me-2 text-primary"></i> Process Student Dispute</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label text-muted small text-uppercase fw-bold">Dispute Subject</label>
                        <input type="text" class="form-control bg-light" id="modal_subject" readonly>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Staff Resolution Remarks <span class="text-danger">*</span></label>
                        <textarea class="form-control" name="resolution_remarks" rows="3" required placeholder="Explain why the due is being resolved/waived or rejected..."></textarea>
                    </div>

                    <div class="alert alert-info small mb-0">
                        <i class="bi bi-info-circle me-1"></i> Resolving this dispute will automatically waive any associated due fine and recalculate the student's continuous clearance status.
                    </div>
                </div>
                <div class="modal-footer border-top py-3">
                    <button type="submit" name="action" value="reject" class="btn btn-outline-danger rounded-pill px-4">Reject Dispute</button>
                    <button type="submit" name="action" value="resolve" class="btn btn-success rounded-pill px-4 fw-bold">Resolve & Waive Due</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    const resolveModal = document.getElementById('resolveModal');
    if (resolveModal) {
        resolveModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            document.getElementById('modal_disp_id').value = button.getAttribute('data-dispid');
            document.getElementById('modal_due_id').value = button.getAttribute('data-dueid');
            document.getElementById('modal_stu_id').value = button.getAttribute('data-stuid');
            document.getElementById('modal_subject').value = button.getAttribute('data-subject');
        });
    }
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
