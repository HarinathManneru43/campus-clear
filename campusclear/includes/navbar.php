<?php
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

$user = current_user();

// Fetch unread notifications count
$unread_count = 0;
if (is_logged_in()) {
    $pdo = db();
    $nstmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = :uid AND is_read = 0");
    $nstmt->execute([':uid' => $user['id']]);
    $unread_count = (int)$nstmt->fetchColumn();
}
?>
<!-- Top Navigation Bar -->
<div id="content">
    <nav class="navbar navbar-expand-lg top-navbar sticky-top">
        <div class="container-fluid">
            <button type="button" id="sidebarCollapse" class="btn btn-light border shadow-sm me-3">
                <i class="bi bi-list fs-5"></i>
            </button>

            <div class="d-none d-md-flex align-items-center me-auto">
                <span class="fw-semibold text-secondary me-2">Campus:</span>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">Main University Campus</span>
            </div>

            <div class="d-flex align-items-center gap-3">
<?php
$notif_link = BASE_URL . '/student/notifications.php';
if ($user['role'] === ROLE_STAFF) {
    $notif_link = BASE_URL . '/staff/disputes.php';
} elseif ($user['role'] === ROLE_ADMIN) {
    $notif_link = BASE_URL . '/admin/audit_logs.php';
}
?>
                <?php if (is_logged_in()): ?>
                    <!-- Notification Bell -->
                    <div class="dropdown">
                        <a class="btn btn-light position-relative border shadow-sm rounded-circle p-2" href="<?= $notif_link ?>" role="button" title="Notifications & Activity">
                            <i class="bi bi-bell fs-5 text-dark"></i>
                            <?php if ($unread_count > 0): ?>
                                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    <?= $unread_count ?>
                                    <span class="visually-hidden">unread notifications</span>
                                </span>
                            <?php endif; ?>
                        </a>
                    </div>

                    <!-- User Profile Dropdown -->
                    <div class="dropdown">
                        <a href="#" class="d-flex align-items-center text-decoration-none dropdown-toggle" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold" style="width: 38px; height: 38px;">
                                <?= strtoupper(substr($user['full_name'], 0, 1)) ?>
                            </div>
                            <div class="d-none d-lg-block text-start me-1">
                                <span class="d-block fw-bold text-dark lh-1" style="font-size:0.9rem;"><?= sanitize($user['full_name']) ?></span>
                                <small class="text-muted text-uppercase" style="font-size:0.75rem;"><?= sanitize($user['role']) ?></small>
                            </div>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2" aria-labelledby="userDropdown">
                            <li class="px-3 py-2 border-bottom">
                                <span class="d-block fw-bold"><?= sanitize($user['full_name']) ?></span>
                                <small class="text-muted"><?= sanitize($user['email']) ?></small>
                            </li>
                            <?php if ($user['role'] === ROLE_STUDENT): ?>
                                <li><a class="dropdown-item py-2" href="<?= BASE_URL ?>/student/profile.php"><i class="bi bi-person me-2"></i> My Profile</a></li>
                                <li><a class="dropdown-item py-2" href="<?= BASE_URL ?>/student/clearance_status.php"><i class="bi bi-shield-check me-2"></i> Clearance Status</a></li>
                            <?php endif; ?>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item py-2 text-danger" href="<?= BASE_URL ?>/auth/logout.php"><i class="bi bi-box-arrow-right me-2"></i> Logout</a></li>
                        </ul>
                    </div>
                <?php else: ?>
                    <a href="<?= BASE_URL ?>/auth/login.php" class="btn btn-primary px-4 rounded-pill shadow-sm">Login Portal</a>
                <?php endif; ?>
            </div>
        </div>
    </nav>
    <div class="main-content">
        <?php render_flash(); ?>
