const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const querystring = require('node:querystring');

const PORT = process.env.PORT || 8000;
const DB_FILE = path.join(__dirname, 'campusclear_data.json');

// Session storage (in-memory)
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

// Database Engine
let db = null;
function loadDb(force = false) {
    if (db && !force) return db;
    try {
        if (fs.existsSync(DB_FILE)) {
            const raw = fs.readFileSync(DB_FILE, 'utf8');
            db = JSON.parse(raw);
        } else {
            console.error("DB file not found, creating from generator...");
            require('./generate_data.js');
            const raw = fs.readFileSync(DB_FILE, 'utf8');
            db = JSON.parse(raw);
        }
    } catch (e) {
        console.error("Error loading DB:", e);
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

// Initial load
loadDb();

// Clearance Engine
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
            pendingDepartments.push(dept.name);
        } else {
            clearedCount++;
        }

        departmentDetails.push({
            id: dept.id,
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

    const isFullyCleared = (pendingCount === 0);
    const overallStatus = isFullyCleared ? 'cleared' : 'pending';

    return {
        student,
        overall_status: overallStatus,
        is_cleared: isFullyCleared,
        cleared_count: clearedCount,
        pending_count: pendingCount,
        total_departments: activeDepts.length,
        department_details: departmentDetails,
        pending_departments: pendingDepartments
    };
}

function logAudit(userId, action, entityType, details) {
    const data = loadDb();
    const newId = data.audit_logs.length > 0 ? Math.max(...data.audit_logs.map(a => a.id)) + 1 : 1;
    data.audit_logs.unshift({
        id: newId,
        user_id: userId,
        action,
        entity_type: entityType,
        details,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
    saveDb();
}

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
    <title>${title} - Takshashila University</title>
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
        .sidebar { width: 270px; min-height: 100vh; background: var(--brand-sidebar); color: #f1f5f9; flex-shrink: 0; }
        .sidebar-header { padding: 1.5rem; background: #0f172a; border-bottom: 1px solid #334155; }
        .sidebar-link { display: flex; align-items: center; gap: 12px; padding: 0.75rem 1.5rem; color: #94a3b8; text-decoration: none; font-weight: 500; font-size: 0.95rem; border-left: 3px solid transparent; transition: all 0.2s; }
        .sidebar-link:hover, .sidebar-link.active { color: #ffffff; background: rgba(255,255,255,0.05); border-left-color: var(--brand-primary); }
        .top-navbar { background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 0.75rem 1.5rem; }
    </style>
</head>
<body>
<div class="d-flex w-100 min-vh-100">
    <!-- Sidebar -->
    <div class="sidebar d-none d-md-flex flex-column">
        <div class="sidebar-header">
            <a href="/" class="d-flex align-items-center text-white text-decoration-none">
                <i class="bi bi-mortarboard-fill text-primary fs-3 me-2"></i>
                <div>
                    <span class="fw-bold fs-6 d-block lh-1 text-white">Takshashila University</span>
                    <small class="text-xs text-muted" style="font-size:0.7rem;">AIDS Dept • V Semester</small>
                </div>
            </a>
        </div>
        <div class="py-3 flex-grow-1">
            ${user.role === 'student' ? `
                <a href="/student/dashboard" class="sidebar-link ${currentPath === '/student/dashboard' ? 'active' : ''}"><i class="bi bi-speedometer2"></i> Dashboard</a>
                <a href="/student/timetable" class="sidebar-link ${currentPath === '/student/timetable' ? 'active' : ''}"><i class="bi bi-calendar3"></i> Class Timetable</a>
                <a href="/student/dues" class="sidebar-link ${currentPath === '/student/dues' ? 'active' : ''}"><i class="bi bi-receipt"></i> Pending Dues</a>
                <a href="/student/services" class="sidebar-link ${currentPath === '/student/services' ? 'active' : ''}"><i class="bi bi-file-earmark-text"></i> Service Requests</a>
                <a href="/student/certificate" class="sidebar-link ${currentPath === '/student/certificate' ? 'active' : ''}"><i class="bi bi-award"></i> Digital Certificate</a>
            ` : user.role === 'staff' ? `
                <a href="/staff/dashboard" class="sidebar-link ${currentPath === '/staff/dashboard' ? 'active' : ''}"><i class="bi bi-speedometer2"></i> Staff Portal</a>
                <a href="/staff/students" class="sidebar-link ${currentPath === '/staff/students' ? 'active' : ''}"><i class="bi bi-people"></i> AIDS Student Roster (62)</a>
                <a href="/staff/timetable" class="sidebar-link ${currentPath === '/staff/timetable' ? 'active' : ''}"><i class="bi bi-calendar3"></i> V Sem Timetable</a>
                <a href="/staff/approvals" class="sidebar-link ${currentPath === '/staff/approvals' ? 'active' : ''}"><i class="bi bi-check-circle"></i> Service Approvals</a>
            ` : `
                <a href="/admin/dashboard" class="sidebar-link ${currentPath === '/admin/dashboard' ? 'active' : ''}"><i class="bi bi-grid-1x2"></i> Control Center</a>
                <a href="/admin/students" class="sidebar-link ${currentPath === '/admin/students' ? 'active' : ''}"><i class="bi bi-mortarboard"></i> Student Directory (62)</a>
                <a href="/student/timetable" class="sidebar-link ${currentPath === '/student/timetable' ? 'active' : ''}"><i class="bi bi-calendar3"></i> V Sem Timetable</a>
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
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">Takshashila University</span>
                <span class="text-secondary small d-none d-sm-inline">AI & Data Science (AIDS) • HOD: Dr. M Senthil</span>
            </div>
            <div class="d-flex align-items-center gap-3">
                <a href="/verify" class="btn btn-sm btn-outline-primary rounded-pill"><i class="bi bi-qr-code-scan me-1"></i> QR Verify</a>
                <div class="d-flex align-items-center border-start ps-3">
                    <div class="text-end me-2">
                        <span class="d-block fw-bold small text-dark lh-1">${user.full_name || user.username}</span>
                        <small class="text-muted text-uppercase" style="font-size:0.7rem;">${user.role} ${user.username ? '(' + user.username + ')' : ''}</small>
                    </div>
                    <a href="/logout" class="btn btn-sm btn-light border rounded-pill ms-2" title="Logout"><i class="bi bi-box-arrow-right"></i></a>
                </div>
            </div>
        </nav>
        <div class="p-4 flex-grow-1">
            ${content}
        </div>
        <footer class="p-3 bg-white border-top text-center text-muted small">
            &copy; ${new Date().getFullYear()} Takshashila University • Department of Artificial Intelligence & Data Science | Mini Project-II Platform
        </footer>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

// HTTP Server
const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

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
        const data = loadDb();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Takshashila University - AIDS Student Clearance & Academic Portal</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <style>
        body { background-color: #0f172a; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
        .hero-banner { background: radial-gradient(circle at 80% 20%, rgba(79, 70, 229, 0.4) 0%, rgba(15, 23, 42, 1) 75%); padding: 80px 0; }
        .portal-card { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 1.25rem; transition: transform 0.2s; }
        .portal-card:hover { transform: translateY(-5px); }
    </style>
</head>
<body>
    <nav class="navbar navbar-dark bg-dark bg-opacity-75 border-bottom border-secondary py-3">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center fw-bold" href="/">
                <i class="bi bi-mortarboard-fill text-primary fs-3 me-2"></i> Takshashila University
            </a>
            <div class="d-flex gap-2">
                <a href="/verify" class="btn btn-outline-light rounded-pill px-3"><i class="bi bi-qr-code me-1"></i> Verify QR Certificate</a>
                <a href="/login" class="btn btn-primary rounded-pill px-4 fw-bold">Sign In to Portal</a>
            </div>
        </div>
    </nav>

    <div class="hero-banner text-center">
        <div class="container">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 mb-3 fw-bold">Department of Artificial Intelligence & Data Science</span>
            <h1 class="display-4 fw-extrabold text-white mb-2">Takshashila University</h1>
            <h3 class="fw-semibold text-primary-subtle mb-3">Continuous Digital Student Clearance & Academic Portal</h3>
            <p class="lead text-secondary mx-auto mb-4" style="max-width: 700px;">
                Centralized automated clearance tracking across Central Library, Accounts & Finance, Hostel Board, AIDS Department (HOD: Dr. M Senthil), and Exam Cell with instant QR certificate validation for all 62 V-Semester students.
            </p>
            <div class="d-flex justify-content-center gap-3">
                <a href="/login" class="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-lg">Login to Portal <i class="bi bi-arrow-right ms-2"></i></a>
                <a href="/verify" class="btn btn-outline-light btn-lg rounded-pill px-4"><i class="bi bi-qr-code-scan me-1"></i> Public QR Verify</a>
            </div>
        </div>
    </div>

    <div class="container py-5">
        <div class="row g-4">
            <div class="col-md-4">
                <div class="portal-card p-4 h-100">
                    <div class="bg-primary p-3 rounded-circle d-inline-block mb-3 text-white"><i class="bi bi-mortarboard fs-3"></i></div>
                    <h4 class="fw-bold text-white">Student Portal</h4>
                    <p class="text-secondary small">Access for all 62 enrolled students. Check continuous clearance, settle dues, download tamper-proof QR certificates, and view the V-Semester Class Timetable.</p>
                    <a href="/login" class="btn btn-sm btn-outline-primary rounded-pill">Student Login &rarr;</a>
                </div>
            </div>
            <div class="col-md-4">
                <div class="portal-card p-4 h-100">
                    <div class="bg-info p-3 rounded-circle d-inline-block mb-3 text-white"><i class="bi bi-person-workspace fs-3"></i></div>
                    <h4 class="fw-bold text-white">AIDS HOD & Faculty Portal</h4>
                    <p class="text-secondary small">Dedicated console for Dr. M Senthil (HOD AIDS) and teaching staff to monitor the full 62-student cohort, sign off Mini Project-II, and issue clearances.</p>
                    <a href="/login" class="btn btn-sm btn-outline-info rounded-pill">Staff Login &rarr;</a>
                </div>
            </div>
            <div class="col-md-4">
                <div class="portal-card p-4 h-100">
                    <div class="bg-warning p-3 rounded-circle d-inline-block mb-3 text-dark"><i class="bi bi-shield-lock fs-3"></i></div>
                    <h4 class="fw-bold text-white">University Admin Portal</h4>
                    <p class="text-secondary small">Master administrative console with consolidated clearance metrics, emergency override protocols, fine waiver authority, and cryptographic audit logs.</p>
                    <a href="/login" class="btn btn-sm btn-outline-warning rounded-pill">Admin Login &rarr;</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`);
    }

    // ROUTE: Login
    if (pathname === '/login') {
        const data = loadDb();
        if (method === 'POST') {
            return getBody(params => {
                const username = (params.username || '').trim();
                const password = (params.password || '').trim();

                const matchedUser = data.users.find(u => (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) && u.password_plain === password);
                if (matchedUser) {
                    const sid = crypto.randomUUID();
                    let profileName = matchedUser.full_name || matchedUser.username;
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

                    logAudit(matchedUser.id, 'USER_LOGIN', 'AUTH', `User ${matchedUser.username} (${matchedUser.role}) logged in successfully.`);

                    res.writeHead(302, {
                        'Set-Cookie': `campusclear_session=${sid}; Path=/; HttpOnly`,
                        'Location': matchedUser.role === 'admin' ? '/admin/dashboard' : (matchedUser.role === 'staff' ? '/staff/dashboard' : '/student/dashboard')
                    });
                    return res.end();
                }

                res.writeHead(200, { 'Content-Type': 'text/html' });
                return res.end(renderLoginPage('Invalid Register Number or Password. Please select any account below.'));
            });
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLoginPage());
    }

    function renderLoginPage(error = '') {
        const data = loadDb();
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Takshashila University - Portal Login</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <style>
        body { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .login-card { max-width: 520px; width: 100%; border-radius: 1.25rem; background: #ffffff; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    </style>
</head>
<body>
<div class="login-card p-4 p-md-5">
    <div class="text-center mb-4">
        <a href="/" class="text-decoration-none">
            <i class="bi bi-mortarboard-fill text-primary display-4 mb-1 d-inline-block"></i>
            <h3 class="fw-bold text-dark mb-0">Takshashila University</h3>
        </a>
        <p class="text-muted small mb-0">Dept. of Artificial Intelligence & Data Science (AIDS)</p>
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill mt-1">V Semester Clearance Portal</span>
    </div>

    <!-- Quick 1-Click Demo Buttons -->
    <div class="bg-light p-3 rounded-3 mb-3 border">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small fw-bold text-secondary"><i class="bi bi-key-fill text-warning me-1"></i> Quick 1-Click Logins</span>
            <span class="badge bg-secondary-subtle text-secondary" style="font-size:0.65rem;">Click to Autofill</span>
        </div>
        <div class="d-flex flex-wrap gap-2">
            <button type="button" class="btn btn-sm btn-outline-danger rounded-pill fw-semibold py-1 px-2" style="font-size:0.75rem;" onclick="fill('admin','Admin@123')"><i class="bi bi-shield-lock me-1"></i> Admin</button>
            <button type="button" class="btn btn-sm btn-outline-primary rounded-pill fw-semibold py-1 px-2" style="font-size:0.75rem;" onclick="fill('staff_aids','Staff@123')"><i class="bi bi-person-badge me-1"></i> Dr. M Senthil (HOD)</button>
            <button type="button" class="btn btn-sm btn-outline-success rounded-pill fw-semibold py-1 px-2" style="font-size:0.75rem;" onclick="fill('TU6241103111088','Student@123')"><i class="bi bi-star-fill me-1"></i> MANNERU HARINATH</button>
            <button type="button" class="btn btn-sm btn-outline-dark rounded-pill fw-semibold py-1 px-2" style="font-size:0.75rem;" onclick="fill('TU6241103111002','Student@123')"><i class="bi bi-mortarboard me-1"></i> AJAY N</button>
            <button type="button" class="btn btn-sm btn-outline-info rounded-pill fw-semibold py-1 px-2" style="font-size:0.75rem;" onclick="fill('staff_lib','Staff@123')"><i class="bi bi-book me-1"></i> Library</button>
            <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill fw-semibold py-1 px-2" style="font-size:0.75rem;" onclick="fill('staff_acc','Staff@123')"><i class="bi bi-cash me-1"></i> Accounts</button>
        </div>
    </div>

    <!-- Student Select Dropdown for all 62 students -->
    <div class="mb-3 p-2 bg-white rounded border">
        <label class="form-label small fw-bold text-muted mb-1"><i class="bi bi-people-fill text-primary me-1"></i> Or Select Any of 62 Students:</label>
        <div class="input-group input-group-sm">
            <select class="form-select form-select-sm" id="studentPicker" onchange="pickStudent()">
                <option value="">-- Choose student to load credentials --</option>
                ${data.students.map(s => `<option value="${s.roll_number}">${s.roll_number} - ${s.full_name}</option>`).join('')}
            </select>
        </div>
    </div>

    ${error ? `<div class="alert alert-danger py-2 small mb-3"><i class="bi bi-exclamation-circle me-1"></i> ${error}</div>` : ''}

    <form method="POST" action="/login">
        <div class="mb-3">
            <label class="form-label fw-semibold small">Register Number / Username / Email</label>
            <input type="text" class="form-control" id="username" name="username" placeholder="e.g. TU6241103111088 or admin" required autofocus>
        </div>
        <div class="mb-4">
            <label class="form-label fw-semibold small">Password</label>
            <input type="password" class="form-control" id="password" name="password" placeholder="Enter password (default: Student@123)" required>
        </div>
        <button type="submit" class="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm">
            <i class="bi bi-box-arrow-in-right me-2"></i> Access My Portal
        </button>
    </form>
    <div class="text-center mt-3">
        <a href="/" class="small text-secondary text-decoration-none">&larr; Back to University Home</a>
    </div>
</div>
<script>
function fill(u, p) {
    document.getElementById('username').value = u;
    document.getElementById('password').value = p;
}
function pickStudent() {
    const reg = document.getElementById('studentPicker').value;
    if (reg) {
        fill(reg, 'Student@123');
    }
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
            const matchedReq = data.service_requests.find(r => r.qr_token.toLowerCase() === tokenQuery.toLowerCase());
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
                    department: dept ? dept.name : "Artificial Intelligence & Data Science",
                    service_name: srv ? srv.name : "Digital Clearance Certificate",
                    clearance_status: summary.overall_status,
                    is_cleared: summary.is_cleared
                };
            } else {
                const st = data.students.find(s => s.roll_number.toLowerCase() === tokenQuery.toLowerCase() || `CERT-${s.roll_number}`.toLowerCase() === tokenQuery.toLowerCase() || `CERT-${s.roll_number}-CLEAR`.toLowerCase() === tokenQuery.toLowerCase());
                if (st) {
                    const dept = data.departments.find(d => d.id === st.department_id);
                    const summary = getStudentClearanceSummary(st.id);
                    verificationResult = {
                        valid: true,
                        token: tokenQuery,
                        student_name: st.full_name,
                        roll_number: st.roll_number,
                        department: dept ? dept.name : "Artificial Intelligence & Data Science",
                        service_name: "Takshashila University Official Clearance Certificate",
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
    <title>Takshashila University - Certificate Verification</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <style>
        body { background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card-verify { max-width: 620px; width: 100%; border-radius: 1.25rem; background: #ffffff; color: #1e293b; }
    </style>
</head>
<body>
<div class="card card-verify p-4 p-md-5 shadow-2xl border-0">
    <div class="text-center mb-4">
        <a href="/" class="text-decoration-none">
            <i class="bi bi-mortarboard-fill text-primary display-4 mb-1 d-inline-block"></i>
            <h3 class="fw-bold text-dark mb-0">Takshashila University</h3>
        </a>
        <p class="text-muted small">Public Clearance & Certificate Authenticity Verification</p>
    </div>

    ${verificationResult && verificationResult.valid ? `
        <div class="alert ${verificationResult.is_cleared ? 'alert-success border-success' : 'alert-warning border-warning'} p-4 rounded-4 mb-4 text-center">
            <i class="bi ${verificationResult.is_cleared ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-warning'} display-4 mb-2 d-block"></i>
            <h4 class="fw-bold mb-1">${verificationResult.is_cleared ? 'OFFICIALLY VERIFIED & FULLY CLEARED' : 'DOCUMENT FOUND - CLEARANCE PENDING'}</h4>
            <span class="badge bg-white text-dark border rounded-pill px-3 py-1 fw-bold">Token: ${verificationResult.token}</span>
        </div>
        <div class="bg-light p-4 rounded-3 mb-4">
            <div class="row g-3">
                <div class="col-6"><span class="small text-muted text-uppercase d-block fw-bold">Student Name</span><strong class="text-dark">${verificationResult.student_name}</strong></div>
                <div class="col-6"><span class="small text-muted text-uppercase d-block fw-bold">Register Number</span><strong class="text-dark font-monospace">${verificationResult.roll_number}</strong></div>
                <div class="col-6"><span class="small text-muted text-uppercase d-block fw-bold">Department</span><span class="text-dark">${verificationResult.department}</span></div>
                <div class="col-6"><span class="small text-muted text-uppercase d-block fw-bold">College</span><span class="text-dark">Takshashila University</span></div>
                <div class="col-12 border-top pt-2"><span class="small text-muted text-uppercase d-block fw-bold">Clearance Status</span>${renderBadge(verificationResult.clearance_status)}</div>
            </div>
        </div>
    ` : tokenQuery ? `
        <div class="alert alert-danger p-4 rounded-4 text-center mb-4">
            <i class="bi bi-x-circle-fill text-danger display-4 mb-2 d-block"></i>
            <h5 class="fw-bold mb-1">Invalid Certificate Token</h5>
            <p class="small text-muted mb-0">No record found for token or register number <code>${tokenQuery}</code>.</p>
        </div>
    ` : ''}

    <form method="GET" action="/verify">
        <label class="form-label fw-semibold small">Enter Student Register Number or QR Token Code</label>
        <div class="input-group input-group-lg mb-3">
            <input type="text" class="form-control" name="token" value="${tokenQuery}" placeholder="e.g. TU6241103111088" required>
            <button class="btn btn-primary fw-bold" type="submit">Verify Now</button>
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
    // PROTECTED PORTAL VIEWS (Requires Auth)
    // ==========================================
    if (!user) {
        return redirect('/login');
    }

    // ROUTE: Timetable (Accessible to Students, Staff, and Admin)
    if (pathname === '/student/timetable' || pathname === '/staff/timetable' || pathname === '/timetable') {
        const data = loadDb();
        const subjects = data.subjects || [];
        const timings = data.periodTimings || [];
        const timetable = data.timetable || {};

        const content = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold text-dark mb-1"><i class="bi bi-calendar3 me-2 text-primary"></i> V Semester Class Timetable</h2>
                    <p class="text-muted mb-0">Takshashila University • Dept. of Artificial Intelligence & Data Science | HOD: Dr. M Senthil</p>
                </div>
                <div>
                    <button class="btn btn-outline-secondary rounded-pill" onclick="window.print()"><i class="bi bi-printer me-1"></i> Print Schedule</button>
                </div>
            </div>

            <!-- Period Timings Quick Strip -->
            <div class="card card-glass p-3 mb-4">
                <h6 class="fw-bold text-dark mb-2"><i class="bi bi-clock me-1 text-primary"></i> Daily Bell Schedule (8 Periods)</h6>
                <div class="d-flex flex-wrap gap-2">
                    ${timings.map(t => `
                        <div class="p-2 border rounded-3 bg-light text-center" style="min-width: 95px;">
                            <strong class="d-block text-dark small">${t.period}</strong>
                            <small class="text-muted" style="font-size: 0.72rem;">${t.time}</small>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Weekly Timetable Grid -->
            <div class="card card-glass border-0 overflow-hidden mb-4">
                <div class="card-header bg-primary text-white py-3">
                    <h5 class="mb-0 fw-bold"><i class="bi bi-table me-2"></i> Weekly Master Schedule (Monday to Friday)</h5>
                </div>
                <div class="table-responsive">
                    <table class="table table-bordered table-hover text-center align-middle mb-0">
                        <thead class="table-dark">
                            <tr>
                                <th style="width: 100px;">Day</th>
                                <th>Period 1<br><small style="font-size:0.7rem;">9:30-10:20</small></th>
                                <th>Period 2<br><small style="font-size:0.7rem;">10:20-11:10</small></th>
                                <th>Period 3<br><small style="font-size:0.7rem;">11:20-12:10</small></th>
                                <th>Period 4<br><small style="font-size:0.7rem;">12:10-1:00</small></th>
                                <th class="table-secondary" style="width: 40px;"><small>Lunch<br>1:00-1:50</small></th>
                                <th>Period 5<br><small style="font-size:0.7rem;">1:50-2:30</small></th>
                                <th>Period 6<br><small style="font-size:0.7rem;">2:30-3:10</small></th>
                                <th>Period 7<br><small style="font-size:0.7rem;">3:20-4:00</small></th>
                                <th>Period 8<br><small style="font-size:0.7rem;">4:00-4:40</small></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(timetable).map(day => {
                                const periods = timetable[day];
                                return `<tr>
                                    <th class="table-light text-uppercase fw-bold">${day}</th>
                                    <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">${periods[0]}</span></td>
                                    <td><span class="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">${periods[1]}</span></td>
                                    <td><span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">${periods[2]}</span></td>
                                    <td><span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1">${periods[3]}</span></td>
                                    <td class="table-secondary small text-muted">🍽️</td>
                                    <td><span class="badge bg-secondary-subtle text-secondary border px-2 py-1">${periods[4]}</span></td>
                                    <td><span class="badge bg-danger-subtle text-danger border px-2 py-1">${periods[5]}</span></td>
                                    <td><span class="badge bg-dark-subtle text-dark border px-2 py-1">${periods[6]}</span></td>
                                    <td><span class="badge bg-primary-subtle text-primary border px-2 py-1">${periods[7]}</span></td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Subjects & Teaching Staff Directory -->
            <div class="card card-glass border-0 overflow-hidden mb-4">
                <div class="card-header bg-light py-3 border-bottom">
                    <h5 class="mb-0 fw-bold text-dark"><i class="bi bi-book-half me-2 text-primary"></i> V Semester Subjects & Teaching Staff Directory</h5>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Course Code</th>
                                <th>Subject Name</th>
                                <th>Short Code</th>
                                <th>Faculty In-Charge</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjects.map(sub => `
                                <tr>
                                    <td><span class="badge bg-dark font-monospace">${sub.code}</span></td>
                                    <td class="fw-bold text-dark">${sub.name}</td>
                                    <td><span class="badge bg-primary-subtle text-primary border">${sub.short}</span></td>
                                    <td><i class="bi bi-person-fill text-secondary me-1"></i> ${sub.faculty}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("V Sem Timetable", user, content, pathname));
    }

    // ROUTE: Student Dashboard
    if (pathname === '/student/dashboard') {
        const studentId = user.student_id || 1;
        const summary = getStudentClearanceSummary(studentId);
        const data = loadDb();
        const student = summary ? summary.student : null;

        const content = `
            <div class="row mb-4 align-items-center">
                <div class="col-md-8">
                    <h2 class="fw-bold text-dark mb-1">Welcome back, ${user.full_name}! 👋</h2>
                    <p class="text-muted mb-0">
                        Register Number: <code class="fw-bold text-primary">${student ? student.roll_number : user.username}</code> • Dept: <strong>Artificial Intelligence & Data Science</strong> • Semester: <strong>V Sem</strong>
                    </p>
                </div>
                <div class="col-md-4 text-md-end mt-3 mt-md-0">
                    <a href="/student/timetable" class="btn btn-outline-primary rounded-pill me-2"><i class="bi bi-calendar3 me-1"></i> Class Timetable</a>
                    ${summary.is_cleared ? `
                        <a href="/student/certificate" class="btn btn-success rounded-pill px-3 fw-bold shadow-sm"><i class="bi bi-award me-1"></i> View Certificate</a>
                    ` : `
                        <a href="/student/dues" class="btn btn-warning rounded-pill px-3 fw-bold shadow-sm"><i class="bi bi-exclamation-triangle me-1"></i> Pay Dues</a>
                    `}
                </div>
            </div>

            <!-- Hero Clearance Banner -->
            <div class="card card-glass overflow-hidden border-0 shadow-lg mb-4 text-white" style="background: ${summary.is_cleared ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'};">
                <div class="p-4 p-md-5">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <span class="badge bg-white text-dark px-3 py-2 rounded-pill fw-bold text-uppercase mb-2 shadow-sm">University Clearance Engine</span>
                            <h1 class="display-5 fw-extrabold text-white mb-2">Overall: ${summary.overall_status.toUpperCase()}</h1>
                            <p class="fs-5 opacity-90 mb-0">
                                ${summary.is_cleared ? '<i class="bi bi-check-circle-fill me-2"></i> All departments have approved your clearance. You are officially eligible for end-semester exams and certificate generation.' : `<i class="bi bi-exclamation-octagon-fill me-2"></i> Clearance pending in ${summary.pending_count} department(s). Please review details below.`}
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
            <h4 class="fw-bold text-dark mb-3"><i class="bi bi-building me-2 text-primary"></i> Departmental Clearance Status</h4>
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
                                    <i class="bi bi-exclamation-circle me-1"></i> <strong>₹${d.total_due_amount.toFixed(2)}</strong> pending dues in this department.
                                </div>
                            ` : ''}
                            <p class="small text-muted mb-0"><strong>Remarks:</strong> ${d.remarks}</p>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- V Semester Enrolled Courses Strip -->
            <div class="card card-glass p-4 mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="fw-bold text-dark mb-0"><i class="bi bi-journal-code text-primary me-2"></i> V Semester Enrolled Courses</h5>
                    <a href="/student/timetable" class="btn btn-sm btn-outline-primary rounded-pill">Full Schedule &rarr;</a>
                </div>
                <div class="row g-2">
                    ${(data.subjects || []).map(s => `
                        <div class="col-md-6 col-lg-4">
                            <div class="p-3 border rounded-3 bg-light h-100">
                                <span class="badge bg-dark font-monospace mb-1">${s.code}</span>
                                <h6 class="fw-bold text-dark mb-1">${s.name}</h6>
                                <small class="text-muted d-block"><i class="bi bi-person me-1"></i> ${s.faculty}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("Student Dashboard", user, content, pathname));
    }

    // ROUTE: Student Dues & Disputes
    if (pathname === '/student/dues') {
        const studentId = user.student_id || 1;
        const data = loadDb();

        if (method === 'POST') {
            return getBody(params => {
                const action = params.action;
                if (action === 'raise_dispute') {
                    const dueId = Number(params.due_id);
                    const subject = (params.subject || '').trim();
                    const description = (params.description || '').trim();

                    const due = data.dues.find(d => d.id === dueId);
                    if (due) {
                        const newId = data.disputes.length > 0 ? Math.max(...data.disputes.map(d => d.id)) + 1 : 1;
                        data.disputes.push({
                            id: newId,
                            student_id: studentId,
                            due_id: dueId,
                            department_id: due.department_id,
                            subject,
                            description,
                            status: 'open',
                            resolution_remarks: '',
                            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        });
                        saveDb();
                        logAudit(user.id, 'RAISE_DISPUTE', 'DISPUTE', `Raised dispute for due ID ${dueId} (${subject})`);
                    }
                }
                return redirect('/student/dues');
            });
        }

        const myDues = data.dues.filter(d => d.student_id === studentId);
        const myDisputes = data.disputes.filter(d => d.student_id === studentId);

        const content = `
            <div class="row mb-4">
                <div class="col-md-8">
                    <h2 class="fw-bold text-dark mb-1"><i class="bi bi-receipt me-2 text-primary"></i> Pending Department Dues</h2>
                    <p class="text-muted mb-0">Review outstanding fee balances, library fines, or submit disputes for administrative review.</p>
                </div>
            </div>

            <div class="card card-glass border-0 overflow-hidden mb-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Department</th>
                                <th>Due Description</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${myDues.length === 0 ? `
                                <tr><td colspan="5" class="text-center py-4 text-success"><i class="bi bi-check-circle-fill fs-3 d-block mb-2"></i> No outstanding dues found. All accounts are settled!</td></tr>
                            ` : myDues.map(d => {
                                const dept = data.departments.find(dp => dp.id === d.department_id);
                                return `<tr>
                                    <td><strong class="text-dark">${dept ? dept.name : 'University'}</strong></td>
                                    <td>${d.title || d.description || d.reason}</td>
                                    <td class="fw-bold text-danger">₹${Number(d.amount).toFixed(2)}</td>
                                    <td>${renderBadge(d.status)}</td>
                                    <td class="text-end">
                                        ${d.status === 'pending' ? `
                                            <button class="btn btn-sm btn-outline-warning rounded-pill" onclick="openDispute(${d.id}, '${(d.title || d.reason || '').replace(/'/g, "\\'")}');">Raise Dispute</button>
                                        ` : '<span class="text-muted small">Settled</span>'}
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Disputes Section -->
            <h4 class="fw-bold text-dark mb-3"><i class="bi bi-chat-left-dots me-2 text-primary"></i> My Active Disputes</h4>
            <div class="card card-glass border-0 overflow-hidden mb-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr><th>Subject</th><th>Description</th><th>Status</th><th>Resolution Remarks</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                            ${myDisputes.length === 0 ? '<tr><td colspan="5" class="text-center py-3 text-muted">No disputes filed.</td></tr>' : myDisputes.map(dp => `
                                <tr>
                                    <td class="fw-bold text-dark">${dp.subject}</td>
                                    <td class="small">${dp.description}</td>
                                    <td>${renderBadge(dp.status)}</td>
                                    <td class="small text-muted">${dp.resolution_remarks || 'Under review by department head'}</td>
                                    <td class="small text-muted">${dp.created_at}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal for dispute -->
            <div class="modal fade" id="disputeModal" tabindex="-1">
                <div class="modal-dialog">
                    <form method="POST" action="/student/dues" class="modal-content">
                        <input type="hidden" name="action" value="raise_dispute">
                        <input type="hidden" name="due_id" id="modalDueId">
                        <div class="modal-header">
                            <h5 class="modal-title fw-bold">Raise Due Dispute</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Due Item</label>
                                <input type="text" class="form-control" id="modalDueTitle" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Dispute Subject</label>
                                <input type="text" class="form-control" name="subject" required placeholder="e.g. Fine already paid / Book returned">
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Explanation</label>
                                <textarea class="form-control" name="description" rows="3" required placeholder="State why this fine should be waived..."></textarea>
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
        return res.end(renderLayout("My Dues", user, content, pathname));
    }

    // ROUTE: Student Services
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
                        return redirect('/student/services?error=blocked');
                    }
                    const reqId = data.service_requests.length > 0 ? Math.max(...data.service_requests.map(r => r.id)) + 1 : 1;
                    const reqNum = `REQ-TU-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
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
                    logAudit(user.id, 'SUBMIT_SERVICE_REQUEST', 'SERVICE_REQUEST', `Submitted service request ${reqNum} for ${srv.name}`);
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
                    <h2 class="fw-bold text-dark mb-1"><i class="bi bi-file-earmark-text me-2 text-primary"></i> University Service Requests</h2>
                    <p class="text-muted mb-0">Apply for Hall Tickets, Bonafide Certificates, Transcripts, and ID replacements.</p>
                </div>
            </div>

            ${errorParam === 'blocked' ? `
                <div class="alert alert-danger p-3 rounded-3 mb-4">
                    <i class="bi bi-x-octagon-fill me-2"></i> <strong>Application Blocked:</strong> This service requires complete institutional clearance across all 5 departments. Please settle pending dues first.
                </div>
            ` : ''}
            ${successParam === '1' ? `
                <div class="alert alert-success p-3 rounded-3 mb-4">
                    <i class="bi bi-check-circle-fill me-2"></i> Service application submitted successfully!
                </div>
            ` : ''}

            <!-- Apply Form -->
            <div class="card card-glass p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-plus-circle me-1 text-primary"></i> Submit New Application</h5>
                <form method="POST" action="/student/services">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label small fw-bold">Select University Service</label>
                            <select class="form-select" name="service_id" required>
                                <option value="">-- Choose Institutional Service --</option>
                                ${data.service_categories.map(c => `
                                    <option value="${c.id}">${c.name} ${c.requires_full_clearance ? '(Requires 100% Zero-Dues Clearance)' : ''}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-bold">Purpose / Justification</label>
                            <input type="text" class="form-control" name="purpose" placeholder="e.g. End Semester Exam Registration" required>
                        </div>
                        <div class="col-12 text-end">
                            <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold">Submit Application</button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- History -->
            <h4 class="fw-bold text-dark mb-3"><i class="bi bi-clock-history me-2 text-primary"></i> Application History</h4>
            <div class="card card-glass border-0 overflow-hidden mb-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr><th>Request No</th><th>Service</th><th>Purpose</th><th>Status</th><th>QR Token</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                            ${myRequests.length === 0 ? '<tr><td colspan="6" class="text-center py-3 text-muted">No applications submitted yet.</td></tr>' : myRequests.map(r => {
                                const srv = data.service_categories.find(c => c.id === r.service_id);
                                return `<tr>
                                    <td><code>${r.request_number}</code></td>
                                    <td><strong class="text-dark">${srv ? srv.name : 'Service'}</strong></td>
                                    <td class="small">${r.purpose}</td>
                                    <td>${renderBadge(r.status)}</td>
                                    <td><span class="badge bg-light text-secondary border font-monospace">${r.qr_token}</span></td>
                                    <td class="small text-muted">${r.created_at}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("Service Requests", user, content, pathname));
    }

    // ROUTE: Student Certificate
    if (pathname === '/student/certificate') {
        const studentId = user.student_id || 1;
        const data = loadDb();
        const summary = getStudentClearanceSummary(studentId);
        const student = summary.student;
        const certToken = `CERT-${student.roll_number}-CLEAR`;
        const verifyUrl = `http://${req.headers.host || 'localhost:8000'}/verify?token=${certToken}`;

        const content = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold text-dark mb-1"><i class="bi bi-award me-2 text-primary"></i> Official Clearance Certificate</h2>
                    <p class="text-muted mb-0">Digital credential verified by Takshashila University Continuous Clearance Engine.</p>
                </div>
                <div>
                    <button class="btn btn-outline-secondary rounded-pill me-2" onclick="window.print()"><i class="bi bi-printer me-1"></i> Print Certificate</button>
                </div>
            </div>

            ${!summary.is_cleared ? `
                <div class="alert alert-warning p-4 rounded-4 text-center">
                    <i class="bi bi-exclamation-triangle-fill display-4 text-warning mb-2 d-block"></i>
                    <h4 class="fw-bold">Certificate Issuance Locked</h4>
                    <p class="mb-3">You have pending clearance in: <strong>${summary.pending_departments.join(', ')}</strong>.</p>
                    <a href="/student/dues" class="btn btn-warning rounded-pill px-4 fw-bold">Review & Clear Dues &rarr;</a>
                </div>
            ` : `
                <!-- Printable Certificate Container -->
                <div class="card card-glass p-5 border-2 border-primary mx-auto shadow-2xl bg-white" style="max-width: 820px; border-style: double;">
                    <div class="text-center pb-4 border-bottom">
                        <i class="bi bi-mortarboard-fill text-primary display-4 mb-2 d-inline-block"></i>
                        <h2 class="fw-extrabold text-dark tracking-wide mb-0">TAKSHASHILA UNIVERSITY</h2>
                        <h6 class="text-uppercase text-secondary fw-bold mt-1">Department of Artificial Intelligence & Data Science</h6>
                        <span class="badge bg-primary text-white px-3 py-1 rounded-pill mt-2">OFFICIAL INSTITUTIONAL CLEARANCE CREDENTIAL</span>
                    </div>

                    <div class="my-4 text-center">
                        <p class="text-muted mb-1 text-uppercase small">This is to certify that the student</p>
                        <h2 class="fw-bold text-dark text-decoration-underline mb-1">${student.full_name}</h2>
                        <p class="font-monospace text-muted fs-5 mb-3">Register Number: <strong>${student.roll_number}</strong></p>
                        <p class="text-secondary mx-auto" style="max-width: 620px;">
                            Has successfully completed all academic, laboratory, residential, and financial clearance obligations for <strong>V Semester Batch 2022-2026</strong>.
                            As verified on <strong>${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>, the student has 
                            <span class="text-success fw-bold text-decoration-underline">ZERO OUTSTANDING DUES OR HOLDS</span>.
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

                    <div class="row align-items-end mt-4 pt-4 border-top">
                        <div class="col-4 text-center">
                            <div id="cert_qr" class="d-inline-block border p-1 bg-white rounded-3 shadow-sm mb-1"></div>
                            <span class="d-block text-muted text-xs" style="font-size:0.65rem;">Scan QR to verify live</span>
                            <code class="text-xs" style="font-size:0.65rem;">${certToken}</code>
                        </div>
                        <div class="col-4 text-center">
                            <div class="border-bottom border-dark pb-2 mb-1 w-75 mx-auto">
                                <span class="fw-bold font-monospace text-primary">Dr. M Senthil</span>
                            </div>
                            <span class="small fw-semibold text-muted d-block">HOD - AI & Data Science</span>
                        </div>
                        <div class="col-4 text-center">
                            <div class="border-bottom border-dark pb-2 mb-1 w-75 ms-auto">
                                <span class="fw-bold font-monospace">Dr. M. K. Sharma</span>
                            </div>
                            <span class="small fw-semibold text-dark d-block">Controller of Examinations</span>
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

    // ROUTE: Staff Dashboard & Roster
    if (pathname === '/staff/dashboard' || pathname === '/staff/students') {
        const data = loadDb();
        const staffDeptId = user.department_id || 4; // Default to AIDS if not set

        if (method === 'POST') {
            return getBody(params => {
                const action = params.action;
                if (action === 'toggle_status') {
                    const stId = Number(params.student_id);
                    const newStatus = params.status || 'cleared';
                    const remarks = (params.remarks || '').trim() || (newStatus === 'cleared' ? 'Approved by department' : 'Hold applied');

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
                    logAudit(user.id, 'CLEARANCE_TOGGLE', 'STUDENT', `Staff updated student ID ${stId} to ${newStatus} with remarks: ${remarks}`);
                } else if (action === 'add_due') {
                    const stId = Number(params.student_id);
                    const amount = Number(params.amount) || 0;
                    const title = (params.title || '').trim();

                    if (stId && amount > 0 && title) {
                        const newId = data.dues.length > 0 ? Math.max(...data.dues.map(d => d.id)) + 1 : 1;
                        data.dues.push({
                            id: newId,
                            student_id: stId,
                            department_id: staffDeptId,
                            title,
                            description: title,
                            amount,
                            status: 'pending',
                            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        });
                        saveDb();
                        logAudit(user.id, 'ADD_DUE', 'DUE', `Issued fine of ₹${amount} to student ID ${stId}: ${title}`);
                    }
                }
                return redirect('/staff/students');
            });
        }

        const dept = data.departments.find(d => d.id === staffDeptId);
        const myStudents = data.students;

        const content = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold text-dark mb-1"><i class="bi bi-people me-2 text-primary"></i> ${dept ? dept.name : 'Department'} Staff Console</h2>
                    <p class="text-muted mb-0">Managing V Semester AIDS Student Cohort (${myStudents.length} Students Enrolled)</p>
                </div>
            </div>

            <!-- Issue Fine / Due Modal Trigger Card -->
            <div class="card card-glass p-3 mb-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold text-dark mb-0"><i class="bi bi-plus-circle text-primary me-2"></i> Issue Department Due or Hold</h6>
                        <small class="text-muted">Issue laboratory fee, library overdue fine, or academic hold to any student.</small>
                    </div>
                    <button class="btn btn-sm btn-primary rounded-pill px-3" data-bs-toggle="modal" data-bs-target="#addDueModal">Issue New Fine</button>
                </div>
            </div>

            <div class="card card-glass border-0 overflow-hidden mb-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Register No</th>
                                <th>Student Name</th>
                                <th>Clearance in ${dept ? dept.code : 'Dept'}</th>
                                <th>Pending Dues</th>
                                <th>Remarks</th>
                                <th class="text-end">Quick Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${myStudents.map(st => {
                                const summ = getStudentClearanceSummary(st.id);
                                const myDeptRec = summ.department_details.find(d => d.id === staffDeptId);
                                const isClr = myDeptRec && myDeptRec.effective_status === 'cleared';

                                return `<tr>
                                    <td><code class="fw-bold">${st.roll_number}</code></td>
                                    <td><strong class="text-dark">${st.full_name}</strong><br><small class="text-muted">${st.email}</small></td>
                                    <td>${renderBadge(myDeptRec ? myDeptRec.effective_status : 'cleared')}</td>
                                    <td class="${myDeptRec && myDeptRec.total_due_amount > 0 ? 'text-danger fw-bold' : 'text-muted'}">
                                        ₹${(myDeptRec ? myDeptRec.total_due_amount : 0).toFixed(2)}
                                    </td>
                                    <td class="small text-muted">${myDeptRec ? myDeptRec.remarks : 'No issues'}</td>
                                    <td class="text-end">
                                        <form method="POST" action="/staff/students" class="d-inline">
                                            <input type="hidden" name="action" value="toggle_status">
                                            <input type="hidden" name="student_id" value="${st.id}">
                                            ${isClr ? `
                                                <input type="hidden" name="status" value="pending">
                                                <input type="hidden" name="remarks" value="Hold applied by ${user.full_name}">
                                                <button type="submit" class="btn btn-sm btn-outline-warning rounded-pill">Apply Hold</button>
                                            ` : `
                                                <input type="hidden" name="status" value="cleared">
                                                <input type="hidden" name="remarks" value="Verified & Approved by ${user.full_name}">
                                                <button type="submit" class="btn btn-sm btn-success rounded-pill px-3">Approve Clear</button>
                                            `}
                                        </form>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Add Due Modal -->
            <div class="modal fade" id="addDueModal" tabindex="-1">
                <div class="modal-dialog">
                    <form method="POST" action="/staff/students" class="modal-content">
                        <input type="hidden" name="action" value="add_due">
                        <div class="modal-header">
                            <h5 class="modal-title fw-bold">Issue Department Fine / Due</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Select Student</label>
                                <select class="form-select" name="student_id" required>
                                    ${myStudents.map(s => `<option value="${s.id}">${s.roll_number} - ${s.full_name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Due Reason / Particular</label>
                                <input type="text" class="form-control" name="title" required placeholder="e.g. Lab equipment fine / Overdue book">
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Amount (INR ₹)</label>
                                <input type="number" step="0.01" class="form-control" name="amount" required placeholder="e.g. 500">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-danger rounded-pill px-4">Issue Fine</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("Assigned Students", user, content, pathname));
    }

    // ROUTE: Staff Approvals
    if (pathname === '/staff/approvals') {
        const data = loadDb();
        if (method === 'POST') {
            return getBody(params => {
                const reqId = Number(params.request_id);
                const newStatus = params.status;
                const reqItem = data.service_requests.find(r => r.id === reqId);
                if (reqItem) {
                    reqItem.status = newStatus;
                    saveDb();
                    logAudit(user.id, 'SERVICE_APPROVAL', 'SERVICE_REQUEST', `Staff updated request ID ${reqId} to ${newStatus}`);
                }
                return redirect('/staff/approvals');
            });
        }

        const requests = data.service_requests;
        const content = `
            <h2 class="fw-bold text-dark mb-1"><i class="bi bi-check-circle me-2 text-primary"></i> Service Application Approvals</h2>
            <p class="text-muted mb-4">Review and authorize institutional certificates & hall ticket releases.</p>

            <div class="card card-glass border-0 overflow-hidden">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr><th>Request No</th><th>Student</th><th>Service</th><th>Purpose</th><th>Status</th><th class="text-end">Actions</th></tr>
                        </thead>
                        <tbody>
                            ${requests.map(r => {
                                const st = data.students.find(s => s.id === r.student_id);
                                const srv = data.service_categories.find(c => c.id === r.service_id);
                                return `<tr>
                                    <td><code>${r.request_number}</code></td>
                                    <td><strong class="text-dark">${st ? st.full_name : 'Unknown'}</strong><br><small class="text-muted">${st ? st.roll_number : ''}</small></td>
                                    <td>${srv ? srv.name : 'Service'}</td>
                                    <td class="small">${r.purpose}</td>
                                    <td>${renderBadge(r.status)}</td>
                                    <td class="text-end">
                                        <form method="POST" action="/staff/approvals" class="d-inline">
                                            <input type="hidden" name="request_id" value="${r.id}">
                                            ${r.status !== 'approved' ? `
                                                <button type="submit" name="status" value="approved" class="btn btn-sm btn-success rounded-pill px-3">Approve</button>
                                            ` : ''}
                                            ${r.status !== 'rejected' ? `
                                                <button type="submit" name="status" value="rejected" class="btn btn-sm btn-outline-danger rounded-pill px-2">Reject</button>
                                            ` : ''}
                                        </form>
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

    // ROUTE: Admin Control Center & Dashboard
    if (pathname === '/admin/dashboard') {
        const data = loadDb();
        const totalStudents = data.students.length;
        let fullyClearedCount = 0;
        let totalDuesAmount = 0;

        data.students.forEach(st => {
            const summ = getStudentClearanceSummary(st.id);
            if (summ.is_cleared) fullyClearedCount++;
        });

        data.dues.forEach(d => {
            if (d.status === 'pending') totalDuesAmount += Number(d.amount);
        });

        const clearanceRate = totalStudents > 0 ? ((fullyClearedCount / totalStudents) * 100).toFixed(1) : 0;

        const content = `
            <h2 class="fw-bold text-dark mb-1"><i class="bi bi-grid-1x2 me-2 text-primary"></i> University Control Center</h2>
            <p class="text-muted mb-4">Takshashila University • AI & Data Science Continuous Clearance Analytics</p>

            <div class="row g-4 mb-4">
                <div class="col-md-3">
                    <div class="card card-glass p-3">
                        <span class="text-muted small fw-bold text-uppercase">Total Enrolled Cohort</span>
                        <h2 class="fw-extrabold text-primary mb-0">${totalStudents}</h2>
                        <small class="text-muted">Batch 2022-2026 V Sem</small>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card card-glass p-3">
                        <span class="text-muted small fw-bold text-uppercase">100% Cleared Students</span>
                        <h2 class="fw-extrabold text-success mb-0">${fullyClearedCount}</h2>
                        <small class="text-success fw-bold">${clearanceRate}% Clearance Rate</small>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card card-glass p-3">
                        <span class="text-muted small fw-bold text-uppercase">Pending Outstanding Dues</span>
                        <h2 class="fw-extrabold text-danger mb-0">₹${totalDuesAmount.toFixed(2)}</h2>
                        <small class="text-muted">Across Library, Lab & Hostel</small>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card card-glass p-3">
                        <span class="text-muted small fw-bold text-uppercase">Total Academic Departments</span>
                        <h2 class="fw-extrabold text-dark mb-0">${data.departments.length}</h2>
                        <small class="text-muted">HOD AIDS: Dr. M Senthil</small>
                    </div>
                </div>
            </div>

            <!-- Quick Action Links -->
            <div class="row g-4 mb-4">
                <div class="col-md-6">
                    <div class="card card-glass p-4 h-100">
                        <h5 class="fw-bold text-dark mb-2"><i class="bi bi-mortarboard text-primary me-2"></i> Student Directory (62 Students)</h5>
                        <p class="text-muted small">View all registered students of Takshashila University AIDS department and their real-time clearance status.</p>
                        <a href="/admin/students" class="btn btn-outline-primary rounded-pill">Open Directory &rarr;</a>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card card-glass p-4 h-100">
                        <h5 class="fw-bold text-dark mb-2"><i class="bi bi-key text-warning me-2"></i> Emergency Override Protocol</h5>
                        <p class="text-muted mb-2">Execute an executive administrative sign-off for any graduating student across all 5 departments with a single authorization code.</p>
                        <a href="/admin/override" class="btn btn-outline-warning rounded-pill">Executive Override &rarr;</a>
                    </div>
                </div>
            </div>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("Admin Dashboard", user, content, pathname));
    }

    // ROUTE: Admin Students Directory
    if (pathname === '/admin/students') {
        const data = loadDb();
        const content = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold text-dark mb-1"><i class="bi bi-mortarboard me-2 text-primary"></i> Master Student Directory</h2>
                    <p class="text-muted mb-0">Takshashila University • AI & Data Science Cohort (${data.students.length} Registered Students)</p>
                </div>
            </div>

            <div class="card card-glass border-0 overflow-hidden mb-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Register Number</th>
                                <th>Student Full Name</th>
                                <th>Department</th>
                                <th>Semester & Batch</th>
                                <th>Overall Clearance</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.students.map(st => {
                                const summ = getStudentClearanceSummary(st.id);
                                return `<tr>
                                    <td><code class="fw-bold">${st.roll_number}</code></td>
                                    <td><strong class="text-dark">${st.full_name}</strong><br><small class="text-muted">${st.email}</small></td>
                                    <td><span class="badge bg-light text-secondary">AIDS</span></td>
                                    <td class="small">V Sem • ${st.batch}</td>
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

    // ROUTE: Admin Dues Management
    if (pathname === '/admin/dues') {
        const data = loadDb();
        if (method === 'POST') {
            return getBody(params => {
                const dueId = Number(params.due_id);
                const due = data.dues.find(d => d.id === dueId);
                if (due) {
                    due.status = 'waived';
                    saveDb();
                    logAudit(user.id, 'WAIVE_DUE', 'DUE', `Admin waived due ID ${dueId} of ₹${due.amount}`);
                }
                return redirect('/admin/dues');
            });
        }

        const content = `
            <h2 class="fw-bold text-dark mb-1"><i class="bi bi-wallet2 me-2 text-primary"></i> Institutional Dues & Fine Waiver</h2>
            <p class="text-muted mb-4">Review all university dues and exercise administrative fine waiver authority.</p>

            <div class="card card-glass border-0 overflow-hidden">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr><th>Student</th><th>Department</th><th>Reason</th><th>Amount</th><th>Status</th><th class="text-end">Action</th></tr>
                        </thead>
                        <tbody>
                            ${data.dues.map(d => {
                                const st = data.students.find(s => s.id === d.student_id);
                                const dept = data.departments.find(dp => dp.id === d.department_id);
                                return `<tr>
                                    <td><strong class="text-dark">${st ? st.full_name : 'Unknown'}</strong><br><small class="text-muted">${st ? st.roll_number : ''}</small></td>
                                    <td>${dept ? dept.name : 'University'}</td>
                                    <td>${d.title || d.reason}</td>
                                    <td class="fw-bold text-danger">₹${Number(d.amount).toFixed(2)}</td>
                                    <td>${renderBadge(d.status)}</td>
                                    <td class="text-end">
                                        ${d.status === 'pending' ? `
                                            <form method="POST" action="/admin/dues" class="d-inline">
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

    // ROUTE: Admin Emergency Override
    if (pathname === '/admin/override') {
        const data = loadDb();
        let message = '';

        if (method === 'POST') {
            return getBody(params => {
                const stId = Number(params.student_id);
                const reason = (params.override_reason || '').trim() || 'Executive Chancellor Order';

                if (stId) {
                    data.departments.forEach(dept => {
                        let rec = data.clearance_status.find(cs => cs.student_id === stId && cs.department_id === dept.id);
                        if (rec) {
                            rec.status = 'cleared';
                            rec.remarks = `Executive Override: ${reason}`;
                            rec.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        } else {
                            data.clearance_status.push({
                                id: data.clearance_status.length + 1,
                                student_id: stId,
                                department_id: dept.id,
                                status: 'cleared',
                                remarks: `Executive Override: ${reason}`,
                                updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            });
                        }
                    });

                    data.dues.filter(d => d.student_id === stId && d.status === 'pending').forEach(d => {
                        d.status = 'waived';
                    });

                    saveDb();
                    logAudit(user.id, 'EMERGENCY_OVERRIDE', 'STUDENT', `Executive clearance override executed for student ID ${stId}. Reason: ${reason}`);
                    return redirect('/admin/override?success=1');
                }
            });
        }

        const success = parsedUrl.searchParams.get('success');

        const content = `
            <h2 class="fw-bold text-dark mb-1"><i class="bi bi-key me-2 text-warning"></i> Executive Emergency Override Protocol</h2>
            <p class="text-muted mb-4">Grant instant 100% zero-dues clearance across all 5 departments simultaneously.</p>

            ${success === '1' ? `
                <div class="alert alert-success p-3 rounded-3 mb-4">
                    <i class="bi bi-check-circle-fill me-2"></i> Executive override executed successfully. The selected student now has 100% full clearance!
                </div>
            ` : ''}

            <div class="card card-glass p-4 mb-4" style="max-width: 650px;">
                <form method="POST" action="/admin/override">
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Select Student to Override</label>
                        <select class="form-select" name="student_id" required>
                            ${data.students.map(s => `<option value="${s.id}">${s.roll_number} - ${s.full_name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Executive Justification</label>
                        <textarea class="form-control" name="override_reason" rows="3" required placeholder="State official authorization reason (e.g. Registrar Approved Graduation Expedited)"></textarea>
                    </div>
                    <button type="submit" class="btn btn-warning rounded-pill px-4 fw-bold">
                        <i class="bi bi-shield-fill-check me-1"></i> Authorize Executive Clearance
                    </button>
                </form>
            </div>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(renderLayout("Executive Override", user, content, pathname));
    }

    // ROUTE: Admin Audit Logs
    if (pathname === '/admin/audit') {
        const data = loadDb();
        const content = `
            <h2 class="fw-bold text-dark mb-1"><i class="bi bi-journal-text me-2 text-primary"></i> Tamper-Proof Audit Trail</h2>
            <p class="text-muted mb-4">Cryptographic log tracking every user login, status change, fine issuance, and administrative override.</p>

            <div class="card card-glass border-0 overflow-hidden">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr><th>Timestamp</th><th>Action</th><th>Target Entity</th><th>Details</th></tr>
                        </thead>
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

    // 404 Fallback
    res.writeHead(404, { 'Content-Type': 'text/html' });
    return res.end('<h1>404 Not Found</h1><p><a href="/">Return to Homepage</a></p>');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` Takshashila University Platform is LIVE on Port ${PORT}`);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(`====================================================`);
});
