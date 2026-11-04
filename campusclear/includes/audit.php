<?php
// System Audit Logging Utility

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

/**
 * Record a system action in the immutable audit_logs table
 */
function log_audit($action, $entity_type, $entity_id = null, $details = '') {
    $pdo = db();
    $user_id = $_SESSION['user_id'] ?? null;
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

    try {
        $stmt = $pdo->prepare("
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
            VALUES (:user_id, :action, :entity_type, :entity_id, :details, :ip_address)
        ");
        $stmt->execute([
            ':user_id' => $user_id,
            ':action' => strtoupper($action),
            ':entity_type' => strtoupper($entity_type),
            ':entity_id' => $entity_id,
            ':details' => is_array($details) || is_object($details) ? json_encode($details) : (string)$details,
            ':ip_address' => $ip_address
        ]);
    } catch (\PDOException $e) {
        // Silently log error to PHP log if audit write fails
        error_log("Audit log failed: " . $e->getMessage());
    }
}
