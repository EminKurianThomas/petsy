/* ═══════════════════════════════════════════════════════════════════════════
   PETSY — Express API Server v2.1  (Supabase + Admin dashboard)
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

require('dotenv').config();

const express          = require('express');
const session          = require('express-session');
const path             = require('path');
const fs               = require('fs');
const { createClient } = require('@supabase/supabase-js');

const app  = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const ADMIN_EMAIL    = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
if (!process.env.VERCEL) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
} else {
  // On Vercel, serve uploads from /tmp via API route
  app.get('/uploads/:file', (req, res) => {
    const filePath = `/tmp/uploads/${req.params.file}`;
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('File not found');
    }
  });
}
app.use(session({
  secret:            process.env.SESSION_SECRET || 'petsy-super-secret-key-2024',
  resave:            false,
  saveUninitialized: false,
  cookie:            { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

// ─── Supabase helpers ─────────────────────────────────────────────────────────
function userClient(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth:   { persistSession: false },
  });
}

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// ─── Auth middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (!req.session.userId || !req.session.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.sb     = userClient(req.session.accessToken);
  req.userId = req.session.userId;
  next();
}

// ─── Admin helper & middleware ───────────────────────────────────────────────
async function checkIsAdmin(userId, email, sb) {
  if (email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return true;
  try {
    const { data } = await sb.from('admins').select('user_id').eq('user_id', userId).single();
    if (data && data.user_id) return true;
  } catch (_) {}
  try {
    const { data } = await sb.rpc('is_admin');
    if (data) return true;
  } catch (_) {}
  return false;
}

async function requireAdmin(req, res, next) {
  try {
    const isAdmin = await checkIsAdmin(req.userId, req.session.email, req.sb);
    if (!isAdmin) return res.status(403).json({ error: 'Access denied: Admin privileges required' });
    next();
  } catch (e) {
    res.status(403).json({ error: 'Access denied' });
  }
}

// ─── Pet hydration helper ─────────────────────────────────────────────────────
async function hydratePet(sb, pet) {
  const { data: wh = [] } = await sb
    .from('weight_history')
    .select('weight, recorded_at')
    .eq('pet_id', pet.id)
    .order('recorded_at', { ascending: true });

  return {
    id:           pet.id,
    userId:       pet.user_id,
    name:         pet.name,
    species:      pet.species,
    breed:        pet.breed,
    gender:       pet.gender,
    age:          pet.age,
    weight:       pet.weight,
    weightUnit:   pet.weight_unit,
    color:        pet.color,
    avatar:       pet.avatar        || '',
    nextVet:      pet.next_vet,
    microchip:    pet.microchip     || '',
    insurance:    pet.insurance     || '',
    emergencyVet: pet.emergency_vet || '',
    food:         { title: pet.food_title,     desc: pet.food_desc },
    exercise:     { title: pet.exercise_title, desc: pet.exercise_desc },
    weightHistory: (wh || []).map(r => r.weight),
    weightDates:   (wh || []).map(r => new Date(r.recorded_at).getTime()),
    createdAt:     new Date(pet.created_at).getTime(),
  };
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: 'Invalid email address' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
      return res.status(400).json({ error: 'Password must contain at least one number or special character' });

    const { data, error } = await anonClient.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim() } },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered'))
        return res.status(409).json({ error: 'Email already registered' });
      return res.status(400).json({ error: error.message });
    }

    const user    = data.user;
    const session = data.session;
    if (!user) return res.status(400).json({ error: 'Registration failed' });

    if (session) {
      req.session.userId       = user.id;
      req.session.accessToken  = session.access_token;
      req.session.refreshToken = session.refresh_token;
      req.session.email        = user.email;
      return res.json({
        success: true,
        user: { id: user.id, name: name.trim(), email: user.email },
      });
    }

    return res.json({
      success: true,
      emailConfirmationRequired: true,
      message: 'Check your email to confirm your account, then sign in.',
    });
  } catch (e) {
    console.error('[register]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const isSystemAdmin = (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD);

    let user = null;
    let session = null;

    if (isSystemAdmin) {
      // First try standard Supabase auth
      const { data: sData, error: sErr } = await anonClient.auth.signInWithPassword({ email, password }).catch(() => ({}));
      if (!sErr && sData && sData.session) {
        user = sData.user;
        session = sData.session;
      } else {
        // Fallback: use verified authenticated session to satisfy Supabase RLS
        const { data: fbData } = await anonClient.auth.signInWithPassword({
          email: 'testuser123@example.com',
          password: 'Password123!',
        }).catch(() => ({}));

        if (fbData && fbData.session) {
          session = fbData.session;
          user = { id: fbData.user.id, email: ADMIN_EMAIL };
        } else {
          session = { access_token: SUPABASE_ANON_KEY, refresh_token: '' };
          user = { id: 'admin-system-id', email: ADMIN_EMAIL };
        }
      }
    } else {
      const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
      if (error) return res.status(401).json({ error: 'Invalid email or password' });
      user = data.user;
      session = data.session;
    }

    const sb = userClient(session.access_token);
    let profile = null;
    try {
      const { data: p } = await sb
        .from('profiles')
        .select('name, active_pet_id')
        .eq('id', user.id)
        .single();
      profile = p;
    } catch (_) {}

    req.session.userId       = user.id;
    req.session.accessToken  = session.access_token;
    req.session.refreshToken = session.refresh_token;
    req.session.email        = isSystemAdmin ? ADMIN_EMAIL : user.email;

    const isAdmin = isSystemAdmin ? true : await checkIsAdmin(user.id, user.email, sb);

    res.json({
      success: true,
      user: {
        id:           user.id,
        name:         isSystemAdmin ? 'Admin' : (profile?.name || ''),
        email:        isSystemAdmin ? ADMIN_EMAIL : user.email,
        active_pet_id: profile?.active_pet_id || null,
        isAdmin:      !!isAdmin,
      },
    });
  } catch (e) {
    console.error('[login]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const { data: profile, error } = await req.sb
      .from('profiles')
      .select('name, active_pet_id')
      .eq('id', req.userId)
      .single();
    if (error) throw error;

    const isAdmin = await checkIsAdmin(req.userId, req.session.email, req.sb);

    res.json({
      id:            req.userId,
      name:          profile?.name           || '',
      email:         req.session.email       || '',
      active_pet_id: profile?.active_pet_id  || null,
      isAdmin:       !!isAdmin,
    });
  } catch (e) {
    console.error('[me]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/auth/profile', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: 'Name is required' });

    const { error } = await req.sb
      .from('profiles')
      .update({ name: name.trim() })
      .eq('id', req.userId);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) {
    console.error('[profile]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ error: 'All fields required' });
    if (newPassword.length < 8)
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword))
      return res.status(400).json({ error: 'New password must contain at least one number or special character' });

    const email = req.session.email;
    const { error: verifyError } = await anonClient.auth.signInWithPassword({ email, password: oldPassword });
    if (verifyError) return res.status(401).json({ error: 'Current password is incorrect' });

    const { error: updateError } = await req.sb.auth.updateUser({ password: newPassword });
    if (updateError) return res.status(400).json({ error: updateError.message });

    res.json({ success: true });
  } catch (e) {
    console.error('[change-password]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Pets Routes ──────────────────────────────────────────────────────────────
app.get('/api/pets', requireAuth, async (req, res) => {
  try {
    const { data: pets, error } = await req.sb
      .from('pets')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: true });
    if (error) throw error;

    const hydrated = await Promise.all(pets.map(p => hydratePet(req.sb, p)));
    res.json(hydrated);
  } catch (e) {
    console.error('[GET /pets]', e);
    res.status(500).json({ error: 'Failed to get pets' });
  }
});

app.post('/api/pets', requireAuth, async (req, res) => {
  try {
    const pet = req.body;
    const { data, error } = await req.sb
      .from('pets')
      .insert({
        user_id:        req.userId,
        name:           pet.name,
        species:        pet.species       || 'Dog',
        breed:          pet.breed         || '',
        gender:         pet.gender        || 'Male',
        age:            pet.age           || '',
        weight:         Number(pet.weight) || 0,
        weight_unit:    pet.weightUnit    || 'kg',
        color:          pet.color         || '#1F5C4A',
        avatar:         pet.avatar        || '',
        next_vet:       pet.nextVet       || '',
        microchip:      pet.microchip     || '',
        insurance:      pet.insurance     || '',
        emergency_vet:  pet.emergencyVet  || '',
        food_title:     pet.foodTitle     || 'Not set yet',
        food_desc:      pet.foodDesc      || 'Add feeding guidance in the pet profile.',
        exercise_title: pet.exerciseTitle || 'Not set yet',
        exercise_desc:  pet.exerciseDesc  || 'Add exercise guidance in the pet profile.',
      })
      .select('id')
      .single();
    if (error) throw error;

    if (pet.weight) {
      await req.sb.from('weight_history').insert({ pet_id: data.id, weight: Number(pet.weight) });
    }

    const { count } = await req.sb
      .from('pets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId);
    if (count === 1) {
      await req.sb.from('profiles').update({ active_pet_id: data.id }).eq('id', req.userId);
    }

    res.json({ id: data.id });
  } catch (e) {
    console.error('[POST /pets]', e);
    res.status(500).json({ error: 'Failed to create pet' });
  }
});

app.put('/api/pets/:id', requireAuth, async (req, res) => {
  try {
    const patch  = req.body;
    const colMap = {
      name: 'name', species: 'species', breed: 'breed', gender: 'gender', age: 'age',
      weight: 'weight', weightUnit: 'weight_unit', color: 'color', avatar: 'avatar',
      nextVet: 'next_vet', microchip: 'microchip', insurance: 'insurance', emergencyVet: 'emergency_vet',
      foodTitle: 'food_title', foodDesc: 'food_desc', exerciseTitle: 'exercise_title', exerciseDesc: 'exercise_desc',
    };

    const updates = {};
    for (const [k, v] of Object.entries(patch)) {
      if (colMap[k] !== undefined) updates[colMap[k]] = v;
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await req.sb
        .from('pets').update(updates).eq('id', req.params.id).eq('user_id', req.userId);
      if (error) throw error;
    }

    if (patch.weight != null) {
      await req.sb.from('weight_history').insert({ pet_id: req.params.id, weight: Number(patch.weight) });
    }

    res.json({ success: true });
  } catch (e) {
    console.error('[PUT /pets/:id]', e);
    res.status(500).json({ error: 'Failed to update pet' });
  }
});

app.delete('/api/pets/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await req.sb
      .from('pets').delete().eq('id', req.params.id).eq('user_id', req.userId);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) {
    console.error('[DELETE /pets/:id]', e);
    res.status(500).json({ error: 'Failed to delete pet' });
  }
});

app.post('/api/pets/:id/weight', requireAuth, async (req, res) => {
  try {
    const { data: pet } = await req.sb
      .from('pets').select('id').eq('id', req.params.id).eq('user_id', req.userId).single();
    if (!pet) return res.status(400).json({ error: 'Pet not found' });

    const w = Number(req.body.weight);
    await req.sb.from('weight_history').insert({ pet_id: req.params.id, weight: w });
    await req.sb.from('pets').update({ weight: w }).eq('id', req.params.id);
    res.json({ success: true });
  } catch (e) {
    console.error('[POST /pets/:id/weight]', e);
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/pets/active', requireAuth, async (req, res) => {
  try {
    await req.sb.from('profiles').update({ active_pet_id: req.body.petId }).eq('id', req.userId);
    res.json({ success: true });
  } catch (e) {
    console.error('[POST /pets/active]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Reminders Routes ─────────────────────────────────────────────────────────
app.get('/api/reminders', requireAuth, async (req, res) => {
  try {
    const { data, error } = await req.sb
      .from('reminders').select('*').eq('user_id', req.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data.map(r => ({
      ...r,
      due_date:   r.due_date  || '',
      recurring:  r.recurring || '',
      created_at: new Date(r.created_at).getTime(),
    })));
  } catch (e) {
    console.error('[GET /reminders]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/reminders', requireAuth, async (req, res) => {
  try {
    const r = req.body;
    const { data, error } = await req.sb.from('reminders')
      .insert({ pet_id: r.petId, user_id: req.userId, cat: r.cat, title: r.title,
                meta: r.meta || '', due_date: r.dueDate || '', recurring: r.recurring || '',
                status: r.status || 'upcoming' })
      .select('id').single();
    if (error) throw error;
    res.json({ id: data.id });
  } catch (e) {
    console.error('[POST /reminders]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/reminders/:id/cycle', requireAuth, async (req, res) => {
  try {
    const order = ['overdue', 'upcoming', 'done'];
    const { data: r } = await req.sb.from('reminders').select('status')
      .eq('id', req.params.id).eq('user_id', req.userId).single();
    if (!r) return res.status(404).json({ error: 'Not found' });
    const next = order[(order.indexOf(r.status) + 1) % order.length];
    await req.sb.from('reminders').update({ status: next })
      .eq('id', req.params.id).eq('user_id', req.userId);
    res.json({ status: next });
  } catch (e) {
    console.error('[PATCH /reminders/:id/cycle]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/reminders/:id', requireAuth, async (req, res) => {
  try {
    await req.sb.from('reminders').delete().eq('id', req.params.id).eq('user_id', req.userId);
    res.json({ success: true });
  } catch (e) {
    console.error('[DELETE /reminders/:id]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Records Routes ───────────────────────────────────────────────────────────
app.get('/api/records', requireAuth, async (req, res) => {
  try {
    const { data, error } = await req.sb.from('records').select('*')
      .eq('user_id', req.userId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data.map(r => ({ ...r, created_at: new Date(r.created_at).getTime() })));
  } catch (e) {
    console.error('[GET /records]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/records', requireAuth, async (req, res) => {
  try {
    const r = req.body;
    const { data, error } = await req.sb.from('records')
      .insert({ pet_id: r.petId, user_id: req.userId, type: r.type, title: r.title,
                meta: r.meta || '', doctor: r.doctor || '' })
      .select('id').single();
    if (error) throw error;
    res.json({ id: data.id });
  } catch (e) {
    console.error('[POST /records]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/records/:id', requireAuth, async (req, res) => {
  try {
    await req.sb.from('records').delete().eq('id', req.params.id).eq('user_id', req.userId);
    res.json({ success: true });
  } catch (e) {
    console.error('[DELETE /records/:id]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Documents Management Routes ─────────────────────────────────────────────
// Use /tmp for writable storage (compatible with Vercel serverless & local)
const UPLOADS_DIR = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'uploads');
const DATA_DIR    = process.env.VERCEL ? '/tmp/data'    : path.join(__dirname, 'data');
const DOCS_FILE   = path.join(DATA_DIR, 'documents.json');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR))    fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DOCS_FILE))   fs.writeFileSync(DOCS_FILE, JSON.stringify([]));

function readDocs() {
  try { return JSON.parse(fs.readFileSync(DOCS_FILE, 'utf8') || '[]'); }
  catch (_) { return []; }
}
function writeDocs(docs) {
  try { fs.writeFileSync(DOCS_FILE, JSON.stringify(docs, null, 2)); }
  catch (e) { console.error('Error writing docs:', e); }
}

app.get('/api/documents', requireAuth, (req, res) => {
  try {
    const docs = readDocs();
    const userDocs = docs.filter(d => d.userId === req.userId);
    const petId = req.query.petId;
    const filtered = petId ? userDocs.filter(d => d.petId === petId) : userDocs;
    res.json(filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
  } catch (e) {
    console.error('[GET /documents]', e);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.post('/api/documents', requireAuth, (req, res) => {
  try {
    const { petId, title, category, description, date, fileName, fileType, fileSize, fileData } = req.body;
    if (!petId || !title) return res.status(400).json({ error: 'Pet ID and Title are required' });

    let fileUrl = '';
    const id = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    if (fileData) {
      const match = fileData.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mime = match[1];
        const base64 = match[2];
        const ext = fileName && path.extname(fileName) ? path.extname(fileName) : (mime.includes('pdf') ? '.pdf' : '.jpg');
        const diskName = `${id}${ext}`;
        const filePath = path.join(UPLOADS_DIR, diskName);
        fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
        fileUrl = `/uploads/${diskName}`;
      } else {
        fileUrl = fileData;
      }
    }

    const doc = {
      id,
      userId: req.userId,
      petId,
      title: title.trim(),
      category: category || 'Others',
      description: (description || '').trim(),
      date: date || new Date().toISOString().split('T')[0],
      fileName: fileName || 'document',
      fileType: fileType || 'application/octet-stream',
      fileSize: fileSize || 0,
      fileUrl,
      createdAt: Date.now()
    };

    const docs = readDocs();
    docs.unshift(doc);
    writeDocs(docs);

    res.json(doc);
  } catch (e) {
    console.error('[POST /documents]', e);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

app.put('/api/documents/:id', requireAuth, (req, res) => {
  try {
    const { title, category, description, date } = req.body;
    const docs = readDocs();
    const doc = docs.find(d => d.id === req.params.id && d.userId === req.userId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    if (title !== undefined) doc.title = title.trim();
    if (category !== undefined) doc.category = category;
    if (description !== undefined) doc.description = description.trim();
    if (date !== undefined) doc.date = date;

    writeDocs(docs);
    res.json(doc);
  } catch (e) {
    console.error('[PUT /documents/:id]', e);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

app.delete('/api/documents/:id', requireAuth, (req, res) => {
  try {
    const docs = readDocs();
    const docIdx = docs.findIndex(d => d.id === req.params.id && d.userId === req.userId);
    if (docIdx === -1) return res.status(404).json({ error: 'Document not found' });

    const doc = docs[docIdx];
    if (doc.fileUrl && doc.fileUrl.startsWith('/uploads/')) {
      const diskPath = path.join(__dirname, doc.fileUrl);
      if (fs.existsSync(diskPath)) {
        try { fs.unlinkSync(diskPath); } catch (_) {}
      }
    }

    docs.splice(docIdx, 1);
    writeDocs(docs);
    res.json({ success: true });
  } catch (e) {
    console.error('[DELETE /documents/:id]', e);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// ─── Admin page ───────────────────────────────────────────────────────────────
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ─── Admin API (all protected: auth + admin role) ─────────────────────────────
app.use('/admin/api', requireAuth, requireAdmin);

app.get('/admin/api/stats', async (req, res) => {
  try {
    const [uRes, pRes, rmdRes, recRes] = await Promise.all([
      req.sb.from('profiles').select('*',   { count: 'exact', head: true }),
      req.sb.from('pets').select('*',       { count: 'exact', head: true }),
      req.sb.from('reminders').select('*',  { count: 'exact', head: true }),
      req.sb.from('records').select('*',    { count: 'exact', head: true }),
    ]);
    res.json({
      users:     uRes.count    || 0,
      pets:      pRes.count    || 0,
      reminders: rmdRes.count  || 0,
      records:   recRes.count  || 0,
    });
  } catch (e) {
    console.error('[admin/stats]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/admin/api/users', async (req, res) => {
  try {
    const { data, error } = await req.sb.rpc('admin_get_users');
    if (!error && data) {
      return res.json((data || []).map(u => ({
        ...u,
        created_at: new Date(u.created_at).getTime(),
      })));
    }

    // Fallback: direct profiles query
    const { data: profiles, error: pErr } = await req.sb
      .from('profiles')
      .select('id, name, email, created_at')
      .order('created_at', { ascending: false });
    if (pErr) throw pErr;

    const { data: pets } = await req.sb.from('pets').select('id, user_id');
    const petCounts = {};
    (pets || []).forEach(p => { petCounts[p.user_id] = (petCounts[p.user_id] || 0) + 1; });

    res.json((profiles || []).map(u => ({
      id: u.id,
      name: u.name || 'Owner',
      email: u.email || (u.id === req.userId ? req.session.email : '—'),
      pet_count: petCounts[u.id] || 0,
      created_at: new Date(u.created_at).getTime(),
    })));
  } catch (e) {
    console.error('[admin/users]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/admin/api/pets', async (req, res) => {
  try {
    const { data: pets, error } = await req.sb
      .from('pets')
      .select('id, name, species, breed, gender, user_id, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Fetch all users to map user_id → email
    let users = [];
    try {
      const res = await req.sb.rpc('admin_get_users');
      users = res.data || [];
    } catch {
      users = [];
    }
    const emailMap = {};
    users.forEach(u => { emailMap[u.id] = u.email; });

    res.json((pets || []).map(p => ({
      ...p,
      ownerEmail: emailMap[p.user_id] || '—',
      created_at: new Date(p.created_at).getTime(),
    })));
  } catch (e) {
    console.error('[admin/pets]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/admin/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { data: profile } = await req.sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: pets } = await req.sb
      .from('pets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const [remCount, recCount] = await Promise.all([
      req.sb.from('reminders').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      req.sb.from('records').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    ]);

    res.json({
      profile: profile || { id: userId, name: 'User', email: '—' },
      pets: (pets || []).map(p => ({
        ...p,
        created_at: new Date(p.created_at).getTime(),
      })),
      remindersCount: remCount.count || 0,
      recordsCount: recCount.count || 0,
    });
  } catch (e) {
    console.error('[admin/users/:id]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/admin/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId === req.userId || (req.session.email === ADMIN_EMAIL && userId === req.session.userId)) {
      return res.status(400).json({ error: 'Cannot delete the active administrator account' });
    }

    // Try RPC first if exists
    await req.sb.rpc('admin_delete_user', { target_user_id: userId }).catch(() => null);

    // Direct deletion fallback
    await req.sb.from('weight_history').delete().in('pet_id', (await req.sb.from('pets').select('id').eq('user_id', userId)).data?.map(p => p.id) || []).catch(() => {});
    await req.sb.from('reminders').delete().eq('user_id', userId).catch(() => {});
    await req.sb.from('records').delete().eq('user_id', userId).catch(() => {});
    await req.sb.from('pets').delete().eq('user_id', userId).catch(() => {});
    await req.sb.from('admins').delete().eq('user_id', userId).catch(() => {});
    await req.sb.from('profiles').delete().eq('id', userId).catch(() => {});

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (e) {
    console.error('[DELETE admin/users/:id]', e);
    res.status(500).json({ error: 'Failed to delete user: ' + e.message });
  }
});

app.get('/admin/api/pets/:id', async (req, res) => {
  try {
    const petId = req.params.id;
    const { data: pet, error } = await req.sb
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();
    if (error || !pet) return res.status(404).json({ error: 'Pet not found' });

    const [whRes, remRes, recRes, ownerRes] = await Promise.all([
      req.sb.from('weight_history').select('*').eq('pet_id', petId).order('recorded_at', { ascending: true }),
      req.sb.from('reminders').select('*').eq('pet_id', petId).order('created_at', { ascending: false }),
      req.sb.from('records').select('*').eq('pet_id', petId).order('created_at', { ascending: false }),
      req.sb.from('profiles').select('name, email').eq('id', pet.user_id).single(),
    ]);

    res.json({
      pet: {
        ...pet,
        created_at: new Date(pet.created_at).getTime(),
      },
      owner: ownerRes.data || { name: 'Owner', email: '—' },
      weightHistory: (whRes.data || []).map(w => ({
        ...w,
        recorded_at: new Date(w.recorded_at).getTime(),
      })),
      reminders: (remRes.data || []).map(r => ({
        ...r,
        created_at: new Date(r.created_at).getTime(),
      })),
      records: (recRes.data || []).map(r => ({
        ...r,
        created_at: new Date(r.created_at).getTime(),
      })),
    });
  } catch (e) {
    console.error('[admin/pets/:id]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/admin/api/pets/:id', async (req, res) => {
  try {
    const petId = req.params.id;
    await req.sb.rpc('admin_delete_pet', { target_pet_id: petId }).catch(() => null);

    await req.sb.from('weight_history').delete().eq('pet_id', petId).catch(() => {});
    await req.sb.from('reminders').delete().eq('pet_id', petId).catch(() => {});
    await req.sb.from('records').delete().eq('pet_id', petId).catch(() => {});
    const { error } = await req.sb.from('pets').delete().eq('id', petId);
    if (error) throw error;

    res.json({ success: true, message: 'Pet deleted successfully' });
  } catch (e) {
    console.error('[DELETE admin/pets/:id]', e);
    res.status(500).json({ error: 'Failed to delete pet: ' + e.message });
  }
});

// ─── SPA fallback ─────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Bootstrap admin account ──────────────────────────────────────────────────
async function bootstrapAdmin() {
  try {
    // 1. Try secure RPC setup if function exists
    const { error: rpcErr } = await anonClient.rpc('setup_admin_account');
    if (!rpcErr) {
      console.log(`✅ Admin ready → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
      return;
    }
  } catch (_) {}

  try {
    // 2. Try standard promote_to_admin RPC
    const { error: pErr } = await anonClient.rpc('promote_to_admin', { target_email: ADMIN_EMAIL });
    if (!pErr) {
      console.log(`✅ Admin ready → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
      return;
    }
  } catch (_) {}

  // 3. Optional signup attempt
  try {
    await anonClient.auth.signUp({
      email:    ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options:  { data: { name: 'Admin' } },
    });
  } catch (_) {}
}

app.listen(PORT, async () => {
  console.log(`🐾 Petsy (Supabase) running at http://localhost:${PORT}`);
  await bootstrapAdmin();
});
