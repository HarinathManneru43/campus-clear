<?php
$page_title = "Staff Account Management";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';

require_role(ROLE_ADMIN);

$pdo = db();

// Fetch active departments for select
$departments = $pdo->query("SELECT * FROM departments WHERE is_active = 1 ORDER BY name ASC")->fetchAll();

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_staff') {
    $username = trim($_POST['username'] ?? '');
    $staff_code = trim($_POST['staff_code'] ?? '');
    $full_name = trim($_POST['full_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $department_id = (int)($_POST['department_id'] ?? 0);
    $designation = trim($_POST['designation'] ?? 'Department Staff');
    $password = $_POST['password'] ?? '';
    $token = $_POST['csrf_token'] ?? '';

    if (!verify_csrf($token)) {
        $error = 'Security token error.';
    } elseif (empty($username) || empty($staff_code) || empty($full_name) || empty($email) || empty($password) || $department_id <= 0) {
        $error = 'Please fill in all required fields.';
    } else {
        try {
            $pdo->beginTransaction();

            $pass_hash = password_hash($password, PASSWORD_BCRYPT);
            $u_stmt = $pdo->prepare("
                INSERT INTO users (username, password_hash, email, role, status)
                VALUES (:u, :p, :email, 'staff', 'active')
            ");
            $u_stmt->execute([':u' => $username, ':p' => $pass_hash, ':email' => $email]);
            $user_id = $pdo->lastInsertId();

            $s_stmt = $pdo->prepare("
                INSERT INTO staff (user_id, staff_code, full_name, email, phone, department_id, designation)
                VALUES (:uid, :code, :name, :email, :phone, :did, :desig)
            ");
            $s_stmt->execute([
                ':uid' => $user_id,
                ':code' => $staff_code,
                ':name' => $full_name,
                ':email' => $email,
                ':phone' => $phone,
                ':did' => $department_id,
                ':desig' => $designation
            ]);
            $staff_id = $pdo->lastInsertId();

            $pdo->commit();

            log_audit('CREATE_STAFF', 'STAFF', $staff_id, "Created staff account {$username} for department {$department_id}");
            set_flash('success', "Staff account '{$full_name}' created successfully.");
            redirect(BASE_URL . '/admin/staff.php');

        } catch (\PDOException $e) {
            $pdo->rollBack();
            $error = 'Error creating staff: ' . $e->getMessage();
        }
    }
}

// Fetch staff list
$staff_members = $pdo->query("
    SELECT sf.*, d.name as department_name, d.code as department_code, u.username, u.status as user_status
    FROM staff sf
    JOIN departments d ON sf.department_id = d.id
    JOIN users u ON sf.user_id = u.id
    ORDER BY d.name ASC, sf.full_name ASC
")->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-person-badge me-2 text-primary"></i> Staff Directory & Account Management</h2>
            <p class="text-muted mb-0">Manage department staff accounts and role assignments.</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <button class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold" data-bs-toggle="modal" data-bs-target="#addStaffModal">
                <i class="bi bi-plus-lg me-1"></i> Add New Staff Member
            </button>
        </div>
    </div>

    <?php if (!empty($error)): ?>
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> <?= sanitize($error) ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <div class="card card-glass border-0 shadow-sm">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Staff Code</th>
                            <th>Staff Name</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Email & Username</th>
                            <th>Account Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($staff_members as $sf): ?>
                            <tr>
                                <td class="fw-bold"><code><?= sanitize($sf['staff_code']) ?></code></td>
                                <td><strong class="text-dark"><?= sanitize($sf['full_name']) ?></strong></td>
                                <td><span class="badge bg-primary-subtle text-primary"><?= sanitize($sf['department_name']) ?></span></td>
                                <td class="small"><?= sanitize($sf['designation']) ?></td>
                                <td class="small">
                                    User: <code><?= sanitize($sf['username']) ?></code><br>
                                    Email: <?= sanitize($sf['email']) ?>
                                </td>
                                <td><span class="badge bg-success-subtle text-success"><?= strtoupper($sf['user_status']) ?></span></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Modal: Add Staff -->
<div class="modal fade" id="addStaffModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg">
            <form method="POST" action="">
                <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                <input type="hidden" name="action" value="add_staff">

                <div class="modal-header border-bottom py-3">
                    <h5 class="modal-title fw-bold text-dark"><i class="bi bi-person-plus me-2 text-primary"></i> Create Staff Account</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body p-4">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Login Username <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="username" placeholder="e.g. staff_lib_02" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Staff Code / Employee ID <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="staff_code" placeholder="e.g. STF-LIB-02" required>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Full Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="full_name" placeholder="Full Name" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Email Address <span class="text-danger">*</span></label>
                            <input type="email" class="form-control" name="email" placeholder="staff@campusclear.edu" required>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Assigned Department <span class="text-danger">*</span></label>
                            <select class="form-select" name="department_id" required>
                                <option value="">Select Department...</option>
                                <?php foreach ($departments as $d): ?>
                                    <option value="<?= $d['id'] ?>"><?= sanitize($d['name']) ?> (<?= sanitize($d['code']) ?>)</option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Designation</label>
                            <input type="text" class="form-control" name="designation" placeholder="e.g. Assistant Librarian / Warden">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Phone Number</label>
                            <input type="tel" class="form-control" name="phone" placeholder="Mobile Number">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Account Password <span class="text-danger">*</span></label>
                            <input type="password" class="form-control" name="password" required placeholder="Initial password">
                        </div>
                    </div>
                </div>

                <div class="modal-footer border-top py-3">
                    <button type="button" class="btn btn-light rounded-pill" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold">Create Staff Member</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
