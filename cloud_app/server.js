const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const querystring = require('node:querystring');

const PORT = process.env.PORT || 8000;
const DB_FILE = path.join(__dirname, 'campusclear_data.json');

// ==========================================
// 1. EMBEDDED PERSISTENT DATABASE ENGINE
// ==========================================
function getDefaultData() {
    return {
        departments: [
            { id: 1, name: "Central University Library", code: "LIB", description: "Central repository of books, journals, and lending catalog.", is_active: 1 },
            { id: 2, name: "Accounts & Student Finance", code: "ACC", description: "Tuition, hostel dues, laboratory fees, and scholarship clearance.", is_active: 1 },
            { id: 3, name: "Hostel & Residential Board", code: "HST", description: "Student hostel room allotments, room inventory, and mess dues.", is_active: 1 },
            { id: 4, name: "Computer Science & Engineering", code: "CSE", description: "Academic department clearance, lab equipment, and faculty sign-offs.", is_active: 1 },
            { id: 5, name: "Examination Cell & Registrar", code: "EXM", description: "Admit cards, hall ticket clearance, and provisional degree approvals.", is_active: 1 }
        ],
        users: [
            { id: 1, username: "admin", email: "admin@campusclear.edu", role: "admin", status: "active", password_plain: "Admin@123" },
            { id: 2, username: "staff_lib", email: "library@campusclear.edu", role: "staff", status: "active", password_plain: "Staff@123" },
            { id: 3, username: "staff_acc", email: "accounts@campusclear.edu", role: "staff", status: "active", password_plain: "Staff@123" },
            { id: 4, username: "staff_hst", email: "hostel@campusclear.edu", role: "staff", status: "active", password_plain: "Staff@123" },
            { id: 5, username: "staff_cse", email: "cse@campusclear.edu", role: "staff", status: "active", password_plain: "Staff@123" },
            { id: 6, username: "staff_exm", email: "exam@campusclear.edu", role: "staff", status: "active", password_plain: "Staff@123" },
            { id: 10, username: "TU6241103111002", email: "priya.patel@student.edu", role: "student", status: "active", password_plain: "Student@123" },
            { id: 11, username: "TU6241103111003", email: "rahul.sharma@student.edu", role: "student", status: "active", password_plain: "Student@123" },
            { id: 12, username: "TU6241103111004", email: "ananya.iyer@student.edu", role: "student", status: "active", password_plain: "Student@123" }
        ],
        staff: [
            { id: 1, user_id: 2, staff_code: "STF-LIB-01", full_name: "Dr. Arvind Rao", email: "library@campusclear.edu", phone: "9876543210", department_id: 1, designation: "Chief Librarian" },
            { id: 2, user_id: 3, staff_code: "STF-ACC-01", full_name: "Mrs. Sunita Verma", email: "accounts@campusclear.edu", phone: "9876543211", department_id: 2, designation: "Senior Accounts Officer" },
            { id: 3, user_id: 4, staff_code: "STF-HST-01", full_name: "Col. R. S. Rathore", email: "hostel@campusclear.edu", phone: "9876543212", department_id: 3, designation: "Chief Warden" },
            { id: 4, user_id: 5, staff_code: "STF-CSE-01", full_name: "Prof. K. Swaminathan", email: "cse@campusclear.edu", phone: "9876543213", department_id: 4, designation: "HOD Computer Science" },
            { id: 5, user_id: 6, staff_code: "STF-EXM-01", full_name: "Dr. M. K. Sharma", email: "exam@campusclear.edu", phone: "9876543214", department_id: 5, designation: "Controller of Examinations" }
        ],
        students: [
            { id: 1, user_id: 10, roll_number: "TU6241103111002", full_name: "Priya Patel", email: "priya.patel@student.edu", phone: "9845012345", department_id: 4, batch: "2022-2026", semester: 6, cgpa: 8.85 },
            { id: 2, user_id: 11, roll_number: "TU6241103111003", full_name: "Rahul Sharma", email: "rahul.sharma@student.edu", phone: "9845012346", department_id: 4, batch: "2022-2026", semester: 6, cgpa: 8.20 },
            { id: 3, user_id: 12, roll_number: "TU6241103111004", full_name: "Ananya Iyer", email: "ananya.iyer@student.edu", phone: "9845012347", department_id: 4, batch: "2022-2026", semester: 6, cgpa: 9.40 }
        ],
        clearance_status: [
            { id: 1, student_id: 1, department_id: 1, status: "pending", remarks: "Overdue library book unreturned", updated_at: "2026-11-01 10:30:00" },
            { id: 2, student_id: 1, department_id: 2, status: "cleared", remarks: "Semester fees fully paid", updated_at: "2026-11-01 11:00:00" },
            { id: 3, student_id: 1, department_id: 3, status: "cleared", remarks: "Hostel room inventory verified", updated_at: "2026-11-01 11:15:00" },
            { id: 4, student_id: 1, department_id: 4, status: "cleared", remarks: "All lab practicals completed", updated_at: "2026-11-01 11:20:00" },
            { id: 5, student_id: 1, department_id: 5, status: "cleared", remarks: "Exam clearance approved", updated_at: "2026-11-01 11:25:00" },
            { id: 6, student_id: 3, department_id: 1, status: "cleared", remarks: "No dues", updated_at: "2026-11-01 10:00:00" },
            { id: 7, student_id: 3, department_id: 2, status: "cleared", remarks: "Fees cleared", updated_at: "2026-11-01 10:00:00" },
            { id: 8, student_id: 3, department_id: 3, status: "cleared", remarks: "Room cleared", updated_at: "2026-11-01 10:00:00" },
            { id: 9, student_id: 3, department_id: 4, status: "cleared", remarks: "Academics cleared", updated_at: "2026-11-01 10:00:00" },
            { id: 10, student_id: 3, department_id: 5, status: "cleared", remarks: "Exam cleared", updated_at: "2026-11-01 10:00:00" }
        ],
        dues: [
            { id: 1, student_id: 1, department_id: 1, title: "Overdue Book Fine: Operating Systems 10th Ed", description: "Book due on 15 Oct, returned 12 days late.", amount: 450.00, status: "pending", created_at: "2026-10-28 14:20:00" },
            { id: 2, student_id: 2, department_id: 2, title: "Lab Component Fee Semester 6", description: "Cloud computing lab fee balance.", amount: 1200.00, status: "pending", created_at: "2026-10-29 09:15:00" }
        ],
        disputes: [
            { id: 1, student_id: 1, due_id: 1, department_id: 1, subject: "Dispute regarding book return date", description: "Book was deposited in the drop-box on 20th Oct during library maintenance.", status: "open", resolution_remarks: "", created_at: "2026-10-29 11:00:00" }
        ],
        service_categories: [
            { id: 1, name: "Bonafide Clearance Certificate", description: "Official institutional bonafide document confirming full zero-dues clearance.", requires_full_clearance: 1, is_active: 1 },
            { id: 2, name: "End-Semester Exam Hall Ticket", description: "Admit card clearance for upcoming university semester examinations.", requires_full_clearance: 1, is_active: 1 },
            { id: 3, name: "Institutional ID Card Re-issuance", description: "Application for replacement of lost, worn, or damaged RFID campus card.", requires_full_clearance: 0, is_active: 1 },
            { id: 4, name: "Official University Transcript", description: "Complete attested academic transcript issued to alumni or graduating seniors.", requires_full_clearance: 1, is_active: 1 },
            { id: 5, name: "Library Caution Deposit Refund", description: "Reconciliation and return of cautionary deposit at graduation or withdrawal.", requires_full_clearance: 1, is_active: 1 }
        ],
        service_requests: [
            { id: 1, request_number: "REQ-2026-8921B", student_id: 3, service_id: 1, purpose: "Higher studies application to Georgia Tech", status: "approved", clearance_snapshot: "cleared", qr_token: "CERT-ANANYA-IYER-2026", created_at: "2026-11-02 09:30:00" },
            { id: 2, request_number: "REQ-2026-4410A", student_id: 1, service_id: 3, purpose: "Lost card in central cafeteria", status: "in_progress", clearance_snapshot: "pending", qr_token: "REQ-TOKEN-PRIYA-CARD", created_at: "2026-11-03 14:10:00" }
        ],
        audit_logs: [
            { id: 1, user_id: 1, action: "SYSTEM_INITIALIZATION", entity_type: "DATABASE", details: "CampusClear Cloud Engine Initialized", created_at: "2026-11-04 12:00:00" }
        ]
    };
}

let db = null;
function loadDb() {
    if (db) return db;
    try {
        if (fs.existsSync(DB_FILE)) {
            const raw = fs.readFileSync(DB_FILE, 'utf8');
            db = JSON.parse(raw);
        } else {
            db = getDefaultData();
            saveDb();
        }
    } catch (e) {
        db = getDefaultData();
    }
    return db;
}

function saveDb() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    } catch (e) {
        console.error("Save DB error:", e);
    }
}

loadDb();

