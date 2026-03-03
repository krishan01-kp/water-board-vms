const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'vms.db');

let db = null;

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      driver_name TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_type TEXT NOT NULL,
      vehicle_number TEXT UNIQUE NOT NULL,
      driver_name TEXT NOT NULL,
      photo_path TEXT,
      status TEXT NOT NULL DEFAULT 'operational',
      created_at DATETIME DEFAULT (datetime('now'))
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS breakdowns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER,
      vehicle_number TEXT NOT NULL,
      vehicle_type TEXT NOT NULL,
      location TEXT NOT NULL,
      comment TEXT,
      reported_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT (datetime('now')),
      resolved_at DATETIME
    );
  `);

  // Seed admin
  const adminRows = db.exec("SELECT id FROM users WHERE username = 'admin'");
  if (!adminRows.length || !adminRows[0].values.length) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run('INSERT INTO users (username, password, role, driver_name) VALUES (?, ?, ?, ?)',
      ['admin', hashedPassword, 'admin', 'Administrator']);
    console.log('✅ Admin user seeded: admin / admin123');
  }

  // Seed sample vehicles
  const vehicleRows = db.exec('SELECT COUNT(*) as count FROM vehicles');
  const count = vehicleRows[0].values[0][0];
  if (count === 0) {
    db.run("INSERT INTO vehicles (vehicle_type, vehicle_number, driver_name, status) VALUES ('Water Tanker','WB-1001','Kamal Perera','operational')");
    db.run("INSERT INTO vehicles (vehicle_type, vehicle_number, driver_name, status) VALUES ('Truck','WB-1002','Nimal Silva','operational')");
    db.run("INSERT INTO vehicles (vehicle_type, vehicle_number, driver_name, status) VALUES ('Van','WB-1003','Sunil Fernando','breakdown')");
    console.log('✅ Sample vehicles seeded');
  }

  saveDb();
  console.log('✅ Database initialized');
  return db;
}

// Helper: run a SELECT and return array of objects
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helper: run INSERT/UPDATE/DELETE and return lastInsertRowid + changes
function run(sql, params = []) {
  db.run(sql, params);
  const result = db.exec('SELECT last_insert_rowid() as id, changes() as changes');
  const id = result[0]?.values[0][0];
  const changes = result[0]?.values[0][1];
  saveDb();
  return { lastInsertRowid: id, changes };
}

// Helper: get single row
function get(sql, params = []) {
  const rows = query(sql, params);
  return rows[0] || null;
}

module.exports = { initDb, query, run, get, saveDb };
