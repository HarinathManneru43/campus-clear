<?php
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

// If user is already logged in, redirect automatically to their respective role dashboard
if (is_logged_in()) {
    $role = $_SESSION['user_role'];
    if ($role === ROLE_STUDENT) redirect(BASE_URL . '/student/dashboard.php');
    if ($role === ROLE_STAFF) redirect(BASE_URL . '/staff/dashboard.php');
    if ($role === ROLE_ADMIN) redirect(BASE_URL . '/admin/dashboard.php');
}

$page_title = APP_NAME . ' - Centralized Student Clearance Portal';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= sanitize($page_title) ?></title>
    <!-- Fonts & Bootstrap 5 -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
    <style>
        :root {
            --brand-font: 'Plus Jakarta Sans', sans-serif;
            --brand-primary: #4f46e5;
            --brand-primary-dark: #3730a3;
            --brand-secondary: #06b6d4;
            --brand-dark: #090d16;
            --brand-card-bg: #131b2e;
        }
        body {
            font-family: var(--brand-font);
            color: #334155;
            background-color: #f8fafc;
            overflow-x: hidden;
        }
        /* Header */
        .landing-nav {
            background: rgba(9, 13, 22, 0.95);
            backdrop-filter: blur(14px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .nav-link-custom {
            color: #cbd5e1 !important;
            font-weight: 500;
            transition: color 0.2s ease;
        }
        .nav-link-custom:hover {
            color: #ffffff !important;
        }
        /* Hero Section */
        .hero-section {
            background: radial-gradient(circle at 80% 20%, rgba(79, 70, 229, 0.3) 0%, rgba(9, 13, 22, 1) 70%),
                        linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%);
            color: #ffffff;
            padding: 90px 0 110px;
            position: relative;
            overflow: hidden;
        }
        .hero-glow-1 {
            position: absolute;
            top: -150px;
            right: -100px;
            width: 550px;
            height: 550px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(0,0,0,0) 70%);
            border-radius: 50%;
            pointer-events: none;
        }
        .hero-glow-2 {
            position: absolute;
            bottom: -100px;
            left: -100px;
            width: 450px;
            height: 450px;
            background: radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, rgba(0,0,0,0) 70%);
            border-radius: 50%;
            pointer-events: none;
        }
        .hero-badge {
            background: rgba(99, 102, 241, 0.18);
            border: 1px solid rgba(99, 102, 241, 0.4);
            color: #a5b4fc;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 7px 18px;
            border-radius: 50px;
            font-size: 0.875rem;
            font-weight: 600;
        }
        .hero-card {
            background: rgba(19, 27, 46, 0.9);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
            color: #f8fafc;
        }
        .status-pill-cleared {
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 30px;
            font-size: 0.75rem;
        }
        .status-pill-pulse {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
            animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        /* Metrics Strip */
        .metric-strip {
            background: #ffffff;
            border-radius: 1.25rem;
            box-shadow: 0 10px 30px -5px rgba(0,0,0,0.06);
            margin-top: -45px;
            position: relative;
            z-index: 10;
            border: 1px solid #e2e8f0;
        }
        .metric-box {
            padding: 24px 20px;
            text-align: center;
            border-right: 1px solid #f1f5f9;
        }
        .metric-box:last-child {
            border-right: none;
        }
        /* Feature Cards */
        .feature-box {
            background: #ffffff;
            border-radius: 1.25rem;
            padding: 32px 24px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            height: 100%;
        }
        .feature-box:hover {
            transform: translateY(-6px);
            box-shadow: 0 20px 35px -10px rgba(79, 70, 229, 0.12);
            border-color: #cbd5e1;
        }
        .feature-icon-wrapper {
            width: 60px;
            height: 60px;
            border-radius: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1.6rem;
            margin-bottom: 20px;
        }
        /* Workflow Step Number */
        .step-bubble {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1.2rem;
            box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
            margin-bottom: 20px;
        }
        /* Department Chip */
        .dept-card {
            background: #ffffff;
            border-radius: 1rem;
            padding: 20px;
            border: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 16px;
            transition: all 0.2s ease;
        }
        .dept-card:hover {
            border-color: #6366f1;
            background: #f8fafc;
            transform: translateX(4px);
        }
        /* Service Cards */
        .service-badge-pill {
            font-size: 0.75rem;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 20px;
        }
        /* Accordion Style */
        .faq-accordion .accordion-item {
            border: 1px solid #e2e8f0;
            border-radius: 1rem !important;
            margin-bottom: 12px;
            overflow: hidden;
        }
        .faq-accordion .accordion-button {
            font-weight: 600;
            padding: 20px 24px;
            background: #ffffff;
            color: #0f172a;
        }
        .faq-accordion .accordion-button:not(.collapsed) {
            background: #f1f5f9;
            color: #4f46e5;
            box-shadow: none;
        }
        /* CTA Banner */
        .cta-banner {
            background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
            border-radius: 1.75rem;
            padding: 60px 40px;
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
        }
        /* Modern Footer styling */
        .footer-dark {
            background-color: #090d16;
            color: #94a3b8;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .footer-dark h6 {
            color: #f8fafc;
            font-weight: 700;
            letter-spacing: 0.02em;
        }
        .footer-link {
            color: #94a3b8;
            text-decoration: none;
            transition: all 0.2s ease;
            display: inline-block;
        }
        .footer-link:hover {
            color: #ffffff;
            transform: translateX(3px);
        }
        .footer-contact-item {
            color: #cbd5e1;
            font-size: 0.875rem;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 12px;
        }
    </style>
</head>
<body>

<!-- Header Navigation -->
<nav class="navbar navbar-expand-lg navbar-dark landing-nav sticky-top py-3">
    <div class="container">
        <a class="navbar-brand d-flex align-items-center fw-bold text-white fs-4" href="<?= BASE_URL ?>">
            <div class="bg-primary text-white p-2 rounded-3 me-2 d-flex align-items-center justify-content-center shadow-sm" style="width: 38px; height: 38px;">
                <i class="bi bi-shield-check fs-5"></i>
            </div>
            <?= APP_NAME ?>
        </a>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#landingNavbar">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="landingNavbar">
            <ul class="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3">
                <li class="nav-item"><a class="nav-link nav-link-custom" href="#services">Services</a></li>
                <li class="nav-item"><a class="nav-link nav-link-custom" href="#how-it-works">Workflow</a></li>
                <li class="nav-item"><a class="nav-link nav-link-custom" href="#departments">Departments</a></li>
                <li class="nav-item"><a class="nav-link nav-link-custom" href="#features">Features</a></li>
                <li class="nav-item"><a class="nav-link nav-link-custom" href="#faq">FAQ</a></li>
                <li class="nav-item"><a class="nav-link nav-link-custom" href="<?= BASE_URL ?>/verify.php"><i class="bi bi-qr-code-scan me-1 text-info"></i> Verify QR</a></li>
            </ul>
            <div class="d-flex gap-2">
                <a href="<?= BASE_URL ?>/auth/login.php" class="btn btn-outline-light px-4 rounded-pill fw-semibold">
                    <i class="bi bi-box-arrow-in-right me-1"></i> Portal Login
                </a>
                <a href="<?= BASE_URL ?>/auth/register.php" class="btn btn-primary px-4 rounded-pill fw-semibold shadow-sm">
                    <i class="bi bi-person-plus me-1"></i> Register
                </a>
            </div>
        </div>
    </div>
</nav>

<!-- Hero Section -->
<section class="hero-section text-center text-lg-start">
    <div class="hero-glow-1"></div>
    <div class="hero-glow-2"></div>
    <div class="container position-relative" style="z-index: 2;">
        <div class="row align-items-center g-5">
            <div class="col-lg-7">
                <div class="hero-badge mb-3">
                    <span class="status-pill-pulse"></span>
                    Continuous University Digital Clearance Platform
                </div>
                <h1 class="display-4 fw-extrabold mb-3 tracking-tight text-white lh-sm">
                    Automate, Track & Clear Student <span class="text-info">No-Dues</span> in Real Time.
                </h1>
                <p class="lead text-slate-300 mb-4 fs-5" style="color: #cbd5e1; max-width: 620px;">
                    Say goodbye to repeated physical signature runs, paper queue bottlenecks, and lost records. CampusClear unites college departments into an interconnected, live-updating clearance network with instant QR verification.
                </p>
                <div class="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                    <a href="<?= BASE_URL ?>/auth/login.php" class="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg">
                        Access Your Portal <i class="bi bi-arrow-right ms-2"></i>
                    </a>
                    <a href="<?= BASE_URL ?>/verify.php" class="btn btn-outline-light btn-lg px-4 py-3 rounded-pill fw-semibold">
                        <i class="bi bi-qr-code me-2"></i> Verify Certificate
                    </a>
                </div>
                <div class="d-flex align-items-center gap-4 mt-4 pt-2 text-slate-400 justify-content-center justify-content-lg-start" style="font-size: 0.875rem; color: #94a3b8;">
                    <span><i class="bi bi-check-circle-fill text-success me-1"></i> Role-Based Security</span>
                    <span><i class="bi bi-check-circle-fill text-success me-1"></i> 100% Audit Logging</span>
                    <span><i class="bi bi-check-circle-fill text-success me-1"></i> Instant Dispute Redressal</span>
                </div>
            </div>
            
            <!-- Live Simulated Status Card -->
            <div class="col-lg-5">
                <div class="hero-card p-4 p-md-5">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="d-flex align-items-center">
                            <div class="bg-success-subtle text-success p-2 rounded-3 me-3 d-flex align-items-center justify-content-center" style="width:42px; height:42px;">
                                <i class="bi bi-shield-check fs-4"></i>
                            </div>
                            <div>
                                <h6 class="fw-bold mb-0 text-white">Live Clearance Engine</h6>
                                <small style="color: #94a3b8;">Multi-node synchronization</small>
                            </div>
                        </div>
                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">Active Node</span>
                    </div>

                    <div class="bg-dark bg-opacity-75 p-3 rounded-3 mb-3 border border-secondary border-opacity-25">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-light small"><i class="bi bi-book me-2 text-info"></i> Central Library</span>
                            <span class="status-pill-cleared">CLEARED</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-light small"><i class="bi bi-cash-coin me-2 text-warning"></i> Accounts & Finance</span>
                            <span class="status-pill-cleared">CLEARED</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-light small"><i class="bi bi-building me-2 text-primary"></i> Hostel Administration</span>
                            <span class="status-pill-cleared">CLEARED</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-light small"><i class="bi bi-laptop me-2 text-success"></i> Academic Dept (CSE)</span>
                            <span class="status-pill-cleared">CLEARED</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-light small"><i class="bi bi-mortarboard me-2 text-danger"></i> Examination Cell</span>
                            <span class="status-pill-cleared">CLEARED</span>
                        </div>
                    </div>

                    <div class="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <span class="status-pill-pulse me-2"></span>
                            <strong class="text-success small">Overall Status: 100% Cleared</strong>
                        </div>
                        <span class="badge bg-success text-white px-2 py-1"><i class="bi bi-qr-code me-1"></i> QR Ready</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Impact Metrics Strip -->
<div class="container">
    <div class="metric-strip">
        <div class="row g-0">
            <div class="col-6 col-md-3 metric-box">
                <h2 class="fw-extrabold text-primary mb-1">100%</h2>
                <p class="text-muted small mb-0 fw-semibold">Paperless Digital Protocol</p>
            </div>
            <div class="col-6 col-md-3 metric-box">
                <h2 class="fw-extrabold text-dark mb-1">7+</h2>
                <p class="text-muted small mb-0 fw-semibold">Connected Campus Nodes</p>
            </div>
            <div class="col-6 col-md-3 metric-box">
                <h2 class="fw-extrabold text-success mb-1">&lt; 1 Sec</h2>
                <p class="text-muted small mb-0 fw-semibold">Continuous Status Engine</p>
            </div>
            <div class="col-6 col-md-3 metric-box">
                <h2 class="fw-extrabold text-info mb-1">Tamper-Proof</h2>
                <p class="text-muted small mb-0 fw-semibold">Cryptographic QR Verification</p>
            </div>
        </div>
    </div>
</div>

<!-- Clearance Services & Document Requests Section -->
<section id="services" class="py-5 my-4">
    <div class="container py-4">
        <div class="text-center max-w-2xl mx-auto mb-5">
            <span class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold mb-2">Institutional Services</span>
            <h2 class="fw-extrabold text-dark">Supported Clearance & Certificate Requests</h2>
            <p class="text-muted">Apply online for academic credentials with automated clearance checks.</p>
        </div>

        <div class="row g-4">
            <div class="col-md-6 col-lg-4">
                <div class="feature-box">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="bg-primary-subtle text-primary p-3 rounded-3"><i class="bi bi-card-checklist fs-4"></i></div>
                        <span class="service-badge-pill bg-danger-subtle text-danger">Full Clearance Required</span>
                    </div>
                    <h5 class="fw-bold text-dark mb-2">End-Semester Hall Ticket</h5>
                    <p class="text-muted small mb-0">Automatic examination eligibility signoff across tuition accounts, library dues, and academic department lab attendance.</p>
                </div>
            </div>

            <div class="col-md-6 col-lg-4">
                <div class="feature-box">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="bg-success-subtle text-success p-3 rounded-3"><i class="bi bi-award fs-4"></i></div>
                        <span class="service-badge-pill bg-danger-subtle text-danger">Full Clearance Required</span>
                    </div>
                    <h5 class="fw-bold text-dark mb-2">Bonafide Student Certificate</h5>
                    <p class="text-muted small mb-0">Official institutional bonafide certificate for education loans, passport verification, scholarships, and external visa applications.</p>
                </div>
            </div>

            <div class="col-md-6 col-lg-4">
                <div class="feature-box">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="bg-info-subtle text-info p-3 rounded-3"><i class="bi bi-file-earmark-person fs-4"></i></div>
                        <span class="service-badge-pill bg-danger-subtle text-danger">Full Clearance Required</span>
                    </div>
                    <h5 class="fw-bold text-dark mb-2">Transfer & Character Certificate</h5>
                    <p class="text-muted small mb-0">Comprehensive institutional exit clearance for graduating students, course completion certificates, and transcript release.</p>
                </div>
            </div>

            <div class="col-md-6 col-lg-4">
                <div class="feature-box">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="bg-warning-subtle text-warning-emphasis p-3 rounded-3"><i class="bi bi-book fs-4"></i></div>
                        <span class="service-badge-pill bg-success-subtle text-success">Department Level</span>
                    </div>
                    <h5 class="fw-bold text-dark mb-2">Library No-Due Receipt</h5>
                    <p class="text-muted small mb-0">Single-department book return receipt and digital deposit refund clearance for central library membership renewal.</p>
                </div>
            </div>

            <div class="col-md-6 col-lg-4">
                <div class="feature-box">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="bg-secondary-subtle text-dark p-3 rounded-3"><i class="bi bi-door-closed fs-4"></i></div>
                        <span class="service-badge-pill bg-success-subtle text-success">Department Level</span>
                    </div>
                    <h5 class="fw-bold text-dark mb-2">Hostel & Mess Vacate Slip</h5>
                    <p class="text-muted small mb-0">Hostel room key handover, caution deposit settlement, and final semester mess bill clearance verification.</p>
                </div>
            </div>

            <div class="col-md-6 col-lg-4">
                <div class="feature-box">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="bg-primary-subtle text-primary p-3 rounded-3"><i class="bi bi-person-vcard fs-4"></i></div>
                        <span class="service-badge-pill bg-success-subtle text-success">Instant Reissue</span>
                    </div>
                    <h5 class="fw-bold text-dark mb-2">Duplicate ID Card Reissue</h5>
                    <p class="text-muted small mb-0">Lost or damaged institutional ID badge replacement request with administrative fee reconciliation.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Workflow Section ("How It Works") -->
<section id="how-it-works" class="py-5 bg-white border-top border-bottom">
    <div class="container py-4">
        <div class="text-center max-w-2xl mx-auto mb-5">
            <span class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold mb-2">System Workflow</span>
            <h2 class="fw-extrabold text-dark">How Digital Clearance Works</h2>
            <p class="text-muted">A streamlined 4-step automated pipeline eliminating physical signature delays.</p>
        </div>

        <div class="row g-4">
            <div class="col-md-6 col-lg-3">
                <div class="feature-box">
                    <div class="step-bubble">1</div>
                    <h5 class="fw-bold text-dark mb-2">Live Synchronization</h5>
                    <p class="text-muted small mb-0">Department staff and automated feeds record dues, book returns, and lab items directly into the centralized system.</p>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="feature-box">
                    <div class="step-bubble">2</div>
                    <h5 class="fw-bold text-dark mb-2">Itemized Tracking</h5>
                    <p class="text-muted small mb-0">Students log in to check their real-time status across every department with clear breakdown of any outstanding items.</p>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="feature-box">
                    <div class="step-bubble">3</div>
                    <h5 class="fw-bold text-dark mb-2">Instant Dispute Redress</h5>
                    <p class="text-muted small mb-0">Dispute any incorrect fee or missing return directly in the portal. Staff verify records and resolve status online.</p>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="feature-box">
                    <div class="step-bubble">4</div>
                    <h5 class="fw-bold text-dark mb-2">QR Verified Certificate</h5>
                    <p class="text-muted small mb-0">Once fully cleared, students generate official digital clearance certificates with tamper-proof QR validation.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Integrated Departmental Ecosystem -->
<section id="departments" class="py-5 bg-light">
    <div class="container py-4">
        <div class="row align-items-center g-5">
            <div class="col-lg-5">
                <span class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold mb-2">Campus Ecosystem</span>
                <h2 class="fw-extrabold text-dark mb-3">Connected Campus Department Nodes</h2>
                <p class="text-muted mb-4">Every critical academic, administrative, and hostel entity operates on unified data feeds to guarantee zero discrepancy clearance.</p>
                <a href="<?= BASE_URL ?>/auth/login.php" class="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold">
                    Login to Your Department <i class="bi bi-arrow-right ms-1"></i>
                </a>
            </div>
            <div class="col-lg-7">
                <div class="row g-3">
                    <div class="col-sm-6">
                        <div class="dept-card">
                            <div class="bg-primary-subtle text-primary p-3 rounded-3"><i class="bi bi-book fs-4"></i></div>
                            <div>
                                <h6 class="fw-bold mb-0 text-dark">Central Library</h6>
                                <small class="text-muted">Books, journals & fine clearances</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="dept-card">
                            <div class="bg-success-subtle text-success p-3 rounded-3"><i class="bi bi-cash-stack fs-4"></i></div>
                            <div>
                                <h6 class="fw-bold mb-0 text-dark">Accounts & Finance</h6>
                                <small class="text-muted">Tuition fees, bus fees & dues</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="dept-card">
                            <div class="bg-warning-subtle text-warning-emphasis p-3 rounded-3"><i class="bi bi-building fs-4"></i></div>
                            <div>
                                <h6 class="fw-bold mb-0 text-dark">Hostel & Housing</h6>
                                <small class="text-muted">Mess bills & room vacate check</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="dept-card">
                            <div class="bg-info-subtle text-info p-3 rounded-3"><i class="bi bi-laptop fs-4"></i></div>
                            <div>
                                <h6 class="fw-bold mb-0 text-dark">Academic Dept (CSE)</h6>
                                <small class="text-muted">Projects & lab attendance signoff</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="dept-card">
                            <div class="bg-danger-subtle text-danger p-3 rounded-3"><i class="bi bi-flask fs-4"></i></div>
                            <div>
                                <h6 class="fw-bold mb-0 text-dark">Central Laboratories</h6>
                                <small class="text-muted">Physics, chemistry & hardware labs</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="dept-card">
                            <div class="bg-secondary-subtle text-dark p-3 rounded-3"><i class="bi bi-mortarboard fs-4"></i></div>
                            <div>
                                <h6 class="fw-bold mb-0 text-dark">Examination Cell</h6>
                                <small class="text-muted">Hall tickets, transcripts & exit</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Key System Features Showcase -->
<section id="features" class="py-5 bg-white border-top">
    <div class="container py-4">
        <div class="text-center max-w-2xl mx-auto mb-5">
            <span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold mb-2">Core Capabilities</span>
            <h2 class="fw-extrabold text-dark">Built for Modern Educational Institutions</h2>
            <p class="text-muted">Empowering students, faculty, and administrators with role-tailored workspaces.</p>
        </div>

        <div class="row g-4">
            <div class="col-md-4">
                <div class="feature-box text-start">
                    <div class="feature-icon-wrapper bg-primary-subtle text-primary">
                        <i class="bi bi-mortarboard-fill"></i>
                    </div>
                    <h4 class="fw-bold text-dark mb-2">Student Experience</h4>
                    <p class="text-muted small mb-3">Live personal dashboard displaying current status across all 7 departments, due notifications, dispute submission, and credential downloads.</p>
                    <ul class="list-unstyled text-muted small mb-0 d-flex flex-column gap-2">
                        <li><i class="bi bi-check2 text-primary me-2"></i> Real-time multi-department breakdown</li>
                        <li><i class="bi bi-check2 text-primary me-2"></i> 1-click certificate generation</li>
                        <li><i class="bi bi-check2 text-primary me-2"></i> Dispute tracking with comments</li>
                    </ul>
                </div>
            </div>

            <div class="col-md-4">
                <div class="feature-box text-start">
                    <div class="feature-icon-wrapper bg-info-subtle text-info">
                        <i class="bi bi-person-badge-fill"></i>
                    </div>
                    <h4 class="fw-bold text-dark mb-2">Department Staff Control</h4>
                    <p class="text-muted small mb-3">Department-specific access for Library, Accounts, Hostel, and Labs. Issue dues, clear students in bulk, and review incoming requests.</p>
                    <ul class="list-unstyled text-muted small mb-0 d-flex flex-column gap-2">
                        <li><i class="bi bi-check2 text-info me-2"></i> Fast student lookup by Roll Number</li>
                        <li><i class="bi bi-check2 text-info me-2"></i> Individual and batch clearance toggles</li>
                        <li><i class="bi bi-check2 text-info me-2"></i> In-portal dispute response module</li>
                    </ul>
                </div>
            </div>

            <div class="col-md-4">
                <div class="feature-box text-start">
                    <div class="feature-icon-wrapper bg-warning-subtle text-warning-emphasis">
                        <i class="bi bi-shield-lock-fill"></i>
                    </div>
                    <h4 class="fw-bold text-dark mb-2">Administrative Command</h4>
                    <p class="text-muted small mb-3">Complete operational visibility, analytics, department configuration, service approval criteria, and cryptographic audit trails.</p>
                    <ul class="list-unstyled text-muted small mb-0 d-flex flex-column gap-2">
                        <li><i class="bi bi-check2 text-warning me-2"></i> Institutional analytics & metrics</li>
                        <li><i class="bi bi-check2 text-warning me-2"></i> Emergency administrative override</li>
                        <li><i class="bi bi-check2 text-warning me-2"></i> Immutable system audit logs</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Portal Access & Role Guidelines Section -->
<section id="portal-access" class="py-5 bg-light border-top">
    <div class="container py-4">
        <div class="text-center max-w-2xl mx-auto mb-5">
            <span class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold mb-2">Portal Access Information</span>
            <h2 class="fw-extrabold text-dark">How to Access Your Portal</h2>
            <p class="text-muted">Find specific access details, login instructions, and account guidelines for your user role.</p>
        </div>

        <div class="row g-4">
            <!-- Student Access Card -->
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm rounded-4 p-4 text-start bg-white">
                    <div class="d-flex align-items-center mb-3">
                        <div class="bg-primary-subtle text-primary p-3 rounded-circle me-3" style="width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;">
                            <i class="bi bi-mortarboard-fill fs-4"></i>
                        </div>
                        <div>
                            <h5 class="fw-bold mb-0 text-dark">Student Access</h5>
                            <small class="text-muted">Undergraduate & Postgraduate</small>
                        </div>
                    </div>
                    <p class="text-muted small mb-3">
                        Students can log in to check their continuous clearance status, view outstanding dues across departments, submit online disputes, and apply for verified digital certificates.
                    </p>
                    <div class="bg-light p-3 rounded-3 mb-3 border">
                        <div class="small fw-semibold text-dark mb-1"><i class="bi bi-info-circle text-primary me-1"></i> Login Identifier:</div>
                        <div class="text-muted small">Use your official <strong>University Roll Number</strong> (e.g., <code>TU624...</code>) or registered email address.</div>
                    </div>
                    <div class="mt-auto d-flex gap-2">
                        <a href="<?= BASE_URL ?>/auth/login.php" class="btn btn-primary btn-sm flex-fill fw-semibold py-2">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Student Login
                        </a>
                        <a href="<?= BASE_URL ?>/auth/register.php" class="btn btn-outline-secondary btn-sm fw-semibold py-2">
                            <i class="bi bi-person-plus me-1"></i> Register
                        </a>
                    </div>
                </div>
            </div>

            <!-- Staff Access Card -->
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm rounded-4 p-4 text-start bg-white">
                    <div class="d-flex align-items-center mb-3">
                        <div class="bg-info-subtle text-info p-3 rounded-circle me-3" style="width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;">
                            <i class="bi bi-person-badge-fill fs-4"></i>
                        </div>
                        <div>
                            <h5 class="fw-bold mb-0 text-dark">Department Staff</h5>
                            <small class="text-muted">Library, Accounts, Hostel, Labs</small>
                        </div>
                    </div>
                    <p class="text-muted small mb-3">
                        Authorized departmental officers can manage student clearance records, record or waive dues, review service applications, and respond directly to student disputes.
                    </p>
                    <div class="bg-light p-3 rounded-3 mb-3 border">
                        <div class="small fw-semibold text-dark mb-1"><i class="bi bi-info-circle text-info me-1"></i> Staff Authentication:</div>
                        <div class="text-muted small">Sign in using your assigned <strong>Department Staff Username</strong> or institutional faculty email.</div>
                    </div>
                    <div class="mt-auto">
                        <a href="<?= BASE_URL ?>/auth/login.php" class="btn btn-outline-primary btn-sm w-100 fw-semibold py-2">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Staff Portal Login
                        </a>
                    </div>
                </div>
            </div>

            <!-- Administrator Access Card -->
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm rounded-4 p-4 text-start bg-white">
                    <div class="d-flex align-items-center mb-3">
                        <div class="bg-warning-subtle text-warning-emphasis p-3 rounded-circle me-3" style="width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;">
                            <i class="bi bi-shield-lock-fill fs-4"></i>
                        </div>
                        <div>
                            <h5 class="fw-bold mb-0 text-dark">Institutional Admin</h5>
                            <small class="text-muted">Central University Controller</small>
                        </div>
                    </div>
                    <p class="text-muted small mb-3">
                        System Administrators have master oversight of institutional clearance statistics, department catalog rules, staff account provisioning, and audit logs.
                    </p>
                    <div class="bg-light p-3 rounded-3 mb-3 border">
                        <div class="small fw-semibold text-dark mb-1"><i class="bi bi-info-circle text-warning me-1"></i> Administrative Access:</div>
                        <div class="text-muted small">Protected administrative console access for designated registrar and exam cell officers.</div>
                    </div>
                    <div class="mt-auto">
                        <a href="<?= BASE_URL ?>/auth/login.php" class="btn btn-outline-dark btn-sm w-100 fw-semibold py-2">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Admin Login
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Security & Privacy Notice -->
        <div class="mt-4 p-3 bg-white rounded-3 border border-secondary border-opacity-25 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center">
                <i class="bi bi-shield-check text-success fs-4 me-3"></i>
                <div class="small">
                    <strong class="text-dark">Institutional Security Protocol:</strong>
                    <span class="text-muted ms-1">All accounts are protected with BCRYPT encryption, session regeneration, and continuous audit trails.</span>
                </div>
            </div>
            <span class="badge bg-success-subtle text-success py-2 px-3 rounded-pill fw-semibold"><i class="bi bi-lock-fill me-1"></i> Secure RBAC</span>
        </div>
    </div>
</section>

<!-- FAQ Accordion Section -->
<section id="faq" class="py-5 bg-white border-top">
    <div class="container py-4">
        <div class="text-center max-w-2xl mx-auto mb-5">
            <span class="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill fw-semibold mb-2">Help & Answers</span>
            <h2 class="fw-extrabold text-dark">Frequently Asked Questions</h2>
            <p class="text-muted">Everything you need to know about the continuous clearance workflow.</p>
        </div>

        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="accordion faq-accordion" id="clearanceFaq">
                    
                    <div class="accordion-item shadow-sm">
                        <h2 class="accordion-header" id="headingOne">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true">
                                <i class="bi bi-question-circle text-primary me-2"></i> How do I get my clearance certificate?
                            </button>
                        </h2>
                        <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#clearanceFaq">
                            <div class="accordion-body text-muted">
                                Once all connected departments (Library, Accounts, Hostel, Academics, Exam Cell, etc.) record a <strong>CLEARED</strong> status with 0 pending dues, you can apply for and download an official digital certificate with a verifiable QR code directly from your student dashboard.
                            </div>
                        </div>
                    </div>

                    <div class="accordion-item shadow-sm">
                        <h2 class="accordion-header" id="headingTwo">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                                <i class="bi bi-exclamation-octagon text-primary me-2"></i> What should I do if I have a disputed due or fine?
                            </button>
                        </h2>
                        <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#clearanceFaq">
                            <div class="accordion-body text-muted">
                                If you believe a due was registered in error (e.g., a book was returned or payment receipt exists), navigate to the <strong>Disputes</strong> tab in your student portal and submit an inquiry. The concerned department staff will review the dispute and update the status online.
                            </div>
                        </div>
                    </div>

                    <div class="accordion-item shadow-sm">
                        <h2 class="accordion-header" id="headingThree">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                                <i class="bi bi-qr-code text-primary me-2"></i> How does the QR Code certificate verification work?
                            </button>
                        </h2>
                        <div id="collapseThree" class="accordion-collapse collapse" data-bs-parent="#clearanceFaq">
                            <div class="accordion-body text-muted">
                                Every issued certificate carries a cryptographically unique verification token. Anyone (such as external employers, scholarship boards, or university evaluators) can scan the QR code or visit the public <strong>Verify Certificate</strong> page to instantly confirm the certificate's validity and student details.
                            </div>
                        </div>
                    </div>

                    <div class="accordion-item shadow-sm">
                        <h2 class="accordion-header" id="headingFour">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour">
                                <i class="bi bi-shield-check text-primary me-2"></i> Can an Administrator override clearance for special conditions?
                            </button>
                        </h2>
                        <div id="collapseFour" class="accordion-collapse collapse" data-bs-parent="#clearanceFaq">
                            <div class="accordion-body text-muted">
                                Yes. The system includes an administrative emergency override protocol with mandatory audit justifications for sanctioned institutional exemptions.
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</section>

<!-- Call To Action Banner -->
<section class="py-5 bg-white">
    <div class="container">
        <div class="cta-banner text-center text-md-start">
            <div class="row align-items-center g-4">
                <div class="col-md-8">
                    <span class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold mb-3">Institutional Gateway</span>
                    <h2 class="fw-extrabold text-white mb-2">Ready to access your clearance portal?</h2>
                    <p class="text-slate-300 mb-0" style="color: #cbd5e1;">Log in using your assigned university credentials or register a new student account.</p>
                </div>
                <div class="col-md-4 text-md-end">
                    <a href="<?= BASE_URL ?>/auth/login.php" class="btn btn-primary btn-lg px-4 py-3 rounded-pill fw-bold shadow-lg">
                        <i class="bi bi-box-arrow-in-right me-2"></i> Secure Portal Login
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Modern High-Contrast Footer -->
<footer class="footer-dark py-5">
    <div class="container">
        <div class="row g-4 mb-4">
            <div class="col-md-5">
                <div class="d-flex align-items-center mb-3">
                    <div class="bg-primary text-white p-2 rounded-3 me-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                        <i class="bi bi-shield-check fs-5"></i>
                    </div>
                    <h5 class="fw-bold text-white mb-0"><?= APP_NAME ?></h5>
                </div>
                <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;" class="pe-md-4">
                    Continuous Digital Clearance & Zero-Queuing Protocol for University Departments, Academic Faculty, and Students.
                </p>
                <div class="d-flex flex-wrap gap-2 pt-1">
                    <span class="badge bg-success bg-opacity-20 text-success border border-success border-opacity-25 py-2 px-3">
                        <i class="bi bi-shield-lock-fill me-1"></i> SSL 256-bit Encrypted
                    </span>
                    <span class="badge bg-primary bg-opacity-20 text-info border border-info border-opacity-25 py-2 px-3">
                        <i class="bi bi-activity me-1"></i> System Online
                    </span>
                </div>
            </div>
            
            <div class="col-md-3">
                <h6 class="mb-3">Quick Navigation</h6>
                <ul class="list-unstyled d-flex flex-column gap-2 mb-0" style="font-size: 0.9rem;">
                    <li><a href="<?= BASE_URL ?>/auth/login.php" class="footer-link"><i class="bi bi-chevron-right small me-1 text-primary"></i> Portal Login</a></li>
                    <li><a href="<?= BASE_URL ?>/auth/register.php" class="footer-link"><i class="bi bi-chevron-right small me-1 text-primary"></i> Student Registration</a></li>
                    <li><a href="<?= BASE_URL ?>/verify.php" class="footer-link"><i class="bi bi-chevron-right small me-1 text-primary"></i> Public QR Verification</a></li>
                    <li><a href="#services" class="footer-link"><i class="bi bi-chevron-right small me-1 text-primary"></i> Supported Services</a></li>
                    <li><a href="#how-it-works" class="footer-link"><i class="bi bi-chevron-right small me-1 text-primary"></i> Clearance Workflow</a></li>
                </ul>
            </div>

            <div class="col-md-4">
                <h6 class="mb-3">University Clearance Helpdesk</h6>
                <div class="footer-contact-item">
                    <i class="bi bi-geo-alt-fill text-primary fs-5 mt-1"></i>
                    <div>
                        <strong class="text-white d-block">Main Campus Administrative Block</strong>
                        <span>Office of the Registrar & Controller of Examinations</span>
                    </div>
                </div>
                <div class="footer-contact-item">
                    <i class="bi bi-envelope-fill text-primary fs-5 mt-1"></i>
                    <div>
                        <strong class="text-white d-block">Email Support</strong>
                        <span>clearance-support@campusclear.edu</span>
                    </div>
                </div>
                <div class="footer-contact-item">
                    <i class="bi bi-clock-fill text-primary fs-5 mt-1"></i>
                    <div>
                        <strong class="text-white d-block">Working Hours</strong>
                        <span>Monday – Friday | 09:00 AM – 05:00 PM IST</span>
                    </div>
                </div>
            </div>
        </div>

        <hr style="border-color: rgba(255, 255, 255, 0.12);" class="my-4">
        
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center" style="color: #64748b; font-size: 0.85rem;">
            <p class="mb-0">&copy; <?= date('Y') ?> <?= APP_NAME ?>. Continuous Digital Student Clearance Management System.</p>
            <p class="mb-0 mt-2 mt-md-0">Engineered for University Digital Transformation.</p>
        </div>
    </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/bootstrap.bundle.min.js"></script>
</body>
</html>