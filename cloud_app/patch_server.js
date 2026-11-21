const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'server.js');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Update loadDb to force reload if needed or always read from disk
const oldLoadDb = `let db = null;
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
}`;

const newLoadDb = `let db = null;
function loadDb(force = false) {
    if (db && !force) return db;
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
}`;

content = content.replace(oldLoadDb, newLoadDb);
console.log("Updated loadDb");

