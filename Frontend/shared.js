<script>
(function(){
  // ---------- Helpers ----------
  const $ = (s) => document.querySelector(s);
  const byId = (id) => document.getElementById(id);
  const qs = (s) => document.querySelector(s);
  const qa = (s) => document.querySelectorAll(s);

  const yEl = byId('y'); if (yEl) yEl.textContent = new Date().getFullYear();

  // ---------- Elements ----------
  const modal     = byId('workerModal');
  const form      = byId('workerForm');
  const openBtn   = byId('addWorkerBtn');
  const closeBtn  = byId('closeModal');
  const cancelBtn = byId('cancelBtn');
  const backdrop  = modal ? modal.querySelector('.modal-backdrop') : null;
  const photo     = byId('photo');

  // ---------- Generators ----------
  function randStr(len = 6){
    return Math.random().toString(36).slice(2, 2 + len);
  }
  function genEmpId(){
    const y = new Date().getFullYear().toString().slice(-2);
    return `EMP-${y}${Date.now().toString().slice(-5)}-${randStr(2).toUpperCase()}`;
  }
  function genUsername(){
    const f = (byId('firstName')?.value || 'user').trim().toLowerCase();
    return `${f}.${randStr(3)}`;
  }
  function genPassword(){
    return randStr(10) + '!';
  }

  // ---------- Modal ----------
  function openModal(){
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    const empIdEl = byId('empId');
    const userEl  = byId('username');
    const passEl  = byId('password');

    if (empIdEl) empIdEl.value = genEmpId();
    if (userEl && !userEl.value) userEl.value = genUsername();
    if (passEl && !passEl.value) passEl.value = genPassword();

    byId('firstName')?.focus();
  }

  function closeModal(){
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    form?.reset();
    const prev = byId('photoPreview');
    if (prev) prev.innerHTML = '';
    clearErrors();
  }

  // ---------- Events ----------
  if (openBtn)   openBtn.addEventListener('click', openModal);
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (backdrop)  backdrop.addEventListener('click', closeModal);

  // Photo preview
  if (photo){
    photo.addEventListener('change', (e)=>{
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const prev = byId('photoPreview');
      if (prev) prev.innerHTML = `<img src="${url}" alt="Preview">`;
    });
  }

  // ---------- Validation ----------
  function clearErrors(){
    ['errFirst','errPhone','errAadhaar'].forEach((id)=>{
      const el = byId(id);
      if (el) el.textContent = '';
    });
  }
  function isEmpty(v){ return !v || !v.trim(); }

  function validate(){
    clearErrors();
    let ok = true;

    const firstEl = byId('firstName');
    if (firstEl && isEmpty(firstEl.value)){
      const err = byId('errFirst'); if (err) err.textContent = 'First name is required';
      ok = false;
    }
    const phoneEl = byId('phone');
    const ph = (phoneEl?.value || '').trim();
    if (ph && !/^[0-9]{10}$/.test(ph)){
      const err = byId('errPhone'); if (err) err.textContent = 'Enter 10 digits';
      ok = false;
    }
    const aadhaarEl = byId('aadhaar');
    const ad = (aadhaarEl?.value || '').trim();
    if (ad && !/^[0-9]{12}$/.test(ad)){
      const err = byId('errAadhaar'); if (err) err.textContent = 'Enter 12 digits';
      ok = false;
    }
    return ok;
  }

  // ---------- Form submit ----------
  if (form){
    form.setAttribute('novalidate','');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      if (!validate()) return;

      const payload = {
        firstName:   byId('firstName')?.value.trim() || '',
        middleName:  byId('middleName')?.value.trim() || null,
        lastName:    byId('lastName')?.value.trim() || null,
        aadhaar:     byId('aadhaar')?.value.trim() || null,
        employeeId:  byId('empId')?.value.trim() || '',
        phone:       byId('phone')?.value.trim() || null,
        email:       byId('email')?.value.trim() || null,
        role:        byId('role')?.value || null,
        assignment:  byId('assignment')?.value.trim() || null,
        dateOfJoining: byId('doj')?.value || null,
        username:    byId('username')?.value.trim() || genUsername(),
        password:    byId('password')?.value.trim() || genPassword(),
        remarks:     byId('remarks')?.value.trim() || null
      };

      addRow(payload);
      closeModal();
    });
  }

  // ---------- Table ----------
  function addRow(w){
    const tb = $('#workersTable tbody');
    if (!tb) return;
    const tr = document.createElement('tr');
    const fullName = [w.firstName, w.middleName, w.lastName].filter(Boolean).join(' ');
    tr.innerHTML = `
      <td>${fullName}</td>
      <td>${w.phone || '-'}</td>
      <td>${w.role || '-'}</td>
      <td>${w.dateOfJoining ? new Date(w.dateOfJoining).toLocaleDateString() : '-'}</td>
    `;
    tb.prepend(tr);
  }
})();
</script>
  const [rows]=await db.query('SELECT id,role,password_hash FROM users WHERE email=?',[email.toLowerCase()]);
    if(!rows.length) return res.status(401).json({message:'Invalid email or password'});
    const user=rows[0];
    const match=await bcrypt.compare(password,user.password_hash);
    if(!match) return res.status(401).json({message:'Invalid email or password'});
    const token=jwt.sign({id:user.id,role:user.role},JWT_SECRET,{expiresIn:'8h'});
    res.json({token});
  }catch(e){ console.error('Login error',e); res.status(500).json({message:'Internal server error'}); }
});
app.post('/api/logout', (_req,res)=> res.json({success:true}));

