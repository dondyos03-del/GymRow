const API = `http://${window.location.hostname}:3000/api`;

// ─── SESSION ───
function getSession() {
  try { return JSON.parse(sessionStorage.getItem('gymrow_user')) || null; }
  catch { return null; }
}

function setSession(user) {
  sessionStorage.setItem('gymrow_user', JSON.stringify(user));
}

function clearSession() {
  sessionStorage.removeItem('gymrow_user');
}

function requireAuth(redirectTo = 'login.html') {
  const user = getSession();
  if (!user || !user.email) {
    window.location.href = redirectTo;
    return null;
  }
  return user;
}

function requireProfile(user) {
  if (!user.name || !user.subscription) {
    if (!user.name) { window.location.href = 'signup-details.html'; return false; }
    if (!user.subscription) { window.location.href = 'subscription.html'; return false; }
  }
  return true;
}

// ─── API HELPERS ───
async function apiGet(path) {
  const res = await fetch(API + path);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function apiPut(path, body) {
  const res = await fetch(API + path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function apiDelete(path) {
  const res = await fetch(API + path, { method: 'DELETE' });
  return res.json();
}

// ─── UTILS ───
function calcAge(dob) {
  if (!dob) return '--';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function fmtHeight(h, unit) {
  if (!h) return '--';
  return `${h} ${unit}`;
}

function fmtWeight(w, unit) {
  if (!w) return '--';
  return `${w} ${unit}`;
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function planClass(plan) {
  if (!plan) return '';
  return plan.toLowerCase();
}

function showMsg(el, text, type = 'error') {
  el.textContent = text;
  el.className = `msg ${type}`;
}

function today() {
  return new Date().toISOString().split('T')[0];
}

const GYMS = [
  'Fitness Time',
  'Leejam Sports',
  'NuYu Fitness',
  'Gold\'s Gym',
  'Flex Gym',
  'Body Masters',
  'Armah Sports',
  'Champion Fitness',
  'Arena Fitness',
  'Hybrid Gym',
  'The Zone Gym',
  'Other'
];
