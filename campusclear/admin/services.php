<?php
$page_title = "Service Categories & Clearance Rules";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';

require_role(ROLE_ADMIN);

$pdo = db();

// Handle Add Service Category
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_service') {
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $requires_full_clearance = isset($_POST['requires_full_clearance']) ? 1 : 0;
    $token = $_POST['csrf_token'] ?? '';

    if (verify_csrf($token) && !empty($name)) {
        try {
            $stmt = $pdo->prepare("INSERT INTO service_categories (name, description, requires_full_clearance) VALUES (:name, :desc, :req)");
            $stmt->execute([':name' => $name, ':desc' => $description, ':req' => $requires_full_clearance]);
            $sid = $pdo->lastInsertId();

            log_audit('CREATE_SERVICE_CATEGORY', 'SERVICE_CATEGORY', $sid, "Added service category: {$name}");
            set_flash('success', "Service category '{$name}' created.");
            redirect(BASE_URL . '/admin/services.php');
        } catch (\PDOException $e) {
            set_flash('danger', 'Error adding service: ' . $e->getMessage());
        }
    }
}

// Fetch all services
$services = $pdo->query("SELECT * FROM service_categories ORDER BY name ASC")->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-sliders me-2 text-primary"></i> Service Request Rules & Categories</h2>
            <p class="text-muted mb-0">Configure student request categories and clearance eligibility policies.</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <button class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold" data-bs-toggle="modal" data-bs-target="#addServiceModal">
                <i class="bi bi-plus-lg me-1"></i> Add Service Category
            </button>
        </div>
    </div>

    <div class="row g-4">
        <?php foreach ($services as $s): ?>
            <div class="col-md-6 col-lg-4">
                <div class="card card-glass h-100 border-0 shadow-sm">
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="fw-bold mb-0 text-dark"><?= sanitize($s['name']) ?></h5>
                            <?php if ($s['requires_full_clearance']): ?>
                                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Full Clearance Required</span>
                            <?php else: ?>
                                <span class="badge bg-success-subtle text-success border border-success-subtle">Direct Access</span>
                            <?php endif; ?>
                        </div>
                        <p class="small text-muted mb-3 flex-grow-1"><?= sanitize($s['description']) ?></p>
                        
                        <div class="border-top pt-3 d-flex justify-content-between align-items-center text-xs text-muted">
                            <span>Status: Active</span>
                            <span class="fw-bold text-primary">ID #<?= $s['id'] ?></span>
                        </div>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<!-- Modal: Add Service -->
<div class="modal fade" id="addServiceModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg">
            <form method="POST" action="">
                <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                <input type="hidden" name="action" value="add_service">

                <div class="modal-header border-bottom py-3">
                    <h5 class="modal-title fw-bold text-dark"><i class="bi bi-plus-circle me-2 text-primary"></i> Add Service Category</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Service Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="name" placeholder="e.g. Migration Certificate" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Description</label>
                        <textarea class="form-control" name="description" rows="3" placeholder="Brief purpose..."></textarea>
                    </div>
                    <div class="form-check form-switch mb-3">
                        <input class="form-check-input" type="checkbox" name="requires_full_clearance" id="req_switch" value="1" checked>
                        <label class="form-check-label fw-bold" for="req_switch">Require 100% Departmental Clearance to Apply</label>
                    </div>
                </div>
                <div class="modal-footer border-top py-3">
                    <button type="button" class="btn btn-light rounded-pill" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold">Add Category</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