// --- USERS (admin) ---
app.post('/api/users', async (req,res)=>{
  const {email,password,role='user'}=req.body||{};                                                                            
  if(!email||!password) return res.status(400).json({message:'Email and password required'});
  try{
    const [exists]=await db.query('SELECT id FROM users WHERE email=?',[email.toLowerCase()]);
    if(exists.length) return res.status(409).json({message:'User already exists'});
    const passHash=await bcrypt.hash(password,12);
    const id=uuidv4();
    await db.query('INSERT INTO users (id,email,role,password_hash) VALUES (?,?,?,?)',[id,email.toLowerCase(),role,passHash]);
    res.status(201).json({id,email,role});
  }catch(e){ console.error('Create user error',e); res.status(500).json({message:'Internal server error'}); }
});

/* =========================
   WORKERS API (CRUD lite)
   ========================== */

// Connectivity sanity route
app.get('/api/workers/ping', (_req,res)=> res.json({ workers:true }));                                                                                            
// List
app.get('/api/workers', async (_req,res)=>{
  try{
    const [rows]=await db.query('SELECT id,name,phone,role,joined,status FROM workers ORDER BY joined DESC');
    res.json(rows);
  }catch(e){ console.error('Workers list error:', e); res.status(500).json({message:'Internal server error'}); }
});
// Create
app.post('/api/workers', async (req,res)=>{
  try{
    const { name, phone, role, joined, status='active' } = req.body||{};
    if(!name) return res.status(400).json({message:'name is required'});
    const id=uuidv4();
    await db.query('INSERT INTO workers (id,name,phone,role,joined,status) VALUES (?,?,?,?,?,?)',
      [id,name,phone,role,joined||new Date(),status]);
    res.status(201).json({id,name,phone,role,joined,status});
  }catch(e){ console.error('Create worker error', e); res.status(500).json({message:'Internal server error'}); }
});

--------------------

const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('./db'); // Assume a database module is available
const app = express();
app.use(express.json());

// In-memory session store
const sessions = new Map();

// Helper to set session cookie
function setSessionCookie(res, sid){
  res.cookie('session', sid, { httpOnly: true, sameSite: 'Strict' });
}

// Helper to clear session cookie
function clearSessionCookie(res){
  res.clearCookie('session');
}

// Middleware to require authentication
function requireAuth(role){
  return (req, res, next) => {
    const sid = req.cookies.session;
    if (!sid || !sessions.has(sid)) return res.status(401).json({message:'Unauthorized'});
    const session = sessions.get(sid);
    if (role && session.role !== role) return res.status(403).json({message:'Forbidden'});
    req.session = session;
    next();
  };
}

/* =========================
   AUTHENTICATION API
   ========================== */

app.post('/api/login', async (req,res)=>{
  const {email,password}=req.body||{};
  if(!email||!password) return res.status(400).json({message:'Email and password required'});
  try{
    const [rows]=await db.query('SELECT id,email,role,password_hash FROM users WHERE email=?',[email.toLowerCase()]);   
    if(rows.length===0) return res.status(401).json({message:'Invalid email or password'});
    const user=rows[0];
    const match=await bcrypt.compare(password,user.password_hash);
    if(!match) return res.status(401).json({message:'Invalid email or password'});
    const sid=crypto.randomBytes(32).toString('base64url');
    sessions.set(sid,{sid,uid:user.id,role:user.role,createdAt:Date.now(),lastSeen:Date.now()});
    setSessionCookie(res,sid);
    res.json({success:true,role:user.role});
  }catch(e){ console.error('Login error',e); res.status(500).json({message:'Internal server error'}); }
});

app.post('/api/logout', requireAuth(), (req,res)=>{
  const sid=req.cookies.session; if(sid) sessions.delete(sid);
  clearSessionCookie(res); res.json({success:true});
});

// --- USERS (admin) ---
app.post('/api/users', requireAuth('admin'), async (req,res)=>{
  const {email,password,role='user'}=req.body||{};
  if(!email||!password) return res.status(400).json({message:'Email and password required'});
  try{
    const [exists]=await db.query('SELECT id FROM users WHERE email=?',[email.toLowerCase()]);
    if(exists.length) return res.status(409).json({message:'User already exists'});
    const passHash=await bcrypt.hash(password,12);
    const id=uuidv4();
    await db.query('INSERT INTO users (id,email,role,password_hash) VALUES (?,?,?,?)',[id,email.toLowerCase(),role,passHash]);
    res.status(201).json({id,email,role});
  }catch(e){ console.error('Create user error',e); res.status(500).json({message:'Internal server error'}); }
});

/* =========================
   WORKERS API (CRUD lite)
   ========================== */

// Connectivity sanity route
app.get('/api/workers/ping', (_req,res)=> res.json({ workers:true }));
// List
app.get('/api/workers', requireAuth(), async (_req,res)=>{
  try{
    const [rows]=await db.query('SELECT id,name,phone,role,joined,status FROM workers ORDER BY joined DESC');
    res.json(rows);
  }catch(e){ console.error('Workers list error:', e); res.status(500).json({message:'Internal server error'}); }
}); 
// Create
app.post('/api/workers', requireAuth('admin'), async (req,res)=>{
  try{
    const { name, phone, role, joined, status='active' } = req.body||{};
    if(!name) return res.status(400).json({message:'name is required'});
    const id=uuidv4();
    await db.query('INSERT INTO workers (id,name,phone,role,joined,status) VALUES (?,?,?,?,?,?)',
      [id,name,phone,role,joined||new Date(),status]);
    res.status(201).json({id,name,phone,role,joined,status});
  }catch(e){ console.error('Create worker error', e); res.status(500).json({message:'Internal server error'}); }
});
