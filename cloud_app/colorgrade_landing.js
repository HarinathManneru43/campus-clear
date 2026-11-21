const fs = require('fs');
const path = require('path');

const serverJsPath = path.join(__dirname, 'server.js');
let code = fs.readFileSync(serverJsPath, 'utf8');

// Build the upgraded, color-graded landing page
const vibrantLandingPage = `    // ROUTE: Public Homepage
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
    <title>Takshashila University • Continuous Clearance & Academic Portal</title>
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
        h1, h2, h3, h4, .font-heading {
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

        /* Hero Banner with Rich Color Grade */
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

        /* Vivid Buttons */
        .btn-gradient-primary {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: #ffffff;
            border: none;
            box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.6), 0 0 0 1px rgba(255,255,255,0.2);
            transition: all 0.2s ease;
        }
        .btn-gradient-primary:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            transform: translateY(-2px);
            box-shadow: 0 15px 30px -5px rgba(37, 99, 235, 0.8);
            color: #ffffff;
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

        /* Access Gateway Cards */
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
                <a href="/login" class="btn btn-gradient-primary rounded-pill px-4 btn-sm fw-bold">
                    <i class="bi bi-box-arrow-in-right me-1"></i> Sign In to Portal
                </a>
            </div>
        </div>
    </nav>

    <!-- Hero Banner with Color-Graded Campus Background -->
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

            <!-- Action Buttons -->
            <div class="d-flex justify-content-center flex-wrap gap-3 mb-5">
                <a href="/login" class="btn btn-gradient-primary btn-lg rounded-pill px-5 fw-extrabold font-heading">
                    Access My Portal <i class="bi bi-arrow-right ms-2"></i>
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

    <!-- Vibrant Statistics Counter Strip -->
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

    <!-- Campus & Hostel Facilities Showcase with Colorgraded Photos -->
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

    <!-- Dedicated Portals Gateways -->
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
                    <a href="/login" class="btn btn-gradient-primary rounded-pill mt-3 fw-bold w-100">Student Sign In &rarr;</a>
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
</body>
</html>\`);
    }`;

// Replace the landing page in server.js
const oldLandingRegex = /\/\/ ROUTE: Public Homepage[\s\S]*?res\.end\(`<!DOCTYPE html>[\s\S]*?<\/html>`\);\s*}/;
code = code.replace(oldLandingRegex, vibrantLandingPage);

fs.writeFileSync(serverJsPath, code, 'utf8');
console.log("Successfully upgraded landing page with vibrant color grading and high contrast!");
