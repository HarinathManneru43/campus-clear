<?php
$page_title = "Admin Control Center & Analytics";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';
require_once __DIR__ . '/../includes/clearance_engine.php';

require_role(ROLE_ADMIN);

$pdo = db();

// Total Students Count
$total_students = (int)$pdo->query("SELECT COUNT(*) FROM students")->fetchColumn();

// Calculate Cleared vs Pending Students count
$all_students = $pdo->query("SELECT id FROM students")->fetchAll(PDO::FETCH_COLUMN);
$cleared_students_count = 0;
$pending_students_count = 0;

foreach ($all_students as $sid) {
    $summary = get_student_clearance_summary($sid);
    if ($summary['is_cleared']) {
        $cleared_students_count++;
    } else {
        $pending_students_count++;
    }
}

// Total Departments Count
$total_depts = (int)$pdo->query("SELECT COUNT(*) FROM departments WHERE is_active = 1")->fetchColumn();

// Total Service Requests Count
$total_requests = (int)$pdo->query("SELECT COUNT(*) FROM service_requests")->fetchColumn();

// Total Dues Amount
$total_dues_amt = (float)$pdo->query("SELECT COALESCE(SUM(amount), 0) FROM dues WHERE status = 'pending'")->fetchColumn();

// Department Bottleneck Breakdown (Count of pending cases per department)
$dept_bottleneck_stmt = $pdo->query("
    SELECT d.name, COUNT(cs.id) as pending_cases
    FROM departments d
    LEFT JOIN clearance_status cs ON d.id = cs.department_id AND cs.status IN ('pending', 'blocked')
    WHERE d.is_active = 1
    GROUP BY d.id
    ORDER BY pending_cases DESC
");
$dept_bottleneck = $dept_bottleneck_stmt->fetchAll();

$dept_names_json = json_encode(array_column($dept_bottleneck, 'name'));
$dept_counts_json = json_encode(array_map('intval', array_column($dept_bottleneck, 'pending_cases')));

// Fetch recent audit logs
$audit_stmt = $pdo->query("
    SELECT a.*, u.username
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC LIMIT 8
");
$recent_audits = $audit_stmt->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark mb-1"><i class="bi bi-grid-1x2 me-2 text-primary"></i> Master Administrative Control Center</h2>
            <p class="text-muted mb-0">System-wide continuous clearance metrics, department analytics, and audit monitor.</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="<?= BASE_URL ?>/admin/override.php" class="btn btn-danger rounded-pill px-4 py-2 shadow-sm fw-bold">
                <i class="bi bi-key me-1"></i> Emergency Clearance Override
            </a>
        </div>
    </div>

    <!-- Metric Cards -->
    <div class="row g-4 mb-4">
        <div class="col-md-3">
            <div class="kpi-card d-flex align-items-center">
                <div class="kpi-icon bg-primary-subtle text-primary me-3">
                    <i class="bi bi-mortarboard"></i>
                </div>
                <div>
                    <h3 class="fw-bold mb-0 text-dark"><?= $total_students ?></h3>
                    <span class="text-muted small">Total Students</span>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="kpi-card d-flex align-items-center">
                <div class="kpi-icon bg-success-subtle text-success me-3">
                    <i class="bi bi-check-circle"></i>
                </div>
                <div>
                    <h3 class="fw-bold mb-0 text-dark"><?= $cleared_students_count ?></h3>
                    <span class="text-muted small">Overall Cleared Students</span>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="kpi-card d-flex align-items-center">
                <div class="kpi-icon bg-warning-subtle text-warning-emphasis me-3">
                    <i class="bi bi-clock-history"></i>
                </div>
                <div>
                    <h3 class="fw-bold mb-0 text-dark"><?= $pending_students_count ?></h3>
                    <span class="text-muted small">Overall Pending Cases</span>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="kpi-card d-flex align-items-center">
                <div class="kpi-icon bg-danger-subtle text-danger me-3">
                    <i class="bi bi-wallet2"></i>
                </div>
                <div>
                    <h3 class="fw-bold mb-0 text-dark"><?= format_currency($total_dues_amt) ?></h3>
                    <span class="text-muted small">System Outstanding Dues</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Analytics Graphs Row -->
    <div class="row mb-4">
        <div class="col-lg-5 mb-4 mb-lg-0">
            <div class="card card-glass border-0 shadow-sm h-100 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-pie-chart me-2 text-primary"></i> Overall Campus Clearance Ratio</h5>
                <div style="height: 260px; position: relative;" class="d-flex justify-content-center">
                    <canvas id="clearancePieChart"></canvas>
                </div>
            </div>
        </div>

        <div class="col-lg-7">
            <div class="card card-glass border-0 shadow-sm h-100 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-bar-chart me-2 text-primary"></i> Department Bottleneck Breakdown</h5>
                <div style="height: 260px; position: relative;">
                    <canvas id="deptBarChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- System Audit Activity Feed -->
    <div class="row">
        <div class="col-12">
            <div class="card card-glass border-0 shadow-sm">
                <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-journals me-2 text-primary"></i> Recent System Audit Activity</h5>
                    <a href="<?= BASE_URL ?>/admin/audit_logs.php" class="btn btn-sm btn-outline-primary rounded-pill">View Complete Audit Log</a>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Entity</th>
                                    <th>Details</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($recent_audits as $ad): ?>
                                    <tr>
                                        <td class="small fw-semibold"><?= format_date($ad['created_at']) ?></td>
                                        <td><code><?= sanitize($ad['username'] ?: 'System') ?></code></td>
                                        <td><span class="badge bg-secondary-subtle text-dark fw-bold"><?= sanitize($ad['action']) ?></span></td>
                                        <td><span class="badge bg-light text-secondary"><?= sanitize($ad['entity_type']) ?> #<?= $ad['entity_id'] ?></span></td>
                                        <td class="small text-muted" style="max-width: 300px;"><?= sanitize($ad['details']) ?></td>
                                        <td class="small font-monospace"><?= sanitize($ad['ip_address']) ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    // Pie Chart: Clearance Ratio
    const ctxPie = document.getElementById('clearancePieChart').getContext('2d');
    new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Overall Cleared', 'Overall Pending'],
            datasets: [{
                data: [<?= $cleared_students_count ?>, <?= $pending_students_count ?>],
                backgroundColor: ['#10b981', '#f59e0b'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // Bar Chart: Department Bottlenecks
    const ctxBar = document.getElementById('deptBarChart').getContext('2d');
    new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: <?= $dept_names_json ?>,
            datasets: [{
                label: 'Pending Cases',
                data: <?= $dept_counts_json ?>,
                backgroundColor: '#4f46e5',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
