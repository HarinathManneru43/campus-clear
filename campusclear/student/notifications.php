<?php
$page_title = "My Notifications";
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
require_once __DIR__ . '/../includes/navbar.php';

require_login();

$user = current_user();
$user_id = $user['id'];
$pdo = db();

// Handle Mark as Read
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'mark_read') {
    $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = :uid");
    $stmt->execute([':uid' => $user_id]);
    set_flash('success', 'All notifications marked as read.');
    redirect(BASE_URL . '/student/notifications.php');
}

// Fetch all notifications for user
$n_stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = :uid ORDER BY created_at DESC");
$n_stmt->execute([':uid' => $user_id]);
$notifications = $n_stmt->fetchAll();
?>

<div class="container-fluid">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-bold text-dark"><i class="bi bi-bell me-2 text-primary"></i> Notifications Inbox</h2>
            <p class="text-muted mb-0">Real-time alerts regarding clearance status updates, dues, and service requests.</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <form method="POST" action="" class="d-inline">
                <input type="hidden" name="action" value="mark_read">
                <button type="submit" class="btn btn-outline-secondary rounded-pill"><i class="bi bi-check-all me-1"></i> Mark All as Read</button>
            </form>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card card-glass border-0 shadow-sm">
                <div class="card-body p-0">
                    <?php if (empty($notifications)): ?>
                        <div class="text-center py-5">
                            <i class="bi bi-bell-slash text-muted display-3 d-block mb-3"></i>
                            <h5 class="fw-bold text-dark">No Notifications</h5>
                            <p class="text-muted">You're all caught up!</p>
                        </div>
                    <?php else: ?>
                        <div class="list-group list-group-flush">
                            <?php foreach ($notifications as $n): ?>
                                <div class="list-group-item p-4 <?= $n['is_read'] ? 'bg-white' : 'bg-primary-subtle border-primary-subtle' ?>">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <h5 class="fw-bold mb-0 text-dark"><?= sanitize($n['title']) ?></h5>
                                        <small class="text-muted"><?= format_date($n['created_at']) ?></small>
                                    </div>
                                    <p class="mb-0 text-secondary"><?= sanitize($n['message']) ?></p>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
