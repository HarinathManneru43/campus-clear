<?php
$page_title = "Official Digital Clearance Certificate";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

require_role(ROLE_STUDENT);

$student_id = $_SESSION['student_id'];
$pdo = db();

// Fetch student details
$stu_stmt = $pdo->prepare("
    SELECT s.*, d.name as department_name, d.code as department_code
    FROM students s
    JOIN departments d ON s.department_id = d.id
    WHERE s.id = :sid
");
$stu_stmt->execute([':sid' => $student_id]);
$student = $stu_stmt->fetch();

// Compute continuous clearance
$clearance = get_student_clearance_summary($student_id);

// Generate or fetch certificate verification QR token
$req_id = (int)($_GET['request_id'] ?? 0);
$service_certificate_title = "DIGITAL NO-DUE CLEARANCE CERTIFICATE";
$existing_token = null;

if ($req_id > 0) {
    $r_stmt = $pdo->prepare("
        SELECT sr.qr_token, sc.name as service_name
        FROM service_requests sr
        JOIN service_categories sc ON sr.service_id = sc.id
        WHERE sr.id = :rid AND sr.student_id = :sid
    ");
    $r_stmt->execute([':rid' => $req_id, ':sid' => $student_id]);
    $specific_req = $r_stmt->fetch();
    if ($specific_req && !empty($specific_req['qr_token'])) {
        $existing_token = $specific_req['qr_token'];
        $service_certificate_title = strtoupper(sanitize($specific_req['service_name'])) . " CLEARANCE CERTIFICATE";
    }
}

if (!$existing_token) {
    $token_stmt = $pdo->prepare("
        SELECT qr_token FROM service_requests 
        WHERE student_id = :sid AND clearance_snapshot = 'cleared'
        ORDER BY created_at DESC LIMIT 1
    ");
    $token_stmt->execute([':sid' => $student_id]);
    $existing_token = $token_stmt->fetchColumn();
}

if (!$existing_token) {
    $existing_token = 'CERT-' . strtoupper(substr(md5('CAMPUSCLEAR_' . $student['roll_number'] . '_' . date('Ymd')), 0, 16));
}

$verification_url = SITE_URL . "/verify.php?token=" . urlencode($existing_token);
?>

<div class="container-fluid">
    <div class="row mb-4 no-print align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-award me-2 text-success"></i> Digital Clearance Certificate</h2>
            <p class="text-muted mb-0">Official university-certified clearance document with cryptographic QR code validation.</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <?php if ($clearance['is_cleared']): ?>
                <button onclick="window.print();" class="btn btn-primary rounded-pill px-4 py-2 shadow-sm fw-bold">
                    <i class="bi bi-printer me-2"></i> Print / Download PDF
                </button>
            <?php else: ?>
                <a href="<?= BASE_URL ?>/student/dues.php" class="btn btn-warning rounded-pill px-4 py-2 fw-bold">
                    <i class="bi bi-exclamation-triangle me-1"></i> Resolve Dues First
                </a>
            <?php endif; ?>
        </div>
    </div>

    <?php if (!$clearance['is_cleared']): ?>
        <!-- Certificate Locked View -->
        <div class="card card-glass p-5 text-center border-warning border-3 shadow-lg max-w-2xl mx-auto">
            <div class="bg-warning-subtle text-warning p-4 rounded-circle mx-auto mb-3" style="width: 90px; height: 90px;">
                <i class="bi bi-lock-fill display-4"></i>
            </div>
            <h3 class="fw-bold text-dark mb-2">Certificate Locked: Clearance Pending</h3>
            <p class="text-muted fs-5 mb-4">
                You currently have <strong><?= $clearance['pending_count'] ?> pending department clearance(s)</strong>. Official digital clearance certificates are only issued once all departments confirm zero dues.
            </p>
            <div class="p-3 bg-light rounded-3 mb-4 text-start">
                <span class="fw-bold d-block mb-2 text-dark">Pending Departments:</span>
                <ul class="mb-0 ps-3">
                    <?php foreach ($clearance['pending_departments'] as $pd): ?>
                        <li class="text-danger fw-semibold"><?= sanitize($pd['name']) ?>: <?= sanitize($pd['reason']) ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
            <div>
                <a href="<?= BASE_URL ?>/student/dues.php" class="btn btn-warning px-5 py-3 rounded-pill fw-bold">Resolve Pending Dues Now</a>
            </div>
        </div>
    <?php else: ?>
        <!-- Printable Certificate Canvas -->
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <div class="card p-5 border-4 border-primary rounded-4 bg-white shadow-2xl position-relative overflow-hidden" id="certificate_canvas" style="border-style: double !important;">
                    <!-- Watermark -->
                    <div class="position-absolute top-50 start-50 translate-middle opacity-5 pointer-events-none text-center">
                        <i class="bi bi-shield-check" style="font-size: 25rem; color: #4f46e5;"></i>
                    </div>

                    <!-- Header Banner -->
                    <div class="row align-items-center mb-4 border-bottom pb-4">
                        <div class="col-8">
                            <h2 class="fw-extrabold text-uppercase tracking-wider text-primary mb-1" style="font-family:'Times New Roman', serif;">Central University of Technology</h2>
                            <h5 class="fw-bold text-secondary mb-0">Office of the Controller of Examinations & Registrar</h5>
                            <small class="text-muted">Main Campus, Academic District | Accreditation: NAAC A++ Grade</small>
                        </div>
                        <div class="col-4 text-end">
                            <div class="p-2 border border-success rounded-3 bg-success-subtle text-success d-inline-block text-center px-3">
                                <i class="bi bi-patch-check-fill fs-4 d-block"></i>
                                <span class="fw-bold text-uppercase small">OFFICIALLY CLEARED</span>
                            </div>
                        </div>
                    </div>

                    <!-- Certificate Title -->
                    <div class="text-center my-4">
                        <h3 class="fw-bold text-uppercase tracking-widest text-dark" style="letter-spacing: 3px; font-family:'Times New Roman', serif;">
                            <?= $service_certificate_title ?>
                        </h3>
                        <p class="text-muted italic">Issued via Continuous Digital Clearance Management Engine</p>
                    </div>

                    <!-- Certificate Body -->
                    <div class="my-3 fs-5 lh-lg text-dark" style="font-family: Georgia, serif;">
                        <p>
                            This is to officially certify that Student <strong><?= sanitize($student['full_name']) ?></strong>, 
                            bearing Roll Number / Unique Student ID <strong><code><?= sanitize($student['roll_number']) ?></code></strong>, 
                            belonging to the Department of <strong><?= sanitize($student['department_name']) ?></strong> 
                            (Batch: <?= sanitize($student['batch']) ?>, Semester <?= $student['semester'] ?>), 
                            has completed all institutional clearance protocols.
                        </p>
                        <p>
                            As per the continuous clearance records verified on <strong><?= date('F d, Y') ?></strong>, the student has 
                            <span class="text-success fw-bold text-decoration-underline">ZERO OUTSTANDING DUES OR PENALTIES</span> 
                            across all college administrative and academic divisions.
                        </p>
                    </div>

                    <!-- Department Clearance Grid -->
                    <div class="row my-4 g-3">
                        <?php foreach ($clearance['department_details'] as $dept): ?>
                            <div class="col-4 col-md-3">
                                <div class="p-2 border rounded-3 text-center bg-light">
                                    <span class="d-block small text-muted text-truncate"><?= sanitize($dept['name']) ?></span>
                                    <span class="badge bg-success mt-1"><i class="bi bi-check-circle me-1"></i> CLEARED</span>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <!-- Signatures and QR Code Footer -->
                    <div class="row align-items-end mt-5 pt-4 border-top">
                        <div class="col-md-4 text-center text-md-start mb-4 mb-md-0">
                            <div id="qrcode" class="d-inline-block border p-2 bg-white rounded-3 shadow-sm mb-2"></div>
                            <span class="d-block text-xs text-muted" style="font-size:0.7rem;">Scan QR to verify document authenticity online</span>
                            <code class="text-xs" style="font-size:0.65rem;"><?= sanitize($existing_token) ?></code>
                        </div>

                        <div class="col-md-4 text-center mb-4 mb-md-0">
                            <div class="border-bottom border-dark pb-2 mb-1 w-75 mx-auto">
                                <span class="fw-bold font-monospace text-primary">DIGITAL SEAL STAMPED</span>
                            </div>
                            <span class="small fw-semibold text-muted d-block">CampusClear Automated Engine</span>
                            <span class="text-xs text-muted" style="font-size:0.75rem;">Verified Date: <?= date('d M Y') ?></span>
                        </div>

                        <div class="col-md-4 text-center text-md-end">
                            <div class="border-bottom border-dark pb-2 mb-1 w-75 ms-auto">
                                <span class="fw-bold font-monospace">Dr. M. K. Sharma</span>
                            </div>
                            <span class="small fw-semibold text-dark d-block">Controller of Examinations</span>
                            <span class="text-xs text-muted" style="font-size:0.75rem;">Registrar Cell, CUT University</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
        document.addEventListener('DOMContentLoaded', function () {
            // Generate QR Code dynamically
            new QRCode(document.getElementById("qrcode"), {
                text: "<?= $verification_url ?>",
                width: 90,
                height: 90,
                colorDark : "#0f172a",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        });
        </script>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