// ==========================================
// 2. CONTINUOUS CLEARANCE ENGINE
// ==========================================
function getStudentClearanceSummary(studentId) {
    const data = loadDb();
    const student = data.students.find(s => s.id === studentId);
    if (!student) return null;

    const activeDepts = data.departments.filter(d => d.is_active === 1);
    const departmentDetails = [];
    const pendingDepartments = [];
    let clearedCount = 0;
    let pendingCount = 0;

    for (const dept of activeDepts) {
        const statusRecord = data.clearance_status.find(cs => cs.student_id === studentId && cs.department_id === dept.id);
        const explicitStatus = statusRecord ? statusRecord.status : 'cleared';
        const remarks = statusRecord ? statusRecord.remarks : 'No pending issues';
        const lastUpdated = statusRecord ? statusRecord.updated_at : null;

        const studentDues = data.dues.filter(du => du.student_id === studentId && du.department_id === dept.id && du.status === 'pending');
        const pendingDuesCount = studentDues.length;
        const totalDueAmount = studentDues.reduce((sum, d) => sum + Number(d.amount), 0);

        let effectiveStatus = 'cleared';
        if (pendingDuesCount > 0 || ['pending', 'blocked'].includes(explicitStatus)) {
            effectiveStatus = 'pending';
            pendingCount++;
            const reasons = [];
            if (pendingDuesCount > 0) {
                reasons.push(`${pendingDuesCount} pending due(s) (₹${totalDueAmount.toFixed(2)})`);
            }
            if (remarks && remarks !== 'No pending issues') {
                reasons.push(remarks);
            }
            pendingDepartments.push({
                department_id: dept.id,
                name: dept.name,
                code: dept.code,
                reason: reasons.join(' | ')
            });
        } else {
            clearedCount++;
        }

        departmentDetails.push({
            department_id: dept.id,
            name: dept.name,
            code: dept.code,
            explicit_status: explicitStatus,
            effective_status: effectiveStatus,
            pending_dues_count: pendingDuesCount,
            total_due_amount: totalDueAmount,
            remarks: remarks,
            last_updated: lastUpdated
        });
    }

    const overallStatus = pendingCount === 0 ? 'CLEARED' : 'PENDING';
    return {
        student_id: studentId,
        overall_status: overallStatus,
        is_cleared: overallStatus === 'CLEARED',
        total_departments: activeDepts.length,
        cleared_count: clearedCount,
        pending_count: pendingCount,
        pending_departments: pendingDepartments,
        department_details: departmentDetails
    };
}

// Session store in-memory
const sessions = new Map();

function parseCookies(req) {
    const list = {};
    const rc = req.headers.cookie;
    if (rc) {
        rc.split(';').forEach(cookie => {
            const parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });
    }
    return list;
}

function getSessionUser(req) {
    const cookies = parseCookies(req);
    const sid = cookies['campusclear_session'];
    if (sid && sessions.has(sid)) {
        return sessions.get(sid);
    }
    return null;
}

