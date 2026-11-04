<?php
$page_title = "College Departments Management";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';

require_role(ROLE_ADMIN);

$pdo = db();

// Handle Add Department
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_department') {
    $name = trim($_POST['name'] ?? '');
    $code = strtoupper(trim($_POST['code'] ?? ''));
    $description = trim($_POST['description'] ?? '');
    $token = $_POST['csrf_token'] ?? '';

    if (verify_csrf($token) && !empty($name) && !empty($code)) {
        try {
            $stmt = $pdo->prepare("INSERT INTO departments (name, code, description) VALUES (:name, :code, :desc)");
            $stmt->execute([':name' => $name, ':code' => $code, ':desc' => $description]);
            $dept_id = $pdo->lastInsertId();

            log_audit('CREATE_DEPARTMENT', 'DEPARTMENT', $dept_id, "Added new department: {$name} ({$code})");
            set_flash('success', "Department '{$name}' created successfully.");
            redirect(BASE_URL . '/admin/departments.php');
        } catch (\PDOException $e) {
            set_flash('danger', 'Error creating department: ' . $e->getMessage());
        }
    }
}

// Fetch all departments with student and staff counts
$departments = $pdo->query("
    SELECT d.*, 
           (SELECT COUNT(*) FROM students s WHERE s.department_id = d.id) as student_count,
           (SELECT COUNT(*) FROM staff sf WHERE sf.department_id = d.id) as staff_count
    FROM departments d
    ORDER BY d.name ASC
")->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-building me-2 text-primary"></i> College Departments Catalog</h2>
            <p class="text-muted mb-0">Configure academic departments, labs, hostel administration, and fee clearance bodies.</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <button class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold" data-bs-toggle="modal" data-bs-target="#addDeptModal">
                <i class="bi bi-plus-lg me-1"></i> Add New Department
            </button>
        </div>
    </div>

    <div class="row g-4">
        <?php foreach ($departments as $d): ?>
            <div class="col-md-6 col-lg-4">
                <div class="card card-glass h-100 border-0 shadow-sm">
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="fw-bold mb-0 text-dark"><?= sanitize($d['name']) ?></h5>
                            <span class="badge bg-primary-subtle text-primary border border-primary-subtle"><?= sanitize($d['code']) ?></span>
                        </div>
                        <p class="small text-muted mb-3 flex-grow-1"><?= sanitize($d['description'] ?: 'Standard institutional department.') ?></p>
                        
                        <div class="border-top pt-3 d-flex justify-content-between text-muted small">
                            <span><i class="bi bi-people me-1"></i> <?= $d['student_count'] ?> Students</span>
                            <span><i class="bi bi-person-badge me-1"></i> <?= $d['staff_count'] ?> Staff</span>
                        </div>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<!-- Modal: Add Department -->
<div class="modal fade" id="addDeptModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg">
            <form method="POST" action="">
                <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                <input type="hidden" name="action" value="add_department">

                <div class="modal-header border-bottom py-3">
                    <h5 class="modal-title fw-bold text-dark"><i class="bi bi-building me-2 text-primary"></i> Create Department</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Department Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="name" placeholder="e.g. Mechanical Engineering / Transport" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Short Code <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="code" placeholder="e.g. MECH / TRN" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Description</label>
                        <textarea class="form-control" name="description" rows="3" placeholder="Brief scope of clearance duties..."></textarea>
                    </div>
                </div>
                <div class="modal-footer border-top py-3">
                    <button type="button" class="btn btn-light rounded-pill" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold">Create Department</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
