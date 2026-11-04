<?php
$page_title = "My Service Requests";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';

require_role(ROLE_STUDENT);

$student_id = $_SESSION['student_id'];
$pdo = db();

$stmt = $pdo->prepare("
    SELECT sr.*, sc.name as service_name, sc.requires_full_clearance
    FROM service_requests sr
    JOIN service_categories sc ON sr.service_id = sc.id
    WHERE sr.student_id = :sid
    ORDER BY sr.created_at DESC
");
$stmt->execute([':sid' => $student_id]);
$requests = $stmt->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-file-earmark-text me-2 text-primary"></i> Service Request History</h2>
            <p class="text-muted mb-0">Track applications for Bonafide Certificates, Exam Hall Tickets, ID Re-issuance, and Transcripts.</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="<?= BASE_URL ?>/student/new_request.php" class="btn btn-primary rounded-pill px-4 py-2 shadow-sm fw-bold">
                <i class="bi bi-plus-lg me-1"></i> Apply New Request
            </a>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card card-glass border-0 shadow-sm">
                <div class="card-body p-0">
                    <?php if (empty($requests)): ?>
                        <div class="text-center py-5">
                            <i class="bi bi-file-earmark-plus text-primary display-2 d-block mb-3"></i>
                            <h4 class="fw-bold text-dark">No Service Requests Found</h4>
                            <p class="text-muted">You haven't submitted any service requests yet.</p>
                            <a href="<?= BASE_URL ?>/student/new_request.php" class="btn btn-primary rounded-pill px-4">Submit First Request</a>
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Request No</th>
                                        <th>Service Category</th>
                                        <th>Purpose</th>
                                        <th>Clearance State</th>
                                        <th>Approval Status</th>
                                        <th>Submitted On</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($requests as $req): ?>
                                        <tr>
                                            <td class="fw-bold"><code><?= sanitize($req['request_number']) ?></code></td>
                                            <td><span class="fw-bold text-dark"><?= sanitize($req['service_name']) ?></span></td>
                                            <td class="small text-muted" style="max-width: 250px;"><?= sanitize($req['purpose']) ?></td>
                                            <td>
                                                <span class="badge <?= $req['clearance_snapshot'] === 'cleared' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis' ?>">
                                                    <?= strtoupper($req['clearance_snapshot']) ?>
                                                </span>
                                            </td>
                                            <td><?= get_status_badge($req['status']) ?></td>
                                            <td class="small text-muted"><?= format_date($req['created_at']) ?></td>
                                            <td>
                                                <?php if ($req['status'] === 'approved'): ?>
                                                    <a href="<?= BASE_URL ?>/student/certificate.php?request_id=<?= $req['id'] ?>" class="btn btn-sm btn-success rounded-pill px-3">
                                                        <i class="bi bi-award me-1"></i> QR Certificate
                                                    </a>
                                                <?php else: ?>
                                                    <span class="badge bg-light text-secondary border">In Processing</span>
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
