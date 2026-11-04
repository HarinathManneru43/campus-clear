<?php
$page_title = "Department Service Request Approvals";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';

require_role([ROLE_STAFF, ROLE_ADMIN]);

$staff_dept_id = $_SESSION['department_id'] ?? 1;
$staff_user_id = $_SESSION['user_id'];
$pdo = db();

// Handle Approval / Rejection
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $approval_id = (int)($_POST['approval_id'] ?? 0);
    $request_id = (int)($_POST['request_id'] ?? 0);
    $action_status = $_POST['action'] === 'approve' ? 'approved' : 'rejected';
    $remarks = trim($_POST['remarks'] ?? '');
    $token = $_POST['csrf_token'] ?? '';

    if (verify_csrf($token) && $approval_id > 0) {
        $upd = $pdo->prepare("
            UPDATE request_approvals 
            SET status = :st, remarks = :remarks, action_by_user_id = :uid, updated_at = CURRENT_TIMESTAMP
            WHERE id = :aid AND department_id = :did
        ");
        $upd->execute([
            ':st' => $action_status,
            ':remarks' => $remarks,
            ':uid' => $staff_user_id,
            ':aid' => $approval_id,
            ':did' => $staff_dept_id
        ]);

        // Check overall service request status (If all departments approve -> overall status = approved)
        $chk_stmt = $pdo->prepare("SELECT status FROM request_approvals WHERE request_id = :rid");
        $chk_stmt->execute([':rid' => $request_id]);
        $statuses = $chk_stmt->fetchAll(PDO::FETCH_COLUMN);

        $overall_req_status = 'in_progress';
        if (in_array('rejected', $statuses)) {
            $overall_req_status = 'rejected';
        } elseif (!in_array('pending', $statuses)) {
            $overall_req_status = 'approved';
        }

        $req_upd = $pdo->prepare("UPDATE service_requests SET status = :st WHERE id = :rid");
        $req_upd->execute([':st' => $overall_req_status, ':rid' => $request_id]);

        log_audit('SERVICE_REQUEST_ACTION', 'SERVICE_REQUEST', $request_id, "Department {$staff_dept_id} {$action_status} request ID {$request_id}");
        set_flash('success', "Service request marked as " . strtoupper($action_status) . ".");
        redirect(BASE_URL . '/staff/service_requests.php');
    }
}

// Fetch pending request approvals for staff department
$stmt = $pdo->prepare("
    SELECT ra.*, sr.request_number, sr.purpose, sr.created_at as request_date, sr.clearance_snapshot,
           s.full_name as student_name, s.roll_number, sc.name as service_name
    FROM request_approvals ra
    JOIN service_requests sr ON ra.request_id = sr.id
    JOIN students s ON sr.student_id = s.id
    JOIN service_categories sc ON sr.service_id = sc.id
    WHERE ra.department_id = :did
    ORDER BY ra.updated_at DESC
");
$stmt->execute([':did' => $staff_dept_id]);
$approvals = $stmt->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-card-checklist me-2 text-primary"></i> Service Request Approvals</h2>
            <p class="text-muted">Review student applications requiring departmental clearance verification.</p>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card card-glass border-0 shadow-sm">
                <div class="card-body p-0">
                    <?php if (empty($approvals)): ?>
                        <div class="text-center py-5">
                            <i class="bi bi-check-all text-success display-3 d-block mb-2"></i>
                            <p class="text-muted mb-0">No service request approvals pending for your department.</p>
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Request No</th>
                                        <th>Student Name</th>
                                        <th>Service Category</th>
                                        <th>Purpose</th>
                                        <th>Clearance State</th>
                                        <th>Dept Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($approvals as $appr): ?>
                                        <tr>
                                            <td class="fw-bold"><code><?= sanitize($appr['request_number']) ?></code></td>
                                            <td>
                                                <strong class="text-dark d-block"><?= sanitize($appr['student_name']) ?></strong>
                                                <small class="text-muted"><?= sanitize($appr['roll_number']) ?></small>
                                            </td>
                                            <td><span class="fw-bold text-dark"><?= sanitize($appr['service_name']) ?></span></td>
                                            <td class="small text-muted" style="max-width: 250px;"><?= sanitize($appr['purpose']) ?></td>
                                            <td>
                                                <span class="badge <?= $appr['clearance_snapshot'] === 'cleared' ? 'bg-success' : 'bg-warning text-dark' ?>">
                                                    <?= strtoupper($appr['clearance_snapshot']) ?>
                                                </span>
                                            </td>
                                            <td><?= get_status_badge($appr['status']) ?></td>
                                            <td>
                                                <?php if ($appr['status'] === 'pending'): ?>
                                                    <div class="d-flex gap-2">
                                                        <form method="POST" action="">
                                                            <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                                                            <input type="hidden" name="approval_id" value="<?= $appr['id'] ?>">
                                                            <input type="hidden" name="request_id" value="<?= $appr['request_id'] ?>">
                                                            <input type="hidden" name="action" value="approve">
                                                            <button type="submit" class="btn btn-sm btn-success rounded-pill px-3">Approve</button>
                                                        </form>
                                                        <form method="POST" action="">
                                                            <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                                                            <input type="hidden" name="approval_id" value="<?= $appr['id'] ?>">
                                                            <input type="hidden" name="request_id" value="<?= $appr['request_id'] ?>">
                                                            <input type="hidden" name="action" value="reject">
                                                            <button type="submit" class="btn btn-sm btn-outline-danger rounded-pill px-3">Reject</button>
                                                        </form>
                                                    </div>
                                                <?php else: ?>
                                                    <span class="small text-muted">Processed</span>
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
