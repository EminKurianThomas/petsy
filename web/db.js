const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const { randomUUID } = require('crypto');

const DB_PATH = path.join(__dirname, 'petsy.db');

let _db = null;
let _SQL = null;

async function getDb() {
  if (_db) return _db;
  _SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new _SQL.Database(fileBuffer);
  } else {
    _db = new _SQL.Database();
  }

  _db.run('PRAGMA foreign_keys = ON;');
  initSchema(_db);
  saveDb(); // initial save
  return _db;
}

function saveDb() {
  if (!_db) return;
  const data = _db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function run(sql, params = []) {
  _db.run(sql, params);
  saveDb();
}

function get(sql, params = []) {
  const stmt = _db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function all(sql, params = []) {
  const stmt = _db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function initSchema(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      active_pet_id TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      species TEXT DEFAULT 'Dog',
      breed TEXT DEFAULT '',
      gender TEXT DEFAULT 'Male',
      age TEXT DEFAULT '',
      weight REAL DEFAULT 0,
      weight_unit TEXT DEFAULT 'kg',
      color TEXT DEFAULT '#1F5C4A',
      avatar TEXT DEFAULT '',
      next_vet TEXT DEFAULT '',
      microchip TEXT DEFAULT '',
      insurance TEXT DEFAULT '',
      emergency_vet TEXT DEFAULT '',
      food_title TEXT DEFAULT 'Not set yet',
      food_desc TEXT DEFAULT 'Add feeding guidance in the pet profile.',
      exercise_title TEXT DEFAULT 'Not set yet',
      exercise_desc TEXT DEFAULT 'Add exercise guidance in the pet profile.',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS weight_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id TEXT NOT NULL,
      weight REAL NOT NULL,
      recorded_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      pet_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      cat TEXT NOT NULL DEFAULT 'vet',
      title TEXT NOT NULL,
      meta TEXT DEFAULT '',
      due_date TEXT DEFAULT '',
      recurring TEXT DEFAULT '',
      status TEXT DEFAULT 'upcoming',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      pet_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'vaccinations',
      title TEXT NOT NULL,
      meta TEXT DEFAULT '',
      doctor TEXT DEFAULT '',
      created_at INTEGER NOT NULL
    );
  `);

  // Migrate: add new columns if they don't exist (for existing DBs)
  const migrations = [
    `ALTER TABLE pets ADD COLUMN avatar TEXT DEFAULT ''`,
    `ALTER TABLE pets ADD COLUMN microchip TEXT DEFAULT ''`,
    `ALTER TABLE pets ADD COLUMN insurance TEXT DEFAULT ''`,
    `ALTER TABLE pets ADD COLUMN emergency_vet TEXT DEFAULT ''`,
    `ALTER TABLE reminders ADD COLUMN due_date TEXT DEFAULT ''`,
    `ALTER TABLE reminders ADD COLUMN recurring TEXT DEFAULT ''`,
    `ALTER TABLE records ADD COLUMN doctor TEXT DEFAULT ''`,
  ];
  for (const sql of migrations) {
    try { db.run(sql); } catch (_) { /* column already exists */ }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function hydratePet(p) {
  const weightHistory = all(
    'SELECT weight, recorded_at FROM weight_history WHERE pet_id = ? ORDER BY recorded_at ASC',
    [p.id]
  );
  return {
    id: p.id,
    userId: p.user_id,
    name: p.name,
    species: p.species,
    breed: p.breed,
    gender: p.gender,
    age: p.age,
    weight: p.weight,
    weightUnit: p.weight_unit,
    color: p.color,
    avatar: p.avatar || '',
    nextVet: p.next_vet,
    microchip: p.microchip || '',
    insurance: p.insurance || '',
    emergencyVet: p.emergency_vet || '',
    food: { title: p.food_title, desc: p.food_desc },
    exercise: { title: p.exercise_title, desc: p.exercise_desc },
    weightHistory: weightHistory.map(r => r.weight),
    weightDates: weightHistory.map(r => r.recorded_at),
    createdAt: p.created_at,
  };
}

// ─── Users ────────────────────────────────────────────────────────────────────
function getUserByEmail(email) {
  return get('SELECT * FROM users WHERE email = ?', [email]);
}
function getUserById(id) {
  return get('SELECT id, name, email, active_pet_id FROM users WHERE id = ?', [id]);
}
function createUser({ name, email, passwordHash }) {
  const id = randomUUID();
  run('INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, name, email, passwordHash, Date.now()]);
  return id;
}
function setActivePet(userId, petId) {
  run('UPDATE users SET active_pet_id = ? WHERE id = ?', [petId, userId]);
}
function updateUserName(userId, name) {
  run('UPDATE users SET name = ? WHERE id = ?', [name.trim(), userId]);
}
function getUserHash(userId) {
  const row = get('SELECT password_hash FROM users WHERE id = ?', [userId]);
  return row ? row.password_hash : null;
}
function updateUserPassword(userId, newHash) {
  run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
}

// ─── Pets ─────────────────────────────────────────────────────────────────────
function getPetsByUser(userId) {
  const pets = all('SELECT * FROM pets WHERE user_id = ? ORDER BY created_at ASC', [userId]);
  return pets.map(hydratePet);
}
function createPet(userId, pet) {
  const id = randomUUID();
  const now = Date.now();
  run(`INSERT INTO pets (id, user_id, name, species, breed, gender, age, weight, weight_unit, color, avatar,
       next_vet, microchip, insurance, emergency_vet,
       food_title, food_desc, exercise_title, exercise_desc, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, pet.name, pet.species || 'Dog', pet.breed || '', pet.gender || 'Male',
     pet.age || '', Number(pet.weight) || 0, pet.weightUnit || 'kg', pet.color || '#1F5C4A',
     pet.avatar || '',
     pet.nextVet || '', pet.microchip || '', pet.insurance || '', pet.emergencyVet || '',
     pet.foodTitle || 'Not set yet', pet.foodDesc || 'Add feeding guidance in the pet profile.',
     pet.exerciseTitle || 'Not set yet', pet.exerciseDesc || 'Add exercise guidance in the pet profile.',
     now]);
  if (pet.weight) {
    run('INSERT INTO weight_history (pet_id, weight, recorded_at) VALUES (?, ?, ?)', [id, Number(pet.weight), now]);
  }
  return id;
}
function updatePet(petId, userId, patch) {
  const colMap = {
    name: 'name', species: 'species', breed: 'breed', gender: 'gender', age: 'age',
    weight: 'weight', weightUnit: 'weight_unit', color: 'color', avatar: 'avatar',
    nextVet: 'next_vet', microchip: 'microchip', insurance: 'insurance', emergencyVet: 'emergency_vet',
    foodTitle: 'food_title', foodDesc: 'food_desc', exerciseTitle: 'exercise_title', exerciseDesc: 'exercise_desc',
  };
  const sets = [], vals = [];
  for (const [k, v] of Object.entries(patch)) {
    if (colMap[k] !== undefined) { sets.push(`${colMap[k]} = ?`); vals.push(v); }
  }
  if (!sets.length) return;
  vals.push(petId, userId);
  run(`UPDATE pets SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`, vals);
  if (patch.weight != null) {
    run('INSERT INTO weight_history (pet_id, weight, recorded_at) VALUES (?, ?, ?)', [petId, Number(patch.weight), Date.now()]);
  }
}
function deletePet(petId, userId) {
  run('DELETE FROM weight_history WHERE pet_id = ?', [petId]);
  run('DELETE FROM reminders WHERE pet_id = ?', [petId]);
  run('DELETE FROM records WHERE pet_id = ?', [petId]);
  run('DELETE FROM pets WHERE id = ? AND user_id = ?', [petId, userId]);
}
function logWeight(petId, userId, weight) {
  const pet = get('SELECT id FROM pets WHERE id = ? AND user_id = ?', [petId, userId]);
  if (!pet) throw new Error('Not found');
  run('INSERT INTO weight_history (pet_id, weight, recorded_at) VALUES (?, ?, ?)', [petId, Number(weight), Date.now()]);
  run('UPDATE pets SET weight = ? WHERE id = ?', [Number(weight), petId]);
}

// ─── Reminders ────────────────────────────────────────────────────────────────
function getRemindersByUser(userId) {
  return all('SELECT * FROM reminders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}
function createReminder(userId, r) {
  const id = randomUUID();
  run('INSERT INTO reminders (id, pet_id, user_id, cat, title, meta, due_date, recurring, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, r.petId, userId, r.cat, r.title, r.meta || '', r.dueDate || '', r.recurring || '', r.status || 'upcoming', Date.now()]);
  return id;
}
function cycleReminderStatus(id, userId) {
  const order = ['overdue', 'upcoming', 'done'];
  const r = get('SELECT status FROM reminders WHERE id = ? AND user_id = ?', [id, userId]);
  if (!r) return null;
  const idx = order.indexOf(r.status);
  const next = order[(idx + 1) % order.length];
  run('UPDATE reminders SET status = ? WHERE id = ? AND user_id = ?', [next, id, userId]);
  return next;
}
function deleteReminder(id, userId) {
  run('DELETE FROM reminders WHERE id = ? AND user_id = ?', [id, userId]);
}

// ─── Records ─────────────────────────────────────────────────────────────────
function getRecordsByUser(userId) {
  return all('SELECT * FROM records WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}
function createRecord(userId, r) {
  const id = randomUUID();
  run('INSERT INTO records (id, pet_id, user_id, type, title, meta, doctor, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, r.petId, userId, r.type, r.title, r.meta || '', r.doctor || '', Date.now()]);
  return id;
}
function deleteRecord(id, userId) {
  run('DELETE FROM records WHERE id = ? AND user_id = ?', [id, userId]);
}

module.exports = {
  getDb,
  getUserByEmail, getUserById, createUser, setActivePet, updateUserName, getUserHash, updateUserPassword,
  getPetsByUser, createPet, updatePet, deletePet, logWeight,
  getRemindersByUser, createReminder, cycleReminderStatus, deleteReminder,
  getRecordsByUser, createRecord, deleteRecord,
};
