/* ═══════════════════════════════════════════════════════════════════════════
   PETSY — Single Page Application v2.0
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

// ─── Utilities ────────────────────────────────────────────────────────────────
var esc = window.esc = window.esc || function(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  user: null,
  pets: [],
  reminders: [],
  records: [],
  documents: [],
  activePetId: null,
  currentPage: 'home',
};

const PET_PALETTE = ['#1B5E47', '#FF6B35', '#3B6EA5', '#9B5CBF', '#C9772B', '#2E8B57', '#D44F7A', '#1A8FAA'];

const PET_EMOJIS = ['🐶', '🐱', '🐰', '🐹', '🦜', '🐠', '🐍', '🦎', '🐢', '🐾', '🦮', '🐈', '🐇', '🦙', '🐴', '🦆'];

const CATEGORY_META = {
  vaccine:  { icon: '💉', bg: 'var(--primary-tint)', fg: 'var(--primary-deep)', label: 'Vaccine' },
  med:      { icon: '💊', bg: 'var(--gold-tint)',    fg: '#8A5A10',             label: 'Medication' },
  groom:    { icon: '✂️', bg: 'var(--accent-tint)',  fg: 'var(--accent-deep)',  label: 'Grooming' },
  vet:      { icon: '🩺', bg: 'var(--primary-tint)', fg: 'var(--primary-deep)', label: 'Vet Visit' },
  deworm:   { icon: '🪱', bg: 'var(--gold-tint)',    fg: '#8A5A10',             label: 'Deworming' },
  dental:   { icon: '🦷', bg: 'var(--teal-tint)',    fg: 'var(--teal)',         label: 'Dental' },
  flea:     { icon: '🦟', bg: 'var(--purple-tint)',  fg: 'var(--purple)',       label: 'Flea/Tick' },
};

const RECORD_TYPES = [
  { key: 'vaccinations', label: '💉 Vaccines' },
  { key: 'prescriptions', label: '💊 Meds' },
  { key: 'treatments', label: '🩺 Treatments' },
  { key: 'allergies', label: '⚠️ Allergies' },
  { key: 'documents', label: '📁 Documents & Photos' },
];

// ─── Theme ────────────────────────────────────────────────────────────────────
function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
  } else if (theme === 'light') {
    html.setAttribute('data-theme', 'light');
  } else {
    // System
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  localStorage.setItem('petsy-theme', theme);
}

function getTheme() {
  return localStorage.getItem('petsy-theme') || 'light';
}

// Apply saved theme immediately
applyTheme(getTheme());

/* ═══════════════════════════════════════════════════════════════════════════
   KUTTO ANIMATION ENGINE — Petsy Edition
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Scroll Reveal Observer ───────────────────────────────────────────────────
const _revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      _revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

function observeReveals(root = document) {
  root.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
      .forEach(el => _revealObserver.observe(el));
}

// ─── Staggered Page Content Animator ─────────────────────────────────────────
// Call after rendering a page container to stagger-animate child elements.
function animatePageIn(container) {
  if (!container) return;
  // Mark direct notable children for staggered reveal
  const items = container.querySelectorAll(
    '.card, .quick-stat, .quick-action-btn, .pet-chip, ' +
    '.reminder-item, .record-item, .activity-item, ' +
    '.stat-card, .guide-card, .passport-card, ' +
    '.page-header, .pet-switcher, .section-head, .section-title'
  );
  items.forEach((el, i) => {
    if (el.dataset.animated) return; // don't re-animate
    el.dataset.animated = '1';
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    el.style.transitionDelay = `${Math.min(i * 55, 500)}ms`;
    // Trigger reflow then animate
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });
  // Also observe any .reveal classes inside
  observeReveals(container);
}

// ─── Ripple Effect on Buttons ─────────────────────────────────────────────────
function addRipple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const ripple = document.createElement('span');
  ripple.className = 'ripple-wave';
  ripple.style.left = `${x}px`;
  ripple.style.top  = `${y}px`;
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

function attachRipples(root = document) {
  root.querySelectorAll('.btn-primary, .btn-accent, .btn-ripple').forEach(btn => {
    if (btn.dataset.ripple) return;
    btn.dataset.ripple = '1';
    btn.classList.add('btn-ripple');
    btn.addEventListener('click', addRipple);
  });
}

// ─── Bottom Nav Active Bounce ─────────────────────────────────────────────────
function triggerNavBounce(page) {
  const bnavId = `bnav-${page}`;
  const el = document.getElementById(bnavId);
  if (!el) return;
  // Re-trigger animation by removing then re-adding active class
  el.classList.remove('active');
  void el.offsetWidth; // reflow
  el.classList.add('active');
}

// ─── Page Transition Hook (called from navigate) ──────────────────────────────
function onPageRendered(page) {
  const container = document.getElementById(`page-${page}`);
  if (container) {
    // Small delay to let innerHTML paint first
    requestAnimationFrame(() => animatePageIn(container));
    attachRipples(container);
  }
  triggerNavBounce(page);
  attachRipples(); // catch any top-level btns too
}

// ─── API ──────────────────────────────────────────────────────────────────────
async function api(method, url, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const API = {
  me:              ()          => api('GET',    '/api/auth/me'),
  login:           (b)        => api('POST',   '/api/auth/login', b),
  register:        (b)        => api('POST',   '/api/auth/register', b),
  logout:          ()         => api('POST',   '/api/auth/logout'),
  updateProfile:   (b)        => api('PATCH',  '/api/auth/profile', b),
  changePassword:  (b)        => api('POST',   '/api/auth/change-password', b),
  getPets:         ()         => api('GET',    '/api/pets'),
  createPet:       (b)        => api('POST',   '/api/pets', b),
  updatePet:       (id, b)    => api('PUT',    `/api/pets/${id}`, b),
  deletePet:       (id)       => api('DELETE', `/api/pets/${id}`),
  logWeight:       (id, w)    => api('POST',   `/api/pets/${id}/weight`, { weight: w }),
  setActivePet:    (id)       => api('POST',   '/api/pets/active', { petId: id }),
  getReminders:    ()         => api('GET',    '/api/reminders'),
  createReminder:  (b)        => api('POST',   '/api/reminders', b),
  cycleReminder:   (id)       => api('PATCH',  `/api/reminders/${id}/cycle`),
  deleteReminder:  (id)       => api('DELETE', `/api/reminders/${id}`),
  getRecords:      ()         => api('GET',    '/api/records'),
  createRecord:    (b)        => api('POST',   '/api/records', b),
  deleteRecord:    (id)       => api('DELETE', `/api/records/${id}`),
  getDocuments:    (petId)    => api('GET',    '/api/documents' + (petId ? `?petId=${petId}` : '')),
  uploadDocument:  (b)        => api('POST',   '/api/documents', b),
  updateDocument:  (id, b)    => api('PUT',    `/api/documents/${id}`, b),
  deleteDocument:  (id)       => api('DELETE', `/api/documents/${id}`),
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<div class="toast-icon">${icons[type]}</div><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── Modal ────────────────────────────────────────────────────────────────────
let _modalEl = null;
let _modalSaveFn = null;

function openModal(title, bodyHtml, onSave, saveLabel = 'Save') {
  closeModal();
  const el = document.createElement('div');
  el.className = 'modal-overlay';
  el.id = 'active-modal';
  el.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="modal-header">
        <span class="modal-title">${title}</span>
        <button class="modal-close" onclick="closeModal()" aria-label="Close">✕</button>
      </div>
      <div class="modal-body" id="modal-body">
        ${bodyHtml}
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" style="flex:1" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" style="flex:2" id="modal-save-btn" onclick="modalSave()">${saveLabel}</button>
      </div>
    </div>`;
  document.getElementById('modals').appendChild(el);
  _modalEl = el;
  _modalSaveFn = onSave;

  el.addEventListener('click', (e) => { if (e.target === el) closeModal(); });
  setTimeout(() => {
    const inp = el.querySelector('input:not([type="hidden"]), select, textarea');
    if (inp) inp.focus();
  }, 80);
}

async function modalSave() {
  if (!_modalSaveFn) return;
  const btn = document.getElementById('modal-save-btn');
  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-block;animation:spin 0.7s linear infinite;margin-right:6px">⟳</span>Saving…';
  try {
    await _modalSaveFn();
  } catch(e) {
    showToast(e.message || 'Failed to save', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save'; }
  }
}

function closeModal() {
  if (_modalEl) { _modalEl.remove(); _modalEl = null; }
  _modalSaveFn = null;
}

// ─── Auth Validation Helpers ──────────────────────────────────────────────────
function validateEmailField(input) {
  const errId = input.id === 'login-email' ? 'login-email-err' : 'reg-email-err';
  const errEl = document.getElementById(errId);
  if (!errEl) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (input.value && !emailRegex.test(input.value)) {
    input.classList.add('error');
    input.classList.remove('success-field');
    errEl.textContent = 'Please enter a valid email address';
    errEl.style.display = 'block';
    return false;
  } else if (input.value) {
    input.classList.remove('error');
    input.classList.add('success-field');
    errEl.style.display = 'none';
    return true;
  } else {
    input.classList.remove('error', 'success-field');
    errEl.style.display = 'none';
    return true;
  }
}

function validateConfirmPassword() {
  const pw = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const errEl = document.getElementById('confirm-err');
  if (!errEl) return;
  if (confirm && pw !== confirm) {
    document.getElementById('reg-confirm').classList.add('error');
    errEl.style.display = 'block';
  } else if (confirm) {
    document.getElementById('reg-confirm').classList.remove('error');
    document.getElementById('reg-confirm').classList.add('success-field');
    errEl.style.display = 'none';
  }
}

function updatePasswordStrength(password, strengthId) {
  const container = document.getElementById(strengthId);
  const label = document.getElementById(strengthId + '-label');
  if (!container) return;

  if (!password) { container.style.display = 'none'; return; }
  container.style.display = 'flex';

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { threshold: 1, label: 'Weak', cls: 'weak', barCls: 'active-weak', count: 1 },
    { threshold: 2, label: 'Fair', cls: 'fair', barCls: 'active-fair', count: 2 },
    { threshold: 3, label: 'Good', cls: 'good', barCls: 'active-good', count: 3 },
    { threshold: 5, label: 'Strong', cls: 'strong', barCls: 'active-strong', count: 4 },
  ];

  const level = levels.filter(l => score >= l.threshold).pop() || levels[0];

  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById(strengthId.replace('strength', `bar-${i}`));
    if (!bar) continue;
    bar.className = 'strength-bar' + (i <= level.count ? ` ${level.barCls}` : '');
  }
  if (label) {
    label.textContent = level.label;
    label.className = `strength-label ${level.cls}`;
  }
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
    btn.setAttribute('aria-label', 'Hide password');
  } else {
    input.type = 'password';
    btn.textContent = '👁';
    btn.setAttribute('aria-label', 'Show password');
  }
}

function showForgotPassword() {
  showToast('Password reset is not yet available. Please contact support.', 'info');
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function switchAuthTab(tab) {
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('auth-error').classList.add('hidden');
  const succ = document.getElementById('auth-success');
  if (succ) succ.classList.add('hidden');
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.classList.remove('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideAuthError() {
  const el = document.getElementById('auth-error');
  if (el) el.classList.add('hidden');
}

async function handleLogin(e) {
  e.preventDefault();
  hideAuthError();
  const emailInput = document.getElementById('login-email');
  if (!validateEmailField(emailInput)) return;
  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-block;animation:spin 0.7s linear infinite">⟳</span> Signing in…';
  try {
    const user = await API.login({
      email: emailInput.value.trim(),
      password: document.getElementById('login-password').value,
    });
    state.user = user.user;
    await loadApp();
  } catch(err) {
    showAuthError(err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Sign In →';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  hideAuthError();

  const emailInput = document.getElementById('reg-email');
  if (!validateEmailField(emailInput)) return;

  const pw = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  if (pw !== confirm) {
    showAuthError('Passwords do not match');
    document.getElementById('reg-confirm').classList.add('error');
    return;
  }
  if (pw.length < 8) {
    showAuthError('Password must be at least 8 characters');
    return;
  }
  if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) {
    showAuthError('Password must contain at least one number or special character');
    return;
  }

  const btn = document.getElementById('register-btn');
  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-block;animation:spin 0.7s linear infinite">⟳</span> Creating account…';
  try {
    const res = await API.register({
      name: document.getElementById('reg-name').value.trim(),
      email: emailInput.value.trim(),
      password: pw,
    });
    state.user = res.user;
    await loadApp();
  } catch(err) {
    showAuthError(err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Create Account →';
  }
}

async function handleLogout() {
  await API.logout().catch(() => {});
  state.user = null; state.pets = []; state.reminders = []; state.records = []; state.documents = [];
  state.activePetId = null;
  showApp(false);
}

// ─── Data Loading ─────────────────────────────────────────────────────────────
async function loadAppData() {
  const [pets, reminders, records, documents] = await Promise.all([
    API.getPets().catch(() => []),
    API.getReminders().catch(() => []),
    API.getRecords().catch(() => []),
    API.getDocuments().catch(() => []),
  ]);
  state.pets = pets || [];
  state.reminders = reminders || [];
  state.records = records || [];
  state.documents = documents || [];
  state.activePetId = (state.user && state.user.active_pet_id) || (pets[0] && pets[0].id);
}

async function loadApp() {
  await loadAppData();
  showApp(true);
  renderSidebar();
  updateOverdueBadge();
  navigate(state.currentPage);
}

// ─── Running Dog Loader Controller ──────────────────────────────────────────
function dismissLoader() {
  const loader = document.getElementById('loading');
  if (!loader) return;
  loader.classList.add('fade-out');
  setTimeout(() => {
    loader.classList.add('hidden', 'loader-hidden');
    loader.classList.remove('fade-out');
  }, 450);
}

function showDogLoader(text = "Loading your pet's world…") {
  const loader = document.getElementById('loading');
  if (!loader) return;
  const label = loader.querySelector('.loader-text');
  if (label) label.textContent = text;
  loader.classList.remove('hidden', 'fade-out', 'loader-hidden');
}
window.showDogLoader = showDogLoader;
window.hideDogLoader = dismissLoader;

function showApp(loggedIn) {
  dismissLoader();
  document.getElementById('auth-page').classList.toggle('hidden', loggedIn);
  document.getElementById('app-shell').classList.toggle('hidden', !loggedIn);
}

// ─── Overdue Badge ────────────────────────────────────────────────────────────
function countOverdueReminders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return state.reminders.filter(r => {
    if (r.status === 'overdue') return true;
    if (r.status === 'upcoming' && r.due_date) {
      const due = new Date(r.due_date);
      return !isNaN(due) && due < today;
    }
    return false;
  }).length;
}

function updateOverdueBadge() {
  const count = countOverdueReminders();
  ['nav-overdue-badge', 'bnav-badge'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (count > 0) {
      el.textContent = count > 9 ? '9+' : count;
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function renderSidebar() {
  const u = state.user || {};
  document.getElementById('sidebar-name').textContent = u.name || 'User';
  document.getElementById('sidebar-email').textContent = u.email || '';
  document.getElementById('sidebar-avatar').textContent = (u.name || 'U').charAt(0).toUpperCase();

  const adminNav = document.getElementById('nav-admin');
  if (adminNav) {
    adminNav.classList.toggle('hidden', !u.isAdmin);
  }
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('visible');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('visible');
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function navigate(page) {
  closeSidebar();
  state.currentPage = page;
  const pages = ['home', 'reminders', 'records', 'nutrition', 'profile', 'settings'];
  pages.forEach(p => {
    document.getElementById(`page-${p}`)?.classList.toggle('hidden', p !== page);
    document.getElementById(`nav-${p}`)?.classList.toggle('active', p === page);
    document.getElementById(`bnav-${p}`)?.classList.toggle('active', p === page);
  });
  // Hide FABs on non-fab pages
  hideFabs();
  const renders = {
    home: renderHome,
    reminders: renderReminders,
    records: renderRecords,
    nutrition: renderNutrition,
    profile: renderProfile,
    settings: renderSettings,
  };
  renders[page]?.();
  // 🎉 Trigger Kutto animations after page renders
  setTimeout(() => onPageRendered(page), 20);
}

// ─── Active Pet ───────────────────────────────────────────────────────────────
function getActivePet() {
  return state.pets.find(p => p.id === state.activePetId) || state.pets[0] || null;
}

async function switchPet(id) {
  state.activePetId = id;
  await API.setActivePet(id).catch(() => {});
  navigate(state.currentPage);
}

// ─── Pet Switcher ─────────────────────────────────────────────────────────────
function renderPetSwitcher(container, onAdd) {
  const el = document.createElement('div');
  el.className = 'pet-switcher';
  const pet = getActivePet();

  state.pets.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'pet-chip' + (p.id === (pet && pet.id) ? ' active' : '');
    chip.onclick = () => switchPet(p.id);
    chip.setAttribute('role', 'button');
    chip.setAttribute('tabindex', '0');
    const avatarContent = p.avatar || p.name.charAt(0).toUpperCase();
    chip.innerHTML = `
      <div class="pet-chip-avatar" style="background:${p.color}">${esc(avatarContent)}</div>
      <div>
        <div class="pet-chip-name">${esc(p.name)}</div>
        <div class="pet-chip-species">${esc(p.species)}</div>
      </div>`;
    el.appendChild(chip);
  });

  const addChip = document.createElement('button');
  addChip.className = 'add-pet-chip';
  addChip.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add pet`;
  addChip.onclick = onAdd || showAddPetModal;
  el.appendChild(addChip);
  container.appendChild(el);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return '☀️ Good morning';
  if (h < 17) return '🌤 Good afternoon';
  return '🌙 Good evening';
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(Number(ts));
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateShort(ts) {
  if (!ts) return '';
  const d = new Date(Number(ts));
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function timeAgo(ts) {
  const diff = Date.now() - Number(ts);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDateShort(ts);
}

function isDueDateOverdue(dueDate) {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  if (isNaN(due)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function formatDueDate(dueDate) {
  if (!dueDate) return '';
  const due = new Date(dueDate);
  if (isNaN(due)) return dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due - today) / 86400000);
  if (diff < 0) return `Overdue by ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''}`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff <= 7) return `Due in ${diff} days`;
  return `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function computeHealthScore(pet) {
  if (!pet) return { score: 0, label: 'No Data', color: 'var(--ink-muted)' };
  let score = 100;
  const petReminders = state.reminders.filter(r => r.pet_id === pet.id);
  const overdue = petReminders.filter(r => r.status === 'overdue' || (r.status === 'upcoming' && isDueDateOverdue(r.due_date)));
  score -= overdue.length * 15;
  const petRecords = state.records.filter(r => r.pet_id === pet.id);
  if (petRecords.length === 0) score -= 10;
  if (!pet.nextVet) score -= 5;
  if ((pet.weightHistory || []).length < 2) score -= 5;
  score = Math.max(0, Math.min(100, score));
  let label, color;
  if (score >= 85) { label = 'Excellent 🌟'; color = 'var(--success)'; }
  else if (score >= 65) { label = 'Good 👍'; color = 'var(--gold)'; }
  else if (score >= 40) { label = 'Needs Attention ⚠️'; color = 'var(--warning)'; }
  else { label = 'Action Required 🚨'; color = 'var(--danger)'; }
  return { score, label, color };
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function renderHome() {
  const container = document.getElementById('page-home');
  const pet = getActivePet();

  container.innerHTML = `
    <div class="page-header">
      <div class="page-eyebrow">${getGreeting()}, ${esc(state.user?.name?.split(' ')[0] || 'there')}</div>
      <h1 class="page-title">Pet Dashboard</h1>
      <div class="page-subtitle">Here's what's happening with your pets today</div>
    </div>`;

  // Admin banner if user has admin privileges
  if (state.user?.isAdmin) {
    const adminBanner = document.createElement('div');
    adminBanner.className = 'card reveal';
    adminBanner.style.cssText = 'background: linear-gradient(135deg, rgba(27,94,71,0.12) 0%, rgba(52,201,138,0.08) 100%); border: 1.5px solid var(--primary); display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; margin-bottom: 20px; border-radius: var(--r-md);';
    adminBanner.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:44px;height:44px;border-radius:12px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;box-shadow:0 4px 12px rgba(27,94,71,0.3)">🛡️</div>
        <div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-weight:800;font-size:15px;color:var(--ink)">Administrator Mode</span>
            <span style="font-size:10px;background:var(--primary);color:#fff;padding:2px 7px;border-radius:8px;font-weight:800;letter-spacing:0.4px">SUPER ADMIN</span>
          </div>
          <div style="font-size:12.5px;color:var(--ink-soft);margin-top:2px">Manage users, all platform pets, and system metrics in the Admin Console.</div>
        </div>
      </div>
      <a href="/admin" class="btn btn-primary" style="width:auto;padding:10px 18px;font-size:13px;display:inline-flex;align-items:center;gap:6px;text-decoration:none;flex-shrink:0">
        <span>⚡</span> Admin Console
      </a>`;
    container.appendChild(adminBanner);
  }

  // Pet Switcher
  renderPetSwitcher(container);

  if (!pet) {
    container.innerHTML += `
      <div class="empty-state" style="margin-top:40px">
        <div class="empty-icon">🐾</div>
        <div class="empty-title">No pets yet</div>
        <div class="empty-desc">Add your first pet to start tracking their health and care.</div>
        <button class="btn btn-primary" style="margin-top:20px;width:auto;padding:13px 32px" onclick="showAddPetModal()">+ Add your first pet</button>
      </div>`;
    return;
  }

  // Health Score
  const { score, label, color } = computeHealthScore(pet);
  const healthCard = document.createElement('div');
  healthCard.className = 'health-score-card';
  healthCard.innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between">
      <div>
        <div class="health-eyebrow">Health Score · ${esc(pet.name)}</div>
        <div class="health-score-val">${score}</div>
        <div class="health-score-label">out of 100</div>
        <div class="health-score-badge">${label}</div>
      </div>
      <div style="text-align:right">
        <svg width="72" height="72" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="3"/>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" stroke-width="3"
            stroke-dasharray="${(score / 100) * 100.5} 100.5"
            stroke-linecap="round" transform="rotate(-90 18 18)" opacity="0.9"/>
        </svg>
      </div>
    </div>`;
  container.appendChild(healthCard);

  // Quick Stats
  const overdueCount = state.reminders.filter(r => r.pet_id === pet.id && (r.status === 'overdue' || (r.status === 'upcoming' && isDueDateOverdue(r.due_date)))).length;
  const upcomingCount = state.reminders.filter(r => r.pet_id === pet.id && r.status === 'upcoming' && !isDueDateOverdue(r.due_date)).length;
  const recordsCount = state.records.filter(r => r.pet_id === pet.id).length;
  const statsEl = document.createElement('div');
  statsEl.className = 'section-head';
  statsEl.innerHTML = `<div class="section-title">Quick Stats</div>`;
  container.appendChild(statsEl);

  const qs = document.createElement('div');
  qs.className = 'quick-stats';
  qs.innerHTML = `
    <div class="quick-stat" onclick="navigate('profile')" style="cursor:pointer">
      <div class="quick-stat-icon">⚖️</div>
      <div class="quick-stat-val">${pet.weight || '—'}</div>
      <div class="quick-stat-label">${pet.weightUnit || 'kg'}</div>
    </div>
    <div class="quick-stat" onclick="navigate('reminders')" style="cursor:pointer">
      <div class="quick-stat-icon">🔔</div>
      <div class="quick-stat-val">${upcomingCount}</div>
      <div class="quick-stat-label">Upcoming</div>
    </div>
    <div class="quick-stat" onclick="navigate('reminders')" style="cursor:pointer">
      <div class="quick-stat-icon">⚠️</div>
      <div class="quick-stat-val" style="${overdueCount > 0 ? 'color:var(--danger)' : ''}">${overdueCount}</div>
      <div class="quick-stat-label">Overdue</div>
    </div>
    <div class="quick-stat" onclick="navigate('records')" style="cursor:pointer">
      <div class="quick-stat-icon">📋</div>
      <div class="quick-stat-val">${recordsCount}</div>
      <div class="quick-stat-label">Records</div>
    </div>`;
  container.appendChild(qs);

  // Quick Actions
  const qaSectionHead = document.createElement('div');
  qaSectionHead.className = 'section-head';
  qaSectionHead.innerHTML = `<div class="section-title">Quick Actions</div>`;
  container.appendChild(qaSectionHead);

  const qa = document.createElement('div');
  qa.className = 'quick-actions';
  qa.innerHTML = `
    <button class="quick-action-btn" onclick="showLogWeightModal('${pet.id}')"><span>⚖️</span> Log Weight</button>
    <button class="quick-action-btn" onclick="showAddReminderModal('${pet.id}')"><span>🔔</span> Add Reminder</button>
    <button class="quick-action-btn" onclick="showAddRecordModal('${pet.id}', 'vaccinations')"><span>📋</span> Add Record</button>
    <button class="quick-action-btn" onclick="navigate('profile')"><span>✏️</span> Edit Pet</button>`;
  container.appendChild(qa);

  // Today's Care
  const sectionHead = document.createElement('div');
  sectionHead.className = 'section-head';
  sectionHead.innerHTML = `
    <div class="section-title">Today's Care</div>
    <div class="section-action" onclick="navigate('reminders')">See all</div>`;
  container.appendChild(sectionHead);

  const remCard = document.createElement('div');
  remCard.className = 'card';
  const todays = state.reminders
    .filter(r => r.pet_id === pet.id)
    .sort((a, b) => {
      const order = { overdue: 0, upcoming: 1, done: 2 };
      return (order[a.status] || 1) - (order[b.status] || 1);
    })
    .slice(0, 4);

  if (todays.length) {
    todays.forEach(r => remCard.appendChild(makeReminderItem(r, () => navigate('reminders'))));
  } else {
    remCard.innerHTML = `<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-title">All caught up!</div><div class="empty-desc">No reminders yet for ${esc(pet.name)}.</div></div>`;
  }
  container.appendChild(remCard);

  // Feeding & Activity
  const secHead2 = document.createElement('div');
  secHead2.className = 'section-head';
  secHead2.innerHTML = `<div class="section-title">Feeding & Activity</div>`;
  container.appendChild(secHead2);

  const foodCard = document.createElement('div');
  foodCard.className = 'guide-card';
  foodCard.style.background = 'var(--gold-tint)';
  foodCard.innerHTML = `
    <div class="guide-icon">🍖</div>
    <div>
      <div class="guide-title">${esc(pet.food?.title || 'Not set yet')}</div>
      <div class="guide-desc">${esc(pet.food?.desc || 'Add feeding guidance from the pet profile.')}</div>
    </div>`;
  container.appendChild(foodCard);

  const exCard = document.createElement('div');
  exCard.className = 'guide-card';
  exCard.style.background = 'var(--accent-tint)';
  exCard.innerHTML = `
    <div class="guide-icon">🏃</div>
    <div>
      <div class="guide-title">${esc(pet.exercise?.title || 'Not set yet')}</div>
      <div class="guide-desc">${esc(pet.exercise?.desc || 'Add exercise guidance from the pet profile.')}</div>
    </div>`;
  container.appendChild(exCard);

  // Next Vet
  if (pet.nextVet) {
    const vetCard = document.createElement('div');
    vetCard.className = 'guide-card';
    vetCard.style.background = 'var(--teal-tint)';
    vetCard.innerHTML = `
      <div class="guide-icon">🩺</div>
      <div>
        <div class="guide-title">Next Vet Visit</div>
        <div class="guide-desc">${esc(pet.nextVet)}</div>
      </div>`;
    container.appendChild(vetCard);
  }
}

// ─── REMINDERS PAGE ───────────────────────────────────────────────────────────
let remFilter = 'all';
let remSort = 'date-asc';
let remSearch = '';

function renderReminders() {
  const container = document.getElementById('page-reminders');
  const pet = getActivePet();

  container.innerHTML = `
    <div class="page-header">
      <div class="page-eyebrow">Care Schedule</div>
      <h1 class="page-title">Reminders</h1>
    </div>`;

  renderPetSwitcher(container);

  if (!pet) {
    container.innerHTML += `<div class="empty-state"><div class="empty-icon">🐾</div><div class="empty-title">No pets yet</div><div class="empty-desc">Add a pet first.</div></div>`;
    return;
  }

  // Search bar
  const searchBar = document.createElement('div');
  searchBar.className = 'search-bar';
  searchBar.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input class="search-input" id="rem-search" placeholder="Search reminders…" value="${esc(remSearch)}" oninput="remSearch=this.value;renderReminders()" />`;
  container.appendChild(searchBar);

  // Filter chips
  const chips = document.createElement('div');
  chips.className = 'chip-select';
  const filters = [{ label: 'All', value: 'all' }, ...Object.entries(CATEGORY_META).map(([k,v]) => ({ label: v.label, value: k }))];
  filters.forEach(f => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (remFilter === f.value ? ' active' : '');
    chip.textContent = f.label;
    chip.onclick = () => { remFilter = f.value; renderReminders(); };
    chips.appendChild(chip);
  });
  container.appendChild(chips);

  // Sort bar
  const sortBar = document.createElement('div');
  sortBar.className = 'sort-bar';
  sortBar.innerHTML = `
    <label>Sort:</label>
    <select class="sort-select" id="rem-sort" onchange="remSort=this.value;renderReminders()">
      <option value="date-asc" ${remSort==='date-asc'?'selected':''}>Due Date ↑</option>
      <option value="date-desc" ${remSort==='date-desc'?'selected':''}>Due Date ↓</option>
      <option value="status" ${remSort==='status'?'selected':''}>Status</option>
      <option value="category" ${remSort==='category'?'selected':''}>Category</option>
    </select>
    <span style="font-size:11px;color:var(--ink-muted);margin-left:auto">Click status badge to cycle • × to delete</span>`;
  container.appendChild(sortBar);

  // Reminders list
  const card = document.createElement('div');
  card.className = 'card';
  card.style.overflow = 'hidden';

  let items = state.reminders.filter(r => r.pet_id === pet.id);
  if (remFilter !== 'all') items = items.filter(r => r.cat === remFilter);
  if (remSearch.trim()) {
    const q = remSearch.toLowerCase();
    items = items.filter(r => r.title.toLowerCase().includes(q) || (r.meta||'').toLowerCase().includes(q));
  }

  // Auto-upgrade status for overdue due dates
  items.forEach(r => {
    if (r.status === 'upcoming' && isDueDateOverdue(r.due_date)) {
      r._displayStatus = 'overdue';
    } else {
      r._displayStatus = r.status;
    }
  });

  // Sort
  items.sort((a, b) => {
    if (remSort === 'status') {
      const o = { overdue: 0, upcoming: 1, done: 2 };
      return (o[a._displayStatus]||1) - (o[b._displayStatus]||1);
    }
    if (remSort === 'category') return (a.cat||'').localeCompare(b.cat||'');
    if (remSort === 'date-desc') {
      const aD = a.due_date ? new Date(a.due_date) : new Date(Number(a.created_at));
      const bD = b.due_date ? new Date(b.due_date) : new Date(Number(b.created_at));
      return bD - aD;
    }
    // date-asc
    const aD = a.due_date ? new Date(a.due_date) : new Date(Number(a.created_at));
    const bD = b.due_date ? new Date(b.due_date) : new Date(Number(b.created_at));
    return aD - bD;
  });

  if (items.length) {
    items.forEach(r => {
      const el = makeReminderItem(r, async () => {
        const res = await API.cycleReminder(r.id);
        r.status = res.status;
        updateOverdueBadge();
        renderReminders();
      }, async () => {
        if (!confirm(`Delete "${r.title}"?`)) return;
        await API.deleteReminder(r.id);
        state.reminders = state.reminders.filter(x => x.id !== r.id);
        updateOverdueBadge();
        showToast('Reminder deleted');
        renderReminders();
      }, true);
      card.appendChild(el);
    });
  } else {
    card.innerHTML = `<div class="empty-state"><div class="empty-icon">🔔</div><div class="empty-title">Nothing here yet</div><div class="empty-desc">Tap + to add a reminder for ${esc(pet.name)}.</div></div>`;
  }
  container.appendChild(card);

  // FAB
  let fab = document.getElementById('reminders-fab');
  if (!fab) {
    fab = document.createElement('button');
    fab.id = 'reminders-fab';
    fab.className = 'fab';
    fab.innerHTML = '+';
    fab.title = 'Add reminder';
    document.body.appendChild(fab);
  }
  fab.onclick = () => showAddReminderModal(pet.id);
  fab.style.display = 'flex';
}

function makeReminderItem(r, onClick, onDelete, showDue = false) {
  const el = document.createElement('div');
  el.className = 'reminder-item';
  const cat = CATEGORY_META[r.cat] || CATEGORY_META.vet;
  const displayStatus = r._displayStatus || r.status;
  const statusClass = { overdue: 'status-overdue', upcoming: 'status-upcoming', done: 'status-done' }[displayStatus] || 'status-upcoming';

  let dueHtml = '';
  if (showDue && r.due_date) {
    const dueText = formatDueDate(r.due_date);
    const isOd = isDueDateOverdue(r.due_date) && r.status !== 'done';
    dueHtml = `<div class="reminder-due ${isOd ? 'overdue' : ''}">📅 ${esc(dueText)}</div>`;
  }
  if (r.recurring && r.recurring !== 'none') {
    dueHtml += `<div class="reminder-due">🔁 ${esc(r.recurring)}</div>`;
  }

  el.innerHTML = `
    <div class="reminder-cat-badge" style="background:${cat.bg}">
      <span>${cat.icon}</span>
    </div>
    <div class="reminder-info">
      <div class="reminder-title">${esc(r.title)}</div>
      ${r.meta ? `<div class="reminder-meta">${esc(r.meta)}</div>` : ''}
      ${dueHtml}
    </div>
    <span class="reminder-status ${statusClass}" style="cursor:${onClick?'pointer':'default'}">${displayStatus}</span>
    ${onDelete ? '<button class="reminder-delete" title="Delete">✕</button>' : ''}`;

  if (onClick) el.addEventListener('click', (e) => {
    if (e.target.closest('.reminder-delete')) return;
    onClick(r);
  });
  if (onDelete) {
    el.querySelector('.reminder-delete')?.addEventListener('click', (e) => {
      e.stopPropagation();
      onDelete(r);
    });
  }
  return el;
}

// ─── RECORDS PAGE ─────────────────────────────────────────────────────────────
let recordTab = 'vaccinations';
let recordSearch = '';

function renderRecords() {
  const container = document.getElementById('page-records');
  const pet = getActivePet();

  container.innerHTML = `
    <div class="page-header">
      <div class="page-eyebrow">Digital Health File</div>
      <h1 class="page-title">Records</h1>
    </div>`;

  if (!pet) {
    container.innerHTML += `<div class="empty-state"><div class="empty-icon">📁</div><div class="empty-title">No pets yet</div><div class="empty-desc">Add a pet to start a health file.</div></div>`;
    return;
  }

  // Pet Switcher
  renderPetSwitcher(container);

  // Passport Card
  const passport = document.createElement('div');
  passport.className = 'passport-card';
  passport.innerHTML = `
    <div class="passport-eyebrow">Pet Passport</div>
    <div class="passport-name">${esc(pet.name)} · ${esc(pet.breed || '—')}</div>
    <div class="passport-sub">${esc(pet.species)} · ${esc(pet.gender)} · ${esc(pet.age || '—')}</div>
    <div class="passport-actions">
      <button class="passport-btn" onclick="exportRecords('${pet.id}')">📋 Copy Records</button>
      <button class="passport-btn" onclick="navigate('profile')">✏️ Edit Profile</button>
    </div>`;
  container.appendChild(passport);

  // Tabs
  const tabs = document.createElement('div');
  tabs.className = 'tab-bar';
  RECORD_TYPES.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (recordTab === t.key ? ' active' : '');
    btn.textContent = t.label;
    btn.onclick = () => { recordTab = t.key; renderRecords(); };
    tabs.appendChild(btn);
  });
  container.appendChild(tabs);

  // If Documents tab is active, render full Document Management System
  if (recordTab === 'documents') {
    renderDocumentsTab(container, pet);
    return;
  }

  // Search
  const searchBar = document.createElement('div');
  searchBar.className = 'search-bar';
  searchBar.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input class="search-input" id="rec-search" placeholder="Search records…" value="${esc(recordSearch)}" oninput="recordSearch=this.value;renderRecords()" />`;
  container.appendChild(searchBar);

  // Records List
  const card = document.createElement('div');
  card.className = 'card';
  card.style.overflow = 'hidden';

  let entries = state.records.filter(r => r.pet_id === pet.id && r.type === recordTab);
  if (recordSearch.trim()) {
    const q = recordSearch.toLowerCase();
    entries = entries.filter(r => r.title.toLowerCase().includes(q) || (r.meta||'').toLowerCase().includes(q) || (r.doctor||'').toLowerCase().includes(q));
  }

  if (entries.length) {
    entries.forEach(e => {
      const row = document.createElement('div');
      row.className = 'record-item';
      const typeInfo = RECORD_TYPES.find(t => t.key === e.type);
      const dotColor = {
        vaccinations: 'var(--primary)',
        prescriptions: 'var(--gold)',
        treatments: 'var(--accent)',
        allergies: 'var(--danger)',
      }[e.type] || 'var(--primary)';
      row.innerHTML = `
        <div class="record-dot" style="background:${dotColor}"></div>
        <div style="flex:1;min-width:0">
          <div class="record-title">${esc(e.title)}</div>
          ${e.meta ? `<div class="record-meta">${esc(e.meta)}</div>` : ''}
          ${e.doctor ? `<div class="record-doctor">🩺 ${esc(e.doctor)}</div>` : ''}
          <div class="record-date">📅 ${formatDate(e.created_at)}</div>
        </div>
        <button class="record-delete" title="Delete">✕</button>`;
      row.querySelector('.record-delete').onclick = async () => {
        if (!confirm(`Delete "${e.title}"?`)) return;
        await API.deleteRecord(e.id);
        state.records = state.records.filter(x => x.id !== e.id);
        showToast('Record deleted');
        renderRecords();
      };
      card.appendChild(row);
    });
  } else {
    card.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">No entries yet</div><div class="empty-desc">Tap + to log a ${RECORD_TYPES.find(t=>t.key===recordTab)?.label || 'record'}.</div></div>`;
  }
  container.appendChild(card);

  // FAB
  let fab = document.getElementById('records-fab');
  if (!fab) {
    fab = document.createElement('button');
    fab.id = 'records-fab';
    fab.className = 'fab';
    fab.innerHTML = '+';
    fab.title = 'Add record';
    document.body.appendChild(fab);
  }
  fab.onclick = () => showAddRecordModal(pet.id, recordTab);
  fab.style.display = 'flex';
}

// ─── DOCUMENT MANAGEMENT SYSTEM ───────────────────────────────────────────────
let docCategoryFilter = 'All';
let docSearchQuery = '';

const DOC_CATEGORIES = [
  { key: 'All', label: 'All', icon: '📂', color: 'var(--ink)' },
  { key: 'Vaccination', label: 'Vaccination', icon: '💉', color: 'var(--primary)' },
  { key: 'Medical Reports', label: 'Medical Reports', icon: '🔬', color: 'var(--teal)' },
  { key: 'Prescriptions', label: 'Prescriptions', icon: '💊', color: 'var(--gold)' },
  { key: 'Bills', label: 'Bills', icon: '🧾', color: 'var(--accent)' },
  { key: 'Photos', label: 'Photos', icon: '📸', color: 'var(--purple)' },
  { key: 'Others', label: 'Others', icon: '📁', color: 'var(--ink-soft)' },
];

function renderDocumentsTab(container, pet) {
  const wrap = document.createElement('div');
  wrap.className = 'doc-manager-wrap';

  // Header Actions
  const headerActions = document.createElement('div');
  headerActions.className = 'doc-header-actions';
  headerActions.innerHTML = `
    <div>
      <h3 style="font-size:16px;font-weight:800;color:var(--ink);margin:0">Files & Documents</h3>
      <div style="font-size:12px;color:var(--ink-soft);margin-top:2px">Certificates, prescriptions, bills & photos for ${esc(pet.name)}</div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary" onclick="showUploadDocumentModal('${pet.id}')" style="font-size:12.5px;padding:8px 14px">
        <span>+ Upload File</span>
      </button>
      <button class="btn btn-ghost" onclick="triggerCameraCapture('${pet.id}')" style="font-size:12.5px;padding:8px 12px;border:1px solid var(--line)" title="Take Photo">
        <span>📷 Camera</span>
      </button>
    </div>
    <input type="file" id="doc-cam-input" accept="image/*" capture="environment" style="display:none" onchange="handleCamCapture(event, '${pet.id}')" />
    <input type="file" id="doc-file-picker" accept=".jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf" style="display:none" onchange="handleCamCapture(event, '${pet.id}')" />
  `;
  wrap.appendChild(headerActions);

  // Drag and Drop Zone
  const dropzone = document.createElement('div');
  dropzone.className = 'doc-dropzone';
  dropzone.innerHTML = `
    <div class="doc-dropzone-icon">☁️</div>
    <div class="doc-dropzone-text">Click or drag & drop files here</div>
    <div class="doc-dropzone-sub">Supports JPG, PNG, WEBP, PDF (camera or file picker)</div>
  `;
  dropzone.onclick = () => document.getElementById('doc-file-picker').click();

  ['dragenter', 'dragover'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  });
  ['dragleave', 'drop'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('drag-over'); });
  });
  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleCamCapture({ target: { files } }, pet.id);
    }
  });
  wrap.appendChild(dropzone);

  // Filter Documents for this pet
  let petDocs = (state.documents || []).filter(d => d.petId === pet.id);

  // Category filter chips
  const chipsRow = document.createElement('div');
  chipsRow.className = 'doc-cat-chips';
  DOC_CATEGORIES.forEach(cat => {
    const count = cat.key === 'All' ? petDocs.length : petDocs.filter(d => d.category === cat.key).length;
    const chip = document.createElement('button');
    chip.className = 'chip' + (docCategoryFilter === cat.key ? ' active' : '');
    chip.innerHTML = `${cat.icon} ${cat.label} <span style="opacity:0.75;font-size:10px;margin-left:4px">(${count})</span>`;
    chip.onclick = () => { docCategoryFilter = cat.key; renderRecords(); };
    chipsRow.appendChild(chip);
  });
  wrap.appendChild(chipsRow);

  // Search input
  const searchBar = document.createElement('div');
  searchBar.className = 'search-bar';
  searchBar.style.margin = '4px 0 10px 0';
  searchBar.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input class="search-input" id="doc-search-inp" placeholder="Search documents, prescriptions, bills…"
      value="${esc(docSearchQuery)}" oninput="docSearchQuery=this.value;renderRecords()" />`;
  wrap.appendChild(searchBar);

  // Apply filters
  let filteredDocs = petDocs;
  if (docCategoryFilter !== 'All') {
    filteredDocs = filteredDocs.filter(d => d.category === docCategoryFilter);
  }
  if (docSearchQuery.trim()) {
    const q = docSearchQuery.toLowerCase();
    filteredDocs = filteredDocs.filter(d =>
      (d.title || '').toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q) ||
      (d.fileName || '').toLowerCase().includes(q) ||
      (d.category || '').toLowerCase().includes(q)
    );
  }

  // Documents Grid
  if (!filteredDocs.length) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📁</div>
        <div class="empty-title">No documents found</div>
        <div class="empty-desc">Upload certificates, prescriptions, vet bills, or photos for ${esc(pet.name)}.</div>
        <button class="btn btn-primary" onclick="showUploadDocumentModal('${pet.id}')" style="margin-top:12px;font-size:13px">
          + Upload Document
        </button>
      </div>`;
    wrap.appendChild(empty);
  } else {
    const grid = document.createElement('div');
    grid.className = 'doc-grid';

    filteredDocs.forEach(doc => {
      const card = document.createElement('div');
      card.className = 'doc-card reveal';

      const isPdf = (doc.fileType && doc.fileType.includes('pdf')) || (doc.fileName && doc.fileName.toLowerCase().endsWith('.pdf'));
      const catMeta = DOC_CATEGORIES.find(c => c.key === doc.category) || DOC_CATEGORIES[6];

      let thumbHtml = '';
      if (isPdf) {
        thumbHtml = `
          <div class="doc-thumb" onclick="previewDocument('${doc.id}')">
            <div class="doc-thumb-pdf">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>PDF Document</span>
            </div>
          </div>`;
      } else if (doc.fileUrl) {
        thumbHtml = `
          <div class="doc-thumb" onclick="previewDocument('${doc.id}')">
            <img src="${doc.fileUrl}" alt="${esc(doc.title)}" loading="lazy" />
          </div>`;
      } else {
        thumbHtml = `
          <div class="doc-thumb" onclick="previewDocument('${doc.id}')">
            <div style="font-size:38px">${catMeta.icon}</div>
          </div>`;
      }

      const sizeStr = doc.fileSize ? (doc.fileSize > 1024 * 1024 ? (doc.fileSize / (1024*1024)).toFixed(1) + ' MB' : Math.round(doc.fileSize / 1024) + ' KB') : '';

      card.innerHTML = `
        ${thumbHtml}
        <div class="doc-card-body">
          <span class="doc-badge" style="background:${catMeta.color}18;color:${catMeta.color}">${catMeta.icon} ${esc(doc.category)}</span>
          <div class="doc-title">${esc(doc.title)}</div>
          ${doc.description ? `<div class="doc-desc">${esc(doc.description)}</div>` : ''}
          <div class="doc-meta">
            <span>📅 ${formatDate(doc.date || doc.createdAt)}</span>
            <span>${sizeStr ? '💾 ' + sizeStr : ''}</span>
          </div>
        </div>
        <div class="doc-actions">
          <button class="doc-action-btn" onclick="previewDocument('${doc.id}')" title="Preview">👁️ View</button>
          <button class="doc-action-btn" onclick="downloadDocument('${doc.id}')" title="Download">⬇️</button>
          <button class="doc-action-btn" onclick="showEditDocumentModal('${doc.id}')" title="Rename / Edit">✏️</button>
          <button class="doc-action-btn btn-delete" onclick="handleDeleteDocument('${doc.id}', '${esc(doc.title)}')" title="Delete">🗑️</button>
        </div>
      `;
      grid.appendChild(card);
    });

    wrap.appendChild(grid);
  }

  container.appendChild(wrap);

  // FAB for documents
  let fab = document.getElementById('records-fab');
  if (fab) {
    fab.onclick = () => showUploadDocumentModal(pet.id);
  }
}

function triggerCameraCapture(petId) {
  const cam = document.getElementById('doc-cam-input');
  if (cam) cam.click();
}

function handleCamCapture(e, petId) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  showUploadDocumentModal(petId, null, file);
}

function showUploadDocumentModal(petId, defaultCat, fileObj) {
  let fileDataUrl = '';
  let selectedFile = fileObj || null;
  const today = new Date().toISOString().split('T')[0];

  const catOpts = DOC_CATEGORIES.filter(c => c.key !== 'All').map(c =>
    `<option value="${c.key}" ${c.key === defaultCat ? 'selected' : ''}>${c.icon} ${c.label}</option>`
  ).join('');

  openModal('Upload Document', `
    <div class="field">
      <label class="field-label">Select File / Photo *</label>
      <input type="file" id="up-file" class="field-input" accept=".jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf" />
      <div id="up-file-preview" style="margin-top:10px;text-align:center;display:none"></div>
    </div>
    <div class="field">
      <label class="field-label">Document Title *</label>
      <input id="up-title" class="field-input" placeholder="e.g. Annual Rabies Vaccine Certificate" />
    </div>
    <div class="field">
      <label class="field-label">Category *</label>
      <select id="up-cat" class="field-input">${catOpts}</select>
    </div>
    <div class="field">
      <label class="field-label">Date</label>
      <input id="up-date" type="date" class="field-input" value="${today}" />
    </div>
    <div class="field">
      <label class="field-label">Description / Notes (Optional)</label>
      <textarea id="up-desc" class="field-input" rows="2" placeholder="e.g. Administered at City Vet Hospital, valid until 2027"></textarea>
    </div>
    <div id="up-progress" style="display:none;margin-top:12px">
      <div style="font-size:12px;color:var(--primary);font-weight:700;margin-bottom:4px">Uploading file…</div>
      <div style="height:6px;background:var(--bg2);border-radius:3px;overflow:hidden">
        <div style="height:100%;background:var(--primary);width:100%;animation:pulse 1s infinite"></div>
      </div>
    </div>
  `, async () => {
    const title = document.getElementById('up-title').value.trim();
    if (!title) { showToast('Title is required', 'error'); throw new Error('Title required'); }

    const fileInput = document.getElementById('up-file');
    const file = selectedFile || (fileInput.files && fileInput.files[0]);

    if (!file && !fileDataUrl) {
      showToast('Please select a file to upload', 'error');
      throw new Error('File required');
    }

    const prog = document.getElementById('up-progress');
    if (prog) prog.style.display = 'block';

    const cat = document.getElementById('up-cat').value;
    const date = document.getElementById('up-date').value;
    const desc = document.getElementById('up-desc').value.trim();

    const payload = {
      petId,
      title,
      category: cat,
      description: desc,
      date,
      fileName: file ? file.name : 'document',
      fileType: file ? file.type : 'application/octet-stream',
      fileSize: file ? file.size : 0,
      fileData: fileDataUrl,
    };

    const newDoc = await API.uploadDocument(payload);
    state.documents = [newDoc, ...(state.documents || [])];
    closeModal();
    showToast('Document saved successfully! 📁');
    renderRecords();
  }, 'Upload Document');

  function setupFile(file) {
    selectedFile = file;
    const titleInput = document.getElementById('up-title');
    if (titleInput && !titleInput.value) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      titleInput.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      fileDataUrl = e.target.result;
      const prev = document.getElementById('up-file-preview');
      if (!prev) return;
      prev.style.display = 'block';
      if (file.type && file.type.startsWith('image/')) {
        prev.innerHTML = `<img src="${fileDataUrl}" style="max-height:160px;max-width:100%;border-radius:10px;box-shadow:var(--shadow-sm)" />`;
      } else {
        prev.innerHTML = `<div style="padding:16px;background:var(--bg2);border-radius:10px;font-size:13px;color:var(--ink)">📄 <strong>${esc(file.name)}</strong> (${(file.size/1024).toFixed(1)} KB)</div>`;
      }
    };
    reader.readAsDataURL(file);
  }

  setTimeout(() => {
    const input = document.getElementById('up-file');
    if (fileObj) setupFile(fileObj);
    input?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) setupFile(e.target.files[0]);
    });
  }, 80);
}

function showEditDocumentModal(docId) {
  const doc = (state.documents || []).find(d => d.id === docId);
  if (!doc) return;

  const catOpts = DOC_CATEGORIES.filter(c => c.key !== 'All').map(c =>
    `<option value="${c.key}" ${c.key === doc.category ? 'selected' : ''}>${c.icon} ${c.label}</option>`
  ).join('');

  openModal('Edit Document', `
    <div class="field">
      <label class="field-label">Document Title *</label>
      <input id="ed-title" class="field-input" value="${esc(doc.title)}" />
    </div>
    <div class="field">
      <label class="field-label">Category</label>
      <select id="ed-cat" class="field-input">${catOpts}</select>
    </div>
    <div class="field">
      <label class="field-label">Date</label>
      <input id="ed-date" type="date" class="field-input" value="${doc.date || ''}" />
    </div>
    <div class="field">
      <label class="field-label">Description / Notes</label>
      <textarea id="ed-desc" class="field-input" rows="3">${esc(doc.description || '')}</textarea>
    </div>
  `, async () => {
    const title = document.getElementById('ed-title').value.trim();
    if (!title) { showToast('Title is required', 'error'); throw new Error('Title required'); }

    const updated = await API.updateDocument(docId, {
      title,
      category: document.getElementById('ed-cat').value,
      date: document.getElementById('ed-date').value,
      description: document.getElementById('ed-desc').value.trim(),
    });

    Object.assign(doc, updated);
    closeModal();
    showToast('Document updated ✓');
    renderRecords();
  }, 'Save Changes');
}

function previewDocument(docId) {
  const doc = (state.documents || []).find(d => d.id === docId);
  if (!doc) return;

  const isPdf = (doc.fileType && doc.fileType.includes('pdf')) || (doc.fileName && doc.fileName.toLowerCase().endsWith('.pdf'));

  if (isPdf) {
    openModal(doc.title, `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-size:13px;color:var(--ink-soft)">📄 ${esc(doc.fileName || 'PDF Document')}</span>
        <a href="${doc.fileUrl}" target="_blank" class="btn btn-primary" style="font-size:12px;padding:6px 12px;text-decoration:none">
          Open in New Tab ↗
        </a>
      </div>
      <iframe src="${doc.fileUrl}" style="width:100%;height:65vh;border:1px solid var(--line);border-radius:10px"></iframe>
    `, () => closeModal(), 'Done');
  } else {
    openModal(doc.title, `
      <div style="text-align:center">
        <img src="${doc.fileUrl}" alt="${esc(doc.title)}" style="max-width:100%;max-height:70vh;border-radius:12px;box-shadow:var(--shadow-md)" />
        ${doc.description ? `<p style="font-size:13px;color:var(--ink-soft);margin-top:12px">${esc(doc.description)}</p>` : ''}
      </div>
    `, () => closeModal(), 'Done');
  }
}

function downloadDocument(docId) {
  const doc = (state.documents || []).find(d => d.id === docId);
  if (!doc || !doc.fileUrl) { showToast('File unavailable for download', 'error'); return; }

  const link = document.createElement('a');
  link.href = doc.fileUrl;
  link.download = doc.fileName || `${doc.title}.${(doc.fileType && doc.fileType.includes('pdf')) ? 'pdf' : 'jpg'}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Download started ⬇️');
}

async function handleDeleteDocument(docId, title) {
  openModal('Delete Document', `
    <div style="text-align:center;padding:12px 0">
      <div style="font-size:48px;margin-bottom:12px">⚠️</div>
      <div style="font-size:16px;font-weight:700;color:var(--ink);margin-bottom:6px">Delete "${esc(title)}"?</div>
      <div style="font-size:13px;color:var(--ink-soft)">This will permanently remove this file from your pet's records.</div>
    </div>
  `, async () => {
    await API.deleteDocument(docId);
    state.documents = (state.documents || []).filter(d => d.id !== docId);
    closeModal();
    showToast('Document deleted');
    renderRecords();
  }, '🗑 Delete File');
}

function exportRecords(petId) {
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const petRecords = state.records.filter(r => r.pet_id === petId);
  let text = `📋 PETSY RECORDS — ${pet.name}\n`;
  text += `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
  text += '─'.repeat(40) + '\n\n';

  RECORD_TYPES.forEach(t => {
    const entries = petRecords.filter(r => r.type === t.key);
    if (entries.length) {
      text += `${t.label.toUpperCase()}\n`;
      entries.forEach(e => {
        text += `  • ${e.title}`;
        if (e.meta) text += ` — ${e.meta}`;
        if (e.doctor) text += ` (Dr. ${e.doctor})`;
        text += `\n    Date: ${formatDate(e.created_at)}\n`;
      });
      text += '\n';
    }
  });

  navigator.clipboard.writeText(text).then(() => {
    showToast('Records copied to clipboard! 📋');
  }).catch(() => {
    showToast('Could not copy. Try a modern browser.', 'error');
  });
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function renderProfile() {
  const container = document.getElementById('page-profile');
  container.innerHTML = `
    <div class="page-header">
      <div class="page-eyebrow">Your Pets</div>
      <h1 class="page-title">Profile</h1>
    </div>`;

  renderPetSwitcher(container);

  const pet = getActivePet();
  if (!pet) {
    container.innerHTML += `<div class="empty-state"><div class="empty-icon">🐾</div><div class="empty-title">No pets yet</div><div class="empty-desc">Add a pet to view their profile.</div></div>`;
    return;
  }

  // Hero Card
  const hero = document.createElement('div');
  hero.className = 'card';
  hero.style.padding = '0 0 20px 0';
  hero.style.overflow = 'hidden';

  const heroInner = document.createElement('div');
  heroInner.className = 'profile-hero';
  const avatarContent = pet.avatar || pet.name.charAt(0).toUpperCase();
  heroInner.innerHTML = `
    <div class="avatar-lg" style="background:linear-gradient(135deg,${pet.color},${darkenColor(pet.color)})" onclick="showEditPetModal('${pet.id}')" title="Click to edit">
      <span style="font-style:normal">${esc(avatarContent)}</span>
      <div class="avatar-edit-hint">✏️</div>
    </div>
    <div class="profile-name">${esc(pet.name)}</div>
    <div class="profile-sub">${esc(pet.breed || '—')} · ${esc(pet.species)}</div>
    <div class="profile-tags">
      <span class="profile-tag">${esc(pet.gender)}</span>
      ${pet.age ? `<span class="profile-tag">Age: ${esc(pet.age)}</span>` : ''}
      ${pet.microchip ? `<span class="profile-tag">🔖 ${esc(pet.microchip)}</span>` : ''}
    </div>`;
  hero.appendChild(heroInner);

  // Info Grid
  const grid = document.createElement('div');
  grid.className = 'info-grid';
  grid.style.padding = '0 20px';
  const fields = [
    ['Age', pet.age || '—'],
    ['Gender', pet.gender],
    ['Weight', `${pet.weight || '—'} ${pet.weightUnit || 'kg'}`],
    ['Species', pet.species],
    ['Next Vet', pet.nextVet || '—'],
    ['Microchip', pet.microchip || '—'],
    ['Insurance', pet.insurance || '—'],
    ['Emergency Vet', pet.emergencyVet || '—'],
  ];
  fields.forEach(([label, value]) => {
    grid.innerHTML += `<div class="info-cell"><div class="info-label">${label}</div><div class="info-value">${esc(value)}</div></div>`;
  });
  hero.appendChild(grid);

  // Edit / guidelines buttons
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:10px;padding:16px 20px 0';
  btnRow.innerHTML = `
    <button class="btn btn-ghost" style="flex:1" onclick="showEditPetModal('${pet.id}')">
      ✏️ Edit Profile
    </button>
    <button class="btn btn-ghost" style="flex:1" onclick="showEditGuidelinesModal('${pet.id}')">
      📋 Guidelines
    </button>`;
  hero.appendChild(btnRow);
  container.appendChild(hero);

  // Growth Chart
  const secHead = document.createElement('div');
  secHead.className = 'section-head';
  secHead.innerHTML = `
    <div class="section-title">Weight Tracking</div>
    <div class="section-action" onclick="showLogWeightModal('${pet.id}')">+ Log weight</div>`;
  container.appendChild(secHead);

  const chartCard = document.createElement('div');
  chartCard.className = 'card';
  chartCard.style.padding = '16px';
  renderGrowthChart(chartCard, pet.weightHistory || [], pet.weightDates || [], pet.color, pet.weightUnit || 'kg');
  container.appendChild(chartCard);

  // Guidelines
  const secHead2 = document.createElement('div');
  secHead2.className = 'section-head';
  secHead2.innerHTML = `
    <div class="section-title">Care Guidelines</div>
    <div class="section-action" onclick="showEditGuidelinesModal('${pet.id}')">Edit</div>`;
  container.appendChild(secHead2);

  const foodCard = document.createElement('div');
  foodCard.className = 'guide-card';
  foodCard.style.background = 'var(--gold-tint)';
  foodCard.innerHTML = `<div class="guide-icon">🥣</div><div><div class="guide-title">${esc(pet.food?.title || 'Not set')}</div><div class="guide-desc">${esc(pet.food?.desc || '')}</div></div>`;
  container.appendChild(foodCard);

  const exCard = document.createElement('div');
  exCard.className = 'guide-card';
  exCard.style.background = 'var(--accent-tint)';
  exCard.innerHTML = `<div class="guide-icon">🏃</div><div><div class="guide-title">${esc(pet.exercise?.title || 'Not set')}</div><div class="guide-desc">${esc(pet.exercise?.desc || '')}</div></div>`;
  container.appendChild(exCard);

  // Danger Zone
  const dangerHead = document.createElement('div');
  dangerHead.className = 'section-head';
  dangerHead.innerHTML = `<div class="section-title" style="color:var(--danger)">Danger Zone</div>`;
  container.appendChild(dangerHead);

  const dangerZone = document.createElement('div');
  dangerZone.className = 'danger-zone';
  dangerZone.innerHTML = `
    <div class="danger-zone-title">⚠️ Remove Pet</div>
    <div class="danger-zone-desc">This permanently deletes ${esc(pet.name)}'s profile, all reminders, and all health records. This cannot be undone.</div>
    <button class="btn btn-danger btn-sm" onclick="handleDeletePet('${pet.id}','${esc(pet.name)}')">
      🗑 Delete ${esc(pet.name)}'s Profile
    </button>`;
  container.appendChild(dangerZone);
}

// ─── Growth Chart ─────────────────────────────────────────────────────────────
function renderGrowthChart(container, data, dates, color, unit) {
  if (!data || data.length < 2) {
    container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--ink-soft);font-size:13px;font-weight:500">Log at least 2 weight entries to see the growth chart 📈</div>`;
    return;
  }

  const W = 620, H = 150;
  const pad = { t: 16, r: 24, b: 32, l: 40 };
  const min = Math.min(...data) * 0.96;
  const max = Math.max(...data) * 1.04;
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r),
    y: pad.t + (1 - (v - min) / range) * (H - pad.t - pad.b),
    v,
    date: dates[i] ? formatDateShort(dates[i]) : `#${i+1}`,
  }));

  const smooth = (points) => {
    if (points.length < 2) return `M ${points[0].x},${points[0].y}`;
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cp1x = points[i].x + (points[i+1].x - points[i].x) / 3;
      const cp1y = points[i].y;
      const cp2x = points[i].x + 2 * (points[i+1].x - points[i].x) / 3;
      const cp2y = points[i+1].y;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i+1].x},${points[i+1].y}`;
    }
    return d;
  };

  const linePath = smooth(pts);
  const areaPath = `M ${pts[0].x},${H - pad.b} ` + linePath.replace(/^M [0-9.]+,[0-9.]+/, `L ${pts[0].x},${pts[0].y}`) + ` L ${pts[pts.length-1].x},${H - pad.b} Z`;

  const gradId = `g${Math.random().toString(36).slice(2)}`;
  const dotRadius = data.length > 8 ? 3 : 5;

  // Trend
  const first = data[0], last = data[data.length - 1];
  const diffVal = last - first;
  let trendHtml = '';
  if (Math.abs(diffVal) > 0.05) {
    if (diffVal > 0) trendHtml = `<div class="chart-trend trend-up">↗ +${diffVal.toFixed(1)} ${unit} since start</div>`;
    else trendHtml = `<div class="chart-trend trend-down">↘ ${diffVal.toFixed(1)} ${unit} since start</div>`;
  } else {
    trendHtml = `<div class="chart-trend trend-stable">→ Stable weight</div>`;
  }

  container.innerHTML = `
    <div class="chart-container">
      <svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#${gradId})"/>
        <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${pts.map((p, i) => `
          <circle class="chart-dot" cx="${p.x}" cy="${p.y}" r="${dotRadius}" fill="${color}" stroke="white" stroke-width="2" style="cursor:pointer">
            <title>${p.v} ${unit} · ${p.date}</title>
          </circle>
          <text x="${p.x}" y="${H - 8}" fill="var(--ink-muted)" font-size="9" text-anchor="middle">${p.date}</text>
        `).join('')}
        <text x="${pad.l - 4}" y="${pad.t + 4}" fill="var(--ink-muted)" font-size="9" text-anchor="end">${max.toFixed(1)}</text>
        <text x="${pad.l - 4}" y="${H - pad.b}" fill="var(--ink-muted)" font-size="9" text-anchor="end">${min.toFixed(1)}</text>
      </svg>
    </div>
    ${trendHtml}
    <div style="text-align:center;font-size:11px;color:var(--ink-muted);margin-top:8px">Latest: <strong style="color:var(--ink)">${data[data.length-1]} ${unit}</strong> · ${data.length} entries</div>`;
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function renderSettings() {
  const container = document.getElementById('page-settings');
  container.innerHTML = `
    <div class="page-header">
      <div class="page-eyebrow">Account & Preferences</div>
      <h1 class="page-title">Settings</h1>
    </div>`;

  const currentTheme = getTheme();

  container.innerHTML += `
    <!-- Account Section -->
    <div class="settings-section">
      <div class="settings-section-header">
        <div class="settings-section-icon" style="background:var(--primary-tint)">👤</div>
        <div>
          <div class="settings-section-title">Account</div>
          <div class="settings-section-desc">Manage your name and password</div>
        </div>
      </div>
      <div class="settings-section-body">
        <div class="field">
          <label class="field-label" for="s-name">Display Name</label>
          <div style="display:flex;gap:10px">
            <input id="s-name" class="field-input" value="${esc(state.user?.name || '')}" placeholder="Your name" style="flex:1" />
            <button class="btn btn-outline" style="width:auto;padding:11px 18px;font-size:13px" onclick="saveName()">Save</button>
          </div>
        </div>
        <div style="font-size:12px;color:var(--ink-muted);margin-top:-4px">Email: <strong style="color:var(--ink)">${esc(state.user?.email || '')}</strong> (cannot be changed)</div>
      </div>
    </div>

    <!-- Password Section -->
    <div class="settings-section">
      <div class="settings-section-header">
        <div class="settings-section-icon" style="background:var(--gold-tint)">🔒</div>
        <div>
          <div class="settings-section-title">Change Password</div>
          <div class="settings-section-desc">Use a strong password with numbers or symbols</div>
        </div>
      </div>
      <div class="settings-section-body" id="password-section-body">
        <div id="pw-success" class="auth-success hidden">✅ Password changed successfully!</div>
        <div id="pw-error" class="auth-error hidden"></div>
        <div class="field">
          <label class="field-label" for="s-oldpw">Current Password</label>
          <div class="password-wrapper">
            <input id="s-oldpw" type="password" class="field-input" placeholder="Your current password" autocomplete="current-password" />
            <button type="button" class="password-toggle" onclick="togglePassword('s-oldpw',this)">👁</button>
          </div>
        </div>
        <div class="field">
          <label class="field-label" for="s-newpw">New Password</label>
          <div class="password-wrapper">
            <input id="s-newpw" type="password" class="field-input" placeholder="Min. 8 characters" autocomplete="new-password"
              oninput="updatePasswordStrength(this.value,'s-pw-strength')" />
            <button type="button" class="password-toggle" onclick="togglePassword('s-newpw',this)">👁</button>
          </div>
          <div class="password-strength" id="s-pw-strength" style="display:none">
            <div class="strength-bars">
              <div class="strength-bar" id="s-pw-bar-1"></div>
              <div class="strength-bar" id="s-pw-bar-2"></div>
              <div class="strength-bar" id="s-pw-bar-3"></div>
              <div class="strength-bar" id="s-pw-bar-4"></div>
            </div>
            <span class="strength-label" id="s-pw-strength-label"></span>
          </div>
        </div>
        <div class="field">
          <label class="field-label" for="s-confirmpw">Confirm New Password</label>
          <div class="password-wrapper">
            <input id="s-confirmpw" type="password" class="field-input" placeholder="Repeat new password" autocomplete="new-password" />
            <button type="button" class="password-toggle" onclick="togglePassword('s-confirmpw',this)">👁</button>
          </div>
        </div>
        <button class="btn btn-primary" onclick="savePassword()" id="save-pw-btn">Change Password</button>
      </div>
    </div>

    <!-- Appearance Section -->
    <div class="settings-section">
      <div class="settings-section-header">
        <div class="settings-section-icon" style="background:var(--purple-tint)">🎨</div>
        <div>
          <div class="settings-section-title">Appearance</div>
          <div class="settings-section-desc">Customize how Petsy looks</div>
        </div>
      </div>
      <div class="settings-section-body">
        <div class="theme-toggle-row">
          <div>
            <div class="theme-toggle-label">Theme</div>
            <div class="theme-toggle-sub">Choose light, dark, or match your system</div>
          </div>
          <div class="theme-btn-group">
            <button class="theme-btn ${currentTheme==='light'?'active':''}" onclick="setTheme('light')">☀️ Light</button>
            <button class="theme-btn ${currentTheme==='dark'?'active':''}" onclick="setTheme('dark')">🌙 Dark</button>
            <button class="theme-btn ${currentTheme==='system'?'active':''}" onclick="setTheme('system')">💻 System</button>
          </div>
        </div>
      </div>
    </div>

    ${state.user?.isAdmin ? `
    <!-- Administrator Powers -->
    <div class="settings-section" style="border: 1.5px solid var(--primary); background: linear-gradient(135deg, rgba(27,94,71,0.08) 0%, rgba(52,201,138,0.05) 100%)">
      <div class="settings-section-header">
        <div class="settings-section-icon" style="background:var(--primary);color:#fff">🛡️</div>
        <div>
          <div class="settings-section-title" style="display:flex;align-items:center;gap:8px">
            Administrator Powers
            <span style="font-size:10px;background:var(--primary);color:#fff;padding:2px 8px;border-radius:10px;font-weight:700">SUPER ADMIN</span>
          </div>
          <div class="settings-section-desc">Manage platform users, inspect all registered pets, and view system metrics</div>
        </div>
      </div>
      <div class="settings-section-body">
        <p style="font-size:13px;color:var(--ink-soft);margin-bottom:14px;line-height:1.5">
          You are authenticated as an administrator. You have full platform-wide permissions to inspect users, manage pets, view health stats, and moderate platform content.
        </p>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <a href="/admin" class="btn btn-primary" style="width:auto;padding:12px 22px;display:inline-flex;align-items:center;gap:8px;text-decoration:none">
            <span>⚡</span> Open Admin Console
          </a>
        </div>
      </div>
    </div>` : ''}

    <!-- Account Actions -->
    <div class="settings-section">
      <div class="settings-section-header">
        <div class="settings-section-icon" style="background:var(--danger-tint)">⚙️</div>
        <div>
          <div class="settings-section-title">Account Actions</div>
          <div class="settings-section-desc">Session management</div>
        </div>
      </div>
      <div class="settings-section-body">
        <button class="btn btn-danger" style="width:auto;padding:11px 24px" onclick="handleLogout()">
          🚪 Sign Out
        </button>
      </div>
    </div>
  `;
}

function setTheme(theme) {
  applyTheme(theme);
  renderSettings(); // re-render to update active button
}

async function saveName() {
  const name = document.getElementById('s-name')?.value.trim();
  if (!name) { showToast('Name cannot be empty', 'error'); return; }
  try {
    await API.updateProfile({ name });
    state.user.name = name;
    renderSidebar();
    showToast('Name updated ✓');
  } catch(e) {
    showToast(e.message, 'error');
  }
}

async function savePassword() {
  const btn = document.getElementById('save-pw-btn');
  const errEl = document.getElementById('pw-error');
  const succEl = document.getElementById('pw-success');
  if (errEl) errEl.classList.add('hidden');
  if (succEl) succEl.classList.add('hidden');

  const oldPw = document.getElementById('s-oldpw').value;
  const newPw = document.getElementById('s-newpw').value;
  const confirmPw = document.getElementById('s-confirmpw').value;

  if (!oldPw || !newPw || !confirmPw) { showError(errEl, 'All fields are required'); return; }
  if (newPw.length < 8) { showError(errEl, 'New password must be at least 8 characters'); return; }
  if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPw)) {
    showError(errEl, 'New password must contain at least one number or special character'); return;
  }
  if (newPw !== confirmPw) { showError(errEl, 'Passwords do not match'); return; }

  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-block;animation:spin 0.7s linear infinite">⟳</span> Changing…';
  try {
    await API.changePassword({ oldPassword: oldPw, newPassword: newPw });
    if (succEl) succEl.classList.remove('hidden');
    document.getElementById('s-oldpw').value = '';
    document.getElementById('s-newpw').value = '';
    document.getElementById('s-confirmpw').value = '';
    const strength = document.getElementById('s-pw-strength');
    if (strength) strength.style.display = 'none';
    showToast('Password changed successfully! 🔒');
  } catch(e) {
    showError(errEl, e.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Change Password';
  }
}

function showError(el, msg) {
  if (!el) { showToast(msg, 'error'); return; }
  el.textContent = msg;
  el.classList.remove('hidden');
}

function confirmLogout() {
  // Direct logout — no confirmation dialog
  handleLogout();
}

// ─── ADD PET MODAL ────────────────────────────────────────────────────────────
function showAddPetModal() {
  const palHtml = PET_PALETTE.map((c, i) =>
    `<div class="color-swatch ${i===0?'selected':''}" style="background:${c}" data-color="${c}" onclick="selectColor(this)"></div>`
  ).join('');

  const emojiHtml = PET_EMOJIS.map((e, i) =>
    `<div class="emoji-avatar-option ${i===0?'selected':''}" data-emoji="${e}" onclick="selectEmoji(this)">${e}</div>`
  ).join('');

  openModal('Add a Pet', `
    <div class="field"><label class="field-label">Name *</label><input id="m-name" class="field-input" placeholder="e.g. Milo" /></div>
    <div class="field">
      <label class="field-label">Species</label>
      <select id="m-species" class="field-input" onchange="attachBreedAC()">
        <option>Dog</option><option>Cat</option><option>Rabbit</option><option>Bird</option><option>Fish</option><option>Reptile</option><option>Other</option>
      </select>
    </div>
    <div class="field"><label class="field-label">Breed</label>
      <div class="ac-field-wrap"><input id="m-breed" class="field-input" placeholder="e.g. Golden Retriever — type to search" /></div>
    </div>
    <div class="field">
      <label class="field-label">Gender</label>
      <select id="m-gender" class="field-input"><option>Male</option><option>Female</option></select>
    </div>
    <div class="field"><label class="field-label">Age</label><input id="m-age" class="field-input" placeholder="e.g. 2 yr 4 mo" /></div>
    <div class="field"><label class="field-label">Weight</label>
      <div style="display:flex;gap:8px">
        <input id="m-weight" type="number" step="0.1" min="0" class="field-input" placeholder="e.g. 12.5" style="flex:2" />
        <select id="m-wunit" class="field-input" style="flex:1"><option>kg</option><option>lbs</option></select>
      </div>
    </div>
    <div class="field"><label class="field-label">Avatar Emoji</label>
      <div class="emoji-avatar-grid" id="emoji-picker">${emojiHtml}</div>
    </div>
    <div class="field"><label class="field-label">Profile Color</label>
      <div class="color-picker" id="color-picker">${palHtml}</div>
    </div>
  `, async () => {
    const name = document.getElementById('m-name').value.trim();
    if (!name) { showToast('Name is required', 'error'); throw new Error('Name required'); }
    const color = document.querySelector('#color-picker .color-swatch.selected')?.dataset.color || PET_PALETTE[0];
    const avatar = document.querySelector('#emoji-picker .emoji-avatar-option.selected')?.dataset.emoji || '';
    const { id } = await API.createPet({
      name, color, avatar,
      species: document.getElementById('m-species').value,
      breed: document.getElementById('m-breed').value.trim(),
      gender: document.getElementById('m-gender').value,
      age: document.getElementById('m-age').value.trim(),
      weight: parseFloat(document.getElementById('m-weight').value) || 0,
      weightUnit: document.getElementById('m-wunit').value,
    });
    state.activePetId = id;
    state.pets = await API.getPets();
    closeModal();
    showToast(`${name} added! 🐾`);
    navigate(state.currentPage);
  }, 'Add Pet');

  // Attach breed autocomplete after modal opens
  setTimeout(() => {
    if (window.AC) AC.attachBreed(document.getElementById('m-breed'), 'm-species');
  }, 100);
}

function selectColor(el) {
  document.querySelectorAll('#color-picker .color-swatch').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

function selectEmoji(el) {
  document.querySelectorAll('#emoji-picker .emoji-avatar-option').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

// ─── EDIT PET MODAL ───────────────────────────────────────────────────────────
function showEditPetModal(petId) {
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;

  const palHtml = PET_PALETTE.map(c =>
    `<div class="color-swatch ${c===pet.color?'selected':''}" style="background:${c}" data-color="${c}" onclick="selectColor(this)"></div>`
  ).join('');

  const emojiHtml = PET_EMOJIS.map(e =>
    `<div class="emoji-avatar-option ${e===pet.avatar?'selected':''}" data-emoji="${e}" onclick="selectEmoji(this)">${e}</div>`
  ).join('');

  openModal('Edit Profile', `
    <div class="field"><label class="field-label">Name *</label><input id="em-name" class="field-input" value="${esc(pet.name)}" /></div>
    <div class="field">
      <label class="field-label">Species</label>
      <select id="em-species" class="field-input">
        ${['Dog','Cat','Rabbit','Bird','Fish','Reptile','Other'].map(s => `<option${s===pet.species?' selected':''}>${s}</option>`).join('')}
      </select>
    </div>
    <div class="field"><label class="field-label">Breed</label><input id="em-breed" class="field-input" value="${esc(pet.breed||'')}" /></div>
    <div class="field">
      <label class="field-label">Gender</label>
      <select id="em-gender" class="field-input">
        <option${pet.gender==='Male'?' selected':''}>Male</option>
        <option${pet.gender==='Female'?' selected':''}>Female</option>
      </select>
    </div>
    <div class="field"><label class="field-label">Age</label><input id="em-age" class="field-input" value="${esc(pet.age||'')}" placeholder="e.g. 2 yr 4 mo" /></div>
    <div class="field"><label class="field-label">Weight</label>
      <div style="display:flex;gap:8px">
        <input id="em-weight" type="number" step="0.1" class="field-input" value="${pet.weight||''}" style="flex:2" />
        <select id="em-wunit" class="field-input" style="flex:1">
          <option${pet.weightUnit==='kg'?' selected':''}>kg</option>
          <option${pet.weightUnit==='lbs'?' selected':''}>lbs</option>
        </select>
      </div>
    </div>
    <div class="field"><label class="field-label">Next Vet Visit</label><input id="em-nextvet" class="field-input" value="${esc(pet.nextVet||'')}" placeholder="e.g. Oct 15, 2025" /></div>
    <div class="field"><label class="field-label">Microchip ID</label><input id="em-microchip" class="field-input" value="${esc(pet.microchip||'')}" placeholder="e.g. 985112345678901" /></div>
    <div class="field"><label class="field-label">Insurance</label><input id="em-insurance" class="field-input" value="${esc(pet.insurance||'')}" placeholder="e.g. PetFirst, policy #123" /></div>
    <div class="field"><label class="field-label">Emergency Vet</label><input id="em-emergencyvet" class="field-input" value="${esc(pet.emergencyVet||'')}" placeholder="e.g. City Animal Hospital, (555) 123-4567" /></div>
    <div class="field"><label class="field-label">Avatar Emoji</label>
      <div class="emoji-avatar-grid" id="emoji-picker">${emojiHtml}</div>
    </div>
    <div class="field"><label class="field-label">Profile Color</label>
      <div class="color-picker" id="color-picker">${palHtml}</div>
    </div>
  `, async () => {
    const name = document.getElementById('em-name').value.trim();
    if (!name) { showToast('Name is required', 'error'); throw new Error('Name required'); }
    const color = document.querySelector('#color-picker .color-swatch.selected')?.dataset.color || pet.color;
    const avatar = document.querySelector('#emoji-picker .emoji-avatar-option.selected')?.dataset.emoji || pet.avatar || '';
    const w = parseFloat(document.getElementById('em-weight').value);
    await API.updatePet(petId, {
      name, color, avatar,
      species: document.getElementById('em-species').value,
      breed: document.getElementById('em-breed').value.trim(),
      gender: document.getElementById('em-gender').value,
      age: document.getElementById('em-age').value.trim(),
      weight: isNaN(w) ? pet.weight : w,
      weightUnit: document.getElementById('em-wunit').value,
      nextVet: document.getElementById('em-nextvet').value.trim(),
      microchip: document.getElementById('em-microchip').value.trim(),
      insurance: document.getElementById('em-insurance').value.trim(),
      emergencyVet: document.getElementById('em-emergencyvet').value.trim(),
    });
    state.pets = await API.getPets();
    closeModal();
    showToast('Profile updated ✓');
    navigate(state.currentPage);
  }, 'Save Changes');

  // Attach breed autocomplete for Edit Pet modal
  setTimeout(() => {
    if (window.AC) AC.attachBreed(document.getElementById('em-breed'), 'em-species');
  }, 100);
}

// ─── DELETE PET ───────────────────────────────────────────────────────────────
async function handleDeletePet(petId, name) {
  openModal('Delete Pet', `
    <div style="text-align:center;padding:8px 0">
      <div style="font-size:48px;margin-bottom:12px">⚠️</div>
      <div style="font-size:16px;font-weight:700;color:var(--ink);margin-bottom:6px">Delete ${esc(name)}'s profile?</div>
      <div style="font-size:13px;color:var(--ink-soft)">This permanently removes all reminders and records. <strong>This cannot be undone.</strong></div>
    </div>
  `, async () => {
    await API.deletePet(petId);
    state.pets = state.pets.filter(p => p.id !== petId);
    state.reminders = state.reminders.filter(r => r.pet_id !== petId);
    state.records = state.records.filter(r => r.pet_id !== petId);
    state.activePetId = state.pets[0]?.id || null;
    closeModal();
    showToast(`${name} removed`);
    navigate(state.currentPage);
  }, '🗑 Delete Permanently');
}

// ─── LOG WEIGHT MODAL ─────────────────────────────────────────────────────────
function showLogWeightModal(petId) {
  const pet = state.pets.find(p => p.id === petId);
  openModal('Log Weight', `
    <div style="text-align:center;padding:8px 0 16px">
      <div style="font-size:36px">⚖️</div>
      <div style="font-size:14px;color:var(--ink-soft);margin-top:6px">Current: <strong style="color:var(--ink)">${pet?.weight || 0} ${pet?.weightUnit || 'kg'}</strong></div>
    </div>
    <div class="field">
      <label class="field-label">New Weight (${pet?.weightUnit || 'kg'})</label>
      <input id="lw-weight" type="number" step="0.1" min="0" class="field-input" placeholder="e.g. 13.2" autofocus />
    </div>
  `, async () => {
    const w = parseFloat(document.getElementById('lw-weight').value);
    if (!w || w <= 0) { showToast('Enter a valid weight', 'error'); throw new Error('Invalid weight'); }
    await API.logWeight(petId, w);
    state.pets = await API.getPets();
    closeModal();
    showToast(`Weight logged: ${w} ${pet?.weightUnit || 'kg'} ✓`);
    navigate(state.currentPage);
  }, 'Log Weight');
}

// ─── GUIDELINES MODAL ─────────────────────────────────────────────────────────
function showEditGuidelinesModal(petId) {
  const pet = state.pets.find(p => p.id === petId);
  openModal('Care Guidelines', `
    <p style="font-size:12px;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">🍖 Feeding</p>
    <div class="field"><label class="field-label">Summary</label><input id="gl-ft" class="field-input" value="${esc(pet?.food?.title||'')}" placeholder="e.g. 2 cups, twice daily" /></div>
    <div class="field"><label class="field-label">Details</label><textarea id="gl-fd" class="field-input" rows="2" placeholder="e.g. Chicken, boiled rice, pumpkin">${esc(pet?.food?.desc||'')}</textarea></div>
    <div class="divider" style="margin:12px 0"></div>
    <p style="font-size:12px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">🏃 Exercise</p>
    <div class="field"><label class="field-label">Summary</label><input id="gl-et" class="field-input" value="${esc(pet?.exercise?.title||'')}" placeholder="e.g. 60 min walk/day" /></div>
    <div class="field"><label class="field-label">Details</label><textarea id="gl-ed" class="field-input" rows="2" placeholder="e.g. Morning walk, fetch in the park">${esc(pet?.exercise?.desc||'')}</textarea></div>
  `, async () => {
    await API.updatePet(petId, {
      foodTitle: document.getElementById('gl-ft').value.trim(),
      foodDesc: document.getElementById('gl-fd').value.trim(),
      exerciseTitle: document.getElementById('gl-et').value.trim(),
      exerciseDesc: document.getElementById('gl-ed').value.trim(),
    });
    state.pets = await API.getPets();
    closeModal();
    showToast('Guidelines updated ✓');
    navigate(state.currentPage);
  }, 'Save Guidelines');

  // Attach autocomplete for food ingredients and activities
  setTimeout(() => {
    if (window.AC) {
      AC.attach(document.getElementById('gl-ft'), 'ingredient');
      AC.attach(document.getElementById('gl-et'), 'activity');
    }
  }, 100);
}

// ─── ADD REMINDER MODAL ───────────────────────────────────────────────────────
function showAddReminderModal(petId) {
  const catOpts = Object.entries(CATEGORY_META).map(([k,v]) =>
    `<option value="${k}">${v.icon} ${v.label}</option>`
  ).join('');

  const today = new Date().toISOString().split('T')[0];

  openModal('Add Reminder', `
    <div class="field">
      <label class="field-label">Category</label>
      <select id="ar-cat" class="field-input">${catOpts}</select>
    </div>
    <div class="field"><label class="field-label">Title *</label>
      <input id="ar-title" class="field-input" placeholder="e.g. Rabies booster" /></div>
    <div class="field"><label class="field-label">Details</label>
      <input id="ar-meta" class="field-input" placeholder="e.g. Dr. Sen · City Animal Clinic" /></div>
    <div class="field">
      <label class="field-label">Due Date</label>
      <input id="ar-duedate" type="date" class="field-input" min="${today}" />
    </div>
    <div class="field">
      <label class="field-label">Recurring</label>
      <select id="ar-recurring" class="field-input">
        <option value="">One-time</option>
        <option value="Weekly">Weekly</option>
        <option value="Monthly">Monthly</option>
        <option value="Every 3 months">Every 3 months</option>
        <option value="Every 6 months">Every 6 months</option>
        <option value="Yearly">Yearly</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">Initial Status</label>
      <select id="ar-status" class="field-input">
        <option value="upcoming">Upcoming</option>
        <option value="overdue">Overdue</option>
        <option value="done">Done</option>
      </select>
    </div>
  `, async () => {
    const title = document.getElementById('ar-title').value.trim();
    if (!title) { showToast('Title is required', 'error'); throw new Error('Title required'); }
    const { id } = await API.createReminder({
      petId,
      cat: document.getElementById('ar-cat').value,
      title,
      meta: document.getElementById('ar-meta').value.trim(),
      dueDate: document.getElementById('ar-duedate').value,
      recurring: document.getElementById('ar-recurring').value,
      status: document.getElementById('ar-status').value,
    });
    state.reminders = await API.getReminders();
    updateOverdueBadge();
    closeModal();
    showToast('Reminder added 🔔');
    renderReminders();
  }, 'Add Reminder');

  // Attach autocomplete based on category
  setTimeout(() => {
    if (!window.AC) return;
    const catEl = document.getElementById('ar-cat');
    const titleEl = document.getElementById('ar-title');
    const updateAC = () => {
      const cat = catEl?.value || '';
      if (cat === 'vaccine') AC.attach(titleEl, 'vaccine');
      else if (cat === 'med') AC.attach(titleEl, 'medicine');
      else if (cat === 'deworm') AC.attach(titleEl, 'medicine');
      else AC.close();
    };
    updateAC();
    catEl?.addEventListener('change', updateAC);
  }, 100);
}

// ─── ADD RECORD MODAL ─────────────────────────────────────────────────────────
function showAddRecordModal(petId, defaultType) {
  const typeOpts = RECORD_TYPES.map(t =>
    `<option value="${t.key}" ${t.key===defaultType?'selected':''}>${t.label}</option>`
  ).join('');

  openModal('Add Record', `
    <div class="field">
      <label class="field-label">Type</label>
      <select id="rec-type" class="field-input">${typeOpts}</select>
    </div>
    <div class="field"><label class="field-label">Title *</label>
      <input id="rec-title" class="field-input" placeholder="e.g. Rabies vaccine" /></div>
    <div class="field"><label class="field-label">Details / Notes</label>
      <textarea id="rec-meta" class="field-input" rows="2" placeholder="e.g. Administered Feb 12, 2026"></textarea></div>
    <div class="field"><label class="field-label">Doctor / Vet</label>
      <input id="rec-doctor" class="field-input" placeholder="e.g. Dr. Priya Sen" /></div>
    <div id="toxic-warn" style="display:none;background:var(--danger-tint);border:1px solid rgba(231,74,74,0.4);border-radius:10px;padding:10px 12px;font-size:12px;color:var(--danger);margin-top:6px">⚠️ Possible toxic ingredient detected! Double-check before giving to your pet.</div>
  `, async () => {
    const title = document.getElementById('rec-title').value.trim();
    if (!title) { showToast('Title is required', 'error'); throw new Error('Title required'); }
    await API.createRecord({
      petId,
      type: document.getElementById('rec-type').value,
      title,
      meta: document.getElementById('rec-meta').value.trim(),
      doctor: document.getElementById('rec-doctor').value.trim(),
    });
    state.records = await API.getRecords();
    closeModal();
    showToast('Record added 📋');
    renderRecords();
  }, 'Add Record');

  // Attach autocomplete for title based on type
  setTimeout(() => {
    if (!window.AC) return;
    const typeEl = document.getElementById('rec-type');
    const titleEl = document.getElementById('rec-title');
    const metaEl = document.getElementById('rec-meta');
    const warnEl = document.getElementById('toxic-warn');

    const updateAC = () => {
      const type = typeEl?.value || '';
      if (type === 'vaccinations') AC.attach(titleEl, 'vaccine');
      else if (type === 'prescriptions') AC.attach(titleEl, 'medicine');
      else if (type === 'treatments') AC.attach(titleEl, 'medicine');
      else AC.close();
    };
    updateAC();
    typeEl?.addEventListener('change', updateAC);

    // Toxic check on meta field
    metaEl?.addEventListener('input', () => {
      if (!warnEl) return;
      const toxic = AC.checkToxic(metaEl.value);
      warnEl.style.display = toxic ? 'block' : 'none';
      if (toxic) warnEl.textContent = `⚠️ "${toxic}" is toxic to pets! Do not include in food or medication.`;
    });
  }, 100);
}

function darkenColor(hex) {
  try {
    const n = parseInt((hex || '#333').slice(1), 16);
    const r = Math.max(0, (n >> 16) - 50);
    const g = Math.max(0, ((n >> 8) & 0xff) - 50);
    const b = Math.max(0, (n & 0xff) - 50);
    return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}`;
  } catch { return hex; }
}

// ─── FAB Visibility ───────────────────────────────────────────────────────────
function hideFabs() {
  ['reminders-fab', 'records-fab'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

// ─── System Theme Listener ────────────────────────────────────────────────────
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (getTheme() === 'system') applyTheme('system');
});

// ─── Keyboard navigation support ─────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
(async () => {
  const startTime = Date.now();
  try {
    const user = await API.me();
    state.user = user;
    const elapsed = Date.now() - startTime;
    if (elapsed < 900) await new Promise(r => setTimeout(r, 900 - elapsed));
    await loadApp();
    attachRipples();
  } catch {
    const elapsed = Date.now() - startTime;
    if (elapsed < 900) await new Promise(r => setTimeout(r, 900 - elapsed));
    dismissLoader();
    document.getElementById('auth-page').classList.remove('hidden');
    attachRipples();
  }
})();
