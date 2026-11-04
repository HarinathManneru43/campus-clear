<?php
$page_title = "My Raised Disputes";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';

require_role(ROLE_STUDENT);

$student_id = $_SESSION['student_id'];
$pdo = db();

$stmt = $pdo->prepare("
    SELECT disp.*, d.name as department_name, du.title as due_title, du.amount as due_amount
    FROM disputes disp
    JOIN departments d ON disp.department_id = d.id
    LEFT JOIN dues du ON disp.due_id = du.id
    WHERE disp.student_id = :sid
    ORDER BY disp.created_at DESC
");
$stmt->execute([':sid' => $student_id]);
$disputes = $stmt->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-exclamation-octagon me-2 text-warning"></i> Department Disputes Tracker</h2>
            <p class="text-muted mb-0">Track formal claims submitted for incorrect dues or clearance holds.</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="<?= BASE_URL ?>/student/dues.php" class="btn btn-outline-primary rounded-pill"><i class="bi bi-plus-lg me-1"></i> Dispute a Due</a>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card card-glass border-0 shadow-sm">
                <div class="card-body p-0">
                    <?php if (empty($disputes)): ?>
                        <div class="text-center py-5">
                            <i class="bi bi-shield-check text-muted display-3 d-block mb-3"></i>
                            <h5 class="fw-bold text-dark">No Disputes Raised</h5>
                            <p class="text-muted">If you believe a due or clearance hold was assigned in error, you can raise a dispute directly from the Dues page.</p>
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Date Raised</th>
                                        <th>Department</th>
                                        <th>Subject</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Resolution Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($disputes as $dp): ?>
                                        <tr>
                                            <td class="small fw-semibold"><?= format_date($dp['created_at']) ?></td>
                                            <td><span class="badge bg-secondary-subtle text-dark"><?= sanitize($dp['department_name']) ?></span></td>
                                            <td><strong class="text-dark"><?= sanitize($dp['subject']) ?></strong></td>
                                            <td class="small text-muted" style="max-width: 300px;"><?= sanitize($dp['description']) ?></td>
                                            <td><?= get_status_badge($dp['status']) ?></td>
                                            <td class="small">
                                                <?php if (!empty($dp['resolution_remarks'])): ?>
                                                    <span class="text-dark fw-semibold"><?= sanitize($dp['resolution_remarks']) ?></span>
                                                <?php else: ?>
                                                    <span class="text-muted">Awaiting Department Review</span>
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
