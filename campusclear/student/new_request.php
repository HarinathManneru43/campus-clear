<?php
$page_title = "Apply for College Service";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

require_role(ROLE_STUDENT);

$student_id = $_SESSION['student_id'];
$pdo = db();

// Fetch student continuous clearance summary
$clearance = get_student_clearance_summary($student_id);

// Fetch available active service categories
$sc_stmt = $pdo->prepare("SELECT * FROM service_categories WHERE is_active = 1 ORDER BY name ASC");
$sc_stmt->execute();
$services = $sc_stmt->fetchAll();

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $service_id = (int)($_POST['service_id'] ?? 0);
    $purpose = trim($_POST['purpose'] ?? '');
    $token = $_POST['csrf_token'] ?? '';

    if (!verify_csrf($token)) {
        $error = 'Security token verification failed.';
    } elseif ($service_id <= 0 || empty($purpose)) {
        $error = 'Please select a service category and state your purpose.';
    } else {
        // Fetch service detail to check clearance requirements
        $srv_stmt = $pdo->prepare("SELECT * FROM service_categories WHERE id = :id");
        $srv_stmt->execute([':id' => $service_id]);
        $service = $srv_stmt->fetch();

        if (!$service) {
            $error = 'Selected service is invalid.';
        } elseif ($service['requires_full_clearance'] == 1 && !$clearance['is_cleared']) {
            $error = 'Application Blocked: This service requires FULL departmental clearance. You have pending issues in ' . $clearance['pending_count'] . ' department(s).';
        } else {
            try {
                $req_num = 'REQ-' . date('Y') . '-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
                $qr_token = 'TOKEN_' . strtoupper(substr(md5(uniqid($student_id, true)), 0, 16));
                $clearance_snapshot = $clearance['is_cleared'] ? 'cleared' : 'pending';

                $pdo->beginTransaction();

                $inst_stmt = $pdo->prepare("
                    INSERT INTO service_requests (request_number, student_id, service_id, purpose, status, clearance_snapshot, qr_token)
                    VALUES (:req_num, :sid, :srv_id, :purpose, 'submitted', :snapshot, :qr)
                ");
                $inst_stmt->execute([
                    ':req_num' => $req_num,
                    ':sid' => $student_id,
                    ':srv_id' => $service_id,
                    ':purpose' => $purpose,
                    ':snapshot' => $clearance_snapshot,
                    ':qr' => $qr_token
                ]);
                $request_id = $pdo->lastInsertId();

                // Initialize request approvals for active departments
                $depts_stmt = $pdo->query("SELECT id FROM departments WHERE is_active = 1");
                $active_depts = $depts_stmt->fetchAll(PDO::FETCH_COLUMN);

                $appr_stmt = $pdo->prepare("
                    INSERT INTO request_approvals (request_id, department_id, status)
                    VALUES (:rid, :did, 'pending')
                ");
                foreach ($active_depts as $dept_id) {
                    $appr_stmt->execute([':rid' => $request_id, ':did' => $dept_id]);
                }

                $pdo->commit();

                log_audit('SUBMIT_SERVICE_REQUEST', 'SERVICE_REQUEST', $request_id, "Submitted request {$req_num} for service ID {$service_id}");

                set_flash('success', "Service Request {$req_num} submitted successfully!");
                redirect(BASE_URL . '/student/service_requests.php');

            } catch (\PDOException $e) {
                $pdo->rollBack();
                $error = 'Failed to submit request: ' . $e->getMessage();
            }
        }
    }
}
?>

<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-file-earmark-plus me-2 text-primary"></i> Apply for College Service</h2>
            <p class="text-muted">Request Bonafide Certificates, Exam Clearance, ID Card Replacement, Transcripts, etc.</p>
        </div>
        <div class="col-md-4 text-md-end">
            <span class="fs-6 me-2">Overall Clearance:</span>
            <?= get_status_badge($clearance['overall_status']) ?>
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
                        <label class="form-label fw-bold">Select Service Category <span class="text-danger">*</span></label>
                        <select class="form-select form-select-lg" name="service_id" id="service_select" required>
                            <option value="">-- Select Service --</option>
                            <?php foreach ($services as $srv): ?>
                                <option value="<?= $srv['id'] ?>" 
                                        data-requires-clearance="<?= $srv['requires_full_clearance'] ?>"
                                        data-description="<?= sanitize($srv['description']) ?>">
                                    <?= sanitize($srv['name']) ?> <?= $srv['requires_full_clearance'] ? '(Requires Full Clearance)' : '(No Clearance Required)' ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <div id="service_description" class="form-text mt-2 text-primary"></div>
                    </div>

                    <!-- Dynamic Clearance Warning Banner -->
                    <div id="clearance_warning_box" class="alert alert-warning border border-warning-subtle rounded-3 p-4 mb-4 d-none">
                        <h5 class="fw-bold text-warning-emphasis"><i class="bi bi-shield-exclamation me-2"></i> Department Clearance Hold Required</h5>
                        <p class="mb-2">This service requires FULL clearance across all college departments. The system detected pending issues in:</p>
                        <ul class="mb-3 ps-3">
                            <?php foreach ($clearance['pending_departments'] as $pd): ?>
                                <li><strong><?= sanitize($pd['name']) ?>:</strong> <?= sanitize($pd['reason']) ?></li>
                            <?php endforeach; ?>
                        </ul>
                        <div class="d-flex align-items-center justify-content-between">
                            <span class="small text-muted">Resolve pending dues to enable request submission.</span>
                            <a href="<?= BASE_URL ?>/student/dues.php" class="btn btn-sm btn-warning rounded-pill fw-bold">Resolve Dues Now</a>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-bold">Purpose / Reason for Request <span class="text-danger">*</span></label>
                        <textarea class="form-control" name="purpose" rows="4" required placeholder="Describe why you need this service (e.g. Education loan bank submission, Exam hall entry, lost card re-issue)"></textarea>
                    </div>

                    <div class="d-flex justify-content-between align-items-center">
                        <a href="<?= BASE_URL ?>/student/service_requests.php" class="btn btn-light rounded-pill px-4">Cancel</a>
                        <button type="submit" id="submit_btn" class="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm">
                            <i class="bi bi-send me-2"></i> Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div class="col-lg-4 mt-4 mt-lg-0">
            <div class="card card-glass p-4 border-0 shadow-sm">
                <h5 class="fw-bold mb-3 text-dark"><i class="bi bi-info-circle text-primary me-2"></i> Continuous Clearance Rules</h5>
                <p class="small text-muted mb-3">
                    CampusClear continuously checks your status across <strong>Library, Accounts, Hostel, Department, Lab, and Exam Cell</strong>.
                </p>
                <div class="p-3 bg-light rounded-3 mb-3 border">
                    <span class="small fw-bold d-block text-dark">Full Clearance Services:</span>
                    <small class="text-muted">Exam Hall Tickets, Bonafide Certificates, Transfer Certificates require 100% cleared status.</small>
                </div>
                <div class="p-3 bg-light rounded-3 border">
                    <span class="small fw-bold d-block text-dark">Instant QR Verification:</span>
                    <small class="text-muted">Once approved, an official digital certificate with an embedded QR code will be generated automatically.</small>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    const serviceSelect = document.getElementById('service_select');
    const descBox = document.getElementById('service_description');
    const warningBox = document.getElementById('clearance_warning_box');
    const submitBtn = document.getElementById('submit_btn');
    const isOverallCleared = <?= $clearance['is_cleared'] ? 'true' : 'false' ?>;

    serviceSelect.addEventListener('change', function () {
        const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
        if (!selectedOption || !selectedOption.value) {
            descBox.textContent = '';
            warningBox.classList.add('d-none');
            submitBtn.disabled = false;
            return;
        }

        const requiresClearance = selectedOption.getAttribute('data-requires-clearance') === '1';
        const description = selectedOption.getAttribute('data-description');

        descBox.textContent = description || '';

        if (requiresClearance && !isOverallCleared) {
            warningBox.classList.remove('d-none');
            submitBtn.disabled = true;
        } else {
            warningBox.classList.add('d-none');
            submitBtn.disabled = false;
        }
    });
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
