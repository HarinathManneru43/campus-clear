<?php
$page_title = "Admin Student Directory Management";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

require_role(ROLE_ADMIN);

$pdo = db();

// Handle Delete Student
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_student') {
    $student_id = (int)($_POST['student_id'] ?? 0);
    $token = $_POST['csrf_token'] ?? '';

    if (verify_csrf($token) && $student_id > 0) {
        $u_stmt = $pdo->prepare("SELECT user_id, roll_number FROM students WHERE id = :sid");
        $u_stmt->execute([':sid' => $student_id]);
        $st = $u_stmt->fetch();

        if ($st) {
            $pdo->prepare("DELETE FROM users WHERE id = :uid")->execute([':uid' => $st['user_id']]);
            log_audit('DELETE_STUDENT', 'STUDENT', $student_id, "Deleted student: {$st['roll_number']}");
            set_flash('success', 'Student record deleted.');
        }
        redirect(BASE_URL . '/admin/students.php');
    }
}

// Fetch all students
$search = trim($_GET['search'] ?? '');
$sql = "
    SELECT s.*, d.name as department_name, u.status as user_status
    FROM students s
    JOIN departments d ON s.department_id = d.id
    JOIN users u ON s.user_id = u.id
    WHERE 1=1
";
$params = [];

if (!empty($search)) {
    $sql .= " AND (s.roll_number LIKE :q OR s.full_name LIKE :q OR s.email LIKE :q)";
    $params[':q'] = "%{$search}%";
}

$sql .= " ORDER BY s.roll_number ASC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$students = $stmt->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-mortarboard me-2 text-primary"></i> Master Student Directory</h2>
            <p class="text-muted mb-0">Manage student accounts, academic details, and continuous clearance states.</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="<?= BASE_URL ?>/auth/register.php" target="_blank" class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold">
                <i class="bi bi-person-plus me-1"></i> Register New Student
            </a>
        </div>
    </div>

    <!-- Search Bar -->
    <div class="card card-glass border-0 shadow-sm p-4 mb-4">
        <form method="GET" action="" class="row g-3">
            <div class="col-md-10">
                <input type="text" class="form-control form-control-lg" name="search" placeholder="Search by Roll Number, Full Name, or Email..." value="<?= sanitize($search) ?>">
            </div>
            <div class="col-md-2">
                <button type="submit" class="btn btn-primary btn-lg w-100 rounded-3 fw-bold">Search</button>
            </div>
        </form>
    </div>

    <!-- Table -->
    <div class="card card-glass border-0 shadow-sm">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Roll Number</th>
                            <th>Student Name</th>
                            <th>Department</th>
                            <th>Batch & Sem</th>
                            <th>Overall Clearance</th>
                            <th>Account</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($students as $st): 
                            $summary = get_student_clearance_summary($st['id']);
                        ?>
                            <tr>
                                <td class="fw-bold"><code><?= sanitize($st['roll_number']) ?></code></td>
                                <td>
                                    <strong class="text-dark d-block"><?= sanitize($st['full_name']) ?></strong>
                                    <small class="text-muted"><?= sanitize($st['email']) ?></small>
                                </td>
                                <td><span class="badge bg-light text-secondary"><?= sanitize($st['department_name']) ?></span></td>
                                <td class="small">Batch: <?= sanitize($st['batch']) ?><br>Semester <?= $st['semester'] ?></td>
                                <td><?= get_status_badge($summary['overall_status']) ?></td>
                                <td><span class="badge bg-success-subtle text-success"><?= strtoupper($st['user_status']) ?></span></td>
                                <td>
                                    <div class="d-flex gap-2">
                                        <a href="<?= BASE_URL ?>/staff/student_detail.php?id=<?= $st['id'] ?>" class="btn btn-sm btn-outline-primary rounded-pill">
                                            View & Manage
                                        </a>
                                        <form method="POST" action="" onsubmit="return confirm('Are you sure you want to delete this student record?');">
                                            <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                                            <input type="hidden" name="action" value="delete_student">
                                            <input type="hidden" name="student_id" value="<?= $st['id'] ?>">
                                            <button type="submit" class="btn btn-sm btn-outline-danger rounded-pill"><i class="bi bi-trash"></i></button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
