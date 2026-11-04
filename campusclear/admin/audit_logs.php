<?php
$page_title = "Immutable Security Audit Logs";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';

require_role(ROLE_ADMIN);

$pdo = db();

$action_filter = trim($_GET['action_filter'] ?? '');
$search = trim($_GET['search'] ?? '');

$sql = "
    SELECT a.*, u.username, u.role as user_role
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE 1=1
";
$params = [];

if (!empty($action_filter)) {
    $sql .= " AND a.action = :act";
    $params[':act'] = $action_filter;
}

if (!empty($search)) {
    $sql .= " AND (a.details LIKE :q OR u.username LIKE :q OR a.ip_address LIKE :q)";
    $params[':q'] = "%{$search}%";
}

$sql .= " ORDER BY a.created_at DESC LIMIT 100";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$logs = $stmt->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-journals me-2 text-primary"></i> System Audit Log Inspector</h2>
            <p class="text-muted mb-0">Immutable tracking log of status updates, logins, due additions, and emergency overrides.</p>
        </div>
    </div>

    <!-- Filter Card -->
    <div class="card card-glass border-0 shadow-sm p-4 mb-4">
        <form method="GET" action="" class="row g-3">
            <div class="col-md-7">
                <input type="text" class="form-control" name="search" placeholder="Search by username, IP address, or details..." value="<?= sanitize($search) ?>">
            </div>
            <div class="col-md-3">
                <select class="form-select" name="action_filter">
                    <option value="">All Action Types</option>
                    <option value="LOGIN_SUCCESS" <?= $action_filter === 'LOGIN_SUCCESS' ? 'selected' : '' ?>>LOGIN_SUCCESS</option>
                    <option value="UPDATE_CLEARANCE_STATUS" <?= $action_filter === 'UPDATE_CLEARANCE_STATUS' ? 'selected' : '' ?>>UPDATE_CLEARANCE_STATUS</option>
                    <option value="ISSUE_DUE" <?= $action_filter === 'ISSUE_DUE' ? 'selected' : '' ?>>ISSUE_DUE</option>
                    <option value="RESOLVE_DUE" <?= $action_filter === 'RESOLVE_DUE' ? 'selected' : '' ?>>RESOLVE_DUE</option>
                    <option value="ADMIN_CLEARANCE_OVERRIDE" <?= $action_filter === 'ADMIN_CLEARANCE_OVERRIDE' ? 'selected' : '' ?>>ADMIN_CLEARANCE_OVERRIDE</option>
                </select>
            </div>
            <div class="col-md-2">
                <button type="submit" class="btn btn-primary w-100 rounded-3 fw-bold">Filter Logs</button>
            </div>
        </form>
    </div>

    <!-- Logs Table -->
    <div class="card card-glass border-0 shadow-sm">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Timestamp</th>
                            <th>User (Role)</th>
                            <th>Action Type</th>
                            <th>Entity</th>
                            <th>Audit Details</th>
                            <th>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($logs as $l): ?>
                            <tr>
                                <td><code>#<?= $l['id'] ?></code></td>
                                <td class="small fw-semibold"><?= format_date($l['created_at']) ?></td>
                                <td>
                                    <strong class="text-dark d-block"><?= sanitize($l['username'] ?: 'System / Guest') ?></strong>
                                    <small class="text-muted"><?= sanitize($l['user_role'] ?: 'N/A') ?></small>
                                </td>
                                <td><span class="badge bg-secondary-subtle text-dark fw-bold"><?= sanitize($l['action']) ?></span></td>
                                <td><span class="badge bg-light text-secondary"><?= sanitize($l['entity_type']) ?> #<?= $l['entity_id'] ?></span></td>
                                <td class="small text-muted" style="max-width: 350px;"><?= sanitize($l['details']) ?></td>
                                <td class="small font-monospace"><?= sanitize($l['ip_address']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
