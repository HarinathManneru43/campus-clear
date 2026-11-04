<?php
$page_title = "My Pending Dues & Issues";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
require_once __DIR__ . '/../includes/audit.php';

require_role(ROLE_STUDENT);

$student_id = $_SESSION['student_id'];
$pdo = db();

// Handle dispute form submission
$dispute_msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'raise_dispute') {
    $due_id = (int)($_POST['due_id'] ?? 0);
    $department_id = (int)($_POST['department_id'] ?? 0);
    $subject = trim($_POST['subject'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $token = $_POST['csrf_token'] ?? '';

    if (!verify_csrf($token)) {
        set_flash('danger', 'Security token error.');
    } elseif (empty($subject) || empty($description) || $department_id <= 0) {
        set_flash('danger', 'Please enter a subject and detailed reason for dispute.');
    } else {
        try {
            $stmt = $pdo->prepare("
                INSERT INTO disputes (student_id, due_id, department_id, subject, description, status)
                VALUES (:sid, :due_id, :did, :subj, :desc, 'open')
            ");
            $stmt->execute([
                ':sid' => $student_id,
                ':due_id' => $due_id > 0 ? $due_id : null,
                ':did' => $department_id,
                ':subj' => $subject,
                ':desc' => $description
            ]);
            $dispute_id = $pdo->lastInsertId();

            log_audit('RAISE_DISPUTE', 'DISPUTE', $dispute_id, "Dispute raised for department {$department_id}: {$subject}");
            set_flash('success', 'Dispute raised successfully! Department staff will review your claim.');
            redirect(BASE_URL . '/student/disputes.php');
        } catch (\PDOException $e) {
            set_flash('danger', 'Error raising dispute: ' . $e->getMessage());
        }
    }
}

// Fetch all dues for student
$stmt = $pdo->prepare("
    SELECT du.*, d.name as department_name, d.code as department_code, s.full_name as staff_name
    FROM dues du
    JOIN departments d ON du.department_id = d.id
    LEFT JOIN staff s ON du.added_by_staff_id = s.id
    WHERE du.student_id = :sid
    ORDER BY du.status ASC, du.created_at DESC
");
$stmt->execute([':sid' => $student_id]);
$dues = $stmt->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-receipt me-2 text-danger"></i> Dues & Outstanding Penalties</h2>
            <p class="text-muted mb-0">View financial fines, unreturned library items, or administrative blocks issued by departments.</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="<?= BASE_URL ?>/student/disputes.php" class="btn btn-outline-primary rounded-pill"><i class="bi bi-exclamation-octagon me-1"></i> Track Raised Disputes</a>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card card-glass border-0 shadow-sm">
                <div class="card-body p-0">
                    <?php if (empty($dues)): ?>
                        <div class="text-center py-5">
                            <i class="bi bi-shield-check text-success display-2 d-block mb-3"></i>
                            <h4 class="fw-bold text-dark">No Dues Outstanding!</h4>
                            <p class="text-muted">You have zero pending fines, unreturned books, or administrative holds across all departments.</p>
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Date Issued</th>
                                        <th>Department</th>
                                        <th>Title & Details</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Issued By</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($dues as $d): ?>
                                        <tr>
                                            <td class="small fw-semibold"><?= format_date($d['created_at']) ?></td>
                                            <td>
                                                <span class="badge bg-secondary-subtle text-dark"><?= sanitize($d['department_name']) ?></span>
                                            </td>
                                            <td>
                                                <strong class="d-block text-dark"><?= sanitize($d['title']) ?></strong>
                                                <small class="text-muted"><?= sanitize($d['description']) ?></small>
                                            </td>
                                            <td class="fw-bold fs-6 text-danger">
                                                <?= format_currency($d['amount']) ?>
                                            </td>
                                            <td><?= get_status_badge($d['status']) ?></td>
                                            <td class="small"><?= sanitize($d['staff_name'] ?: 'Staff') ?></td>
                                            <td>
                                                <?php if ($d['status'] === 'pending'): ?>
                                                    <button type="button" class="btn btn-sm btn-outline-danger rounded-pill" 
                                                            data-bs-toggle="modal" 
                                                            data-bs-target="#disputeModal"
                                                            data-dueid="<?= $d['id'] ?>"
                                                            data-deptid="<?= $d['department_id'] ?>"
                                                            data-deptname="<?= sanitize($d['department_name']) ?>"
                                                            data-title="<?= sanitize($d['title']) ?>">
                                                        <i class="bi bi-exclamation-octagon me-1"></i> Dispute Due
                                                    </button>
                                                <?php else: ?>
                                                    <span class="text-muted small"><i class="bi bi-check-all text-success"></i> Resolved</span>
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

<!-- Modal: Raise Dispute -->
<div class="modal fade" id="disputeModal" tabindex="-1" aria-labelledby="disputeModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg">
            <form method="POST" action="">
                <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                <input type="hidden" name="action" value="raise_dispute">
                <input type="hidden" name="due_id" id="modal_due_id">
                <input type="hidden" name="department_id" id="modal_dept_id">

                <div class="modal-header border-bottom py-3">
                    <h5 class="modal-title fw-bold text-danger" id="disputeModalLabel"><i class="bi bi-exclamation-octagon me-2"></i> Raise Dispute on Due</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label text-muted small text-uppercase fw-bold">Department</label>
                        <input type="text" class="form-control bg-light" id="modal_dept_name" readonly>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Subject / Dispute Title <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="subject" id="modal_title" required placeholder="e.g. Payment receipt attached or Book returned">
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Detailed Reason / Explanation <span class="text-danger">*</span></label>
                        <textarea class="form-control" name="description" rows="4" required placeholder="Provide clear details, receipt numbers, dates, or context for department review..."></textarea>
                    </div>
                </div>
                <div class="modal-footer border-top py-3">
                    <button type="button" class="btn btn-light rounded-pill" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-danger rounded-pill px-4 fw-bold">Submit Dispute</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    const disputeModal = document.getElementById('disputeModal');
    if (disputeModal) {
        disputeModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            document.getElementById('modal_due_id').value = button.getAttribute('data-dueid');
            document.getElementById('modal_dept_id').value = button.getAttribute('data-deptid');
            document.getElementById('modal_dept_name').value = button.getAttribute('data-deptname');
            document.getElementById('modal_title').value = 'Dispute on: ' + button.getAttribute('data-title');
        });
    }
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
