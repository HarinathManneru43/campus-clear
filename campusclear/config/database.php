<?php
// Database Configuration & Multi-Port Auto-Healing Connection Engine

if (!defined('DB_HOST')) define('DB_HOST', '127.0.0.1');
if (!defined('DB_USER')) define('DB_USER', 'root');
if (!defined('DB_PASS')) define('DB_PASS', '');
if (!defined('DB_NAME')) define('DB_NAME', 'campusclear_db');
if (!defined('DB_CHARSET')) define('DB_CHARSET', 'utf8mb4');

/**
 * Returns a configured PDO database connection instance with multi-port & multi-host auto-healing fallback.
 *
 * @return PDO
 */
function get_db_connection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $candidate_hosts = ['127.0.0.1', 'localhost'];
    // Ports to test: standard default 3306 first, then secondary 3307 (used by custom batch/XAMPP setups)
    $candidate_ports = [3306, 3307];
    // Candidate passwords to try for local development
    $candidate_passwords = [DB_PASS, '', 'root', 'MySQL96', 'admin'];
    // Deduplicate passwords while preserving order
    $candidate_passwords = array_values(array_unique($candidate_passwords));

    $last_exception = null;
    $connected_port = null;
    $connected_pass = null;
    $connected_host = null;

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_TIMEOUT            => 2,
    ];

    // Attempt 1: Connect directly to DB_NAME across host, port, and password combinations
    foreach ($candidate_hosts as $host) {
        foreach ($candidate_ports as $port) {
            foreach ($candidate_passwords as $pass) {
                try {
                    $dsn = "mysql:host={$host};port={$port};dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
                    $pdo = new PDO($dsn, DB_USER, $pass, $options);
                    $connected_host = $host;
                    $connected_port = $port;
                    $connected_pass = $pass;
                    break 3;
                } catch (\PDOException $e) {
                    $last_exception = $e;
                    // If connection succeeded to server but database does not exist (error 1049)
                    if ($e->getCode() == 1049 || strpos($e->getMessage(), 'Unknown database') !== false) {
                        $connected_host = $host;
                        $connected_port = $port;
                        $connected_pass = $pass;
                        break 3;
                    }
                }
            }
        }
    }

    // Attempt 2: If DB does not exist, connect to MySQL server root and create it
    if ($pdo === null && $connected_host !== null && $connected_port !== null) {
        try {
            $server_dsn = "mysql:host={$connected_host};port={$connected_port};charset=" . DB_CHARSET;
            $server_pdo = new PDO($server_dsn, DB_USER, $connected_pass, $options);
            $server_pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");

            // Now connect to the newly created database
            $dsn = "mysql:host={$connected_host};port={$connected_port};dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, $connected_pass, $options);
        } catch (\PDOException $e) {
            $last_exception = $e;
        }
    }

    // Auto-seed: If connected, check if core tables exist; if missing, seed from database.sql
    if ($pdo !== null) {
        try {
            $chk = $pdo->query("SHOW TABLES LIKE 'users'")->fetch();
            if (!$chk) {
                $sql_file = __DIR__ . '/../database.sql';
                if (file_exists($sql_file)) {
                    $sql_content = file_get_contents($sql_file);
                    if (!empty($sql_content)) {
                        $pdo->exec($sql_content);
                    }
                }
            }
        } catch (\Exception $ignored) {
            // Table check error is non-fatal if tables already existed
        }
        return $pdo;
    }

    // If all connection attempts failed, render a clear diagnostic guide
    $error_msg = $last_exception ? $last_exception->getMessage() : 'Could not contact MySQL service.';
    
    die("
    <!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>CampusClear - Database Connection Required</title>
        <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css' rel='stylesheet'>
        <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css'>
        <style>
            body { background: #0f172a; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
            .diag-card { background: #1e293b; border: 1px solid #334155; border-radius: 1rem; max-width: 650px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        </style>
    </head>
    <body>
        <div class='diag-card p-4 p-md-5'>
            <div class='text-center mb-4'>
                <div class='d-inline-flex p-3 rounded-circle bg-danger-subtle text-danger mb-3'>
                    <i class='bi bi-database-exclamation display-4'></i>
                </div>
                <h3 class='fw-bold text-white mb-1'>MySQL Database Not Running</h3>
                <p class='text-secondary small'>CampusClear attempted to connect to MySQL on ports 3306 and 3307.</p>
            </div>

            <div class='alert alert-dark border border-secondary rounded-3 text-start mb-4'>
                <span class='small text-secondary d-block fw-bold mb-1'>SYSTEM ERROR DETAILS:</span>
                <code class='text-danger-emphasis' style='word-break: break-all;'>" . htmlspecialchars($error_msg) . "</code>
            </div>

            <div class='bg-black bg-opacity-25 p-4 rounded-3 text-start mb-4 border border-secondary-subtle'>
                <h6 class='fw-bold text-warning mb-3'><i class='bi bi-lightbulb me-2'></i> How to Fix in 10 Seconds:</h6>
                <ol class='mb-0 text-light small ps-3' style='line-height: 1.8;'>
                    <li>Open <strong>XAMPP Control Panel</strong> on your computer.</li>
                    <li>Click the <strong class='text-success'>Start</strong> button next to <strong>MySQL</strong>.</li>
                    <li>Alternatively, run <code>start_campusclear.bat</code> from the project root folder.</li>
                    <li>Refresh this browser page.</li>
                </ol>
            </div>

            <div class='text-center'>
                <button onclick='window.location.reload();' class='btn btn-primary px-4 py-2 rounded-pill fw-bold'>
                    <i class='bi bi-arrow-clockwise me-1'></i> Retry Connection
                </button>
            </div>
        </div>
    </body>
    </html>
    ");
}
