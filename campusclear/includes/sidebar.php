<?php
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/auth.php';

$user = current_user();
$role = $user['role'] ?? '';
$current_page = $_SERVER['PHP_SELF'];
?>
<!-- Sidebar Navigation -->
<nav id="sidebar">
    <div class="sidebar-header d-flex align-items-center justify-content-between">
        <a href="<?= BASE_URL ?>/index.php" class="d-flex align-items-center text-white text-decoration-none">
            <i class="bi bi-shield-check text-primary fs-3 me-2"></i>
            <div>
                <span class="fw-bold fs-5 tracking-tight d-block text-white"><?= APP_NAME ?></span>
                <small class="text-xs text-muted d-block" style="font-size:0.7rem;">Digital Clearance Portal</small>
            </div>
        </a>
    </div>

    <ul class="list-unstyled components">
        <?php if ($role === ROLE_STUDENT): ?>
            <!-- Student Links -->
            <li class="<?= strpos($current_page, 'student/dashboard.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/student/dashboard.php"><i class="bi bi-speedometer2"></i> Dashboard</a>
            </li>
            <li class="<?= strpos($current_page, 'student/clearance_status.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/student/clearance_status.php"><i class="bi bi-patch-check"></i> Clearance Status</a>
            </li>
            <li class="<?= strpos($current_page, 'student/dues.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/student/dues.php"><i class="bi bi-receipt"></i> Pending Dues</a>
            </li>
            <li class="<?= strpos($current_page, 'student/service_requests.php') !== false || strpos($current_page, 'student/new_request.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/student/service_requests.php"><i class="bi bi-file-earmark-text"></i> Service Requests</a>
            </li>
            <li class="<?= strpos($current_page, 'student/disputes.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/student/disputes.php"><i class="bi bi-exclamation-octagon"></i> Raised Disputes</a>
            </li>
            <li class="<?= strpos($current_page, 'student/certificate.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/student/certificate.php"><i class="bi bi-award"></i> Digital Certificate</a>
            </li>
            <li class="<?= strpos($current_page, 'student/profile.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/student/profile.php"><i class="bi bi-person-circle"></i> My Profile</a>
            </li>

        <?php elseif ($role === ROLE_STAFF): ?>
            <!-- Staff Links -->
            <li class="<?= strpos($current_page, 'staff/dashboard.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/staff/dashboard.php"><i class="bi bi-speedometer2"></i> Staff Portal</a>
            </li>
            <li class="<?= strpos($current_page, 'staff/students.php') !== false || strpos($current_page, 'staff/student_detail.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/staff/students.php"><i class="bi bi-people"></i> Assigned Students</a>
            </li>
            <li class="<?= strpos($current_page, 'staff/add_due.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/staff/add_due.php"><i class="bi bi-plus-circle"></i> Issue New Due</a>
            </li>
            <li class="<?= strpos($current_page, 'staff/clearance_management.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/staff/clearance_management.php"><i class="bi bi-toggle-on"></i> Clearance Toggle</a>
            </li>
            <li class="<?= strpos($current_page, 'staff/service_requests.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/staff/service_requests.php"><i class="bi bi-card-checklist"></i> Service Approvals</a>
            </li>
            <li class="<?= strpos($current_page, 'staff/disputes.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/staff/disputes.php"><i class="bi bi-chat-left-dots"></i> Department Disputes</a>
            </li>

        <?php elseif ($role === ROLE_ADMIN): ?>
            <!-- Admin Links -->
            <li class="<?= strpos($current_page, 'admin/dashboard.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/admin/dashboard.php"><i class="bi bi-grid-1x2"></i> Control Center</a>
            </li>
            <li class="<?= strpos($current_page, 'admin/students.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/admin/students.php"><i class="bi bi-mortarboard"></i> Student Directory</a>
            </li>
            <li class="<?= strpos($current_page, 'admin/staff.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/admin/staff.php"><i class="bi bi-person-badge"></i> Staff Directory</a>
            </li>
            <li class="<?= strpos($current_page, 'admin/departments.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/admin/departments.php"><i class="bi bi-building"></i> Departments</a>
            </li>
            <li class="<?= strpos($current_page, 'admin/services.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/admin/services.php"><i class="bi bi-sliders"></i> Service Categories</a>
            </li>
            <li class="<?= strpos($current_page, 'admin/dues.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/admin/dues.php"><i class="bi bi-wallet2"></i> System Dues</a>
            </li>
            <li class="<?= strpos($current_page, 'admin/disputes.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/admin/disputes.php"><i class="bi bi-shield-exclamation"></i> Escalated Disputes</a>
            </li>
            <li class="<?= strpos($current_page, 'admin/reports.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/admin/reports.php"><i class="bi bi-bar-chart-line"></i> Clearance Reports</a>
            </li>
            <li class="<?= strpos($current_page, 'admin/override.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/admin/override.php"><i class="bi bi-key"></i> Emergency Override</a>
            </li>
            <li class="<?= strpos($current_page, 'admin/audit_logs.php') !== false ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/admin/audit_logs.php"><i class="bi bi-journals"></i> Audit Logs</a>
            </li>
        <?php endif; ?>

        <li class="mt-4 border-top border-secondary pt-2">
            <a href="<?= BASE_URL ?>/auth/logout.php" class="text-danger-emphasis"><i class="bi bi-box-arrow-right text-danger"></i> Secure Logout</a>
        </li>
    </ul>
</nav>
