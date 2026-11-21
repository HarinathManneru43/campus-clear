const fs = require('fs');
const path = require('path');

const serverJsPath = path.join(__dirname, 'server.js');
let code = fs.readFileSync(serverJsPath, 'utf8');

// 1. Add static file handler right at the start of request handler
const staticHandler = `    // Static Files Handler
    if (pathname.startsWith('/public/')) {
        const relPath = pathname.replace(/^\\/public\\//, '');
        const safePath = path.normalize(relPath).replace(/^(\\.\\.[\\/\\\\])+/, '');
        const filePath = path.join(__dirname, 'public', safePath);

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.webp': 'image/webp',
                '.avif': 'image/avif',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.svg': 'image/svg+xml',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.ico': 'image/x-icon'
            };
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400'
            });
            return fs.createReadStream(filePath).pipe(res);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
        }
    }
`;

// Replace beginning of request handler to include staticHandler
const serverStartTarget = `const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, \`http://\${req.headers.host || 'localhost'}\`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    function getBody(callback) {`;

const newServerStart = `const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, \`http://\${req.headers.host || 'localhost'}\`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

${staticHandler}

    function getBody(callback) {`;

code = code.replace(serverStartTarget, newServerStart);

// 2. Build gorgeous landing page
const landingPageHtml = `    // ROUTE: Public Homepage
    if (pathname === '/') {
        const data = loadDb();
        const totalStudents = data.students.length;
        let clearedCount = 0;
        data.students.forEach(st => {
            const summ = getStudentClearanceSummary(st.id);
            if (summ && summ.is_cleared) clearedCount++;
        });

        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(\`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Takshashila University • AI & Data Science Portal</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --tu-primary: #3b82f6;
            --tu-accent: #f97316;
            --tu-dark: #090d16;
            --tu-card-bg: rgba(17, 24, 39, 0.75);
        }
        body {
            background-color: var(--tu-dark);
            color: #f1f5f9;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            overflow-x: hidden;
        }
        h1, h2, h3, h4, .font-heading {
            font-family: 'Outfit', sans-serif;
        }
        .hero-banner {
            position: relative;
            background: linear-gradient(180deg, rgba(9, 13, 22, 0.78) 0%, rgba(9, 13, 22, 0.94) 85%, var(--tu-dark) 100%),
                        url('/public/campus.webp') center/cover no-repeat;
            padding: 90px 0 110px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .hero-badge {
            background: rgba(59, 130, 246, 0.15);
            border: 1px solid rgba(59, 130, 246, 0.35);
            color: #93c5fd;
            backdrop-filter: blur(10px);
        }
        .logo-glow-wrapper {
            position: relative;
            display: inline-block;
        }
        .logo-glow-wrapper::before {
            content: '';
            position: absolute;
            inset: -10px;
            background: radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, transparent 70%);
            border-radius: 50%;
            z-index: 0;
            filter: blur(14px);
        }
        .logo-img {
            position: relative;
            z-index: 1;
            background: #ffffff;
            border-radius: 50%;
            padding: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
        .glass-card {
            background: var(--tu-card-bg);
            border: 1px solid rgba(255, 255, 255, 0.09);
            border-radius: 1.25rem;
            backdrop-filter: blur(16px);
            transition: all 0.25s ease;
        }
        .glass-card:hover {
            transform: translateY(-6px);
            border-color: rgba(59, 130, 246, 0.4);
            box-shadow: 0 20px 40px -15px rgba(59, 130, 246, 0.2);
        }
        .stat-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 1rem;
            padding: 1.5rem;
            text-align: center;
        }
        .campus-img-frame {
            border-radius: 1.25rem;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .campus-img-frame img {
            width: 100%;
            height: 230px;
            object-fit: cover;
            transition: transform 0.4s ease;
        }
        .campus-img-frame:hover img {
            transform: scale(1.04);
        }
        .campus-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 1rem 1.25rem;
            background: linear-gradient(0deg, rgba(9, 13, 22, 0.95) 0%, transparent 100%);
        }
        .search-pill-box {
            background: rgba(255, 255, 255, 0.07);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 50rem;
            padding: 6px;
        }
        .search-pill-box input {
            background: transparent;
            border: none;
            color: #ffffff;
            padding-left: 1rem;
        }
        .search-pill-box input:focus {
            outline: none;
            box-shadow: none;
            background: transparent;
            color: #ffffff;
        }
    </style>
</head>
<body>

    <!-- University Header Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark sticky-top" style="background: rgba(9, 13, 22, 0.85); backdrop-filter: blur(15px); border-bottom: 1px solid rgba(255,255,255,0.08);">
        <div class="container py-1">
            <a class="navbar-brand d-flex align-items-center gap-3" href="/">
                <img src="/public/logo.webp" alt="Takshashila University Emblem" height="48" class="logo-img">
                <div>
                    <span class="fw-extrabold fs-5 d-block text-white font-heading lh-1">Takshashila University</span>
                    <small class="text-secondary" style="font-size: 0.72rem; letter-spacing: 0.5px;">DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE</small>
                </div>
            </a>
            <div class="d-flex align-items-center gap-2">
                <a href="/verify" class="btn btn-outline-light rounded-pill px-3 btn-sm fw-semibold"><i class="bi bi-qr-code-scan me-1.5 text-primary"></i> Verify Certificate</a>
                <a href="/login" class="btn btn-primary rounded-pill px-4 btn-sm fw-bold shadow"><i class="bi bi-box-arrow-in-right me-1"></i> Sign In to Portal</a>
            </div>
        </div>
    </nav>

    <!-- Main Hero Section with College Background -->
    <div class="hero-banner text-center">
        <div class="container position-relative">
            <!-- Big Floating Crest -->
            <div class="logo-glow-wrapper mb-3">
                <img src="/public/logo.webp" alt="Takshashila Crest" height="90" class="logo-img">
            </div>
            
            <div class="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill hero-badge mb-3">
                <span class="badge bg-primary rounded-pill px-2">V SEMESTER</span>
                <span class="small fw-semibold">AI & Data Science (AIDS) • HOD: Dr. M Senthil</span>
            </div>

            <h1 class="display-3 fw-extrabold text-white mb-2 font-heading tracking-tight">
                Takshashila University
            </h1>
            <p class="fs-4 text-primary-subtle fw-medium mb-3">
                Continuous Digital Student Clearance & Academic Portal
            </p>
            <p class="text-secondary mx-auto mb-4 lead" style="max-width: 720px; font-size: 1.05rem;">
                Official unified platform for real-time clearance automation across Central Library, Accounts & Finance, Residential Hostel Board, AIDS Department, and the Examination Cell with cryptographic QR validation.
            </p>

            <div class="d-flex justify-content-center flex-wrap gap-3 mb-5">
                <a href="/login" class="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-lg" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
                    Access My Portal <i class="bi bi-arrow-right ms-2"></i>
                </a>
                <a href="/verify" class="btn btn-outline-light btn-lg rounded-pill px-4">
                    <i class="bi bi-patch-check me-2 text-warning"></i> Public QR Verify
                </a>
            </div>

            <!-- Instant In-Page Roll Number Verifier Widget -->
            <div class="mx-auto" style="max-width: 580px;">
                <form method="GET" action="/verify" class="search-pill-box d-flex align-items-center shadow-lg">
                    <i class="bi bi-search text-muted ms-3 fs-5"></i>
                    <input type="text" name="token" class="form-control form-control-lg" placeholder="Enter student register number (e.g. TU6241103111088)..." required>
                    <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold text-nowrap">Verify Now</button>
                </form>
                <small class="text-muted mt-2 d-block text-center" style="font-size: 0.76rem;">Instant validation for employers, university registrars, and faculty.</small>
            </div>
        </div>
    </div>

    <!-- Live Statistics Strip -->
    <div class="container my-5">
        <div class="row g-3">
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <h2 class="fw-extrabold text-primary mb-0 font-heading">\${totalStudents}</h2>
                    <span class="small fw-bold text-white d-block mt-1">Enrolled AIDS Students</span>
                    <small class="text-muted" style="font-size: 0.72rem;">Batch 2022–2026 Cohort</small>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <h2 class="fw-extrabold text-success mb-0 font-heading">5</h2>
                    <span class="small fw-bold text-white d-block mt-1">Institutional Desks</span>
                    <small class="text-muted" style="font-size: 0.72rem;">Library, Finance, Hostel, AIDS, Exam</small>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <h2 class="fw-extrabold text-warning mb-0 font-heading">9</h2>
                    <span class="small fw-bold text-white d-block mt-1">V Semester Courses</span>
                    <small class="text-muted" style="font-size: 0.72rem;">Deep Learning, TOC, Networks, AI</small>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <h2 class="fw-extrabold text-info mb-0 font-heading">100%</h2>
                    <span class="small fw-bold text-white d-block mt-1">Digital & Paperless</span>
                    <small class="text-muted" style="font-size: 0.72rem;">Instant QR Clearance Pass</small>
                </div>
            </div>
        </div>
    </div>

    <!-- Campus & Hostel Infrastructure Showcase -->
    <div class="container my-5">
        <div class="text-center mb-4">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 fw-bold text-uppercase" style="font-size:0.75rem;">University Facilities</span>
            <h3 class="fw-bold text-white mt-2 font-heading">Takshashila Campus Infrastructure</h3>
            <p class="text-secondary small mx-auto" style="max-width: 600px;">Integrated with university academic departments and residential campus facilities for continuous clearance management.</p>
        </div>

        <div class="row g-4 align-items-stretch">
            <div class="col-md-6">
                <div class="glass-card p-3 h-100">
                    <div class="campus-img-frame mb-3">
                        <img src="/public/campus.webp" alt="Takshashila University Academic Campus">
                        <div class="campus-overlay">
                            <h5 class="fw-bold text-white mb-0 font-heading"><i class="bi bi-building me-2 text-primary"></i> Main Academic Block</h5>
                            <small class="text-white-50">Department of Artificial Intelligence & Data Science • Labs & Classrooms</small>
                        </div>
                    </div>
                    <div class="p-2">
                        <h5 class="fw-bold text-white mb-1">AI & Data Science Department</h5>
                        <p class="text-secondary small mb-3">Home to state-of-the-art Deep Learning computing labs, Computer Networks testing racks, and Mini Project-II research laboratories directed by <strong>Dr. M Senthil</strong>.</p>
                        <div class="d-flex flex-wrap gap-2">
                            <span class="badge bg-dark border text-light"><i class="bi bi-cpu me-1"></i> AI Computing Lab</span>
                            <span class="badge bg-dark border text-light"><i class="bi bi-hdd-network me-1"></i> CISCO Network Lab</span>
                            <span class="badge bg-dark border text-light"><i class="bi bi-code-slash me-1"></i> Project Incubation</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="glass-card p-3 h-100">
                    <div class="campus-img-frame mb-3">
                        <img src="/public/hostel.avif" alt="Takshashila University Residential Hostel">
                        <div class="campus-overlay">
                            <h5 class="fw-bold text-white mb-0 font-heading"><i class="bi bi-houses me-2 text-warning"></i> TU Residential Hostel Campus</h5>
                            <small class="text-white-50">Chief Warden: Col. R. S. Rathore • Real-Time Room & Mess Clearance</small>
                        </div>
                    </div>
                    <div class="p-2">
                        <h5 class="fw-bold text-white mb-1">Residential & Hostel Board</h5>
                        <p class="text-secondary small mb-3">Directly linked to the digital clearance engine to automatically reconcile room inventories, utility dues, and mess fees without student physical visits.</p>
                        <div class="d-flex flex-wrap gap-2">
                            <span class="badge bg-dark border text-light"><i class="bi bi-door-closed me-1"></i> Room Inventory Sync</span>
                            <span class="badge bg-dark border text-light"><i class="bi bi-cup-hot me-1"></i> Mess Billing Check</span>
                            <span class="badge bg-dark border text-light"><i class="bi bi-shield-check me-1"></i> Warden Sign-off</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Portal Gateways Grid -->
    <div class="container my-5 py-4 border-top border-secondary border-opacity-25">
        <div class="text-center mb-5">
            <span class="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-3 py-1 fw-bold text-uppercase" style="font-size:0.75rem;">Access Channels</span>
            <h3 class="fw-bold text-white mt-2 font-heading">Choose Your University Portal</h3>
        </div>

        <div class="row g-4">
            <div class="col-md-4">
                <div class="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="bg-primary bg-opacity-20 text-primary p-3 rounded-circle d-inline-block mb-3 fs-3">
                            <i class="bi bi-mortarboard-fill"></i>
                        </div>
                        <h4 class="fw-bold text-white font-heading">Student Portal</h4>
                        <p class="text-secondary small">
                            Full access for all 62 enrolled AIDS students. Monitor clearance status across all 5 departments, view pending dues, apply for hall tickets, and access your <strong>V-Sem Class Timetable</strong>.
                        </p>
                    </div>
                    <a href="/login" class="btn btn-outline-primary rounded-pill mt-3 fw-bold w-100">Student Sign In &rarr;</a>
                </div>
            </div>

            <div class="col-md-4">
                <div class="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="bg-info bg-opacity-20 text-info p-3 rounded-circle d-inline-block mb-3 fs-3">
                            <i class="bi bi-person-workspace"></i>
                        </div>
                        <h4 class="fw-bold text-white font-heading">Faculty & HOD Portal</h4>
                        <p class="text-secondary small">
                            Dedicated desks for <strong>Dr. M Senthil</strong> (HOD AIDS), Central Library, Accounts Officer, Hostel Warden, and Exam Cell to oversee student rosters, sign off Mini Project-II, and issue clearances.
                        </p>
                    </div>
                    <a href="/login" class="btn btn-outline-info rounded-pill mt-3 fw-bold w-100">Faculty Sign In &rarr;</a>
                </div>
            </div>

            <div class="col-md-4">
                <div class="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="bg-warning bg-opacity-20 text-warning p-3 rounded-circle d-inline-block mb-3 fs-3">
                            <i class="bi bi-shield-lock-fill"></i>
                        </div>
                        <h4 class="fw-bold text-white font-heading">University Administration</h4>
                        <p class="text-secondary small">
                            Executive administrative control center providing campus-wide clearance analytics, 62-student master registry, emergency override protocols, and cryptographic audit records.
                        </p>
                    </div>
                    <a href="/login" class="btn btn-outline-warning rounded-pill mt-3 fw-bold w-100">Admin Sign In &rarr;</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Official University Footer -->
    <footer class="py-5 border-top border-secondary border-opacity-25" style="background: rgba(5, 8, 15, 0.9);">
        <div class="container text-center">
            <img src="/public/logo.webp" alt="Takshashila University" height="60" class="logo-img mb-3">
            <h5 class="fw-bold text-white font-heading mb-1">Takshashila University</h5>
            <p class="text-muted small mb-3">Department of Artificial Intelligence & Data Science (AIDS) • Mini Project-II Platform</p>
            <div class="d-flex justify-content-center gap-3 text-secondary small mb-3">
                <a href="/verify" class="text-secondary text-decoration-none hover-white"><i class="bi bi-shield-check me-1"></i> QR Authenticity Verification</a>
                <span>•</span>
                <a href="/login" class="text-secondary text-decoration-none hover-white"><i class="bi bi-box-arrow-in-right me-1"></i> Portal Access</a>
                <span>•</span>
                <span class="text-muted">HOD: Dr. M Senthil</span>
            </div>
            <p class="text-secondary opacity-75 small mb-0" style="font-size: 0.78rem;">
                &copy; \${new Date().getFullYear()} Takshashila University. All Rights Reserved. Powered by Continuous Clearance Engine.
            </p>
        </div>
    </footer>
</body>
</html>\`);
    }`;

