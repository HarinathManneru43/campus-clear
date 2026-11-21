const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'campusclear_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Clear all dues for TU6241103111020 (BEZAWADA ANJANA, student_id: 9)
const s20 = data.students.find(s => s.roll_number === 'TU6241103111020');
if (s20) {
    // Settle all dues
    data.dues.forEach(d => {
        if (d.student_id === s20.id) {
            d.status = 'settled';
        }
    });

    // Set all 5 departments to cleared
    data.clearance_status.forEach(cs => {
        if (cs.student_id === s20.id) {
            cs.status = 'cleared';
            cs.remarks = 'All requirements verified & approved (Dues fully settled)';
            cs.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }
    });

    console.log(`Cleared all dues and holds for ${s20.roll_number} - ${s20.full_name}`);
}

// 2. Add fine for 085 (TU6241103111085 - MAMILLAPALLI ASHRITH CHOWDARY, student_id: 30)
const s85 = data.students.find(s => s.roll_number === 'TU6241103111085');
if (s85) {
    const nextDueId = data.dues.length > 0 ? Math.max(...data.dues.map(d => d.id)) + 1 : 1;
    data.dues.push({
        id: nextDueId,
        student_id: s85.id,
        department_id: 1, // Central Library
        title: "Library Overdue Book Fine",
        description: "Pattern Recognition and Machine Learning (Bishop) overdue by 14 days",
        amount: 350.00,
        status: "pending",
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });

    const cs85 = data.clearance_status.find(cs => cs.student_id === s85.id && cs.department_id === 1);
    if (cs85) {
        cs85.status = 'pending';
        cs85.remarks = 'Library: Overdue reference book and fine pending return';
        cs85.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }
    console.log(`Issued fine for ${s85.roll_number} - ${s85.full_name}`);
}

// 3. Add fine for 086 (TU6241103111086 - MANDATI NAVANEETH, student_id: 31)
const s86 = data.students.find(s => s.roll_number === 'TU6241103111086');
if (s86) {
    const nextDueId = data.dues.length > 0 ? Math.max(...data.dues.map(d => d.id)) + 1 : 1;
    data.dues.push({
        id: nextDueId,
        student_id: s86.id,
        department_id: 2, // Accounts & Finance
        title: "Semester V AI Computing Lab Fee Balance",
        description: "Deep Learning Lab equipment usage surcharge balance",
        amount: 500.00,
        status: "pending",
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });

    const cs86 = data.clearance_status.find(cs => cs.student_id === s86.id && cs.department_id === 2);
    if (cs86) {
        cs86.status = 'pending';
        cs86.remarks = 'Accounts: Lab maintenance fee surcharge pending settlement';
        cs86.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }
    console.log(`Issued fine for ${s86.roll_number} - ${s86.full_name}`);
}

// Add audit log
const nextAuditId = data.audit_logs.length > 0 ? Math.max(...data.audit_logs.map(a => a.id)) + 1 : 1;
data.audit_logs.unshift({
    id: nextAuditId,
    user_id: 1,
    action: "DUES_UPDATE",
    entity_type: "STUDENTS",
    details: "Cleared all dues for TU6241103111020 (Anjana). Issued fine ₹350 for TU6241103111085 (Ashrith) and ₹500 for TU6241103111086 (Navaneeth).",
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log("Successfully updated database!");

