const fs = require('fs');
const path = require('path');

const serverJsPath = path.join(__dirname, 'server.js');
let code = fs.readFileSync(serverJsPath, 'utf8');

const cleanLandingPage = `    // ROUTE: Public Homepage
    if (pathname === '/') {
        const data = loadDb();
        const totalStudents = data.students.length;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(\`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Takshashila University • Continuous Clearance Platform</title>
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
            background: rgba(6, 11, 24, 0.92);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }
        .nav-logo-badge {
            background: #ffffff;
            border-radius: 50%;
            padding: 4px;
            box-shadow: 0 4px 15px rgba(249, 115, 22, 0.35);
            border: 2px solid var(--tu-orange-light);
        }

        /* Hero Banner with Rich Campus Background */
        .hero-banner {
            position: relative;
            background: linear-gradient(180deg, rgba(6, 11, 24, 0.52) 0%, rgba(15, 28, 63, 0.75) 45%, rgba(6, 11, 24, 0.98) 100%),
                        url('/public/campus.webp') center 35%/cover no-repeat;
            padding: 90px 0 110px;
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
            background: linear-gradient(135deg, #ffffff 40%, #f1f5f9 75%, #93c5fd 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .hero-subtitle {
            font-size: clamp(1.2rem, 2.3vw, 1.6rem);
            font-weight: 800;
            color: #38bdf8;
            letter-spacing: -0.01em;
            text-shadow: 0 2px 10px rgba(0,0,0,0.6);
        }
        .hero-desc {
            color: #e2e8f0;
            font-size: 1.12rem;
            line-height: 1.65;
            font-weight: 500;
            text-shadow: 0 2px 8px rgba(0,0,0,0.8);
        }

        .pill-dept {
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.35) 0%, rgba(249, 115, 22, 0.35) 100%);
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(12px);
            color: #ffffff;
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }

        /* WHITE GLASSY BUTTON WITH TOUCH SHIMMER EFFECT */
        .btn-white-glass {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            color: #0b1536 !important;
            border: 2px solid #ffffff;
            font-weight: 800;
            font-family: 'Outfit', sans-serif;
            font-size: 1.1rem;
            letter-spacing: 0.3px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), 0 0 25px rgba(255, 255, 255, 0.35);
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
            box-shadow: 0 18px 45px rgba(255, 255, 255, 0.6), 0 0 40px rgba(56, 189, 248, 0.8);
            border-color: #ffffff;
        }
        .btn-white-glass:hover::before {
            left: 150%;
        }

        .btn-verify-pill {
            background: rgba(15, 28, 63, 0.8);
            border: 2px solid rgba(255, 255, 255, 0.4);
            color: #ffffff;
            font-weight: 700;
            backdrop-filter: blur(10px);
            transition: all 0.25s ease;
        }
        .btn-verify-pill:hover {
            border-color: #ffffff;
            background: rgba(255, 255, 255, 0.15);
            color: #ffffff;
            transform: translateY(-2px);
        }

        /* High-Visibility Search Box */
        .search-hero-card {
            background: rgba(15, 28, 63, 0.92);
            border: 2px solid rgba(56, 189, 248, 0.5);
            border-radius: 50rem;
            padding: 8px 10px 8px 22px;
            box-shadow: 0 20px 45px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.3);
            backdrop-filter: blur(20px);
            transition: all 0.25s ease;
        }
        .search-hero-card:focus-within {
            border-color: #38bdf8;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.5);
            transform: scale(1.01);
        }
        .search-hero-card input {
            background: transparent;
            border: none;
            color: #ffffff !important;
            font-size: 1.05rem;
            font-weight: 600;
        }
        .search-hero-card input::placeholder {
            color: #cbd5e1 !important;
            font-weight: 500;
        }
        .search-hero-card input:focus {
            outline: none;
            box-shadow: none;
            background: transparent;
            color: #ffffff !important;
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

        /* Vivid Stat Cards */
        .vivid-stat-card {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
            border: 1px solid rgba(255, 255, 255, 0.18);
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
            background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.9), transparent);
        }
        .vivid-stat-card:hover {
            transform: translateY(-4px);
            border-color: rgba(56, 189, 248, 0.5);
        }

        /* Facility Cards */
        .facility-card {
            background: linear-gradient(160deg, rgba(15, 28, 63, 0.85) 0%, rgba(6, 11, 24, 0.95) 100%);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 1.5rem;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.55);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .facility-card:hover {
            transform: translateY(-8px);
            border-color: rgba(56, 189, 248, 0.55);
            box-shadow: 0 30px 60px -15px rgba(37, 99, 235, 0.35);
        }
        .facility-img-box {
            position: relative;
            height: 250px;
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
            background: rgba(6, 11, 24, 0.88);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.25);
            padding: 0.4rem 1rem;
            border-radius: 50rem;
            font-size: 0.82rem;
            font-weight: 700;
        }

        /* Gateway Cards */
        .gateway-card {
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 1.5rem;
            padding: 2.25rem;
            transition: all 0.25s ease;
        }
        .gateway-card:hover {
            transform: translateY(-6px);
            border-color: var(--tu-blue-light);
            box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.4);
        }
        .gateway-icon {
            width: 64px;
            height: 64px;
            border-radius: 1.25rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1.85rem;
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
                    <small class="text-info fw-bold" style="font-size: 0.75rem; letter-spacing: 0.6px;">DEPT. OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE</small>
                </div>
            </a>
            <div class="d-flex align-items-center gap-2">
                <a href="/verify" class="btn btn-outline-light rounded-pill px-3.5 btn-sm fw-bold">
                    <i class="bi bi-qr-code-scan me-1 text-warning"></i> QR Verify
                </a>
                <a href="/login" class="btn btn-white-glass rounded-pill px-4 btn-sm fw-bold shadow">
                    <i class="bi bi-box-arrow-in-right me-1 text-primary"></i> Sign In to Portal
                </a>
            </div>
        </div>
    </nav>

    <!-- Hero Banner with Campus Background -->
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
                Continuous Digital Student Clearance Platform
            </p>
            <p class="hero-desc mx-auto mb-4 lead" style="max-width: 740px;">
                Official unified platform for automated clearance tracking across Central Library, Accounts & Finance, Residential Hostel Board, AIDS Department, and the Examination Cell with instant QR verification.
            </p>

            <!-- Action Buttons with White Glassy Effect -->
            <div class="d-flex justify-content-center flex-wrap gap-3 mb-5">
                <a href="/login" class="btn btn-white-glass btn-lg rounded-pill px-5 py-3">
                    Access My Portal <i class="bi bi-arrow-right ms-2 text-primary"></i>
                </a>
                <a href="/verify" class="btn btn-verify-pill btn-lg rounded-pill px-4">
                    <i class="bi bi-patch-check-fill me-2 text-warning"></i> Public QR Verify
                </a>
            </div>

            <!-- High-Contrast Search & Quick Roll Number Verifier -->
            <div class="mx-auto" style="max-width: 620px;">
                <form method="GET" action="/verify" class="search-hero-card d-flex align-items-center">
                    <i class="bi bi-search text-info fs-5 me-2"></i>
                    <input type="text" name="token" class="form-control" placeholder="Enter student roll number to verify (e.g. TU6241103111088)..." required>
                    <button type="submit" class="btn btn-gradient-orange rounded-pill px-4 py-2.5 fw-bold text-nowrap font-heading">
                        Verify Status
                    </button>
                </form>
                <div class="d-flex justify-content-center align-items-center gap-2 mt-2.5">
                    <i class="bi bi-shield-check text-success"></i>
                    <span class="fw-semibold" style="font-size: 0.88rem; color: #e2e8f0;">Instant tamper-proof validation for faculty, registrars, and parents.</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Live Statistics Strip (High Contrast) -->
    <div class="container my-5">
        <div class="row g-3">
            <div class="col-6 col-md-3">
                <div class="vivid-stat-card">
                    <div class="display-5 fw-extrabold font-heading mb-1" style="color: #60a5fa;">\${totalStudents}</div>
                    <span class="fw-bold text-white d-block fs-6">Enrolled Students</span>
                    <small class="fw-bold text-info" style="font-size: 0.82rem;">AIDS Batch 2022–2026</small>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="vivid-stat-card">
                    <div class="display-5 fw-extrabold font-heading mb-1" style="color: #4ade80;">5</div>
                    <span class="fw-bold text-white d-block fs-6">Clearance Desks</span>
                    <small class="fw-bold" style="color: #86efac; font-size: 0.82rem;">Library • Finance • Hostel • AIDS • Exam</small>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="vivid-stat-card">
                    <div class="display-5 fw-extrabold font-heading mb-1" style="color: var(--tu-gold);">V Sem</div>
                    <span class="fw-bold text-white d-block fs-6">Class Cohort</span>
                    <small class="fw-bold text-warning" style="font-size: 0.82rem;">HOD: Dr. M Senthil</small>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="vivid-stat-card">
                    <div class="display-5 fw-extrabold font-heading mb-1" style="color: var(--tu-orange-light);">100%</div>
                    <span class="fw-bold text-white d-block fs-6">Digital Paperless</span>
                    <small class="fw-bold" style="color: #fdba74; font-size: 0.82rem;">Official QR Clearance Pass</small>
                </div>
            </div>
        </div>
    </div>

    <!-- Campus & Hostel Facilities Showcase -->
    <div class="container my-5 py-2">
        <div class="text-center mb-4">
            <span class="badge rounded-pill px-3 py-1.5 fw-bold text-uppercase" style="background: rgba(37, 99, 235, 0.25); border: 1px solid rgba(56, 189, 248, 0.5); color: #38bdf8;">
                <i class="bi bi-geo-alt-fill me-1"></i> Campus Facilities
            </span>
            <h2 class="fw-extrabold text-white mt-2 font-heading">Takshashila Campus Infrastructure</h2>
            <p class="lead mx-auto" style="max-width: 640px; color: #cbd5e1; font-size: 1rem;">
                Connected directly to the university continuous clearance engine for real-time status synchronization.
            </p>
        </div>

        <div class="row g-4 align-items-stretch">
            <!-- Academic Block Card -->
            <div class="col-md-6">
                <div class="facility-card h-100">
                    <div class="facility-img-box">
                        <img src="/public/campus.webp" alt="Takshashila Academic Campus">
                        <div class="facility-badge-overlay text-info">
                            <i class="bi bi-building-fill me-1 text-primary"></i> Main Academic Block
                        </div>
                    </div>
                    <div class="p-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h4 class="fw-bold text-white mb-0 font-heading">AI & Data Science Block</h4>
                            <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">AIDS Dept</span>
                        </div>
                        <p class="mb-3" style="color: #e2e8f0; font-size: 0.95rem; line-height: 1.6;">
                            Features specialized Deep Learning computing labs, CISCO networking racks, and project workstations under the leadership of <strong>Dr. M Senthil (HOD AIDS)</strong>.
                        </p>
                        <div class="d-flex flex-wrap gap-2 pt-2 border-top border-secondary border-opacity-50">
                            <span class="badge bg-dark border border-secondary text-light px-2.5 py-1.5"><i class="bi bi-cpu-fill text-info me-1"></i> GPU Compute Lab</span>
                            <span class="badge bg-dark border border-secondary text-light px-2.5 py-1.5"><i class="bi bi-diagram-3-fill text-primary me-1"></i> Network Lab</span>
                            <span class="badge bg-dark border border-secondary text-light px-2.5 py-1.5"><i class="bi bi-kanban-fill text-warning me-1"></i> Mini Project-II</span>
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
                        <p class="mb-3" style="color: #e2e8f0; font-size: 0.95rem; line-height: 1.6;">
                            Integrated residential facilities managed by <strong>Col. R. S. Rathore (Chief Warden)</strong>. Room inventories, cautionary deposits, and mess dues sync automatically with student portals.
                        </p>
                        <div class="d-flex flex-wrap gap-2 pt-2 border-top border-secondary border-opacity-50">
                            <span class="badge bg-dark border border-secondary text-light px-2.5 py-1.5"><i class="bi bi-door-open-fill text-success me-1"></i> Room Inventory Sync</span>
                            <span class="badge bg-dark border border-secondary text-light px-2.5 py-1.5"><i class="bi bi-cup-hot-fill text-danger me-1"></i> Mess Dues Check</span>
                            <span class="badge bg-dark border border-secondary text-light px-2.5 py-1.5"><i class="bi bi-shield-lock-fill text-warning me-1"></i> Warden Clearance</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Portal Gateways Grid -->
    <div class="container my-5 py-4 border-top border-secondary border-opacity-25">
        <div class="text-center mb-4">
            <span class="badge rounded-pill px-3 py-1.5 fw-bold text-uppercase" style="background: rgba(249, 115, 22, 0.2); border: 1px solid rgba(249, 115, 22, 0.4); color: var(--tu-orange-light);">
                <i class="bi bi-door-closed-fill me-1"></i> Access Channels
            </span>
            <h2 class="fw-extrabold text-white mt-2 font-heading">Login to Your Portal</h2>
        </div>

        <div class="row g-4">
            <div class="col-md-4">
                <div class="gateway-card h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="gateway-icon" style="background: rgba(37, 99, 235, 0.25); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4);">
                            <i class="bi bi-mortarboard-fill"></i>
                        </div>
                        <h4 class="fw-bold text-white font-heading">Student Portal</h4>
                        <p style="color: #e2e8f0; font-size: 0.95rem; line-height: 1.6;">
                            Full access for all 62 enrolled students. Check continuous clearance, settle dues, download official QR certificates, and view your academic schedule.
                        </p>
                    </div>
                    <a href="/login" class="btn btn-white-glass rounded-pill mt-3 w-100">Student Sign In &rarr;</a>
                </div>
            </div>

            <div class="col-md-4">
                <div class="gateway-card h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="gateway-icon" style="background: rgba(249, 115, 22, 0.25); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.4);">
                            <i class="bi bi-person-workspace"></i>
                        </div>
                        <h4 class="fw-bold text-white font-heading">Faculty & HOD Portal</h4>
                        <p style="color: #e2e8f0; font-size: 0.95rem; line-height: 1.6;">
                            Dedicated console for <strong>Dr. M Senthil (HOD AIDS)</strong>, Library, Accounts, and Hostel Wardens to manage student rosters, sign off Mini Project-II, and issue clearances.
                        </p>
                    </div>
                    <a href="/login" class="btn btn-gradient-orange rounded-pill mt-3 fw-bold w-100">Faculty Sign In &rarr;</a>
                </div>
            </div>

            <div class="col-md-4">
                <div class="gateway-card h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="gateway-icon" style="background: rgba(234, 179, 8, 0.25); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.4);">
                            <i class="bi bi-shield-lock-fill"></i>
                        </div>
                        <h4 class="fw-bold text-white font-heading">University Admin</h4>
                        <p style="color: #e2e8f0; font-size: 0.95rem; line-height: 1.6;">
                            Executive control center providing campus-wide clearance rate analytics, 62-student master registry, emergency override protocols, and cryptographic audit records.
                        </p>
                    </div>
                    <a href="/login" class="btn btn-outline-light rounded-pill mt-3 fw-bold w-100" style="border-color: rgba(255,255,255,0.4); font-size: 0.95rem;">Admin Sign In &rarr;</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Official University Footer -->
    <footer class="py-5 border-top border-secondary border-opacity-50" style="background: #030712;">
        <div class="container text-center">
            <img src="/public/logo.webp" alt="Takshashila University" height="65" class="nav-logo-badge mb-3">
            <h4 class="fw-extrabold text-white font-heading mb-1">Takshashila University</h4>
            <p class="mb-3 text-info fw-bold" style="font-size: 0.9rem;">Department of Artificial Intelligence & Data Science (AIDS) • Continuous Clearance Platform</p>
            <div class="d-flex justify-content-center flex-wrap gap-3 text-secondary small mb-3">
                <a href="/verify" class="text-decoration-none" style="color: #93c5fd;"><i class="bi bi-shield-check text-success me-1"></i> QR Authenticity Verification</a>
                <span class="text-white-50">•</span>
                <a href="/login" class="text-decoration-none" style="color: #93c5fd;"><i class="bi bi-box-arrow-in-right text-primary me-1"></i> Portal Access</a>
                <span class="text-white-50">•</span>
                <span class="text-white">HOD: Dr. M Senthil</span>
            </div>
            <p class="small mb-0" style="font-size: 0.85rem; color: #94a3b8;">
                &copy; \${new Date().getFullYear()} Takshashila University. All Rights Reserved. Continuous Digital Clearance Platform.
            </p>
        </div>
    </footer>
</body>
</html>\`);
    }`;

// Replace the landing page in server.js
const oldLandingRegex = /\/\/ ROUTE: Public Homepage[\s\S]*?res\.end\(`<!DOCTYPE html>[\s\S]*?<\/html>`\);\s*}/;
code = code.replace(oldLandingRegex, cleanLandingPage);

fs.writeFileSync(serverJsPath, code, 'utf8');
console.log("Successfully cleaned up landing page: removed timetable/leadership, kept white glassy button, and fixed all text visibility!");
