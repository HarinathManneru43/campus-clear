# CampusClear – Centralized Digital Student Clearance & Service Management System

> **3rd-Year B.Tech Mini Project**
> Developed using PHP (PDO), MySQL, HTML5, CSS3 (Bootstrap 5 + Custom Glassmorphism UI), and JavaScript.

---

## 📌 Project Overview

**CampusClear** is a web-based digital clearance and college service management platform designed to replace repeated manual "No-Due" form submissions with a **continuous digital clearance status engine**. 

Instead of students submitting a new physical No-Due form every time they need hall tickets, certificates, or semester registration, the system maintains a real-time clearance status across all departments (Central Library, Accounts & Finance, Hostel Administration, Academic Departments, Research Laboratories, Examination Cell, etc.).

---

## ✨ Key Features & Technical Highlights

1. **Continuous Clearance Calculation Engine**
   - Automatically computes continuous overall clearance status (`CLEARED` vs `PENDING`).
   - If any department has unresolved dues or explicit holds, overall status remains `PENDING` with exact pending department(s) and reason(s) highlighted.

2. **Role-Based Access Control (RBAC)**
   - **Student Portal**: View live clearance status, track dues, raise disputes, submit service requests, download QR-verified digital certificates.
   - **Staff Portal**: Departmental roster view, issue dues/penalties, toggle department clearance status, approve service applications, process disputes.
   - **Admin Control Center**: System analytics with Chart.js graphs, student/staff CRUD, service rule management, clearance reports, emergency clearance overrides, immutable audit logs.

3. **Automated Eligibility Service Request Module**
   - Students apply for certificates or exam hall tickets.
   - On selecting a service, the system automatically checks required clearance conditions. If blocked, displays exact pending department reason.

4. **Digital Clearance Certificate & QR Code Verification**
   - Generates official clearance certificates with embedded QR codes pointing to `verify.php?token=...`.
   - Third-party verifiers can scan or click the QR code to validate document authenticity online.

5. **Security & Auditing**
   - Built with PHP PDO and 100% prepared statements (SQL Injection Prevention).
   - Password hashing using BCRYPT (`password_hash` & `password_verify`).
   - Immutable security audit logs recording action, entity, user ID, IP address, and timestamp.

---

## 🛠️ Technology Stack & Requirements

- **Backend**: PHP 8.x (PDO Object-Oriented Database Layer)
- **Database**: MySQL 5.7+ / 8.0+
- **Frontend**: HTML5, Modern Vanilla CSS3, Bootstrap 5, Bootstrap Icons, JavaScript (Fetch API, Chart.js, QRCode.js)
- **Development Environment**: XAMPP / WAMP / MAMP (Apache + MySQL), phpMyAdmin, VS Code

---

## 🚀 Quick Start (1-Click Run)

### Option A: Automated 1-Click Launcher (Recommended)
Simply double-click:
```
start_campusclear.bat
```
This batch script automatically:
1. Detects and verifies MySQL/MariaDB on standard port **3306** or fallback port **3307**.
2. Automatically launches the MariaDB service if not currently running.
3. Automatically launches your default browser to `http://localhost:8000/`.
4. Starts the PHP built-in web server.
5. Auto-creates `campusclear_db` and seeds tables from `database.sql` on first load if not yet initialized!

---

### Option B: Traditional XAMPP Setup
1. Copy the `campusclear` folder into `C:\xampp\htdocs\campusclear`.
2. Start **Apache** and **MySQL** from XAMPP Control Panel.
3. Open `http://localhost/campusclear/` in your browser.
4. Database self-heals automatically, or you can import `database.sql` in phpMyAdmin.

---

## 🔑 Demo Login Credentials

The login screen (`/auth/login.php`) includes **1-Click Demo Fill Buttons** for instant evaluation:

| Role | Username / Roll No | Password | Description |
|---|---|---|---|
| **System Admin** | `admin` | `Admin@123` | Master control center, analytics, emergency override, and audit logs |
| **Library Staff** | `staff_lib` | `Staff@123` | Central Library clearance and book penalty management |
| **Accounts Staff** | `staff_acc` | `Staff@123` | Tuition fees and finance clearance approvals |
| **Hostel Staff** | `staff_hst` | `Staff@123` | Hostel room clearance and damages assessment |
| **CSE Dept Staff** | `staff_cse` | `Staff@123` | Academic department clearance |
| **Exam Cell Staff** | `staff_exm` | `Staff@123` | Exam hall ticket clearance approvals |
| **Active Student** | `TU6241103111002` | `Student@123` | Student dashboard, continuous clearance monitor, dues, QR certificate |

