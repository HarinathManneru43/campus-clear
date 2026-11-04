<?php
$page_title = "Department Clearance Status";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

require_role(ROLE_STUDENT);

$student_id = $_SESSION['student_id'];
$pdo = db();

$clearance = get_student_clearance_summary($student_id);

// Fetch status transition history log for this student
$hist_stmt = $pdo->prepare("
    SELECT ch.*, d.name as department_name, u.username as updated_by_name
    FROM clearance_history ch
    JOIN departments d ON ch.department_id = d.id
    JOIN users u ON ch.updated_by_user_id = u.id
    WHERE ch.student_id = :sid
    ORDER BY ch.created_at DESC LIMIT 20
");
$hist_stmt->execute([':sid' => $student_id]);
$history_logs = $hist_stmt->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-patch-check me-2 text-success"></i> Continuous Department Clearance Monitor</h2>
            <p class="text-muted mb-0">Live status updated continuously by department heads and administrative staff.</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <span class="fs-5 fw-bold me-2">Overall:</span>
            <?= get_status_badge($clearance['overall_status']) ?>
        </div>
    </div>

    <!-- Active Department Status Cards -->
    <div class="row g-4 mb-5">
        <?php foreach ($clearance['department_details'] as $dept): ?>
            <div class="col-md-6 col-xl-4">
                <div class="card card-glass h-100 border-0 shadow-sm">
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 class="fw-bold mb-0 text-dark"><?= sanitize($dept['name']) ?></h5>
                                <span class="badge bg-light text-secondary border mt-1"><?= sanitize($dept['code']) ?></span>
                            </div>
                            <div><?= get_status_badge($dept['effective_status']) ?></div>
                        </div>
                        
                        <div class="my-auto">
                            <?php if ($dept['pending_dues_count'] > 0): ?>
                                <div class="alert alert-danger py-2 px-3 mb-2 small">
                                    <i class="bi bi-exclamation-circle me-1"></i> <strong><?= $dept['pending_dues_count'] ?> Pending Due(s):</strong> <?= format_currency($dept['total_due_amount']) ?>
                                </div>
                            <?php endif; ?>
                            
                            <p class="small text-muted mb-0">
                                <strong>Remarks:</strong> <?= sanitize($dept['remarks']) ?>
                            </p>
                        </div>

                        <div class="border-top pt-3 mt-3 d-flex justify-content-between align-items-center text-muted text-xs">
                            <span><i class="bi bi-clock me-1"></i> Updated: <?= format_date($dept['last_updated']) ?></span>
                            <?php if ($dept['effective_status'] === 'pending'): ?>
                                <a href="<?= BASE_URL ?>/student/dues.php" class="btn btn-sm btn-outline-danger py-0 px-2 rounded-pill">View Dues</a>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <!-- Clearance Transition History Trail -->
    <div class="row">
        <div class="col-12">
            <div class="card card-glass border-0 shadow-sm">
                <div class="card-header bg-white py-3 border-bottom">
                    <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-journal-text me-2 text-primary"></i> Clearance Transition Audit History</h5>
                </div>
                <div class="card-body p-0">
                    <?php if (empty($history_logs)): ?>
                        <div class="text-center py-4 text-muted">
                            <p class="mb-0">No status changes recorded yet.</p>
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Department</th>
                                        <th>Previous Status</th>
                                        <th>New Status</th>
                                        <th>Remarks</th>
                                        <th>Updated By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($history_logs as $log): ?>
                                        <tr>
                                            <td class="small fw-semibold"><?= format_date($log['created_at']) ?></td>
                                            <td><?= sanitize($log['department_name']) ?></td>
                                            <td><span class="badge bg-secondary-subtle text-secondary"><?= strtoupper($log['previous_status']) ?></span></td>
                                            <td><?= get_status_badge($log['new_status']) ?></td>
                                            <td class="small text-muted"><?= sanitize($log['remarks']) ?></td>
                                            <td class="small"><code><?= sanitize($log['updated_by_name']) ?></code></td>
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