function logAudit(userId, action, entityType, details) {
    const data = loadDb();
    const id = data.audit_logs.length > 0 ? Math.max(...data.audit_logs.map(a => a.id)) + 1 : 1;
    data.audit_logs.unshift({
        id,
        user_id: userId,
        action,
        entity_type: entityType,
        details,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
    saveDb();
}

// ==========================================
// 3. HTML LAYOUT & COMPONENTS
// ==========================================
function renderBadge(status) {
    const st = String(status).toLowerCase();
    if (st === 'cleared' || st === 'approved' || st === 'resolved') {
        return `<span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 fw-bold"><i class="bi bi-check-circle-fill me-1"></i> ${status.toUpperCase()}</span>`;
    } else if (st === 'pending' || st === 'in_progress' || st === 'open') {
        return `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-3 py-1 fw-bold"><i class="bi bi-clock-history me-1"></i> ${status.toUpperCase()}</span>`;
    } else if (st === 'blocked' || st === 'rejected') {
        return `<span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1 fw-bold"><i class="bi bi-exclamation-triangle-fill me-1"></i> ${status.toUpperCase()}</span>`;
    }
    return `<span class="badge bg-secondary rounded-pill px-3 py-1">${status.toUpperCase()}</span>`;
}

function renderLayout(title, user, content, currentPath = '') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - CampusClear</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <style>
        :root {
            --brand-primary: #4f46e5;
            --brand-dark: #0f172a;
            --brand-sidebar: #1e293b;
        }
        body { font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; color: #334155; min-height: 100vh; display: flex; flex-direction: column; }
        .card-glass { background: rgba(255, 255, 255, 0.98); border: 1px solid #e2e8f0; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .sidebar { width: 260px; min-height: 100vh; background: var(--brand-sidebar); color: #f1f5f9; flex-shrink: 0; }
        .sidebar-header { padding: 1.5rem; background: #0f172a; border-bottom: 1px solid #334155; }
        .sidebar-link { display: flex; align-items: center; gap: 12px; padding: 0.75rem 1.5rem; color: #94a3b8; text-decoration: none; font-weight: 500; font-size: 0.95rem; border-left: 3px solid transparent; transition: all 0.2s; }
        .sidebar-link:hover, .sidebar-link.active { color: #ffffff; background: rgba(255,255,255,0.05); border-left-color: var(--brand-primary); }
        .top-navbar { background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 0.75rem 1.5rem; }
        .kpi-card { background: #ffffff; border-radius: 1rem; padding: 1.25rem; border: 1px solid #e2e8f0; display: flex; align-items: center; }
        .kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    </style>
</head>
<body>
<div class="d-flex w-100 min-vh-100">
    <!-- Sidebar -->
    <div class="sidebar d-none d-md-flex flex-column">
        <div class="sidebar-header">
            <a href="/" class="d-flex align-items-center text-white text-decoration-none">
                <i class="bi bi-shield-check text-primary fs-3 me-2"></i>
                <div>
                    <span class="fw-bold fs-5 d-block">CampusClear</span>
                    <small class="text-xs text-muted" style="font-size:0.7rem;">Continuous Clearance Portal</small>
                </div>
            </a>
        </div>
        <div class="py-3 flex-grow-1">
            ${user.role === 'student' ? `
                <a href="/student/dashboard" class="sidebar-link ${currentPath === '/student/dashboard' ? 'active' : ''}"><i class="bi bi-speedometer2"></i> Dashboard</a>
                <a href="/student/dues" class="sidebar-link ${currentPath === '/student/dues' ? 'active' : ''}"><i class="bi bi-receipt"></i> Pending Dues</a>
                <a href="/student/services" class="sidebar-link ${currentPath === '/student/services' ? 'active' : ''}"><i class="bi bi-file-earmark-text"></i> Service Requests</a>
                <a href="/student/certificate" class="sidebar-link ${currentPath === '/student/certificate' ? 'active' : ''}"><i class="bi bi-award"></i> Digital Certificate</a>
            ` : user.role === 'staff' ? `
                <a href="/staff/dashboard" class="sidebar-link ${currentPath === '/staff/dashboard' ? 'active' : ''}"><i class="bi bi-speedometer2"></i> Staff Portal</a>
                <a href="/staff/students" class="sidebar-link ${currentPath === '/staff/students' ? 'active' : ''}"><i class="bi bi-people"></i> Assigned Students</a>
                <a href="/staff/approvals" class="sidebar-link ${currentPath === '/staff/approvals' ? 'active' : ''}"><i class="bi bi-check-circle"></i> Service Approvals</a>
            ` : `
                <a href="/admin/dashboard" class="sidebar-link ${currentPath === '/admin/dashboard' ? 'active' : ''}"><i class="bi bi-grid-1x2"></i> Control Center</a>
                <a href="/admin/students" class="sidebar-link ${currentPath === '/admin/students' ? 'active' : ''}"><i class="bi bi-mortarboard"></i> Student Directory</a>
                <a href="/admin/dues" class="sidebar-link ${currentPath === '/admin/dues' ? 'active' : ''}"><i class="bi bi-wallet2"></i> System Dues</a>
                <a href="/admin/override" class="sidebar-link ${currentPath === '/admin/override' ? 'active' : ''}"><i class="bi bi-key"></i> Emergency Override</a>
                <a href="/admin/audit" class="sidebar-link ${currentPath === '/admin/audit' ? 'active' : ''}"><i class="bi bi-journal-text"></i> Audit Logs</a>
            `}
        </div>
        <div class="p-3 border-top border-secondary">
            <a href="/logout" class="sidebar-link text-danger"><i class="bi bi-box-arrow-right"></i> Logout</a>
        </div>
    </div>

    <!-- Main View -->
    <div class="flex-grow-1 d-flex flex-column min-vh-100">
        <nav class="top-navbar d-flex justify-content-between align-items-center sticky-top">
            <div class="d-flex align-items-center gap-2">
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">Cloud Live Edition</span>
                <span class="text-secondary small d-none d-sm-inline">Zero XAMPP • Fast Cloud Server</span>
            </div>
            <div class="d-flex align-items-center gap-3">
                <a href="/verify" class="btn btn-sm btn-outline-primary rounded-pill"><i class="bi bi-qr-code-scan me-1"></i> QR Verify</a>
                <div class="d-flex align-items-center gap-2">
                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width:36px; height:36px;">
                        ${(user.full_name || user.username || 'U')[0].toUpperCase()}
                    </div>
                    <div class="d-none d-md-block text-start">
                        <span class="d-block fw-bold small text-dark lh-1">${user.full_name || user.username}</span>
                        <small class="text-muted text-uppercase" style="font-size:0.7rem;">${user.role}</small>
                    </div>
                    <a href="/logout" class="btn btn-sm btn-light border rounded-pill ms-2" title="Logout"><i class="bi bi-box-arrow-right"></i></a>
                </div>
            </div>
        </nav>
        <div class="p-4 flex-grow-1">
            ${content}
        </div>
        <footer class="p-3 bg-white border-top text-center text-muted small">
            &copy; ${new Date().getFullYear()} CampusClear Cloud - Digital Clearance & Service Platform | 24/7 Web Accessible
        </footer>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

// ==========================================
// 4. REQUEST ROUTER & CONTROLLERS
// ==========================================
const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Static Assets
    if (pathname.startsWith('/assets/')) {
        const filePath = path.join(__dirname, 'public', pathname);
        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath);
            const mime = ext === '.css' ? 'text/css' : ext === '.js' ? 'application/javascript' : 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': mime });
            return fs.createReadStream(filePath).pipe(res);
        }
    }

    function getBody(callback) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => callback(querystring.parse(body)));
    }

    function redirect(url) {
        res.writeHead(302, { 'Location': url });
        res.end();
    }

    const user = getSessionUser(req);

    // ROUTE: Public Homepage
    if (pathname === '/') {
        if (user) {
            if (user.role === 'student') return redirect('/student/dashboard');
            if (user.role === 'staff') return redirect('/staff/dashboard');
            if (user.role === 'admin') return redirect('/admin/dashboard');
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CampusClear - Continuous Digital Clearance Platform</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; }
        .hero-banner { background: radial-gradient(circle at 80% 20%, rgba(79, 70, 229, 0.35) 0%, rgba(15, 23, 42, 1) 70%); padding: 80px 0; }
        .portal-card { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 1.25rem; transition: transform 0.2s; }
        .portal-card:hover { transform: translateY(-5px); }
    </style>
</head>
<body>
    <nav class="navbar navbar-dark bg-dark bg-opacity-75 border-bottom border-secondary py-3">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center fw-bold" href="/">
                <i class="bi bi-shield-check text-primary fs-3 me-2"></i> CampusClear
            </a>
            <div class="d-flex gap-2">
                <a href="/verify" class="btn btn-outline-light rounded-pill px-3"><i class="bi bi-qr-code me-1"></i> Verify Certificate</a>
                <a href="/login" class="btn btn-primary rounded-pill px-4 fw-bold">Login Portal</a>
            </div>
        </div>
    </nav>

    <div class="hero-banner text-center">
        <div class="container">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 mb-3 fw-bold">Live Cloud Edition • No XAMPP Required</span>
            <h1 class="display-4 fw-extrabold text-white mb-3">Continuous Digital Student Clearance System</h1>
            <p class="lead text-secondary mx-auto mb-4" style="max-width: 650px;">
                Automated continuous departmental clearance tracking across Library, Finance, Hostel, and Academic Departments with instant QR code validation.
            </p>
            <div class="d-flex justify-content-center gap-3">
                <a href="/login" class="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-lg">Access Portal <i class="bi bi-arrow-right ms-2"></i></a>
                <a href="/verify" class="btn btn-outline-secondary btn-lg rounded-pill px-4">Public QR Verify</a>
            </div>
        </div>
    </div>

    <div class="container py-5">
        <div class="row g-4">
            <div class="col-md-4">
                <div class="portal-card p-4 h-100">
                    <div class="bg-primary p-3 rounded-circle d-inline-block mb-3 text-white"><i class="bi bi-mortarboard fs-3"></i></div>
                    <h4 class="fw-bold text-white">Student Dashboard</h4>
                    <p class="text-secondary small">Continuous clearance meter, transparent pending dues settlement, in-portal dispute resolution, and printable QR certificates.</p>
                    <a href="/login" class="btn btn-sm btn-outline-primary rounded-pill">Student Demo &rarr;</a>
                </div>
            </div>
            <div class="col-md-4">
                <div class="portal-card p-4 h-100">
                    <div class="bg-info p-3 rounded-circle d-inline-block mb-3 text-white"><i class="bi bi-people fs-3"></i></div>
                    <h4 class="fw-bold text-white">Department Staff Portal</h4>
                    <p class="text-secondary small">Dedicated consoles for Central Library, Student Accounts, Hostel, Academics, and Exam Cell to issue fines and toggle clearance.</p>
                    <a href="/login" class="btn btn-sm btn-outline-info rounded-pill">Staff Demo &rarr;</a>
                </div>
            </div>
            <div class="col-md-4">
                <div class="portal-card p-4 h-100">
                    <div class="bg-warning p-3 rounded-circle d-inline-block mb-3 text-dark"><i class="bi bi-shield-lock fs-3"></i></div>
                    <h4 class="fw-bold text-white">Admin Control Center</h4>
                    <p class="text-secondary small">Institutional analytics, department catalogs, student directory, emergency override protocols, and immutable audit trails.</p>
                    <a href="/login" class="btn btn-sm btn-outline-warning rounded-pill">Admin Demo &rarr;</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`);
    }

    // ROUTE: Login
    if (pathname === '/login') {
        if (method === 'POST') {
            return getBody(params => {
                const username = (params.username || '').trim();
                const password = (params.password || '').trim();
                const data = loadDb();

                const matchedUser = data.users.find(u => (u.username === username || u.email === username) && u.password_plain === password);
                if (matchedUser) {
                    const sid = crypto.randomUUID();
                    let profileName = matchedUser.username;
                    let studentId = null;
                    let staffId = null;
                    let deptId = null;

                    if (matchedUser.role === 'student') {
                        const st = data.students.find(s => s.user_id === matchedUser.id);
                        if (st) {
                            profileName = st.full_name;
                            studentId = st.id;
                            deptId = st.department_id;
                        }
                    } else if (matchedUser.role === 'staff') {
                        const sf = data.staff.find(s => s.user_id === matchedUser.id);
                        if (sf) {
                            profileName = sf.full_name;
                            staffId = sf.id;
                            deptId = sf.department_id;
                        }
                    }

                    sessions.set(sid, {
                        id: matchedUser.id,
                        username: matchedUser.username,
                        role: matchedUser.role,
                        full_name: profileName,
                        student_id: studentId,
                        staff_id: staffId,
                        department_id: deptId
                    });

                    logAudit(matchedUser.id, 'LOGIN_SUCCESS', 'USER', `${matchedUser.role.toUpperCase()} Login`);
                    res.writeHead(302, {
                        'Set-Cookie': `campusclear_session=${sid}; Path=/; HttpOnly`,
                        'Location': matchedUser.role === 'student' ? '/student/dashboard' : matchedUser.role === 'staff' ? '/staff/dashboard' : '/admin/dashboard'
                    });
                    return res.end();
                }

                res.writeHead(200, { 'Content-Type': 'text/html' });
                return res.end(renderLoginPage('Invalid username or password. Please click one of the quick autofill buttons below.'));
            });
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLoginPage());
    }

    function renderLoginPage(error = '') {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - CampusClear</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <style>
        body { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .login-card { max-width: 440px; width: 100%; border-radius: 1.25rem; background: #ffffff; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    </style>
</head>
<body>
<div class="login-card p-4 p-md-5">
    <div class="text-center mb-4">
        <a href="/" class="text-decoration-none">
            <i class="bi bi-shield-check text-primary display-4 mb-2 d-inline-block"></i>
            <h3 class="fw-bold text-dark mb-0">CampusClear</h3>
        </a>
        <p class="text-muted small">Centralized Clearance Portal</p>
    </div>

    <!-- 1-Click Demo Login Buttons -->
    <div class="bg-light p-3 rounded-3 mb-4 border">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small fw-bold text-secondary"><i class="bi bi-key-fill text-warning me-1"></i> Quick Demo Logins</span>
            <span class="badge bg-secondary-subtle text-secondary" style="font-size:0.65rem;">Click to Autofill</span>
        </div>
        <div class="d-flex flex-wrap gap-2">
            <button type="button" class="btn btn-sm btn-outline-danger rounded-pill fw-semibold py-1 px-2" style="font-size:0.75rem;" onclick="fill('admin','Admin@123')"><i class="bi bi-shield-lock me-1"></i> Admin</button>
            <button type="button" class="btn btn-sm btn-outline-primary rounded-pill fw-semibold py-1 px-2" style="font-size:0.75rem;" onclick="fill('staff_lib','Staff@123')"><i class="bi bi-book me-1"></i> Staff (Lib)</button>
            <button type="button" class="btn btn-sm btn-outline-info rounded-pill fw-semibold py-1 px-2" style="font-size:0.75rem;" onclick="fill('staff_acc','Staff@123')"><i class="bi bi-cash me-1"></i> Staff (Acc)</button>
            <button type="button" class="btn btn-sm btn-outline-success rounded-pill fw-semibold py-1 px-2" style="font-size:0.75rem;" onclick="fill('TU6241103111002','Student@123')"><i class="bi bi-mortarboard me-1"></i> Student</button>
        </div>
    </div>

    ${error ? `<div class="alert alert-danger py-2 small mb-3"><i class="bi bi-exclamation-circle me-1"></i> ${error}</div>` : ''}

    <form method="POST" action="/login">
        <div class="mb-3">
            <label class="form-label fw-semibold small">Username / Roll Number / Email</label>
            <input type="text" class="form-control" id="username" name="username" placeholder="e.g. admin or TU6241103111002" required autofocus>
        </div>
        <div class="mb-4">
            <label class="form-label fw-semibold small">Password</label>
            <input type="password" class="form-control" id="password" name="password" placeholder="Enter password" required>
        </div>
        <button type="submit" class="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm">
            <i class="bi bi-box-arrow-in-right me-2"></i> Secure Login
        </button>
    </form>
    <div class="text-center mt-4">
        <a href="/" class="small text-secondary text-decoration-none">&larr; Back to Homepage</a>
    </div>
</div>
<script>
function fill(u, p) {
    document.getElementById('username').value = u;
    document.getElementById('password').value = p;
}
</script>
</body>
</html>`;
    }

    // ROUTE: Logout
    if (pathname === '/logout') {
        const cookies = parseCookies(req);
        const sid = cookies['campusclear_session'];
        if (sid) sessions.delete(sid);
        res.writeHead(302, {
            'Set-Cookie': 'campusclear_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'Location': '/'
        });
        return res.end();
    }

    // ROUTE: Public Verification
    if (pathname === '/verify') {
        const tokenQuery = (parsedUrl.searchParams.get('token') || '').trim();
        const data = loadDb();
        let verificationResult = null;

        if (tokenQuery) {
            const matchedReq = data.service_requests.find(r => r.qr_token === tokenQuery);
            if (matchedReq) {
                const st = data.students.find(s => s.id === matchedReq.student_id);
                const srv = data.service_categories.find(c => c.id === matchedReq.service_id);
                const dept = data.departments.find(d => d.id === st.department_id);
                const summary = getStudentClearanceSummary(st.id);
                verificationResult = {
                    valid: true,
                    token: tokenQuery,
                    student_name: st.full_name,
                    roll_number: st.roll_number,
                    department: dept.name,
                    service_name: srv ? srv.name : "Digital Clearance Certificate",
                    clearance_status: summary.overall_status,
                    is_cleared: summary.is_cleared
                };
            } else {
                const st = data.students.find(s => s.roll_number.toLowerCase() === tokenQuery.toLowerCase() || `CERT-${s.roll_number}`.toLowerCase() === tokenQuery.toLowerCase());
                if (st) {
                    const dept = data.departments.find(d => d.id === st.department_id);
                    const summary = getStudentClearanceSummary(st.id);
                    verificationResult = {
                        valid: true,
                        token: tokenQuery,
                        student_name: st.full_name,
                        roll_number: st.roll_number,
                        department: dept.name,
                        service_name: "General Digital Clearance Certificate",
                        clearance_status: summary.overall_status,
                        is_cleared: summary.is_cleared
                    };
                }
            }
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Verification - CampusClear</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <style>
        body { background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card-verify { max-width: 600px; width: 100%; border-radius: 1.25rem; background: #ffffff; color: #1e293b; }
    </style>
</head>
<body>
<div class="card card-verify p-4 p-md-5 shadow-2xl border-0">
    <div class="text-center mb-4">
        <a href="/" class="text-decoration-none">
            <i class="bi bi-shield-check text-primary display-4 mb-2 d-inline-block"></i>
            <h3 class="fw-bold text-dark mb-0">CampusClear Verification</h3>
        </a>
        <p class="text-muted small">Official Digital Certificate Authenticity Portal</p>
    </div>

    ${verificationResult && verificationResult.valid ? `
        <div class="alert ${verificationResult.is_cleared ? 'alert-success border-success' : 'alert-warning border-warning'} p-4 rounded-4 mb-4 text-center">
            <i class="bi ${verificationResult.is_cleared ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-warning'} display-4 mb-2 d-block"></i>
            <h4 class="fw-bold mb-1">${verificationResult.is_cleared ? 'VERIFIED AUTHENTIC & CLEARED' : 'DOCUMENT VALID - CLEARANCE PENDING'}</h4>
            <span class="badge bg-white text-dark border rounded-pill px-3 py-1 fw-bold">Token: ${verificationResult.token}</span>
        </div>
        <div class="bg-light p-4 rounded-3 mb-4">
            <div class="row g-3">
                <div class="col-6"><span class="small text-muted text-uppercase d-block fw-bold">Student Name</span><strong class="text-dark">${verificationResult.student_name}</strong></div>
                <div class="col-6"><span class="small text-muted text-uppercase d-block fw-bold">Roll Number</span><strong class="text-dark font-monospace">${verificationResult.roll_number}</strong></div>
                <div class="col-6"><span class="small text-muted text-uppercase d-block fw-bold">Department</span><span class="text-dark">${verificationResult.department}</span></div>
                <div class="col-6"><span class="small text-muted text-uppercase d-block fw-bold">Service / Title</span><span class="text-dark">${verificationResult.service_name}</span></div>
                <div class="col-12 border-top pt-2"><span class="small text-muted text-uppercase d-block fw-bold">Clearance Status</span>${renderBadge(verificationResult.clearance_status)}</div>
            </div>
        </div>
    ` : tokenQuery ? `
        <div class="alert alert-danger p-4 rounded-4 text-center mb-4">
            <i class="bi bi-x-circle-fill text-danger display-4 mb-2 d-block"></i>
            <h5 class="fw-bold mb-1">Invalid Certificate Token</h5>
            <p class="small text-muted mb-0">Could not validate token code <code>${tokenQuery}</code>.</p>
        </div>
    ` : ''}

    <form method="GET" action="/verify">
        <label class="form-label fw-semibold small">Enter Certificate QR Token or Student Roll Number</label>
        <div class="input-group input-group-lg mb-3">
            <input type="text" class="form-control" name="token" value="${tokenQuery}" placeholder="e.g. CERT-ANANYA-IYER-2026 or TU6241103111002" required>
            <button class="btn btn-primary fw-bold" type="submit">Verify</button>
        </div>
    </form>
    <div class="text-center mt-3">
        <a href="/" class="small text-secondary text-decoration-none">&larr; Return to Homepage</a>
    </div>
</div>
</body>
</html>`);
    }

    // ==========================================
    // 5. PROTECTED PORTAL VIEWS
    // ==========================================
    if (!user) {
        return redirect('/login');
    }

    // 5.1 STUDENT DASHBOARD
    if (pathname === '/student/dashboard') {
        const studentId = user.student_id || 1;
        const summary = getStudentClearanceSummary(studentId);

        const content = `
            <div class="row mb-4 align-items-center">
                <div class="col-md-8">
                    <h2 class="fw-bold text-dark mb-1">Welcome, ${user.full_name}! 👋</h2>
                    <p class="text-muted mb-0">Continuous clearance monitor for semester registrations & graduation.</p>
                </div>
                <div class="col-md-4 text-md-end mt-3 mt-md-0">
                    ${summary.is_cleared ? `
                        <a href="/student/certificate" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm"><i class="bi bi-award me-1"></i> Download Certificate</a>
                    ` : `
                        <a href="/student/dues" class="btn btn-warning rounded-pill px-4 fw-bold shadow-sm"><i class="bi bi-exclamation-triangle me-1"></i> Resolve Dues</a>
                    `}
                </div>
            </div>

            <!-- Hero Clearance Card -->
            <div class="card card-glass overflow-hidden border-0 shadow-lg mb-4 text-white" style="background: ${summary.is_cleared ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'};">
                <div class="p-4 p-md-5">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <span class="badge bg-white text-dark px-3 py-2 rounded-pill fw-bold text-uppercase mb-2 shadow-sm">Continuous Engine Status</span>
                            <h1 class="display-5 fw-extrabold text-white mb-2">Overall: ${summary.overall_status}</h1>
                            <p class="fs-5 opacity-90 mb-0">
                                ${summary.is_cleared ? '<i class="bi bi-check-circle-fill me-2"></i> All departments have approved your clearance. You are eligible for certificates & exams.' : `<i class="bi bi-exclamation-octagon-fill me-2"></i> Clearance pending in ${summary.pending_count} department(s). Please review details below.`}
                            </p>
                        </div>
                        <div class="col-md-4 text-md-end text-center mt-4 mt-md-0">
                            <div class="d-inline-block bg-white text-dark p-4 rounded-4 shadow text-center" style="min-width: 180px;">
                                <div class="display-4 fw-bold text-primary">${summary.cleared_count} / ${summary.total_departments}</div>
                                <span class="small fw-semibold text-muted text-uppercase">Depts Cleared</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Department Breakdown Grid -->
            <h4 class="fw-bold text-dark mb-3"><i class="bi bi-building me-2 text-primary"></i> Department Clearance Breakdown</h4>
            <div class="row g-4 mb-4">
                ${summary.department_details.map(d => `
                    <div class="col-md-6 col-lg-4">
                        <div class="card card-glass p-4 h-100">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="fw-bold mb-0 text-dark">${d.name}</h5>
                                ${renderBadge(d.effective_status)}
                            </div>
                            <span class="badge bg-light text-secondary border w-auto align-self-start mb-3">${d.code}</span>
                            ${d.pending_dues_count > 0 ? `
                                <div class="alert alert-danger py-2 px-3 small mb-2">
                                    <i class="bi bi-exclamation-circle me-1"></i> <strong>₹${d.total_due_amount.toFixed(2)}</strong> due in this department.
                                </div>
                            ` : ''}
                            <p class="small text-muted mb-0"><strong>Remarks:</strong> ${d.remarks}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("Student Dashboard", user, content, pathname));
    }

    // 5.2 STUDENT DUES & DISPUTES
    if (pathname === '/student/dues') {
        const studentId = user.student_id || 1;
        const data = loadDb();

        if (method === 'POST') {
            return getBody(params => {
                const dueId = Number(params.due_id);
                const due = data.dues.find(d => d.id === dueId);
                if (due) {
                    const dispId = data.disputes.length > 0 ? Math.max(...data.disputes.map(d => d.id)) + 1 : 1;
                    data.disputes.push({
                        id: dispId,
                        student_id: studentId,
                        due_id: dueId,
                        department_id: due.department_id,
                        subject: params.subject || "Dispute on fine",
                        description: params.description || "",
                        status: "open",
                        resolution_remarks: "",
                        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                    });
                    saveDb();
                    logAudit(user.id, 'RAISE_DISPUTE', 'DISPUTE', `Raised dispute for due ID ${dueId}`);
                }
                return redirect('/student/dues');
            });
        }

        const myDues = data.dues.filter(d => d.student_id === studentId);
        const myDisputes = data.disputes.filter(d => d.student_id === studentId);

        const content = `
            <h2 class="fw-bold text-dark mb-1"><i class="bi bi-receipt me-2 text-danger"></i> My Dues & Penalties</h2>
            <p class="text-muted mb-4">View issued penalties and submit in-portal dispute explanations to department staff.</p>

            <div class="card card-glass p-0 border-0 mb-5 overflow-hidden">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr><th>Department</th><th>Title & Details</th><th>Amount</th><th>Status</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            ${myDues.length === 0 ? '<tr><td colspan="5" class="text-center py-4 text-muted">No dues outstanding! All clear.</td></tr>' : myDues.map(d => {
                                const dept = data.departments.find(dp => dp.id === d.department_id);
                                return `<tr>
                                    <td><span class="badge bg-light text-dark border">${dept ? dept.name : 'General'}</span></td>
                                    <td><strong class="d-block text-dark">${d.title}</strong><small class="text-muted">${d.description}</small></td>
                                    <td class="fw-bold text-danger">₹${Number(d.amount).toFixed(2)}</td>
                                    <td>${renderBadge(d.status)}</td>
                                    <td>
                                        ${d.status === 'pending' ? `
                                            <button class="btn btn-sm btn-outline-warning rounded-pill" onclick="openDispute(${d.id}, '${d.title.replace(/'/g, "\\'")}')">Raise Dispute</button>
                                        ` : '<span class="text-success small fw-bold">Settled</span>'}
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Raised Disputes -->
            <h4 class="fw-bold text-dark mb-3"><i class="bi bi-chat-left-dots me-2 text-primary"></i> Track Raised Disputes</h4>
            <div class="card card-glass p-0 border-0 overflow-hidden">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light"><tr><th>Date</th><th>Subject</th><th>Explanation</th><th>Status</th><th>Staff Response</th></tr></thead>
                        <tbody>
                            ${myDisputes.length === 0 ? '<tr><td colspan="5" class="text-center py-4 text-muted">No active disputes raised.</td></tr>' : myDisputes.map(dp => `
                                <tr>
                                    <td class="small text-muted">${dp.created_at}</td>
                                    <td class="fw-bold text-dark">${dp.subject}</td>
                                    <td class="small text-muted">${dp.description}</td>
                                    <td>${renderBadge(dp.status)}</td>
                                    <td class="small">${dp.resolution_remarks || '<em>Awaiting review</em>'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Dispute Modal Form -->
            <div class="modal fade" id="disputeModal" tabindex="-1">
                <div class="modal-dialog">
                    <form method="POST" action="/student/dues" class="modal-content rounded-4 border-0">
                        <input type="hidden" name="due_id" id="modalDueId">
                        <div class="modal-header">
                            <h5 class="modal-title fw-bold">Raise Due Dispute</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Due Particular</label>
                                <input type="text" class="form-control" id="modalDueTitle" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Dispute Subject</label>
                                <input type="text" class="form-control" name="subject" required placeholder="e.g. Fine already paid / Book returned">
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Detailed Justification</label>
                                <textarea class="form-control" name="description" rows="3" required placeholder="Provide transaction details, return date, etc."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-primary rounded-pill px-4">Submit Dispute</button>
                        </div>
                    </form>
                </div>
            </div>
            <script>
            function openDispute(id, title) {
                document.getElementById('modalDueId').value = id;
                document.getElementById('modalDueTitle').value = title;
                new bootstrap.Modal(document.getElementById('disputeModal')).show();
            }
            </script>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("My Dues & Disputes", user, content, pathname));
    }

    // 5.3 STUDENT SERVICE REQUESTS
    if (pathname === '/student/services') {
        const studentId = user.student_id || 1;
        const data = loadDb();
        const summary = getStudentClearanceSummary(studentId);

        if (method === 'POST') {
            return getBody(params => {
                const srvId = Number(params.service_id);
                const srv = data.service_categories.find(s => s.id === srvId);
                const purpose = (params.purpose || '').trim();

                if (srv && purpose) {
                    if (srv.requires_full_clearance && !summary.is_cleared) {
                        // Blocked by clearance rule
                        return redirect('/student/services?error=blocked');
                    }
                    const reqId = data.service_requests.length > 0 ? Math.max(...data.service_requests.map(r => r.id)) + 1 : 1;
                    const reqNum = `REQ-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                    const qrToken = `TOKEN-${reqNum}`;

                    data.service_requests.unshift({
                        id: reqId,
                        request_number: reqNum,
                        student_id: studentId,
                        service_id: srvId,
                        purpose,
                        status: 'in_progress',
                        clearance_snapshot: summary.is_cleared ? 'cleared' : 'pending',
                        qr_token: qrToken,
                        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                    });
                    saveDb();
                    logAudit(user.id, 'SUBMIT_SERVICE_REQUEST', 'SERVICE_REQUEST', `Submitted request ${reqNum} for ${srv.name}`);
                }
                return redirect('/student/services?success=1');
            });
        }

        const myRequests = data.service_requests.filter(r => r.student_id === studentId);
        const errorParam = parsedUrl.searchParams.get('error');
        const successParam = parsedUrl.searchParams.get('success');

        const content = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold text-dark mb-1"><i class="bi bi-file-earmark-text me-2 text-primary"></i> College Service Requests</h2>
                    <p class="text-muted mb-0">Apply for Bonafide Certificates, Exam Clearance, ID Card Replacement, and Transcripts.</p>
                </div>
                <button class="btn btn-primary rounded-pill px-4 fw-bold" data-bs-toggle="modal" data-bs-target="#newRequestModal">
                    <i class="bi bi-plus-lg me-1"></i> Apply for Service
                </button>
            </div>

            ${errorParam === 'blocked' ? `
                <div class="alert alert-danger alert-dismissible fade show mb-4 rounded-4" role="alert">
                    <i class="bi bi-exclamation-octagon-fill me-2"></i> <strong>Application Blocked:</strong> This service requires 100% full departmental clearance. You have pending clearance in ${summary.pending_count} department(s).
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            ` : successParam === '1' ? `
                <div class="alert alert-success alert-dismissible fade show mb-4 rounded-4" role="alert">
                    <i class="bi bi-check-circle-fill me-2"></i> Service application submitted successfully! Department staff will review your request.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            ` : ''}

            <!-- Application History Table -->
            <div class="card card-glass p-0 border-0 overflow-hidden mb-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr><th>Request No</th><th>Service</th><th>Purpose</th><th>Clearance State</th><th>Approval Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${myRequests.length === 0 ? '<tr><td colspan="6" class="text-center py-4 text-muted">No service applications submitted yet.</td></tr>' : myRequests.map(r => {
                                const srv = data.service_categories.find(s => s.id === r.service_id);
                                return `<tr>
                                    <td><code>${r.request_number}</code></td>
                                    <td><strong class="text-dark">${srv ? srv.name : 'College Service'}</strong></td>
                                    <td class="small text-muted">${r.purpose}</td>
                                    <td><span class="badge ${r.clearance_snapshot === 'cleared' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}">${r.clearance_snapshot.toUpperCase()}</span></td>
                                    <td>${renderBadge(r.status)}</td>
                                    <td>
                                        ${r.status === 'approved' ? `
                                            <a href="/student/certificate" class="btn btn-sm btn-success rounded-pill px-3"><i class="bi bi-award me-1"></i> Certificate</a>
                                        ` : '<span class="text-muted small">In Review</span>'}
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal: Apply Service -->
            <div class="modal fade" id="newRequestModal" tabindex="-1">
                <div class="modal-dialog">
                    <form method="POST" action="/student/services" class="modal-content rounded-4 border-0">
                        <div class="modal-header border-bottom">
                            <h5 class="modal-title fw-bold">Apply for College Service</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div class="mb-3">
                                <label class="form-label fw-bold small">Service Category <span class="text-danger">*</span></label>
                                <select class="form-select" name="service_id" required>
                                    ${data.service_categories.map(s => `<option value="${s.id}">${s.name} ${s.requires_full_clearance ? '(Requires Full Clearance)' : '(Open Access)'}</option>`).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold small">Purpose / Statement of Need <span class="text-danger">*</span></label>
                                <textarea class="form-control" name="purpose" rows="3" required placeholder="State why you require this document or service..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold">Submit Application</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("Service Requests", user, content, pathname));
    }

    // 5.4 DIGITAL CERTIFICATE VIEW
    if (pathname === '/student/certificate') {
        const studentId = user.student_id || 1;
        const summary = getStudentClearanceSummary(studentId);
        const data = loadDb();
        const student = data.students.find(s => s.id === studentId);
        const dept = data.departments.find(d => d.id === student.department_id);

        const certToken = `CERT-${student.roll_number}`;
        const verifyUrl = `${parsedUrl.origin}/verify?token=${certToken}`;

        const content = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold text-dark mb-1"><i class="bi bi-award me-2 text-success"></i> Digital Clearance Certificate</h2>
                    <p class="text-muted mb-0">Cryptographically verifiable institutional clearance document.</p>
                </div>
                ${summary.is_cleared ? `
                    <button onclick="window.print();" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"><i class="bi bi-printer me-2"></i> Print / PDF</button>
                ` : `
                    <a href="/student/dues" class="btn btn-warning rounded-pill px-4 fw-bold">Resolve Pending Dues</a>
                `}
            </div>

            ${!summary.is_cleared ? `
                <div class="card card-glass p-5 text-center border-warning border-3 shadow-lg max-w-2xl mx-auto">
                    <div class="bg-warning-subtle text-warning p-3 rounded-circle mx-auto mb-3" style="width: 70px; height: 70px;">
                        <i class="bi bi-lock-fill fs-2"></i>
                    </div>
                    <h3 class="fw-bold text-dark mb-2">Certificate Locked: Clearance Pending</h3>
                    <p class="text-muted fs-5 mb-4">You have pending holds in <strong>${summary.pending_count} department(s)</strong>. Clear all dues to unlock your official certificate.</p>
                    <a href="/student/dues" class="btn btn-warning px-5 py-3 rounded-pill fw-bold">Review Pending Dues</a>
                </div>
            ` : `
                <div class="card p-5 border-4 border-primary rounded-4 bg-white shadow-2xl position-relative mx-auto" style="border-style: double !important; max-width: 900px;">
                    <div class="d-flex justify-content-between align-items-center border-bottom pb-4 mb-4">
                        <div>
                            <h2 class="fw-extrabold text-uppercase text-primary mb-1" style="font-family:'Times New Roman', serif;">Central University of Technology</h2>
                            <h5 class="fw-bold text-secondary mb-0">Office of the Controller of Examinations & Registrar</h5>
                            <small class="text-muted">Accreditation: NAAC A++ Grade • Institutional Clearance Engine</small>
                        </div>
                        <div class="p-2 border border-success rounded-3 bg-success-subtle text-success text-center px-3">
                            <i class="bi bi-patch-check-fill fs-4 d-block"></i>
                            <span class="fw-bold text-uppercase small">OFFICIALLY CLEARED</span>
                        </div>
                    </div>

                    <div class="text-center my-4">
                        <h3 class="fw-bold text-uppercase tracking-widest text-dark" style="letter-spacing: 3px; font-family:'Times New Roman', serif;">
                            DIGITAL NO-DUE CLEARANCE CERTIFICATE
                        </h3>
                        <p class="text-muted italic small">Generated via Real-Time Continuous Clearance Engine</p>
                    </div>

                    <div class="fs-5 lh-lg text-dark my-4" style="font-family: Georgia, serif;">
                        <p>
                            This certifies that Student <strong>${student.full_name}</strong>, bearing University Roll Number 
                            <code>${student.roll_number}</code> belonging to the Department of <strong>${dept ? dept.name : 'Engineering'}</strong> 
                            (Batch: ${student.batch}, Semester ${student.semester}), has successfully cleared all institutional protocols.
                        </p>
                        <p>
                            As verified on <strong>${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>, the student has 
                            <span class="text-success fw-bold text-decoration-underline">ZERO OUTSTANDING DUES OR DISCIPLINARY HOLDS</span>.
                        </p>
                    </div>

                    <div class="row my-4 g-2">
                        ${summary.department_details.map(d => `
                            <div class="col-4 col-md">
                                <div class="p-2 border rounded-3 text-center bg-light">
                                    <small class="d-block text-muted text-truncate">${d.code}</small>
                                    <span class="badge bg-success mt-1">CLEARED</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="row align-items-end mt-5 pt-4 border-top">
                        <div class="col-4 text-center">
                            <div id="cert_qr" class="d-inline-block border p-1 bg-white rounded-3 shadow-sm mb-1"></div>
                            <span class="d-block text-muted text-xs" style="font-size:0.65rem;">Scan QR to verify live authenticity</span>
                            <code class="text-xs" style="font-size:0.65rem;">${certToken}</code>
                        </div>
                        <div class="col-4 text-center">
                            <div class="border-bottom border-dark pb-2 mb-1 w-75 mx-auto">
                                <span class="fw-bold font-monospace text-primary">DIGITAL SEAL</span>
                            </div>
                            <span class="small fw-semibold text-muted d-block">CampusClear Engine</span>
                        </div>
                        <div class="col-4 text-center">
                            <div class="border-bottom border-dark pb-2 mb-1 w-75 ms-auto">
                                <span class="fw-bold font-monospace">Dr. M. K. Sharma</span>
                            </div>
                            <span class="small fw-semibold text-dark d-block">Controller of Exams</span>
                        </div>
                    </div>
                </div>
                <script>
                document.addEventListener('DOMContentLoaded', function() {
                    new QRCode(document.getElementById("cert_qr"), {
                        text: "${verifyUrl}",
                        width: 80,
                        height: 80,
                        colorDark: "#0f172a",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });
                });
                </script>
            `}
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("Digital Certificate", user, content, pathname));
    }

    // 5.5 STAFF STUDENTS & CLEARANCE TOGGLE
    if (pathname === '/staff/students') {
        const data = loadDb();
        const staffDeptId = user.department_id || 1;

        if (method === 'POST') {
            return getBody(params => {
                const action = params.action;
                if (action === 'toggle_status') {
                    const stId = Number(params.student_id);
                    const newStatus = params.status || 'cleared';
                    const remarks = (params.remarks || '').trim() || (newStatus === 'cleared' ? 'Cleared by staff' : 'Hold applied');

                    let rec = data.clearance_status.find(cs => cs.student_id === stId && cs.department_id === staffDeptId);
                    if (rec) {
                        rec.status = newStatus;
                        rec.remarks = remarks;
                        rec.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    } else {
                        const newId = data.clearance_status.length > 0 ? Math.max(...data.clearance_status.map(c => c.id)) + 1 : 1;
                        data.clearance_status.push({
                            id: newId,
                            student_id: stId,
                            department_id: staffDeptId,
                            status: newStatus,
                            remarks: remarks,
                            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        });
                    }
                    saveDb();
                    logAudit(user.id, 'UPDATE_CLEARANCE_STATUS', 'STUDENT', `Changed student ID ${stId} status to ${newStatus}`);
                } else if (action === 'issue_due') {
                    const stId = Number(params.student_id);
                    const title = (params.title || '').trim();
                    const amount = Number(params.amount) || 0;
                    if (stId && title) {
                        const dueId = data.dues.length > 0 ? Math.max(...data.dues.map(d => d.id)) + 1 : 1;
                        data.dues.push({
                            id: dueId,
                            student_id: stId,
                            department_id: staffDeptId,
                            title: title,
                            description: (params.description || '').trim(),
                            amount: amount,
                            status: 'pending',
                            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        });
                        saveDb();
                        logAudit(user.id, 'ISSUE_DUE', 'DUE', `Issued due ID ${dueId} of ₹${amount} to student ${stId}`);
                    }
                }
                return redirect('/staff/students');
            });
        }

        const dept = data.departments.find(d => d.id === staffDeptId);
        const content = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold text-dark mb-1"><i class="bi bi-people me-2 text-primary"></i> Assigned Students Roster</h2>
                    <p class="text-muted mb-0">Department: <strong>${dept ? dept.name : 'All Departments'}</strong></p>
                </div>
            </div>

            <div class="card card-glass border-0 overflow-hidden mb-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr><th>Roll Number</th><th>Student Name</th><th>Current Dept Status</th><th>Pending Dues</th><th>Toggle Clearance</th><th>Issue Penalty</th></tr>
                        </thead>
                        <tbody>
                            ${data.students.map(st => {
                                const cs = data.clearance_status.find(c => c.student_id === st.id && c.department_id === staffDeptId);
                                const currStatus = cs ? cs.status : 'cleared';
                                const dues = data.dues.filter(d => d.student_id === st.id && d.department_id === staffDeptId && d.status === 'pending');
                                const totalDue = dues.reduce((s, d) => s + Number(d.amount), 0);

                                return `<tr>
                                    <td><code>${st.roll_number}</code></td>
                                    <td><strong class="text-dark">${st.full_name}</strong><br><small class="text-muted">Batch: ${st.batch}</small></td>
                                    <td>${renderBadge(currStatus)}</td>
                                    <td>${dues.length > 0 ? `<span class="badge bg-danger">₹${totalDue.toFixed(2)} (${dues.length})</span>` : '<span class="text-success small fw-bold">₹0.00</span>'}</td>
                                    <td>
                                        <form method="POST" action="/staff/students" class="d-flex gap-2">
                                            <input type="hidden" name="action" value="toggle_status">
                                            <input type="hidden" name="student_id" value="${st.id}">
                                            <select name="status" class="form-select form-select-sm w-auto">
                                                <option value="cleared" ${currStatus === 'cleared' ? 'selected' : ''}>CLEARED</option>
                                                <option value="pending" ${currStatus === 'pending' ? 'selected' : ''}>PENDING</option>
                                                <option value="blocked" ${currStatus === 'blocked' ? 'selected' : ''}>BLOCKED</option>
                                            </select>
                                            <button type="submit" class="btn btn-sm btn-primary rounded-pill px-3">Update</button>
                                        </form>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="openIssueDue(${st.id}, '${st.full_name.replace(/'/g, "\\'")}')">
                                            <i class="bi bi-plus-circle me-1"></i> Issue Due
                                        </button>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Issue Due Modal -->
            <div class="modal fade" id="issueDueModal" tabindex="-1">
                <div class="modal-dialog">
                    <form method="POST" action="/staff/students" class="modal-content rounded-4 border-0">
                        <input type="hidden" name="action" value="issue_due">
                        <input type="hidden" name="student_id" id="dueStudentId">
                        <div class="modal-header border-bottom">
                            <h5 class="modal-title fw-bold">Issue Department Fine / Penalty</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Target Student</label>
                                <input type="text" class="form-control" id="dueStudentName" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Due Title <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" name="title" placeholder="e.g. Broken glassware fee / Late lab fee" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Amount (₹) <span class="text-danger">*</span></label>
                                <input type="number" step="0.01" class="form-control" name="amount" placeholder="e.g. 500.00" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Description</label>
                                <textarea class="form-control" name="description" rows="2" placeholder="Details or incident reference..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-danger rounded-pill px-4 fw-bold">Issue Due</button>
                        </div>
                    </form>
                </div>
            </div>
            <script>
            function openIssueDue(id, name) {
                document.getElementById('dueStudentId').value = id;
                document.getElementById('dueStudentName').value = name;
                new bootstrap.Modal(document.getElementById('issueDueModal')).show();
            }
            </script>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("Assigned Students", user, content, pathname));
    }

    // 5.6 STAFF SERVICE APPROVALS
    if (pathname === '/staff/approvals') {
        const data = loadDb();

        if (method === 'POST') {
            return getBody(params => {
                const reqId = Number(params.request_id);
                const action = params.action; // 'approve' or 'reject'
                const reqRecord = data.service_requests.find(r => r.id === reqId);
                if (reqRecord) {
                    reqRecord.status = action === 'approve' ? 'approved' : 'rejected';
                    saveDb();
                    logAudit(user.id, 'SERVICE_REQUEST_ACTION', 'SERVICE_REQUEST', `Marked request ${reqRecord.request_number} as ${reqRecord.status}`);
                }
                return redirect('/staff/approvals');
            });
        }

        const requests = data.service_requests;
        const content = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold text-dark mb-1"><i class="bi bi-card-checklist me-2 text-primary"></i> Service Request Approvals</h2>
                    <p class="text-muted mb-0">Review student applications requiring departmental clearance verification.</p>
                </div>
            </div>

            <div class="card card-glass border-0 overflow-hidden mb-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr><th>Request No</th><th>Student</th><th>Service</th><th>Purpose</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${requests.length === 0 ? '<tr><td colspan="6" class="text-center py-4 text-muted">No pending service applications.</td></tr>' : requests.map(r => {
                                const st = data.students.find(s => s.id === r.student_id);
                                const srv = data.service_categories.find(s => s.id === r.service_id);
                                return `<tr>
                                    <td><code>${r.request_number}</code></td>
                                    <td><strong class="text-dark">${st ? st.full_name : 'Unknown'}</strong><br><small class="text-muted">${st ? st.roll_number : ''}</small></td>
                                    <td><strong class="text-dark">${srv ? srv.name : 'Service'}</strong></td>
                                    <td class="small text-muted">${r.purpose}</td>
                                    <td>${renderBadge(r.status)}</td>
                                    <td>
                                        ${r.status === 'in_progress' ? `
                                            <form method="POST" action="/staff/approvals" class="d-inline">
                                                <input type="hidden" name="request_id" value="${r.id}">
                                                <button type="submit" name="action" value="approve" class="btn btn-sm btn-success rounded-pill px-3 me-1"><i class="bi bi-check-lg"></i> Approve</button>
                                                <button type="submit" name="action" value="reject" class="btn btn-sm btn-danger rounded-pill px-3"><i class="bi bi-x-lg"></i> Reject</button>
                                            </form>
                                        ` : '<span class="text-muted small">Processed</span>'}
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("Service Approvals", user, content, pathname));
    }

    // 5.7 ADMIN CONTROL CENTER & ANALYTICS
    if (pathname === '/admin/dashboard' || pathname === '/staff/dashboard') {
        const data = loadDb();
        const totalStudents = data.students.length;
        const totalDues = data.dues.filter(d => d.status === 'pending').length;
        const totalDuesAmount = data.dues.filter(d => d.status === 'pending').reduce((sum, d) => sum + Number(d.amount), 0);
        const openDisputes = data.disputes.filter(d => d.status === 'open').length;

        const content = `
            <div class="row mb-4 align-items-center">
                <div class="col-md-8">
                    <h2 class="fw-bold text-dark mb-1">${user.role === 'admin' ? 'Master Control Center & Analytics' : 'Department Staff Workspace'}</h2>
                    <p class="text-muted mb-0">System continuous clearance oversight, due issuance, and audit operations.</p>
                </div>
                <div class="col-md-4 text-md-end mt-3 mt-md-0">
                    ${user.role === 'admin' ? `
                        <a href="/admin/override" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm"><i class="bi bi-key me-1"></i> Emergency Override</a>
                    ` : `
                        <a href="/staff/students" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"><i class="bi bi-people me-1"></i> Manage Students</a>
                    `}
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="row g-4 mb-4">
                <div class="col-md-3">
                    <div class="kpi-card">
                        <div class="kpi-icon bg-primary-subtle text-primary me-3"><i class="bi bi-people"></i></div>
                        <div><h3 class="fw-bold mb-0 text-dark">${totalStudents}</h3><span class="text-muted small">Total Students</span></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="kpi-card">
                        <div class="kpi-icon bg-danger-subtle text-danger me-3"><i class="bi bi-wallet2"></i></div>
                        <div><h3 class="fw-bold mb-0 text-dark">₹${totalDuesAmount.toFixed(0)}</h3><span class="text-muted small">Pending Dues</span></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="kpi-card">
                        <div class="kpi-icon bg-warning-subtle text-warning-emphasis me-3"><i class="bi bi-clock-history"></i></div>
                        <div><h3 class="fw-bold mb-0 text-dark">${totalDues}</h3><span class="text-muted small">Pending Due Cases</span></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="kpi-card">
                        <div class="kpi-icon bg-info-subtle text-info me-3"><i class="bi bi-chat-left-dots"></i></div>
                        <div><h3 class="fw-bold mb-0 text-dark">${openDisputes}</h3><span class="text-muted small">Open Disputes</span></div>
                    </div>
                </div>
            </div>

            <!-- Student Clearance Registry -->
            <div class="card card-glass border-0 overflow-hidden mb-4">
                <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-mortarboard me-2 text-primary"></i> Active Student Clearance Registry</h5>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light"><tr><th>Roll No</th><th>Student Name</th><th>Dept</th><th>Overall Status</th><th>Pending Depts / Reasons</th></tr></thead>
                        <tbody>
                            ${data.students.map(st => {
                                const summ = getStudentClearanceSummary(st.id);
                                const d = data.departments.find(dp => dp.id === st.department_id);
                                return `<tr>
                                    <td><code>${st.roll_number}</code></td>
                                    <td class="fw-bold text-dark">${st.full_name}</td>
                                    <td><span class="badge bg-light text-secondary">${d ? d.code : 'GEN'}</span></td>
                                    <td>${renderBadge(summ.overall_status)}</td>
                                    <td>${summ.pending_departments.map(p => `<span class="badge bg-danger-subtle text-danger me-1 mb-1">${p.name}: ${p.reason}</span>`).join('') || '<span class="text-success small fw-bold"><i class="bi bi-check-circle me-1"></i> All 5 Cleared</span>'}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout(user.role === 'admin' ? "Admin Control Center" : "Staff Portal", user, content, pathname));
    }

    // 5.8 ADMIN EMERGENCY OVERRIDE
    if (pathname === '/admin/override') {
        const data = loadDb();

        if (method === 'POST') {
            return getBody(params => {
                const stId = Number(params.student_id);
                const justification = (params.justification || '').trim();

                if (stId && justification) {
                    // Force clear across all departments
                    for (const dept of data.departments) {
                        let rec = data.clearance_status.find(cs => cs.student_id === stId && cs.department_id === dept.id);
                        if (rec) {
                            rec.status = 'cleared';
                            rec.remarks = `ADMIN OVERRIDE: ${justification}`;
                            rec.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        } else {
                            data.clearance_status.push({
                                id: data.clearance_status.length + 1,
                                student_id: stId,
                                department_id: dept.id,
                                status: 'cleared',
                                remarks: `ADMIN OVERRIDE: ${justification}`,
                                updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            });
                        }
                    }
                    // Waive pending dues for this student
                    for (const due of data.dues) {
                        if (due.student_id === stId && due.status === 'pending') {
                            due.status = 'waived';
                        }
                    }
                    saveDb();
                    logAudit(user.id, 'ADMIN_CLEARANCE_OVERRIDE', 'STUDENT', `Emergency clearance override for student ${stId}: ${justification}`);
                }
                return redirect('/admin/override?success=1');
            });
        }

        const successParam = parsedUrl.searchParams.get('success');
        const content = `
            <div class="row mb-4">
                <div class="col-md-8">
                    <h2 class="fw-bold text-dark mb-1"><i class="bi bi-key me-2 text-danger"></i> Emergency Administrative Clearance Override</h2>
                    <p class="text-muted mb-0">Sanction discretionary clearance for graduation, emergency medical transfers, or registrar exemptions.</p>
                </div>
            </div>

            ${successParam === '1' ? `
                <div class="alert alert-success alert-dismissible fade show rounded-4 mb-4" role="alert">
                    <i class="bi bi-check-circle-fill me-2"></i> Emergency clearance override executed successfully! Student is now 100% CLEARED across all departments.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            ` : ''}

            <div class="card card-glass p-4 p-md-5 border-0 max-w-2xl">
                <form method="POST" action="/admin/override" onsubmit="return confirm('WARNING: Are you sure you want to execute an emergency clearance override for this student?');">
                    <div class="mb-4">
                        <label class="form-label fw-bold">Select Target Student <span class="text-danger">*</span></label>
                        <select class="form-select form-select-lg" name="student_id" required>
                            <option value="">-- Choose Student by Roll Number or Name --</option>
                            ${data.students.map(st => `<option value="${st.id}">[${st.roll_number}] ${st.full_name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="form-label fw-bold">Mandatory Justification / Exemption Order No. <span class="text-danger">*</span></label>
                        <textarea class="form-control" name="justification" rows="3" required placeholder="State official registrar executive approval reference or justification..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-danger btn-lg rounded-pill px-5 fw-bold shadow">
                        <i class="bi bi-shield-lock-fill me-2"></i> Execute Emergency Clearance Override
                    </button>
                </form>
            </div>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("Emergency Override", user, content, pathname));
    }

    // 5.9 ADMIN DUES & WAIVER
    if (pathname === '/admin/dues') {
        const data = loadDb();

        if (method === 'POST') {
            return getBody(params => {
                const dueId = Number(params.due_id);
                const due = data.dues.find(d => d.id === dueId);
                if (due) {
                    due.status = 'waived';
                    saveDb();
                    logAudit(user.id, 'ADMIN_WAIVE_DUE', 'DUE', `Waived due ID ${dueId} for student ${due.student_id}`);
                }
                return redirect('/admin/dues');
            });
        }

        const dues = data.dues;
        const content = `
            <div class="row mb-4">
                <div class="col-md-8">
                    <h2 class="fw-bold text-dark mb-1"><i class="bi bi-wallet2 me-2 text-primary"></i> Master System Dues Directory</h2>
                    <p class="text-muted mb-0">System-wide overview of active, settled, and waived student penalties.</p>
                </div>
            </div>

            <div class="card card-glass border-0 overflow-hidden mb-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr><th>ID</th><th>Student</th><th>Department</th><th>Title & Particulars</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${dues.map(d => {
                                const st = data.students.find(s => s.id === d.student_id);
                                const dept = data.departments.find(dp => dp.id === d.department_id);
                                return `<tr>
                                    <td><code>#${d.id}</code></td>
                                    <td><strong class="text-dark">${st ? st.full_name : 'Unknown'}</strong><br><small class="text-muted">${st ? st.roll_number : ''}</small></td>
                                    <td><span class="badge bg-light text-secondary">${dept ? dept.name : 'General'}</span></td>
                                    <td><strong class="text-dark">${d.title}</strong><br><small class="text-muted">${d.description}</small></td>
                                    <td class="fw-bold text-danger">₹${Number(d.amount).toFixed(2)}</td>
                                    <td>${renderBadge(d.status)}</td>
                                    <td>
                                        ${d.status === 'pending' ? `
                                            <form method="POST" action="/admin/dues" class="d-inline" onsubmit="return confirm('Waive this fine for the student?');">
                                                <input type="hidden" name="due_id" value="${d.id}">
                                                <button type="submit" class="btn btn-sm btn-outline-warning rounded-pill px-3">Waive Fine</button>
                                            </form>
                                        ` : '<span class="text-muted small">Settled</span>'}
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("System Dues", user, content, pathname));
    }

    // 5.10 ADMIN STUDENTS DIRECTORY
    if (pathname === '/admin/students') {
        const data = loadDb();
        const content = `
            <div class="row mb-4">
                <div class="col-md-8">
                    <h2 class="fw-bold text-dark mb-1"><i class="bi bi-mortarboard me-2 text-primary"></i> Master Student Directory</h2>
                    <p class="text-muted mb-0">Directory of registered students and real-time clearance status.</p>
                </div>
            </div>

            <div class="card card-glass border-0 overflow-hidden mb-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr><th>Roll Number</th><th>Student Name</th><th>Department</th><th>Batch & Sem</th><th>Overall Clearance</th></tr>
                        </thead>
                        <tbody>
                            ${data.students.map(st => {
                                const summ = getStudentClearanceSummary(st.id);
                                const d = data.departments.find(dp => dp.id === st.department_id);
                                return `<tr>
                                    <td><code>${st.roll_number}</code></td>
                                    <td><strong class="text-dark">${st.full_name}</strong><br><small class="text-muted">${st.email}</small></td>
                                    <td><span class="badge bg-light text-secondary">${d ? d.name : 'Engineering'}</span></td>
                                    <td class="small">Batch: ${st.batch}<br>Semester ${st.semester}</td>
                                    <td>${renderBadge(summ.overall_status)}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("Student Directory", user, content, pathname));
    }

    // 5.11 ADMIN AUDIT LOGS
    if (pathname === '/admin/audit') {
        const data = loadDb();
        const content = `
            <div class="row mb-4">
                <div class="col-md-8">
                    <h2 class="fw-bold text-dark mb-1"><i class="bi bi-journal-text me-2 text-primary"></i> Tamper-Proof Audit Trail</h2>
                    <p class="text-muted mb-0">Cryptographic audit log recording every user sign-in, status modification, fine issuance, and override.</p>
                </div>
            </div>

            <div class="card card-glass border-0 overflow-hidden mb-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light"><tr><th>Timestamp</th><th>Action</th><th>Target Entity</th><th>Details</th></tr></thead>
                        <tbody>
                            ${data.audit_logs.map(a => `
                                <tr>
                                    <td class="small font-monospace">${a.created_at}</td>
                                    <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle">${a.action}</span></td>
                                    <td><span class="badge bg-light text-secondary">${a.entity_type}</span></td>
                                    <td class="small text-dark">${a.details}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("Audit Logs", user, content, pathname));
    }

    // Fallback 404
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1><p><a href="/">Return to CampusClear</a></p>');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` CampusClear Cloud Platform is LIVE on Port ${PORT}`);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(`====================================================`);
});
