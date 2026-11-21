const fs = require('fs');
const path = require('path');

const rawStudents = [
  { reg: "TU6241103111002", name: "AJAY N" },
  { reg: "TU6241103111003", name: "AKILAN R" },
  { reg: "TU6241103111004", name: "AKULA HEMANTH KUMAR" },
  { reg: "TU6241103111005", name: "AMUL VIZHI P" },
  { reg: "TU6241103111006", name: "ANANDARAJ T" },
  { reg: "TU6241103111009", name: "ARIVUSELVAN S" },
  { reg: "TU6241103111010", name: "ASHIP ALI A" },
  { reg: "TU6241103111017", name: "BANDI HEMANTH KUMAR" },
  { reg: "TU6241103111020", name: "BEZAWADA ANJANA" },
  { reg: "TU6241103111021", name: "BHAVANA R" },
  { reg: "TU6241103111024", name: "BOJARAJAN S" },
  { reg: "TU6241103111026", name: "BOMMINENI MOHAN KRISHNA" },
  { reg: "TU6241103111030", name: "C THEJAVARSHINI" },
  { reg: "TU6241103111034", name: "DESAM RITHIKA REDDY" },
  { reg: "TU6241103111035", name: "DHANALAKSHMI K" },
  { reg: "TU6241103111038", name: "DHIVYA S" },
  { reg: "TU6241103111040", name: "DONTHIREDDY VENKATA TEJENDRA REDDY" },
  { reg: "TU6241103111042", name: "DUVVURU SRUJAN KUMAR REDDY" },
  { reg: "TU6241103111043", name: "ELANGOVAN M" },
  { reg: "TU6241103111051", name: "GOPIKA" },
  { reg: "TU6241103111052", name: "GOWDA ANITHA" },
  { reg: "TU6241103111053", name: "GOWTHAM S" },
  { reg: "TU6241103111057", name: "HARIRAJAN K S" },
  { reg: "TU6241103111058", name: "HEMANATH J" },
  { reg: "TU6241103111059", name: "IYYANAR R" },
  { reg: "TU6241103111060", name: "JUVVALAGUNTA MOURYA HARSHA VARDHAN" },
  { reg: "TU6241103111061", name: "KALIKIRI NAVANTH REDDY" },
  { reg: "TU6241103111073", name: "KONATHALAPALLI VENKATA GNANATEJA" },
  { reg: "TU6241103111078", name: "KUMMARA SIVABANU" },
  { reg: "TU6241103111085", name: "MAMILLAPALLI ASHRITH CHOWDARY" },
  { reg: "TU6241103111086", name: "MANDATI NAVANEETH" },
  { reg: "TU6241103111088", name: "MANNERU HARINATH" },
  { reg: "TU6241103111093", name: "MARZEENA R G" },
  { reg: "TU6241103111100", name: "MUDI KAVYA" },
  { reg: "TU6241103111101", name: "MUKKELLA RAVITEJA" },
  { reg: "TU6241103111103", name: "NAKKANI VENKATA SAI TARUN" },
  { reg: "TU6241103111105", name: "NIRMAL KUMAR S" },
  { reg: "TU6241103111109", name: "P USHA SREE" },
  { reg: "TU6241103111116", name: "PAWAR BAVESH KUMAR" },
  { reg: "TU6241103111119", name: "PITTA SAI SUNANDH KUMAR" },
  { reg: "TU6241103111123", name: "RAGAVI V" },
  { reg: "TU6241103111124", name: "RAGUNATHAN S" },
  { reg: "TU6241103111126", name: "RANJAN N" },
  { reg: "TU6241103111128", name: "RAVELLA VENKATA NAGA BAJI PAVAN KUMAR" },
  { reg: "TU6241103111134", name: "SAMRAJ R" },
  { reg: "TU6241103111135", name: "SANTHA PRAKASH E" },
  { reg: "TU6241103111138", name: "SASMITHA SREE B" },
  { reg: "TU6241103111141", name: "SHAIK KHALEELBASHA" },
  { reg: "TU6241103111146", name: "SIVASANKAR G" },
  { reg: "TU6241103111149", name: "SUSINDHAR S" },
  { reg: "TU6241103111152", name: "THALASILA NANDINI" },
  { reg: "TU6241103111154", name: "THILAGA P" },
  { reg: "TU6241103111163", name: "VARTHA SARAVANA" },
  { reg: "TU6241103111166", name: "VEMULA KULAVARDHAN" },
  { reg: "TU6241103111174", name: "ANUSHKA S" },
  { reg: "TU6241103111175", name: "CHANDRAPRASAD K" },
  { reg: "TU6241103111176", name: "O G DEVARAJ" },
  { reg: "TU6241103111179", name: "DUGGISETTY KAMALESH" },
  { reg: "TU6241103111181", name: "NELLORE ADITHYA" },
  { reg: "TU6241103111183", name: "SAKTHI VISHAL I" },
  { reg: "TU6241103111186", name: "CHELLOJU MOKSHAGNYA" },
  { reg: "TU6241103111190", name: "SREERAM B" }
];