// Replace old landing page
const oldLandingRegex = /\/\/ ROUTE: Public Homepage[\s\S]*?res\.end\(`<!DOCTYPE html>[\s\S]*?<\/html>`\);\s*}/;
code = code.replace(oldLandingRegex, landingPageHtml);

// 3. Also update the logo in the top navbar inside renderLayout
const oldBrandInLayout = `<i class="bi bi-mortarboard-fill text-primary fs-3 me-2"></i>
                <div>
                    <span class="fw-bold fs-6 d-block lh-1 text-white">Takshashila University</span>`;

const newBrandInLayout = `<img src="/public/logo.webp" alt="Takshashila Logo" height="38" class="bg-white rounded-circle p-1 me-2 shadow-sm">
                <div>
                    <span class="fw-bold fs-6 d-block lh-1 text-white font-heading">Takshashila University</span>`;

code = code.replace(oldBrandInLayout, newBrandInLayout);

// 4. Also update logo in renderLoginPage
const oldLoginBrand = `<div class="bg-primary bg-opacity-10 text-primary p-3 rounded-circle d-inline-block mb-3">
                <i class="bi bi-mortarboard-fill display-5"></i>
            </div>
            <h3 class="fw-extrabold text-dark mb-1">Takshashila University</h3>`;

const newLoginBrand = `<img src="/public/logo.webp" alt="Takshashila University Logo" height="75" class="bg-white rounded-circle p-1 mb-2 shadow">
            <h3 class="fw-extrabold text-dark mb-1">Takshashila University</h3>`;

code = code.replace(oldLoginBrand, newLoginBrand);

fs.writeFileSync(serverJsPath, code, 'utf8');
console.log("Successfully upgraded landing page, static file handler, and university logo branding!");

