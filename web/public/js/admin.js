/* ═══════════════════════════════════════════════════════════════════════════
   PETSY — Admin Dashboard JavaScript
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  user:    null,
  stats:   null,
  users:   [],
  pets:    [],
  section: 'dashboard',
};

const SPECIES_EMOJI = {
  Dog: '🐶', Cat: '🐱', Rabbit: '🐰', Hamster: '🐹',
  Bird: '🦜', Fish: '🐠', Snake: '🐍', Turtle: '🐢',
  default: '🐾',
};

// ─── Theme Controller (Dark & Light Mode) ───────────────────────────────────
function getAdminTheme() {
  return localStorage.getItem('petsy-admin-theme') || 'dark';
}

function applyAdminTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('petsy-admin-theme', theme);
  updateThemeToggleUI(theme);
}

function toggleAdminTheme() {
  const current = getAdminTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyAdminTheme(next);
}

function updateThemeToggleUI(theme) {
  const isDark = theme === 'dark';
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.innerHTML = `<span class="theme-toggle-icon">${isDark ? '🌙' : '☀️'}</span><span class="theme-toggle-text">${isDark ? 'Dark' : 'Light'}</span>`;
    btn.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    btn.title = `Switch to ${isDark ? 'light' : 'dark'} mode`;
  });
}

// ─── Kutto Running Dog Loader Controller ──────────────────────────────────
function dismissAdminLoader() {
  const el = document.getElementById('loading-screen');
  if (!el) return;
  el.classList.add('fade-out');
  setTimeout(() => {
    el.classList.add('hidden');
    el.classList.remove('fade-out');
  }, 400);
}

// ─── API helpers ──────────────────────────────────────────────────────────────
async function api(method, url, body) {
  const opts = {
    method,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (res.status === 401 || res.status === 403) {
    return { _status: res.status, error: res.status === 401 ? 'Unauthorized' : 'Forbidden' };
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const area = document.getElementById('toast-area');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${msg}`;
  area.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function navigate(section) {
  state.section = section;

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.section === section);
  });

  // Update page title
  const titles = { dashboard: 'Dashboard', users: 'Users', pets: 'Pets' };
  const subs   = {
    dashboard: 'Overview of your Petsy platform',
    users:     'All registered user accounts',
    pets:      'All pet profiles across all users',
  };
  document.getElementById('page-title').textContent = titles[section] || section;
  document.getElementById('page-sub').textContent   = subs[section]  || '';

  // Show section
  document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
  document.getElementById(`section-${section}`).classList.remove('hidden');

  // Render content
  if (section === 'dashboard') renderDashboard();
  if (section === 'users')     renderUsers(state.users);
  if (section === 'pets')      renderPets(state.pets);
}

// ─── Logout ───────────────────────────────────────────────────────────────────
async function handleLogout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  state.user = null;
  document.getElementById('admin-app').classList.add('hidden');
  showLoginScreen();
}

function showLoginScreen(errMsg = '') {
  dismissAdminLoader();
  document.getElementById('admin-app').classList.add('hidden');
  const loginScreen = document.getElementById('admin-login-screen');
  loginScreen.classList.remove('hidden');
  updateThemeToggleUI(getAdminTheme());
  const errEl = document.getElementById('login-err');
  if (errMsg) {
    errEl.textContent = errMsg;
    errEl.classList.remove('hidden');
  } else {
    errEl.classList.add('hidden');
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const errEl = document.getElementById('login-err');
  errEl.classList.add('hidden');

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('btn-login-submit');

  btn.disabled = true;
  btn.textContent = 'Verifying admin account…';

  try {
    const res = await api('POST', '/api/auth/login', { email, password });
    if (res._status || res.error) {
      throw new Error(res.error || 'Invalid credentials');
    }
    if (!res.user || !res.user.isAdmin) {
      throw new Error('Access denied: Account is not an administrator. Please run the database migration first.');
    }
    document.getElementById('admin-login-screen').classList.add('hidden');
    document.getElementById('loading-screen').classList.remove('hidden');
    await init();
  } catch (err) {
    errEl.textContent = err.message || 'Login failed';
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In to Admin Console →';
  }
}

// ─── Count-up animation ───────────────────────────────────────────────────────
function animateCount(el, target) {
  const duration = 800;
  const start    = Date.now();
  const tick = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ─── Date formatting ──────────────────────────────────────────────────────────
function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// ─── Render — Dashboard ───────────────────────────────────────────────────────
function renderDashboard() {
  const s = state.stats || {};

  // Animate stat numbers
  const nums = {
    'stat-users':     s.users     || 0,
    'stat-pets':      s.pets      || 0,
    'stat-reminders': s.reminders || 0,
    'stat-records':   s.records   || 0,
  };
  for (const [id, val] of Object.entries(nums)) {
    const el = document.getElementById(id);
    if (el) animateCount(el, val);
  }

  // Recent users table (up to 5)
  const recentUsers = [...state.users].slice(0, 5);
  document.getElementById('dash-users-body').innerHTML = recentUsers.length
    ? recentUsers.map(u => userRow(u, true)).join('')
    : emptyRow('No users yet', 4);

  // Recent pets table (up to 5)
  const recentPets = [...state.pets].slice(0, 5);
  document.getElementById('dash-pets-body').innerHTML = recentPets.length
    ? recentPets.map(p => petRow(p, true)).join('')
    : emptyRow('No pets yet', 4);
}

// ─── Render — Users ───────────────────────────────────────────────────────────
function renderUsers(list) {
  const el = document.getElementById('users-count');
  if (el) el.textContent = `${list.length} total`;

  document.getElementById('users-body').innerHTML = list.length
    ? list.map(u => userRow(u, false)).join('')
    : emptyRow('No users found', 5);
}

function userRow(u, compact) {
  const initial = (u.name || u.email || 'U').charAt(0).toUpperCase();
  const pets = Array.from({ length: Math.min(u.pet_count || 0, 5) });
  const safeName = esc(u.name || u.email || 'User');

  return `<tr>
    <td>
      <div class="td-name">
        <div class="td-avatar">${initial}</div>
        <div>
          <div>${esc(u.name || '—')}</div>
          <div class="td-email">${esc(u.email || '—')}</div>
        </div>
      </div>
    </td>
    <td>
      <div class="pet-count-cell">
        <strong style="color:var(--text)">${u.pet_count || 0}</strong>
        <div class="pet-pips">
          ${pets.map(() => `<div class="pet-pip"></div>`).join('')}
        </div>
      </div>
    </td>
    <td style="color:var(--text-muted);font-size:12.5px">${timeAgo(u.created_at)}</td>
    ${!compact ? `<td><span class="badge badge-green">Active</span></td>` : ''}
    <td style="text-align:right">
      <div class="td-actions">
        <button class="btn-action btn-action-view" onclick="viewUserDetails('${u.id}')" title="View details">
          <span>👁</span> View
        </button>
        <button class="btn-action btn-action-delete" onclick="confirmDeleteUser('${u.id}', '${safeName}')" title="Delete user">
          <span>🗑</span> Delete
        </button>
      </div>
    </td>
  </tr>`;
}

// ─── Render — Pets ────────────────────────────────────────────────────────────
function renderPets(list) {
  const el = document.getElementById('pets-count');
  if (el) el.textContent = `${list.length} total`;

  document.getElementById('pets-body').innerHTML = list.length
    ? list.map(p => petRow(p, false)).join('')
    : emptyRow('No pets found', 6);
}

function petRow(p, compact) {
  const emoji = SPECIES_EMOJI[p.species] || SPECIES_EMOJI.default;
  const speciesBadge = {
    Dog: 'badge-green', Cat: 'badge-blue', Rabbit: 'badge-orange',
    Bird: 'badge-purple',
  }[p.species] || 'badge-gray';
  const safeName = esc(p.name || 'Pet');

  return `<tr>
    <td>
      <div class="td-name">
        <div class="td-pet-avatar">${emoji}</div>
        <span>${esc(p.name)}</span>
      </div>
    </td>
    <td><span class="badge ${speciesBadge}">${esc(p.species)}</span></td>
    <td style="color:var(--text-soft)">${esc(p.breed || '—')}</td>
    ${!compact ? `<td class="td-email">${esc(p.ownerEmail || '—')}</td>` : ''}
    <td style="color:var(--text-muted);font-size:12.5px">${timeAgo(p.created_at)}</td>
    <td style="text-align:right">
      <div class="td-actions">
        <button class="btn-action btn-action-view" onclick="viewPetDetails('${p.id}')" title="View details">
          <span>👁</span> View
        </button>
        <button class="btn-action btn-action-delete" onclick="confirmDeletePet('${p.id}', '${safeName}')" title="Delete pet">
          <span>🗑</span> Delete
        </button>
      </div>
    </td>
  </tr>`;
}

function emptyRow(msg, cols) {
  return `<tr><td colspan="${cols}">
    <div class="empty-state">
      <div class="empty-state-icon">🔍</div>
      <p>${msg}</p>
    </div>
  </td></tr>`;
}

// ─── Search filtering ─────────────────────────────────────────────────────────
function filterUsers(q) {
  const query = q.toLowerCase();
  const filtered = state.users.filter(u =>
    (u.name  || '').toLowerCase().includes(query) ||
    (u.email || '').toLowerCase().includes(query)
  );
  renderUsers(filtered);
}

function filterPets(q) {
  const query = q.toLowerCase();
  const filtered = state.pets.filter(p =>
    (p.name       || '').toLowerCase().includes(query) ||
    (p.species    || '').toLowerCase().includes(query) ||
    (p.breed      || '').toLowerCase().includes(query) ||
    (p.ownerEmail || '').toLowerCase().includes(query)
  );
  renderPets(filtered);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  applyAdminTheme(getAdminTheme());
  const startTime = Date.now();
  document.getElementById('loading-screen').classList.remove('hidden', 'fade-out');
  document.getElementById('admin-login-screen').classList.add('hidden');
  document.getElementById('admin-app').classList.add('hidden');

  // 1. Verify login
  const meData = await api('GET', '/api/auth/me').catch(() => null);
  const elapsed = Date.now() - startTime;
  if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed));

  if (!meData || meData._status === 401 || meData._status === 403 || !meData.isAdmin) {
    showLoginScreen(meData && !meData.isAdmin && !meData._status ? 'Access denied: Your account does not have administrator privileges.' : '');
    return;
  }

  // 2. Fetch stats
  const statsData = await api('GET', '/admin/api/stats').catch(() => null);
  if (!statsData || statsData._status === 401 || statsData._status === 403) {
    showLoginScreen('Access denied: Admin permissions missing.');
    return;
  }

  state.user  = meData;
  state.stats = statsData;

  // 3. Load users + pets
  const [usersData, petsData] = await Promise.all([
    api('GET', '/admin/api/users').catch(() => []),
    api('GET', '/admin/api/pets').catch(() => []),
  ]);

  state.users = Array.isArray(usersData) ? usersData : [];
  state.pets  = Array.isArray(petsData) ? petsData : [];

  // 4. Populate sidebar user info
  document.getElementById('sb-user-name').textContent  = meData.name  || 'Admin';
  document.getElementById('sb-user-initial').textContent = (meData.name || 'A').charAt(0).toUpperCase();

  // 5. Show app
  dismissAdminLoader();
  document.getElementById('admin-app').classList.remove('hidden');
  updateThemeToggleUI(getAdminTheme());

  // 6. Render default section
  navigate('dashboard');
}

// ─── Modal Management ─────────────────────────────────────────────────────────
function openAdminModal(title, subtitle, icon, bodyHtml, footerHtml = '') {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-subtitle').textContent = subtitle;
  document.getElementById('modal-icon').textContent = icon;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-footer').innerHTML = footerHtml || '<button class="btn-cancel" onclick="closeAdminModal()">Close</button>';
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('admin-modal').classList.remove('hidden');
}

function closeAdminModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('admin-modal').classList.add('hidden');
}

function openConfirmModal(title, msg, onConfirm) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  const btn = document.getElementById('btn-confirm-delete');
  btn.onclick = async () => {
    btn.disabled = true;
    btn.textContent = 'Deleting…';
    try {
      await onConfirm();
      closeConfirmModal();
    } catch (err) {
      toast(err.message || 'Action failed', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Delete';
    }
  };
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeConfirmModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('confirm-modal').classList.add('hidden');
}

async function refreshData() {
  const [statsData, usersData, petsData] = await Promise.all([
    api('GET', '/admin/api/stats').catch(() => null),
    api('GET', '/admin/api/users').catch(() => []),
    api('GET', '/admin/api/pets').catch(() => []),
  ]);
  if (statsData) state.stats = statsData;
  state.users = Array.isArray(usersData) ? usersData : state.users;
  state.pets  = Array.isArray(petsData)  ? petsData  : state.pets;
  navigate(state.section);
}

// ─── View & Delete Handlers ───────────────────────────────────────────────────
async function viewUserDetails(userId) {
  const data = await api('GET', `/admin/api/users/${userId}`);
  if (!data || data.error) {
    toast(data?.error || 'Could not load user details', 'error');
    return;
  }
  const u = data.profile;
  const pets = data.pets || [];

  const bodyHtml = `
    <div class="detail-pill-row">
      <div class="detail-pill">
        <div class="detail-pill-label">Total Pets</div>
        <div class="detail-pill-val">${pets.length}</div>
      </div>
      <div class="detail-pill">
        <div class="detail-pill-label">Reminders</div>
        <div class="detail-pill-val">${data.remindersCount}</div>
      </div>
      <div class="detail-pill">
        <div class="detail-pill-label">Health Records</div>
        <div class="detail-pill-val">${data.recordsCount}</div>
      </div>
    </div>

    <div>
      <div class="detail-section-title">Account Details</div>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-item-label">Full Name</div>
          <div class="detail-item-val">${esc(u.name || '—')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Email Address</div>
          <div class="detail-item-val">${esc(u.email || '—')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">User ID (UUID)</div>
          <div class="detail-item-val" style="font-family:monospace;font-size:12px">${esc(u.id)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Member Since</div>
          <div class="detail-item-val">${fmtDate(u.created_at)} (${timeAgo(new Date(u.created_at).getTime())})</div>
        </div>
      </div>
    </div>

    <div>
      <div class="detail-section-title">Registered Pets (${pets.length})</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${pets.length ? pets.map(p => {
          const emoji = SPECIES_EMOJI[p.species] || SPECIES_EMOJI.default;
          return `
            <div class="detail-pet-card">
              <div class="detail-pet-left">
                <div class="detail-pet-avatar">${emoji}</div>
                <div>
                  <div class="detail-pet-name">${esc(p.name)}</div>
                  <div class="detail-pet-sub">${esc(p.species)} · ${esc(p.breed || 'Mixed')} · ${p.weight || '—'} ${esc(p.weight_unit || 'kg')}</div>
                </div>
              </div>
              <button class="btn-action btn-action-view" onclick="closeAdminModal(); viewPetDetails('${p.id}')">
                View Pet →
              </button>
            </div>
          `;
        }).join('') : '<p style="color:var(--text-muted);font-size:13px">No pets registered yet.</p>'}
      </div>
    </div>
  `;

  const footerHtml = `
    <button class="btn-action btn-action-delete" style="margin-right:auto;padding:8px 14px" onclick="closeAdminModal(); confirmDeleteUser('${u.id}', '${esc(u.name || u.email)}')">
      🗑 Delete User Account
    </button>
    <button class="btn-cancel" onclick="closeAdminModal()">Close</button>
  `;

  openAdminModal(u.name || 'User Profile', u.email || 'User Details', '👤', bodyHtml, footerHtml);
}

function confirmDeleteUser(userId, name) {
  openConfirmModal(
    'Delete User Account',
    `Are you sure you want to permanently delete user "${name}"? All their registered pets, medical records, and reminders will be erased immediately.`,
    async () => {
      const res = await api('DELETE', `/admin/api/users/${userId}`);
      if (res.error) throw new Error(res.error);
      toast('User deleted successfully');
      await refreshData();
    }
  );
}

async function viewPetDetails(petId) {
  const data = await api('GET', `/admin/api/pets/${petId}`);
  if (!data || data.error) {
    toast(data?.error || 'Could not load pet details', 'error');
    return;
  }
  const p = data.pet;
  const owner = data.owner || {};
  const emoji = SPECIES_EMOJI[p.species] || SPECIES_EMOJI.default;

  const bodyHtml = `
    <div class="detail-pill-row">
      <div class="detail-pill">
        <div class="detail-pill-label">Species</div>
        <div class="detail-pill-val">${esc(p.species)}</div>
      </div>
      <div class="detail-pill">
        <div class="detail-pill-label">Current Weight</div>
        <div class="detail-pill-val">${p.weight || '—'} ${esc(p.weight_unit || 'kg')}</div>
      </div>
      <div class="detail-pill">
        <div class="detail-pill-label">Reminders</div>
        <div class="detail-pill-val">${(data.reminders || []).length}</div>
      </div>
      <div class="detail-pill">
        <div class="detail-pill-label">Health Records</div>
        <div class="detail-pill-val">${(data.records || []).length}</div>
      </div>
    </div>

    <div>
      <div class="detail-section-title">Pet Information</div>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-item-label">Pet Name</div>
          <div class="detail-item-val">${esc(p.name)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Breed</div>
          <div class="detail-item-val">${esc(p.breed || '—')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Gender & Age</div>
          <div class="detail-item-val">${esc(p.gender || '—')} · ${esc(p.age || '—')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Owner</div>
          <div class="detail-item-val">${esc(owner.name || '—')} (${esc(owner.email || '—')})</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Microchip ID</div>
          <div class="detail-item-val" style="font-family:monospace">${esc(p.microchip || 'None')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Next Vet Visit</div>
          <div class="detail-item-val">${esc(p.next_vet || 'Not scheduled')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Insurance Provider</div>
          <div class="detail-item-val">${esc(p.insurance || 'None')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Emergency Vet Contact</div>
          <div class="detail-item-val">${esc(p.emergency_vet || 'None')}</div>
        </div>
      </div>
    </div>

    <div>
      <div class="detail-section-title">Care & Nutrition Guidelines</div>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-item-label">Feeding Diet</div>
          <div class="detail-item-val">${esc(p.food_title || 'Not set')}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${esc(p.food_desc || '')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Exercise Plan</div>
          <div class="detail-item-val">${esc(p.exercise_title || 'Not set')}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${esc(p.exercise_desc || '')}</div>
        </div>
      </div>
    </div>

    <div>
      <div class="detail-section-title">Active Reminders (${(data.reminders || []).length})</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${(data.reminders || []).length ? data.reminders.map(r => `
          <div class="detail-item" style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-weight:600;color:var(--text)">${esc(r.title)}</div>
              <div style="font-size:12px;color:var(--text-muted)">Due: ${r.due_date || 'No date'} · ${r.recurring || 'One-time'}</div>
            </div>
            <span class="badge ${r.status==='done'?'badge-green':r.status==='overdue'?'badge-orange':'badge-blue'}">${esc(r.status)}</span>
          </div>
        `).join('') : '<p style="color:var(--text-muted);font-size:13px">No reminders recorded.</p>'}
      </div>
    </div>
  `;

  const footerHtml = `
    <button class="btn-action btn-action-delete" style="margin-right:auto;padding:8px 14px" onclick="closeAdminModal(); confirmDeletePet('${p.id}', '${esc(p.name)}')">
      🗑 Delete Pet
    </button>
    <button class="btn-cancel" onclick="closeAdminModal()">Close</button>
  `;

  openAdminModal(p.name, `${p.species} · Owner: ${owner.email || '—'}`, emoji, bodyHtml, footerHtml);
}

function confirmDeletePet(petId, name) {
  openConfirmModal(
    'Delete Pet Profile',
    `Are you sure you want to delete pet "${name}"? All medical records, weight history, and reminders for this pet will be removed.`,
    async () => {
      const res = await api('DELETE', `/admin/api/pets/${petId}`);
      if (res.error) throw new Error(res.error);
      toast('Pet deleted successfully');
      await refreshData();
    }
  );
}

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ─── Keyboard listeners ───────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAdminModal();
    closeConfirmModal();
  }
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