const departments = [
  { id: 1, name: "Central University Library", code: "LIB", description: "Central repository of books, journals, and lending catalog.", is_active: 1 },
  { id: 2, name: "Accounts & Student Finance", code: "ACC", description: "Tuition, hostel dues, laboratory fees, and scholarship clearance.", is_active: 1 },
  { id: 3, name: "Hostel & Residential Board", code: "HST", description: "Student hostel room allotments, room inventory, and mess dues.", is_active: 1 },
  { id: 4, name: "Artificial Intelligence & Data Science", code: "AIDS", description: "HOD: Dr. M Senthil - Academic department clearance, labs & Mini Project-II sign-offs.", is_active: 1 },
  { id: 5, name: "Examination Cell & Registrar", code: "EXM", description: "Admit cards, hall ticket clearance, and provisional degree approvals.", is_active: 1 }
];

const subjects = [
  { code: "U24MAT501", name: "Numerical Method", short: "NM", faculty: "Dr. D. Senthil Kumar" },
  { code: "U24CEB501", name: "Computer Networks", short: "CN", faculty: "Mrs. Dhanusree" },
  { code: "U24CET502", name: "Theory of Computation", short: "TOC", faculty: "Dr. R. Vinodha" },
  { code: "U24ADB565", name: "Deep Learning", short: "DL", faculty: "IBM Staff-2" },
  { code: "U24ADT521", name: "Responsible AI", short: "RA", faculty: "Dr. M. Senthil" },
  { code: "U24BAT567", name: "Theory and Practise of Entrepreneurship", short: "TPE", faculty: "Ms. Lakshmi Priya" },
  { code: "GE-III", name: "Generic Elective-III", short: "GE-III", faculty: "Faculty Coordinator" },
  { code: "SEM", name: "Seminar", short: "SEM", faculty: "Mr. Sandip Mondal" },
  { code: "U24CSW501", name: "Mini Project-II", short: "MP-II", faculty: "Dr. M. Senthil" },
  { code: "LAB-CN", name: "Computer Networks Lab", short: "CN LAB", faculty: "Mrs. M. Subathra & Dr. R. Aruna Kirithika" }
];

const periodTimings = [
  { period: "Period 1", time: "9:30 - 10:20" },
  { period: "Period 2", time: "10:20 - 11:10" },
  { period: "Interval", time: "11:10 - 11:20" },
  { period: "Period 3", time: "11:20 - 12:10" },
  { period: "Period 4", time: "12:10 - 1:00" },
  { period: "Lunch Break", time: "1:00 - 1:50" },
  { period: "Period 5", time: "1:50 - 2:30" },
  { period: "Period 6", time: "2:30 - 3:10" },
  { period: "Interval", time: "3:10 - 3:20" },
  { period: "Period 7", time: "3:20 - 4:00" },
  { period: "Period 8", time: "4:00 - 4:40" }
];

const timetable = {
  MONDAY: ["RA", "TPE", "CN", "TOC", "CN LAB", "CN LAB", "NM", "TOC"],
  TUESDAY: ["NM", "CN", "TPE", "TOC", "RA", "TOC", "TPE", "DL"],
  WEDNESDAY: ["TOC", "NM", "DL", "CN", "TPE", "RA", "DL", "TPE"],
  THURSDAY: ["DL", "MP-II", "MP-II", "MP-II", "RA", "NM", "SEM", "DL"],
  FRIDAY: ["NM", "RA", "NM", "TOC", "DL", "DL", "CN", "RA"]
};

const users = [
  { id: 1, username: "admin", email: "admin@takshashilauniv.ac.in", role: "admin", status: "active", password_plain: "Admin@123", full_name: "Takshashila Admin Portal" },
  { id: 2, username: "staff_lib", email: "library@takshashilauniv.ac.in", role: "staff", status: "active", password_plain: "Staff@123", full_name: "Dr. Arvind Rao (Central Library)" },
  { id: 3, username: "staff_acc", email: "accounts@takshashilauniv.ac.in", role: "staff", status: "active", password_plain: "Staff@123", full_name: "Mrs. Sunita Verma (Accounts)" },
  { id: 4, username: "staff_hst", email: "hostel@takshashilauniv.ac.in", role: "staff", status: "active", password_plain: "Staff@123", full_name: "Col. R. S. Rathore (Hostel Warden)" },
  { id: 5, username: "staff_aids", email: "senthil.m@takshashilauniv.ac.in", role: "staff", status: "active", password_plain: "Staff@123", full_name: "Dr. M Senthil (HOD AIDS)" },
  { id: 6, username: "staff_exm", email: "exam@takshashilauniv.ac.in", role: "staff", status: "active", password_plain: "Staff@123", full_name: "Dr. M. K. Sharma (Exam Cell)" }
];

