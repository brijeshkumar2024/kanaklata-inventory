// ---------- Helpers ----------
const $ = s => document.querySelector(s);
const byId = id => document.getElementById(id);

// ---------- Elements ----------
const modal     = byId('workerModal');
const form      = byId('workerForm');
const openBtn   = byId('addWorkerBtn');
const closeBtn  = byId('closeModal');
const cancelBtn = byId('cancelBtn');
const backdrop  = modal ? modal.querySelector('.modal-backdrop') : null;
const photo     = byId('photo');

// ---------- Generators ----------
function randStr(len = 6) {
  return Math.random().toString(36).slice(2, 2 + len);
}
function genEmpId() {
  const y = new Date().getFullYear().toString().slice(-2);
  return `EMP-${y}${Date.now().toString().slice(-5)}-${randStr(2).toUpperCase()}`;
}
function genUsername() {
  const f = (byId('firstName').value || 'user').trim().toLowerCase();
  return `${f}.${randStr(3)}`;
}
function genPassword() {
  return randStr(10) + '!';
}
function byId(id){ return document.getElementById(id); }
function qs(s){ return document.querySelector(s); }
function qa(s){ return document.querySelectorAll(s); }
const yEl = document.getElementById('y'); if (yEl) yEl.textContent = new Date().getFullYear();
// ---------- Modal ----------
function openModal() {
  if (!modal) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');

  byId('empId').value = genEmpId();
  if (!byId('username').value) byId('username').value = genUsername();
  if (!byId('password').value) byId('password').value = genPassword();

  byId('firstName').focus();
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  form.reset();
  byId('photoPreview').innerHTML = '';
  clearErrors();
}


// ---------- Events ----------
if (openBtn)   openBtn.addEventListener('click', openModal);
if (closeBtn)  closeBtn.addEventListener('click', closeModal);
if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
if (backdrop)  backdrop.addEventListener('click', closeModal);

// Photo preview
if (photo) {
  photo.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    byId('photoPreview').innerHTML = `<img src="${url}" alt="Preview">`;
  });
}

// ---------- Validation ----------
function clearErrors() {
  ['errFirst', 'errPhone', 'errAadhaar'].forEach(id => {
    const el = byId(id);
    if (el) el.textContent = '';
  });
}
function isEmpty(v) {
  return !v || !v.trim();
}
function validate() {
  clearErrors();
  let ok = true;

  if (isEmpty(byId('firstName').value)) {
    byId('errFirst').textContent = 'First name is required';
    ok = false;
  }
  const ph = byId('phone').value.trim();
  if (ph && !/^[0-9]{10}$/.test(ph)) {
    byId('errPhone').textContent = 'Enter 10 digits';
    ok = false;
  }
  const ad = byId('aadhaar').value.trim();
  if (ad && !/^[0-9]{12}$/.test(ad)) {
    byId('errAadhaar').textContent = 'Enter 12 digits';
    ok = false;
  }
  return ok;
}

// ---------- Form submit ----------
if (form) {
  form.setAttribute('novalidate', ''); // disable native HTML validation
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      firstName: byId('firstName').value.trim(),
      middleName: byId('middleName').value.trim() || null,
      lastName: byId('lastName').value.trim() || null,
      aadhaar: byId('aadhaar').value.trim() || null,
      employeeId: byId('empId').value.trim(),
      phone: byId('phone').value.trim() || null,
      email: byId('email').value.trim() || null,
      role: byId('role').value || null,
      assignment: byId('assignment').value.trim() || null,
      dateOfJoining: byId('doj').value || null,
      username: byId('username').value.trim() || genUsername(),
      password: byId('password').value.trim() || genPassword(),
      remarks: byId('remarks').value.trim() || null
    };

    addRow(payload);
    closeModal();
  });
}

// ---------- Table ----------
function addRow(w) {
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
</script>