---

## 🔒 Role-Based Access Architecture

The system enforces strict Role-Based Access Control (RBAC) across three primary operational domains:

- **Administrator Portal:** System configuration, institutional analytics, department master management, emergency overrides, and tamper-proof audit trails.
- **Department Staff Workspaces:** Dedicated role interfaces for Central Library, Accounts & Finance, Hostel Administration, Academic Departments, Central Labs, and Examination Cell.
- **Student Dashboard:** Continuous clearance tracking across all connected departments, transparent due settlement, in-portal dispute redressal, and cryptographically verified QR certificate generation.

---

## 📂 Project Directory Structure

```
campusclear/
├── config/
│   ├── app.php               # Session initialization & base URL setup
│   ├── constants.php         # Global status & role definitions
│   └── database.php          # PDO MySQL database connection
├── includes/
│   ├── auth.php              # Session checks & RBAC authorization
│   ├── audit.php             # System audit log writer
│   ├── clearance_engine.php  # Continuous clearance calculation engine
│   ├── db.php                # Database helper singleton
│   ├── functions.php         # Sanitization, CSRF & badge formatters
│   ├── header.php            # HTML layout head
│   ├── navbar.php            # Top bar with user profile & alerts
│   ├── sidebar.php           # Role-aware sidebar menu
│   └── footer.php            # Layout footer & script links
├── assets/
│   ├── css/
│   │   ├── style.css         # Glassmorphism visual design
│   │   └── bootstrap.min.css # Bootstrap 5 stylesheet
│   └── js/
│       ├── main.js           # AJAX handlers & utilities
│       ├── chart.min.js      # Chart.js library
│       └── qrcode.min.js     # QR code generator library
├── auth/
│   ├── login.php             # Unified login controller
│   ├── register.php          # Student registration controller
│   └── logout.php            # Secure logout
├── student/
│   ├── dashboard.php         # Student continuous status dashboard
│   ├── clearance_status.php  # Department-by-department status breakdown
│   ├── dues.php              # Dues list & raise dispute modal
│   ├── service_requests.php  # Service applications tracker
│   ├── new_request.php       # Apply for service with auto clearance check
│   ├── disputes.php          # Raised disputes status
│   ├── certificate.php       # Printable clearance certificate + QR code
│   ├── profile.php           # Academic profile
│   └── notifications.php     # Real-time notifications inbox
├── staff/
│   ├── dashboard.php         # Department staff portal
│   ├── students.php          # Assigned student roster
│   ├── student_detail.php    # Student record manager & status updater
│   ├── add_due.php           # Issue due/fine controller
│   ├── clearance_management.php # Batch clearance status updater
│   ├── service_requests.php  # Departmental request approval portal
│   └── disputes.php          # Review department student disputes
├── admin/
│   ├── dashboard.php         # Master analytics dashboard (Charts, KPIs)
│   ├── students.php          # Student CRUD management
│   ├── staff.php             # Staff account creation & dept assignment
│   ├── departments.php       # College departments catalog
│   ├── services.php          # Service request category rules
│   ├── dues.php              # Master dues overview & waiving
│   ├── disputes.php          # Master disputes escalation
│   ├── reports.php           # Printable reports & CSV exporter
│   ├── audit_logs.php        # Immutable security audit log inspector
│   └── override.php          # Emergency administrative clearance override
├── api/
│   ├── clearance_check.php   # JSON API for continuous clearance status
│   ├── update_status.php     # AJAX clearance toggle endpoint
│   └── notifications.php     # Unread notification count API
├── verify.php                # Public QR code certificate verification page
├── database.sql              # Database schema & initial seed data
├── index.php                 # Portal landing page
└── README.md                 # Project documentation
```

---

## 📜 License & Usage
This project was developed for educational purposes as a **3rd-year B.Tech Mini Project**. It is designed with modular architecture so it can be seamlessly expanded into a full college ERP integration system.
