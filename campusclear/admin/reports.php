<?php
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

require_role(ROLE_ADMIN);

$page_title = "Clearance Reports & Export Generator";

$pdo = db();

// Fetch filter parameters
$dept_filter = (int)($_GET['department_id'] ?? 0);
$status_filter = trim($_GET['status'] ?? '');
$export_format = trim($_GET['export'] ?? '');

// Fetch all departments for filter
$departments = $pdo->query("SELECT * FROM departments WHERE is_active = 1 ORDER BY name ASC")->fetchAll();

$sql = "
    SELECT s.*, d.name as department_name, d.code as department_code
    FROM students s
    JOIN departments d ON s.department_id = d.id
    WHERE 1=1
";
$params = [];

if ($dept_filter > 0) {
    $sql .= " AND s.department_id = :did";
    $params[':did'] = $dept_filter;
}

$sql .= " ORDER BY s.roll_number ASC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$raw_students = $stmt->fetchAll();

// Evaluate continuous clearance for report rows
$report_rows = [];
foreach ($raw_students as $st) {
    $summary = get_student_clearance_summary($st['id']);
    
    if (!empty($status_filter)) {
        if (strtolower($status_filter) === 'cleared' && !$summary['is_cleared']) continue;
        if (strtolower($status_filter) === 'pending' && $summary['is_cleared']) continue;
    }

    $report_rows[] = [
        'id' => $st['id'],
        'roll_number' => $st['roll_number'],
        'full_name' => $st['full_name'],
        'email' => $st['email'],
        'department' => $st['department_name'],
        'batch' => $st['batch'],
        'semester' => $st['semester'],
        'overall_status' => $summary['overall_status'],
        'pending_depts_count' => $summary['pending_count']
    ];
}

// CSV Export Handler
if ($export_format === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=campusclear_report_' . date('Ymd_His') . '.csv');
    $output = fopen('php://output', 'w');
    fputcsv($output, ['Roll Number', 'Full Name', 'Email', 'Department', 'Batch', 'Semester', 'Overall Clearance Status', 'Pending Dept Count']);
    
    foreach ($report_rows as $row) {
        fputcsv($output, [
            $row['roll_number'],
            $row['full_name'],
            $row['email'],
            $row['department'],
            $row['batch'],
            $row['semester'],
            $row['overall_status'],
            $row['pending_depts_count']
        ]);
    }
    fclose($output);
    exit;
}

require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
?>

<div class="container-fluid">
    <div class="row mb-4 no-print align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-bar-chart-line me-2 text-primary"></i> Clearance Reports & Export Engine</h2>
            <p class="text-muted mb-0">Generate institutional clearance audit reports for examination cells or graduation approvals.</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="?<?= http_build_query(array_merge($_GET, ['export' => 'csv'])) ?>" class="btn btn-success rounded-pill px-4 shadow-sm fw-bold me-2">
                <i class="bi bi-file-earmark-spreadsheet me-1"></i> Export to CSV
            </a>
            <button onclick="window.print();" class="btn btn-outline-dark rounded-pill px-4 fw-bold">
                <i class="bi bi-printer me-1"></i> Print Report
            </button>
        </div>
    </div>

    <!-- Filter Card -->
    <div class="card card-glass border-0 shadow-sm p-4 mb-4 no-print">
        <form method="GET" action="" class="row g-3">
            <div class="col-md-5">
                <label class="form-label fw-bold">Filter Academic Department</label>
                <select class="form-select" name="department_id">
                    <option value="">All Academic Departments</option>
                    <?php foreach ($departments as $d): ?>
                        <option value="<?= $d['id'] ?>" <?= $dept_filter === $d['id'] ? 'selected' : '' ?>><?= sanitize($d['name']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="col-md-5">
                <label class="form-label fw-bold">Clearance Status Filter</label>
                <select class="form-select" name="status">
                    <option value="">All Clearance States</option>
                    <option value="cleared" <?= $status_filter === 'cleared' ? 'selected' : '' ?>>CLEARED Only</option>
                    <option value="pending" <?= $status_filter === 'pending' ? 'selected' : '' ?>>PENDING Only</option>
                </select>
            </div>

            <div class="col-md-2 d-flex align-items-end">
                <button type="submit" class="btn btn-primary w-100 rounded-3 fw-bold py-2">Generate Report</button>
            </div>
        </form>
    </div>

    <!-- Report Table -->
    <div class="card card-glass border-0 shadow-sm">
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0 text-dark">Institutional Clearance Roster</h5>
            <span class="badge bg-primary rounded-pill"><?= count($report_rows) ?> Records Found</span>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Roll Number</th>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Batch & Sem</th>
                            <th>Overall Clearance</th>
                            <th>Pending Depts</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($report_rows as $row): ?>
                            <tr>
                                <td class="fw-bold"><code><?= sanitize($row['roll_number']) ?></code></td>
                                <td><strong class="text-dark"><?= sanitize($row['full_name']) ?></strong></td>
                                <td class="small text-muted"><?= sanitize($row['email']) ?></td>
                                <td><span class="badge bg-light text-secondary"><?= sanitize($row['department']) ?></span></td>
                                <td class="small">Batch <?= sanitize($row['batch']) ?> (Sem <?= $row['semester'] ?>)</td>
                                <td><?= get_status_badge($row['overall_status']) ?></td>
                                <td>
                                    <?php if ($row['pending_depts_count'] > 0): ?>
                                        <span class="badge bg-danger rounded-pill"><?= $row['pending_depts_count'] ?> Dept(s) Pending</span>
                                    <?php else: ?>
                                        <span class="text-success small fw-semibold"><i class="bi bi-check-lg me-1"></i> 0 Dues</span>
                                    <?php endif; ?>
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