const staff = [
  { id: 1, user_id: 2, staff_code: "STF-LIB-01", full_name: "Dr. Arvind Rao", email: "library@takshashilauniv.ac.in", phone: "9876543210", department_id: 1, designation: "Chief Librarian" },
  { id: 2, user_id: 3, staff_code: "STF-ACC-01", full_name: "Mrs. Sunita Verma", email: "accounts@takshashilauniv.ac.in", phone: "9876543211", department_id: 2, designation: "Senior Accounts Officer" },
  { id: 3, user_id: 4, staff_code: "STF-HST-01", full_name: "Col. R. S. Rathore", email: "hostel@takshashilauniv.ac.in", phone: "9876543212", department_id: 3, designation: "Chief Warden" },
  { id: 4, user_id: 5, staff_code: "STF-AIDS-01", full_name: "Dr. M Senthil", email: "senthil.m@takshashilauniv.ac.in", phone: "9876543213", department_id: 4, designation: "HOD - AI & Data Science" },
  { id: 5, user_id: 6, staff_code: "STF-EXM-01", full_name: "Dr. M. K. Sharma", email: "exam@takshashilauniv.ac.in", phone: "9876543214", department_id: 5, designation: "Controller of Examinations" }
];

let nextUserId = 100;
let studentIdSeq = 1;
let clearanceIdSeq = 1;
let duesIdSeq = 1;

const students = [];
const clearance_status = [];
const dues = [];

rawStudents.forEach((st, idx) => {
  const uId = nextUserId++;
  const sId = studentIdSeq++;
  const emailName = st.name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
  const email = `${emailName}@takshashilauniv.ac.in`;

  users.push({
    id: uId,
    username: st.reg,
    email: email,
    role: "student",
    status: "active",
    password_plain: "Student@123",
    full_name: st.name
  });

  students.push({
    id: sId,
    user_id: uId,
    roll_number: st.reg,
    full_name: st.name,
    email: email,
    phone: "98" + String(10000000 + idx),
    department_id: 4, // AIDS
    batch: "2022-2026",
    semester: 5,
    cgpa: (7.80 + ((idx * 31) % 21) / 10).toFixed(2)
  });

  // Assign clearance status for all 5 departments
  departments.forEach(dept => {
    let status = 'cleared';
    let remarks = 'All requirements verified & approved';

    // A few students have realistic pending dues:
    if (idx === 0 && dept.id === 1) { // Ajay N
      status = 'pending';
      remarks = 'Library: "Computer Networks (Tanenbaum)" 14 days overdue';
    } else if (idx === 3 && dept.id === 2) { // Amul Vizhi P
      status = 'pending';
      remarks = 'Accounts: Lab Maintenance fee unpaid';
    } else if (idx === 8 && dept.id === 3) { // Bezawada Anjana
      status = 'pending';
      remarks = 'Hostel: Mess dues pending reconciliation';
    } else if (idx === 15 && dept.id === 1) { // Dhivya S
      status = 'pending';
      remarks = 'Library: Reference Journal return pending';
    } else if (idx === 25 && dept.id === 4) { // Juvvalagunta Mourya
      status = 'pending';
      remarks = 'AIDS Dept: Mini Project-II phase 1 report sign-off required';
    }

    clearance_status.push({
      id: clearanceIdSeq++,
      student_id: sId,
      department_id: dept.id,
      status: status,
      remarks: remarks,
      updated_at: "2026-11-20 10:00:00"
    });
  });

  if (idx === 0) {
    dues.push({
      id: duesIdSeq++,
      student_id: sId,
      department_id: 1,
      title: "Library Book Overdue Fine",
      description: "Book 'Computer Networks (Tanenbaum)' returned 14 days late.",
      amount: 280.00,
      status: "pending",
      created_at: "2026-11-15 09:30:00"
    });
  } else if (idx === 3) {
    dues.push({
      id: duesIdSeq++,
      student_id: sId,
      department_id: 2,
      title: "Semester V Lab Maintenance Fee",
      description: "Cloud and Deep Learning Lab equipment fee balance.",
      amount: 750.00,
      status: "pending",
      created_at: "2026-11-16 11:20:00"
    });
  } else if (idx === 8) {
    dues.push({
      id: duesIdSeq++,
      student_id: sId,
      department_id: 3,
      title: "Hostel Mess Maintenance Balance",
      description: "Room 304 mess utility maintenance.",
      amount: 400.00,
      status: "pending",
      created_at: "2026-11-17 14:15:00"
    });
  } else if (idx === 15) {
    dues.push({
      id: duesIdSeq++,
      student_id: sId,
      department_id: 1,
      title: "Reference Journal Retention Surcharge",
      description: "IEEE Transactions journal overdue fine.",
      amount: 150.00,
      status: "pending",
      created_at: "2026-11-18 10:00:00"
    });
  }
});

