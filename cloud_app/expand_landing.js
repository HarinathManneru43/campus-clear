const fs = require('fs');
const path = require('path');

const serverJsPath = path.join(__dirname, 'server.js');
let code = fs.readFileSync(serverJsPath, 'utf8');

const expandedLandingPage = `    // ROUTE: Public Homepage
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
    <title>Takshashila University • Continuous Clearance & Academic Platform</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --tu-navy-deep: #060b18;
            --tu-navy: #0f1c3f;
            --tu-blue: #2563eb;
            --tu-blue-light: #38bdf8;
            --tu-orange: #ea580c;
            --tu-orange-light: #f97316;
            --tu-gold: #fbbf24;
            --tu-emerald: #10b981;
        }
        body {
            background-color: var(--tu-navy-deep);
            color: #f8fafc;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            overflow-x: hidden;
        }
        h1, h2, h3, h4, h5, .font-heading {
            font-family: 'Outfit', sans-serif;
            letter-spacing: -0.02em;
        }
        
        /* Navbar */
        .tu-navbar {
            background: rgba(6, 11, 24, 0.88);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }
        .nav-logo-badge {
            background: #ffffff;
            border-radius: 50%;
            padding: 4px;
            box-shadow: 0 4px 15px rgba(249, 115, 22, 0.35);
            border: 2px solid var(--tu-orange-light);
        }

        /* Hero Banner */
        .hero-banner {
            position: relative;
            background: linear-gradient(180deg, rgba(6, 11, 24, 0.55) 0%, rgba(15, 28, 63, 0.72) 40%, rgba(6, 11, 24, 0.98) 100%),
                        url('/public/campus.webp') center 35%/cover no-repeat;
            padding: 85px 0 100px;
            box-shadow: inset 0 -40px 60px var(--tu-navy-deep);
        }
        .hero-banner::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 50% 25%, rgba(37, 99, 235, 0.28) 0%, transparent 65%);
            pointer-events: none;
        }

        /* Crest Emblem */
        .hero-crest-container {
            position: relative;
            display: inline-block;
            margin-bottom: 1.5rem;
        }
        .hero-crest-container::before {
            content: '';
            position: absolute;
            inset: -12px;
            background: radial-gradient(circle, rgba(249, 115, 22, 0.55) 0%, rgba(37, 99, 235, 0.3) 50%, transparent 75%);
            border-radius: 50%;
            filter: blur(16px);
            z-index: 0;
            animation: pulse-glow 3s infinite alternate;
        }
        @keyframes pulse-glow {
            0% { transform: scale(0.95); opacity: 0.7; }
            100% { transform: scale(1.08); opacity: 1; }
        }
        .hero-crest-img {
            position: relative;
            z-index: 1;
            background: #ffffff;
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.6), 0 0 0 3px rgba(255,255,255,0.9);
        }

        .hero-title {
            font-size: clamp(2.5rem, 5.5vw, 4.2rem);
            font-weight: 900;
            background: linear-gradient(135deg, #ffffff 40%, #cbd5e1 75%, #93c5fd 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .hero-subtitle {
            font-size: clamp(1.15rem, 2.2vw, 1.55rem);
            font-weight: 700;
            color: #38bdf8;
            letter-spacing: -0.01em;
        }

        .pill-dept {
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(249, 115, 22, 0.25) 100%);
            border: 1px solid rgba(255, 255, 255, 0.22);
            backdrop-filter: blur(12px);
            color: #ffffff;
            box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        }

        /* NEW: WHITE GLASSY BUTTON WITH TOUCH SHIMMER EFFECT */
        .btn-white-glass {
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(16px);
            color: #0b1536 !important;
            border: 2px solid rgba(255, 255, 255, 0.95);
            font-weight: 800;
            font-family: 'Outfit', sans-serif;
            letter-spacing: 0.3px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35), 0 0 20px rgba(255, 255, 255, 0.3);
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .btn-white-glass::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 60%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
            transform: skewX(-25deg);
            transition: 0.6s ease;
        }
        .btn-white-glass:hover, .btn-white-glass:active, .btn-white-glass:focus {
            background: #ffffff;
            color: #1d4ed8 !important;
            transform: translateY(-4px) scale(1.03);
            box-shadow: 0 18px 45px rgba(255, 255, 255, 0.5), 0 0 35px rgba(56, 189, 248, 0.75);
            border-color: #ffffff;
        }
        .btn-white-glass:hover::before {
            left: 150%;
        }

        .btn-gradient-orange {
            background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
            color: #ffffff;
            border: none;
            box-shadow: 0 10px 25px -5px rgba(234, 88, 12, 0.6);
            transition: all 0.2s ease;
        }
        .btn-gradient-orange:hover {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            transform: translateY(-2px);
            color: #ffffff;
        }

        /* High-Visibility Search Box */
        .search-hero-card {
            background: rgba(15, 28, 63, 0.85);
            border: 2px solid rgba(56, 189, 248, 0.35);
            border-radius: 50rem;
            padding: 7px 8px 7px 20px;
            box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6), 0 0 25px rgba(56, 189, 248, 0.2);
            backdrop-filter: blur(20px);
            transition: all 0.25s ease;
        }
        .search-hero-card:focus-within {
            border-color: var(--tu-blue-light);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 35px rgba(56, 189, 248, 0.35);
            transform: scale(1.01);
        }
        .search-hero-card input {
            background: transparent;
            border: none;
            color: #ffffff;
            font-size: 1.05rem;
            font-weight: 500;
        }
        .search-hero-card input::placeholder {
            color: #94a3b8;
        }
        .search-hero-card input:focus {
            outline: none;
            box-shadow: none;
            background: transparent;
            color: #ffffff;
        }

        /* Vivid Stat Cards */
        .vivid-stat-card {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 1.25rem;
            padding: 1.5rem;
            text-align: center;
            backdrop-filter: blur(12px);
            position: relative;
            overflow: hidden;
            transition: transform 0.25s;
        }
        .vivid-stat-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: 20%;
            right: 20%;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8), transparent);
        }
        .vivid-stat-card:hover {
            transform: translateY(-4px);
            border-color: rgba(56, 189, 248, 0.4);
        }

        /* Facility Cards */
        .facility-card {
            background: linear-gradient(160deg, rgba(15, 28, 63, 0.75) 0%, rgba(6, 11, 24, 0.85) 100%);
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 1.5rem;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.45);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .facility-card:hover {
            transform: translateY(-8px);
            border-color: rgba(56, 189, 248, 0.45);
            box-shadow: 0 30px 60px -15px rgba(37, 99, 235, 0.3);
        }
        .facility-img-box {
            position: relative;
            height: 240px;
            overflow: hidden;
        }
        .facility-img-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: contrast(108%) saturate(115%);
            transition: transform 0.6s ease;
        }
        .facility-card:hover .facility-img-box img {
            transform: scale(1.06);
        }
        .facility-badge-overlay {
            position: absolute;
            top: 1rem;
            left: 1rem;
            background: rgba(6, 11, 24, 0.82);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 0.35rem 0.85rem;
            border-radius: 50rem;
            font-size: 0.78rem;
            font-weight: 700;
        }

        /* Process Step Cards */
        .step-box {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 1.25rem;
            padding: 1.75rem;
            position: relative;
            height: 100%;
            transition: all 0.25s;
        }
        .step-box:hover {
            transform: translateY(-5px);
            border-color: rgba(56, 189, 248, 0.4);
            background: rgba(255, 255, 255, 0.05);
        }
        .step-num {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--tu-blue) 0%, #1e40af 100%);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 1.2rem;
            margin-bottom: 1rem;
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
        }

        /* Gateway Cards */
        .gateway-card {
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 1.5rem;
            padding: 2rem;
            transition: all 0.25s ease;
        }
        .gateway-card:hover {
            transform: translateY(-6px);
            border-color: var(--tu-blue-light);
            box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.35);
        }
        .gateway-icon {
            width: 60px;
            height: 60px;
            border-radius: 1rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1.75rem;
            margin-bottom: 1.25rem;
        }

        /* FAQ Accordion */
        .accordion-item {
            background: rgba(15, 28, 63, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem !important;
            margin-bottom: 0.75rem;
            overflow: hidden;
        }
        .accordion-button {
            background: transparent !important;
            color: #ffffff !important;
            font-weight: 700;
            font-family: 'Outfit', sans-serif;
            font-size: 1.05rem;
            padding: 1.25rem 1.5rem;
            box-shadow: none !important;
        }
        .accordion-button::after {
            filter: invert(1);
        }
        .accordion-body {
            color: #cbd5e1;
            padding: 0 1.5rem 1.5rem 1.5rem;
            line-height: 1.7;
        }
    </style>
</head>
<body>

    <!-- Top Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark sticky-top tu-navbar">
        <div class="container py-1">
            <a class="navbar-brand d-flex align-items-center gap-3" href="/">
                <img src="/public/logo.webp" alt="Takshashila University" height="48" class="nav-logo-badge">
                <div>
                    <span class="fw-extrabold fs-5 d-block text-white font-heading lh-1">Takshashila University</span>
                    <small class="text-info fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.6px;">DEPT. OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE</small>
                </div>
            </a>
            <div class="d-flex align-items-center gap-2">
                <a href="/verify" class="btn btn-outline-light rounded-pill px-3.5 btn-sm fw-bold">
                    <i class="bi bi-qr-code-scan me-1 text-warning"></i> QR Verify
                </a>
                <a href="/login" class="btn btn-white-glass rounded-pill px-4 btn-sm fw-bold shadow">
                    <i class="bi bi-box-arrow-in-right me-1"></i> Sign In to Portal
                </a>
            </div>
        </div>
    </nav>

    <!-- SECTION 1: HERO BANNER -->
    <div class="hero-banner text-center">
        <div class="container position-relative">
            <!-- Center Emblem Crest -->
            <div class="hero-crest-container">
                <img src="/public/logo.webp" alt="Takshashila University Crest" height="105" class="hero-crest-img">
            </div>

            <!-- Department Pill -->
            <div class="d-inline-flex align-items-center gap-2 px-3.5 py-1.5 rounded-pill pill-dept mb-3">
                <span class="badge rounded-pill px-2.5 py-1 fw-bold" style="background: var(--tu-orange);">V SEMESTER</span>
                <span class="small fw-bold text-white">AI & Data Science (AIDS) • HOD: Dr. M Senthil</span>
            </div>

            <h1 class="hero-title mb-2">
                Takshashila University
            </h1>
            <p class="hero-subtitle mb-3">
                Continuous Digital Student Clearance & Academic Platform
            </p>
            <p class="text-slate-300 mx-auto mb-4 lead" style="max-width: 740px; font-size: 1.08rem; color: #cbd5e1; line-height: 1.6;">
                Automated continuous clearance across Central Library, Accounts & Finance, Hostel Board, AIDS Department, and Exam Cell with live QR code validation for all 62 V-Semester students.
            </p>

            <!-- Action Buttons with White Glassy Effect -->
            <div class="d-flex justify-content-center flex-wrap gap-3 mb-5">
                <a href="/login" class="btn btn-white-glass btn-lg rounded-pill px-5 py-3">
                    Access My Portal <i class="bi bi-arrow-right ms-2 text-primary"></i>
                </a>
                <a href="/verify" class="btn btn-outline-light btn-lg rounded-pill px-4 fw-bold" style="border-width: 2px;">
                    <i class="bi bi-patch-check-fill me-2 text-warning"></i> Public QR Verify
                </a>
            </div>

            <!-- High-Contrast Search & Quick Roll Number Verifier -->
            <div class="mx-auto" style="max-width: 620px;">
                <form method="GET" action="/verify" class="search-hero-card d-flex align-items-center">
                    <i class="bi bi-search text-info fs-5 me-2"></i>
                    <input type="text" name="token" class="form-control" placeholder="Enter Roll Number to verify (e.g. TU6241103111088)..." required>
                    <button type="submit" class="btn btn-gradient-orange rounded-pill px-4 py-2.5 fw-bold text-nowrap font-heading">
                        Verify Status
                    </button>
                </form>
                <div class="d-flex justify-content-center align-items-center gap-2 mt-2">
                    <i class="bi bi-shield-check text-success small"></i>
                    <span class="small text-muted" style="font-size: 0.8rem;">Instant tamper-proof validation for faculty, registrars, and parents.</span>
                </div>
            </div>
        </div>
    </div>

    <!-- SECTION 2: LIVE STATISTICS STRIP -->
    <div class="container my-5">
        <div class="row g-3">
            <div class="col-6 col-md-3">
                <div class="vivid-stat-card">
                    <div class="display-5 fw-extrabold text-primary font-heading mb-1">\${totalStudents}</div>
                    <span class="fw-bold text-white d-block">Enrolled Students</span>
                    <small class="text-info fw-semibold" style="font-size: 0.74rem;">AIDS Batch 2022–2026</small>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="vivid-stat-card">
                    <div class="display-5 fw-extrabold text-success font-heading mb-1">5</div>
                    <span class="fw-bold text-white d-block">Clearance Desks</span>
                    <small class="text-success-emphasis fw-semibold" style="font-size: 0.74rem;">Library • Finance • Hostel • AIDS • Exam</small>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="vivid-stat-card">
                    <div class="display-5 fw-extrabold font-heading mb-1" style="color: var(--tu-gold);">9</div>
                    <span class="fw-bold text-white d-block">V Sem Subjects</span>
                    <small class="text-warning fw-semibold" style="font-size: 0.74rem;">Deep Learning • TOC • Networks • Mini Project-II</small>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="vivid-stat-card">
                    <div class="display-5 fw-extrabold font-heading mb-1" style="color: var(--tu-orange-light);">100%</div>
                    <span class="fw-bold text-white d-block">Paperless QR</span>
                    <small class="text-warning-emphasis fw-semibold" style="font-size: 0.74rem;">Instant Digital Certificate</small>
                </div>
            </div>
        </div>
    </div>

    <!-- SECTION 3: CAMPUS INFRASTRUCTURE SHOWCASE -->
    <div class="container my-5 py-2">
        <div class="text-center mb-4">
            <span class="badge rounded-pill px-3 py-1.5 fw-bold text-uppercase" style="background: rgba(37, 99, 235, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8;">
                <i class="bi bi-geo-alt-fill me-1"></i> Campus Infrastructure
            </span>
            <h2 class="fw-extrabold text-white mt-2 font-heading">Takshashila Campus Facilities</h2>
            <p class="text-slate-400 small mx-auto" style="max-width: 620px; color: #94a3b8;">
                Fully connected with the university clearance engine for automated student clearance and departmental verification.
            </p>
        </div>

        <div class="row g-4 align-items-stretch">
            <!-- Academic Block Card -->
            <div class="col-md-6">
                <div class="facility-card h-100">
                    <div class="facility-img-box">
                        <img src="/public/campus.webp" alt="Takshashila Academic Campus">
                        <div class="facility-badge-overlay text-info">
                            <i class="bi bi-building-fill me-1 text-primary"></i> Academic Block
                        </div>
                    </div>
                    <div class="p-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h4 class="fw-bold text-white mb-0 font-heading">AI & Data Science Block</h4>
                            <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">AIDS Dept</span>
                        </div>
                        <p class="small mb-3" style="color: #cbd5e1; line-height: 1.6;">
                            Features specialized Deep Learning computing labs, CISCO networking practical racks, and project workstations under the leadership of <strong>Dr. M Senthil (HOD AIDS)</strong>.
                        </p>
                        <div class="d-flex flex-wrap gap-2 pt-2 border-top border-secondary border-opacity-25">
                            <span class="badge bg-dark border border-secondary text-light"><i class="bi bi-cpu-fill text-info me-1"></i> GPU Compute Lab</span>
                            <span class="badge bg-dark border border-secondary text-light"><i class="bi bi-diagram-3-fill text-primary me-1"></i> Network Lab</span>
                            <span class="badge bg-dark border border-secondary text-light"><i class="bi bi-kanban-fill text-warning me-1"></i> Mini Project-II</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TU Hostel Card -->
            <div class="col-md-6">
                <div class="facility-card h-100">
                    <div class="facility-img-box">
                        <img src="/public/hostel.avif" alt="Takshashila Residential Hostel">
                        <div class="facility-badge-overlay text-warning">
                            <i class="bi bi-houses-fill me-1 text-warning"></i> Residential Campus
                        </div>
                    </div>
                    <div class="p-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h4 class="fw-bold text-white mb-0 font-heading">TU Residential Hostel</h4>
                            <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill">Hostel Board</span>
                        </div>
                        <p class="small mb-3" style="color: #cbd5e1; line-height: 1.6;">
                            Integrated residential facilities managed by <strong>Col. R. S. Rathore (Chief Warden)</strong>. Room inventories, cautionary deposits, and mess dues sync automatically with student portals.
                        </p>
                        <div class="d-flex flex-wrap gap-2 pt-2 border-top border-secondary border-opacity-25">
                            <span class="badge bg-dark border border-secondary text-light"><i class="bi bi-door-open-fill text-success me-1"></i> Room Inventory Sync</span>
                            <span class="badge bg-dark border border-secondary text-light"><i class="bi bi-cup-hot-fill text-danger me-1"></i> Mess Dues Check</span>
                            <span class="badge bg-dark border border-secondary text-light"><i class="bi bi-shield-lock-fill text-warning me-1"></i> Warden Clearance</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- SECTION 4: 4-STEP CLEARANCE PROCESS ROADMAP -->
    <div class="container my-5 py-4 border-top border-secondary border-opacity-25">
        <div class="text-center mb-5">
            <span class="badge rounded-pill px-3 py-1.5 fw-bold text-uppercase" style="background: rgba(16, 185, 129, 0.18); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399;">
                <i class="bi bi-cpu-fill me-1"></i> Automated Workflow
            </span>
            <h2 class="fw-extrabold text-white mt-2 font-heading">How Continuous Clearance Works</h2>
            <p class="text-muted small mx-auto" style="max-width: 600px;">Zero manual paper forms. Replaces weeks of running from desk to desk with automated background synchronization.</p>
        </div>

        <div class="row g-4">
            <div class="col-md-3">
                <div class="step-box">
                    <div class="step-num">1</div>
                    <h5 class="fw-bold text-white font-heading">Continuous Sync</h5>
                    <p class="small text-muted mb-0">Library catalog, accounts cashier, and hostel wardens continuously log records in the university database.</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="step-box">
                    <div class="step-num" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%);">2</div>
                    <h5 class="fw-bold text-white font-heading">Live Calculation</h5>
                    <p class="small text-muted mb-0">The clearance engine instantly calculates real-time clearance status across all 5 departments for each student.</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="step-box">
                    <div class="step-num" style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);">3</div>
                    <h5 class="fw-bold text-white font-heading">In-Portal Dispute</h5>
                    <p class="small text-muted mb-0">Students can contest any fee or fine with 1-click in-portal dispute submission for rapid faculty resolution.</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="step-box">
                    <div class="step-num" style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);">4</div>
                    <h5 class="fw-bold text-white font-heading">Instant QR Seal</h5>
                    <p class="small text-muted mb-0">Once cleared, official institutional clearance certificates with cryptographic QR seals are issued instantly.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- SECTION 5: V SEMESTER SUBJECTS & CURRICULUM MATRIX -->
    <div class="container my-5 py-4 border-top border-secondary border-opacity-25">
        <div class="d-flex flex-wrap justify-content-between align-items-end mb-4">
            <div>
                <span class="badge rounded-pill px-3 py-1.5 fw-bold text-uppercase" style="background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.4); color: var(--tu-orange-light);">
                    <i class="bi bi-book-half me-1"></i> Academic Courses
                </span>
                <h2 class="fw-extrabold text-white mt-2 font-heading mb-1">V Semester Curriculum & Faculty In-Charge</h2>
                <p class="text-muted small mb-0">Takshashila University • AI & Data Science (AIDS) Department</p>
            </div>
            <div class="mt-3 mt-md-0">
                <a href="/login" class="btn btn-outline-info rounded-pill px-4 btn-sm fw-bold"><i class="bi bi-calendar3 me-1"></i> View Full Timetable &rarr;</a>
            </div>
        </div>

        <div class="row g-3">
            \${(data.subjects || []).map((s, idx) => \`
                <div class="col-md-6 col-lg-4">
                    <div class="p-3.5 rounded-4 h-100" style="background: rgba(15, 28, 63, 0.55); border: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.2s;">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="badge bg-dark font-monospace text-info border border-secondary">\${s.code}</span>
                            <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">\${s.short}</span>
                        </div>
                        <h6 class="fw-bold text-white mb-2 font-heading">\${s.name}</h6>
                        <small class="text-secondary d-flex align-items-center"><i class="bi bi-person-fill text-warning me-1.5"></i> \${s.faculty}</small>
                    </div>
                </div>
            \`).join('')}
        </div>
    </div>

    <!-- SECTION 6: FACULTY LEADERSHIP HIGHLIGHTS -->
    <div class="container my-5 py-4 border-top border-secondary border-opacity-25">
        <div class="text-center mb-5">
            <span class="badge rounded-pill px-3 py-1.5 fw-bold text-uppercase" style="background: rgba(59, 130, 246, 0.18); border: 1px solid rgba(59, 130, 246, 0.4); color: #93c5fd;">
                <i class="bi bi-award-fill me-1"></i> Leadership
            </span>
            <h2 class="fw-extrabold text-white mt-2 font-heading">Department Leadership & Administration</h2>
            <p class="text-muted small mx-auto" style="max-width: 600px;">Leading the continuous clearance and academic sign-off processes for all 62 students.</p>
        </div>

        <div class="row g-4">
            <div class="col-md-4">
                <div class="facility-card p-4 text-center h-100">
                    <div class="bg-primary bg-opacity-20 text-primary p-3 rounded-circle d-inline-block mb-3 fs-2" style="width: 75px; height: 75px; display: inline-flex; align-items: center; justify-content: center;">
                        <i class="bi bi-person-badge"></i>
                    </div>
                    <h5 class="fw-bold text-white font-heading mb-1">Dr. M Senthil</h5>
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill mb-2">HOD - AI & Data Science</span>
                    <p class="small text-muted mb-0">Course Lead for Responsible AI & Mini Project-II. Authorizes departmental clearance and project viva eligibility.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="facility-card p-4 text-center h-100">
                    <div class="bg-warning bg-opacity-20 text-warning p-3 rounded-circle d-inline-block mb-3 fs-2" style="width: 75px; height: 75px; display: inline-flex; align-items: center; justify-content: center;">
                        <i class="bi bi-shield-fill"></i>
                    </div>
                    <h5 class="fw-bold text-white font-heading mb-1">Col. R. S. Rathore</h5>
                    <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill mb-2">Chief Warden</span>
                    <p class="small text-muted mb-0">Oversees residential campus, hostel room asset audits, mess fee reconciliations, and boarding clearance.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="facility-card p-4 text-center h-100">
                    <div class="bg-success bg-opacity-20 text-success p-3 rounded-circle d-inline-block mb-3 fs-2" style="width: 75px; height: 75px; display: inline-flex; align-items: center; justify-content: center;">
                        <i class="bi bi-check-all"></i>
                    </div>
                    <h5 class="fw-bold text-white font-heading mb-1">Dr. M. K. Sharma</h5>
                    <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill mb-2">Controller of Examinations</span>
                    <p class="small text-muted mb-0">Final institutional authority for end-semester hall ticket releases, mark sheets, and degree clearance certificates.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- SECTION 7: PORTAL GATEWAYS -->
    <div class="container my-5 py-4 border-top border-secondary border-opacity-25">
        <div class="text-center mb-4">
            <span class="badge rounded-pill px-3 py-1.5 fw-bold text-uppercase" style="background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.4); color: var(--tu-orange-light);">
                <i class="bi bi-door-closed-fill me-1"></i> Portal Access
            </span>
            <h2 class="fw-extrabold text-white mt-2 font-heading">Login to Your Portal</h2>
        </div>

        <div class="row g-4">
            <div class="col-md-4">
                <div class="gateway-card h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="gateway-icon" style="background: rgba(37, 99, 235, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4);">
                            <i class="bi bi-mortarboard-fill"></i>
                        </div>
                        <h4 class="fw-bold text-white font-heading">Student Portal</h4>
                        <p class="small" style="color: #cbd5e1; line-height: 1.6;">
                            Access for all 62 enrolled students. Check continuous clearance, settle dues, download tamper-proof QR certificates, and view the <strong>V-Sem Class Timetable</strong>.
                        </p>
                    </div>
                    <a href="/login" class="btn btn-white-glass rounded-pill mt-3 w-100">Student Sign In &rarr;</a>
                </div>
            </div>

            <div class="col-md-4">
                <div class="gateway-card h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="gateway-icon" style="background: rgba(249, 115, 22, 0.2); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.4);">
                            <i class="bi bi-person-workspace"></i>
                        </div>
                        <h4 class="fw-bold text-white font-heading">Faculty & HOD Portal</h4>
                        <p class="small" style="color: #cbd5e1; line-height: 1.6;">
                            Dedicated console for <strong>Dr. M Senthil (HOD AIDS)</strong>, Library, Accounts, and Hostel Wardens to manage student rosters, sign off Mini Project-II, and issue clearances.
                        </p>
                    </div>
                    <a href="/login" class="btn btn-gradient-orange rounded-pill mt-3 fw-bold w-100">Faculty Sign In &rarr;</a>
                </div>
            </div>

            <div class="col-md-4">
                <div class="gateway-card h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="gateway-icon" style="background: rgba(234, 179, 8, 0.2); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.4);">
                            <i class="bi bi-shield-lock-fill"></i>
                        </div>
                        <h4 class="fw-bold text-white font-heading">University Admin</h4>
                        <p class="small" style="color: #cbd5e1; line-height: 1.6;">
                            Executive control center providing campus-wide clearance rate analytics, 62-student master registry, emergency override protocols, and cryptographic audit records.
                        </p>
                    </div>
                    <a href="/login" class="btn btn-outline-light rounded-pill mt-3 fw-bold w-100" style="border-color: rgba(255,255,255,0.25);">Admin Sign In &rarr;</a>
                </div>
            </div>
        </div>
    </div>

    <!-- SECTION 8: FREQUENTLY ASKED QUESTIONS (ACCORDION) -->
    <div class="container my-5 py-4 border-top border-secondary border-opacity-25">
        <div class="text-center mb-5">
            <span class="badge rounded-pill px-3 py-1.5 fw-bold text-uppercase" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8;">
                <i class="bi bi-question-circle-fill me-1"></i> FAQ Guide
            </span>
            <h2 class="fw-extrabold text-white mt-2 font-heading">Frequently Asked Questions</h2>
            <p class="text-muted small mx-auto" style="max-width: 600px;">Clear guidance on institutional clearance, dispute policies, and exam certifications.</p>
        </div>

        <div class="mx-auto" style="max-width: 800px;">
            <div class="accordion" id="tuFaqAccordion">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                            <i class="bi bi-patch-question-fill text-primary me-2"></i> When is departmental clearance mandatory?
                        </button>
                    </h2>
                    <div id="faq1" class="accordion-collapse collapse show" data-bs-parent="#tuFaqAccordion">
                        <div class="accordion-body">
                            Departmental clearance is mandatory prior to the issuance of End-Semester Examination Hall Tickets, registration for higher semesters, Bonafide certificates for internships/passports, and issuance of provisional graduation degrees.
                        </div>
                    </div>
                </div>

                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                            <i class="bi bi-receipt text-warning me-2"></i> How do I contest a fine or incorrect due?
                        </button>
                    </h2>
                    <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#tuFaqAccordion">
                        <div class="accordion-body">
                            Log in to your Student Portal, navigate to the <strong>"My Dues"</strong> tab, and click <strong>"Raise Dispute"</strong> on the specific item. Provide your justification (such as book return drop-box date or fee receipt number). Department staff will review and update your status in real time.
                        </div>
                    </div>
                </div>

                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                            <i class="bi bi-kanban text-info me-2"></i> How is Mini Project-II (U24CSW501) clearance sign-off handled?
                        </button>
                    </h2>
                    <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#tuFaqAccordion">
                        <div class="accordion-body">
                            Mini Project-II clearance is directly managed in the AIDS Department Portal by <strong>Dr. M Senthil (HOD)</strong>. Once your project abstract, periodic code reviews, and guide evaluations are completed, your department clearance will automatically turn to <code>CLEARED</code>.
                        </div>
                    </div>
                </div>

                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                            <i class="bi bi-qr-code text-success me-2"></i> How can external parties verify my certificate?
                        </button>
                    </h2>
                    <div id="faq4" class="accordion-collapse collapse" data-bs-parent="#tuFaqAccordion">
                        <div class="accordion-body">
                            Every digital clearance certificate is embedded with an official cryptographic QR code. Any university official, recruiting company, or parent can scan the QR code with their phone camera or enter your Register Number on the public <strong>Verify Portal</strong> (<code>/verify</code>) to get instant live verification.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- SECTION 9: HELPDESK & CAMPUS CONTACTS -->
    <div class="container my-5 py-4 border-top border-secondary border-opacity-25">
        <div class="row g-4 align-items-center">
            <div class="col-lg-6">
                <span class="badge rounded-pill px-3 py-1.5 fw-bold text-uppercase" style="background: rgba(37, 99, 235, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8;">
                    <i class="bi bi-telephone-fill me-1"></i> Support Matrix
                </span>
                <h2 class="fw-extrabold text-white mt-2 font-heading">Campus Helpdesk & Desk Contacts</h2>
                <p class="text-muted small mb-4">Need in-person assistance? Reach out directly to your assigned departmental coordinators:</p>

                <div class="d-flex flex-column gap-3">
                    <div class="d-flex align-items-center gap-3 p-3 rounded-3" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);">
                        <i class="bi bi-mortarboard-fill text-primary fs-3"></i>
                        <div>
                            <strong class="text-white d-block">AIDS Department Office</strong>
                            <small class="text-muted">Academic Block Room 302 • HOD: Dr. M Senthil • Ext: 401</small>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-3 p-3 rounded-3" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);">
                        <i class="bi bi-book-fill text-info fs-3"></i>
                        <div>
                            <strong class="text-white d-block">Central Library Circulation Desk</strong>
                            <small class="text-muted">Ground Floor Library Building • In-Charge: Dr. Arvind Rao • Ext: 102</small>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-3 p-3 rounded-3" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);">
                        <i class="bi bi-houses-fill text-warning fs-3"></i>
                        <div>
                            <strong class="text-white d-block">Hostel Wardens Office</strong>
                            <small class="text-muted">Hostel Block A Office • Chief Warden: Col. R. S. Rathore • Ext: 305</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="p-4 rounded-4" style="background: linear-gradient(145deg, rgba(15, 28, 63, 0.8) 0%, rgba(6, 11, 24, 0.95) 100%); border: 1px solid rgba(56, 189, 248, 0.3); box-shadow: 0 20px 45px rgba(0,0,0,0.5);">
                    <h4 class="fw-bold text-white font-heading mb-2"><i class="bi bi-shield-check text-success me-2"></i> Fast Student Access</h4>
                    <p class="small text-muted mb-4">All 62 enrolled V-Semester AI & Data Science students can directly sign in using their University Register Number.</p>
                    <div class="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="small text-muted">Student User ID:</span>
                            <code class="text-info font-monospace">TU6241103111...</code>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="small text-muted">Default Password:</span>
                            <span class="small text-light font-monospace">Student@123</span>
                        </div>
                    </div>
                    <a href="/login" class="btn btn-white-glass rounded-pill w-100 py-3 fw-bold">
                        Proceed to Student Login &rarr;
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Official University Footer -->
    <footer class="py-5 border-top border-secondary border-opacity-25" style="background: #030712;">
        <div class="container text-center">
            <img src="/public/logo.webp" alt="Takshashila University" height="65" class="nav-logo-badge mb-3">
            <h4 class="fw-extrabold text-white font-heading mb-1">Takshashila University</h4>
            <p class="small mb-3 text-info">Department of Artificial Intelligence & Data Science (AIDS) • Mini Project-II Platform</p>
            <div class="d-flex justify-content-center flex-wrap gap-3 text-secondary small mb-3">
                <a href="/verify" class="text-secondary text-decoration-none"><i class="bi bi-shield-check text-success me-1"></i> QR Authenticity Verification</a>
                <span>•</span>
                <a href="/login" class="text-secondary text-decoration-none"><i class="bi bi-box-arrow-in-right text-primary me-1"></i> Portal Access</a>
                <span>•</span>
                <span class="text-light">HOD: Dr. M Senthil</span>
            </div>
            <p class="text-muted small mb-0" style="font-size: 0.78rem;">
                &copy; \${new Date().getFullYear()} Takshashila University. All Rights Reserved. Continuous Digital Clearance Platform.
            </p>
        </div>
    </footer>

    <!-- Bootstrap JS for Accordion -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>\`);
    }`;

// Replace the landing page in server.js
const oldLandingRegex = /\/\/ ROUTE: Public Homepage[\s\S]*?res\.end\(`<!DOCTYPE html>[\s\S]*?<\/html>`\);\s*}/;
code = code.replace(oldLandingRegex, expandedLandingPage);

fs.writeFileSync(serverJsPath, code, 'utf8');
console.log("Successfully created long, rich landing page with white glassy buttons and interactive sections!");

