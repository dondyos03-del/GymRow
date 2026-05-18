const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory and db.json exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
}

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Check if user exists
app.post('/api/check-user', (req, res) => {
  const { email } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email.toLowerCase());
  res.json({ exists: !!user });
});

// Sign up (create user)
app.post('/api/signup', (req, res) => {
  const { email } = req.body;
  const db = readDB();
  if (db.users.find(u => u.email === email.toLowerCase())) {
    return res.status(400).json({ error: 'This account already exists.' });
  }
  const newUser = {
    email: email.toLowerCase(),
    name: null,
    dob: null,
    height: null,
    heightUnit: 'cm',
    weight: null,
    weightUnit: 'kg',
    gym: null,
    subscription: null,
    splits: [],
    nutrition: []
  };
  db.users.push(newUser);
  writeDB(db);
  res.json({ success: true, user: newUser });
});

// Login
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'You need to sign up first.' });
  }
  res.json({ success: true, user });
});

// Update user profile
app.put('/api/user/:email', (req, res) => {
  const email = req.params.email.toLowerCase();
  const updates = req.body;
  const db = readDB();
  const idx = db.users.findIndex(u => u.email === email);
  if (idx === -1) return res.status(404).json({ error: 'User not found.' });
  db.users[idx] = { ...db.users[idx], ...updates };
  writeDB(db);
  res.json({ success: true, user: db.users[idx] });
});

// Get user
app.get('/api/user/:email', (req, res) => {
  const email = req.params.email.toLowerCase();
  const db = readDB();
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user });
});

// Add exercise
app.post('/api/user/:email/exercises', (req, res) => {
  const email = req.params.email.toLowerCase();
  const exercise = req.body;
  const db = readDB();
  const idx = db.users.findIndex(u => u.email === email);
  if (idx === -1) return res.status(404).json({ error: 'User not found.' });
  exercise.id = Date.now().toString();
  exercise.sets = exercise.sets || [];
  db.users[idx].exercises.push(exercise);
  writeDB(db);
  res.json({ success: true, exercise });
});

// Update exercise
app.put('/api/user/:email/exercises/:exId', (req, res) => {
  const email = req.params.email.toLowerCase();
  const { exId } = req.params;
  const updates = req.body;
  const db = readDB();
  const idx = db.users.findIndex(u => u.email === email);
  if (idx === -1) return res.status(404).json({ error: 'User not found.' });
  const exIdx = db.users[idx].exercises.findIndex(e => e.id === exId);
  if (exIdx === -1) return res.status(404).json({ error: 'Exercise not found.' });
  db.users[idx].exercises[exIdx] = { ...db.users[idx].exercises[exIdx], ...updates };
  writeDB(db);
  res.json({ success: true, exercise: db.users[idx].exercises[exIdx] });
});

// Delete exercise
app.delete('/api/user/:email/exercises/:exId', (req, res) => {
  const email = req.params.email.toLowerCase();
  const { exId } = req.params;
  const db = readDB();
  const idx = db.users.findIndex(u => u.email === email);
  if (idx === -1) return res.status(404).json({ error: 'User not found.' });
  db.users[idx].exercises = db.users[idx].exercises.filter(e => e.id !== exId);
  writeDB(db);
  res.json({ success: true });
});

// Add nutrition entry
app.post('/api/user/:email/nutrition', (req, res) => {
  const email = req.params.email.toLowerCase();
  const entry = req.body;
  const db = readDB();
  const idx = db.users.findIndex(u => u.email === email);
  if (idx === -1) return res.status(404).json({ error: 'User not found.' });
  entry.id = Date.now().toString();
  entry.date = entry.date || new Date().toISOString().split('T')[0];
  db.users[idx].nutrition.push(entry);
  writeDB(db);
  res.json({ success: true, entry });
});

// Delete nutrition entry
app.delete('/api/user/:email/nutrition/:entryId', (req, res) => {
  const email = req.params.email.toLowerCase();
  const { entryId } = req.params;
  const db = readDB();
  const idx = db.users.findIndex(u => u.email === email);
  if (idx === -1) return res.status(404).json({ error: 'User not found.' });
  db.users[idx].nutrition = db.users[idx].nutrition.filter(n => n.id !== entryId);
  writeDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`GymRow server running at http://localhost:${PORT}`);
});