const disputes = [
  {
    id: 1,
    student_id: 1,
    due_id: 1,
    department_id: 1,
    subject: "Contesting overdue calculation",
    description: "Book was placed in the central drop-box during weekend holiday.",
    status: "open",
    resolution_remarks: "",
    created_at: "2026-11-18 11:30:00"
  }
];

const service_categories = [
  { id: 1, name: "Bonafide Clearance Certificate", description: "Official institutional bonafide document confirming full zero-dues clearance.", requires_full_clearance: 1, is_active: 1 },
  { id: 2, name: "End-Semester Exam Hall Ticket", description: "Admit card clearance for upcoming university semester examinations.", requires_full_clearance: 1, is_active: 1 },
  { id: 3, name: "Institutional ID Card Re-issuance", description: "Application for replacement of lost, worn, or damaged RFID campus card.", requires_full_clearance: 0, is_active: 1 },
  { id: 4, name: "Official University Transcript", description: "Complete attested academic transcript issued to alumni or graduating seniors.", requires_full_clearance: 1, is_active: 1 },
  { id: 5, name: "Library Caution Deposit Refund", description: "Reconciliation and return of cautionary deposit at graduation or withdrawal.", requires_full_clearance: 1, is_active: 1 }
];

// Student index 31 is MANNERU HARINATH (TU6241103111088, student_id = 32)
const service_requests = [
  {
    id: 1,
    request_number: "REQ-TU-2026-8801",
    student_id: 32,
    service_id: 2,
    purpose: "End-Semester Examinations V Semester Hall Ticket",
    status: "approved",
    clearance_snapshot: "cleared",
    qr_token: "CERT-TU6241103111088-CLEAR",
    created_at: "2026-11-20 10:15:00"
  },
  {
    id: 2,
    request_number: "REQ-TU-2026-8802",
    student_id: 32,
    service_id: 1,
    purpose: "Internship & Project Verification Document",
    status: "approved",
    clearance_snapshot: "cleared",
    qr_token: "CERT-TU6241103111088-BONAFIDE",
    created_at: "2026-11-20 11:45:00"
  },
  {
    id: 3,
    request_number: "REQ-TU-2026-8803",
    student_id: 1,
    service_id: 1,
    purpose: "Scholarship verification",
    status: "in_progress",
    clearance_snapshot: "pending",
    qr_token: "REQ-TU6241103111002-PENDING",
    created_at: "2026-11-21 09:00:00"
  }
];

const audit_logs = [
  { id: 1, user_id: 1, action: "SYSTEM_INITIALIZATION", entity_type: "SYSTEM", details: "Takshashila University AIDS Dept V Semester Platform Initialized", created_at: "2026-11-21 14:00:00" },
  { id: 2, user_id: 5, action: "STAFF_REGISTRATION", entity_type: "STAFF", details: "Dr. M Senthil registered as HOD AIDS and Mini Project-II Lead", created_at: "2026-11-21 14:05:00" },
  { id: 3, user_id: 1, action: "BATCH_ENROLLMENT", entity_type: "STUDENTS", details: "Imported 62 students for Batch 2022-2026 V Semester AIDS", created_at: "2026-11-21 14:10:00" }
];

const database = {
  college_name: "Takshashila University",
  department_name: "Artificial Intelligence & Data Science (AIDS)",
  hod: "Dr. M Senthil",
  semester: "V Semester",
  departments,
  subjects,
  periodTimings,
  timetable,
  users,
  staff,
  students,
  clearance_status,
  dues,
  disputes,
  service_categories,
  service_requests,
  audit_logs
};

fs.writeFileSync(path.join(__dirname, 'campusclear_data.json'), JSON.stringify(database, null, 2), 'utf8');
console.log(`Generated database: ${students.length} students, ${users.length} users, ${departments.length} departments, ${subjects.length} subjects.`);
