<?php
// Continuous Clearance Calculation Engine

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/audit.php';

/**
 * Calculates continuous clearance status for a student across all active departments.
 *
 * @param int $student_id
 * @return array
 */
function get_student_clearance_summary($student_id) {
    $pdo = db();

    // Fetch all active departments
    $dept_stmt = $pdo->prepare("SELECT id, name, code FROM departments WHERE is_active = 1 ORDER BY name ASC");
    $dept_stmt->execute();
    $departments = $dept_stmt->fetchAll();

    // Fetch existing clearance statuses for student
    $status_stmt = $pdo->prepare("
        SELECT department_id, status, remarks, updated_at
        FROM clearance_status
        WHERE student_id = :student_id
    ");
    $status_stmt->execute([':student_id' => $student_id]);
    $status_rows = $status_stmt->fetchAll();
    
    $status_map = [];
    foreach ($status_rows as $row) {
        $status_map[$row['department_id']] = $row;
    }

    // Fetch all pending dues grouped by department
    $dues_stmt = $pdo->prepare("
        SELECT department_id, COUNT(*) as pending_dues_count, SUM(amount) as total_due_amount
        FROM dues
        WHERE student_id = :student_id AND status = 'pending'
        GROUP BY department_id
    ");
    $dues_stmt->execute([':student_id' => $student_id]);
    $dues_rows = $dues_stmt->fetchAll();

    $dues_map = [];
    foreach ($dues_rows as $row) {
        $dues_map[$row['department_id']] = $row;
    }

    $department_details = [];
    $pending_count = 0;
    $cleared_count = 0;
    $pending_departments = [];

    foreach ($departments as $dept) {
        $dept_id = $dept['id'];
        $explicit_status = $status_map[$dept_id]['status'] ?? 'cleared';
        $remarks = $status_map[$dept_id]['remarks'] ?? 'No pending issues';
        $last_updated = $status_map[$dept_id]['updated_at'] ?? null;
        
        $pending_dues_count = (int)($dues_map[$dept_id]['pending_dues_count'] ?? 0);
        $total_due_amount = (float)($dues_map[$dept_id]['total_due_amount'] ?? 0.00);

        // Effective department status rule:
        // If pending dues exist OR explicit status is pending/blocked -> department status is PENDING
        $effective_status = 'cleared';
        if ($pending_dues_count > 0 || in_array($explicit_status, ['pending', 'blocked'])) {
            $effective_status = 'pending';
            $pending_count++;
            $reason = [];
            if ($pending_dues_count > 0) {
                $reason[] = "{$pending_dues_count} pending due(s) (Total: ₹" . number_format($total_due_amount, 2) . ")";
            }
            if (!empty($remarks) && $remarks !== 'No pending issues') {
                $reason[] = $remarks;
            }
            $pending_departments[] = [
                'department_id' => $dept_id,
                'name' => $dept['name'],
                'code' => $dept['code'],
                'reason' => implode(' | ', $reason)
            ];
        } else {
            $cleared_count++;
        }

        $department_details[] = [
            'department_id' => $dept_id,
            'name' => $dept['name'],
            'code' => $dept['code'],
            'explicit_status' => $explicit_status,
            'effective_status' => $effective_status,
            'pending_dues_count' => $pending_dues_count,
            'total_due_amount' => $total_due_amount,
            'remarks' => $remarks,
            'last_updated' => $last_updated
        ];
    }

    $overall_status = ($pending_count === 0) ? 'CLEARED' : 'PENDING';

    return [
        'student_id' => $student_id,
        'overall_status' => $overall_status,
        'is_cleared' => ($overall_status === 'CLEARED'),
        'total_departments' => count($departments),
        'cleared_count' => $cleared_count,
        'pending_count' => $pending_count,
        'pending_departments' => $pending_departments,
        'department_details' => $department_details
    ];
}

/**
 * Update clearance status for a student in a specific department & trigger audit log & notification
 */
function update_department_clearance($student_id, $department_id, $new_status, $remarks, $updated_by_user_id) {
    $pdo = db();

    // Fetch previous status
    $prev_stmt = $pdo->prepare("SELECT status FROM clearance_status WHERE student_id = :sid AND department_id = :did");
    $prev_stmt->execute([':sid' => $student_id, ':did' => $department_id]);
    $prev_row = $prev_stmt->fetch();
    $previous_status = $prev_row['status'] ?? 'cleared';

    // Upsert clearance status
    $upsert = $pdo->prepare("
        INSERT INTO clearance_status (student_id, department_id, status, remarks, last_updated_by)
        VALUES (:sid, :did, :status, :remarks, :uid)
        ON DUPLICATE KEY UPDATE status = :up_status, remarks = :up_remarks, last_updated_by = :up_uid, updated_at = CURRENT_TIMESTAMP
    ");
    $upsert->execute([
        ':sid' => $student_id,
        ':did' => $department_id,
        ':status' => $new_status,
        ':remarks' => $remarks,
        ':uid' => $updated_by_user_id,
        ':up_status' => $new_status,
        ':up_remarks' => $remarks,
        ':up_uid' => $updated_by_user_id
    ]);

    // Record history trail
    $hist = $pdo->prepare("
        INSERT INTO clearance_history (student_id, department_id, previous_status, new_status, remarks, updated_by_user_id)
        VALUES (:sid, :did, :prev, :new, :remarks, :uid)
    ");
    $hist->execute([
        ':sid' => $student_id,
        ':did' => $department_id,
        ':prev' => $previous_status,
        ':new' => $new_status,
        ':remarks' => $remarks,
        ':uid' => $updated_by_user_id
    ]);

    // Fetch student user_id for notification
    $stu_stmt = $pdo->prepare("SELECT user_id, full_name FROM students WHERE id = :sid");
    $stu_stmt->execute([':sid' => $student_id]);
    $student_info = $stu_stmt->fetch();

    if ($student_info) {
        // Fetch department name
        $dstmt = $pdo->prepare("SELECT name FROM departments WHERE id = :did");
        $dstmt->execute([':did' => $department_id]);
        $dept_name = $dstmt->fetchColumn();

        $notif_title = "Clearance Status Updated";
        $notif_msg = "Your clearance status for {$dept_name} was changed to " . strtoupper($new_status) . ". Remarks: " . ($remarks ?: 'None');
        
        $nstmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (:uid, :title, :msg, 'status_change')");
        $nstmt->execute([
            ':uid' => $student_info['user_id'],
            ':title' => $notif_title,
            ':msg' => $notif_msg
        ]);
    }

    log_audit('UPDATE_CLEARANCE_STATUS', 'STUDENT', $student_id, "Department ID: {$department_id}, New Status: {$new_status}, Remarks: {$remarks}");

    return get_student_clearance_summary($student_id);
}
