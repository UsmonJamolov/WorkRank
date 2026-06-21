const DISLIKE_CATS = ['Sifat xatosi', 'Xavfsizlik xatosi', 'Tugallanmagan ish', "Noto'g'ri material", 'Boshqa'];
const API_URL = '/api';
const TOKEN_KEY = 'workrank_token';
const CHECKIN_KEY = 'workrank_morning_checkin';
const GATE_KEY = 'workrank_gate_passed';
const VALID_QR_DEMO = 'WRK-SMART-2026-001';
const WORKPLACE_QR_FILENAME = 'workrank-ishxona-qr.png';

let stories = [
  { id: 1, name: 'Aziz', avatar: 'https://i.pravatar.cc/150?u=aziz', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', title: 'Elektr montaj', points: 45, likes: 12, dislikes: 1, viewed: false },
  { id: 2, name: 'Bekzod', avatar: 'https://i.pravatar.cc/150?u=bekzod', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800', title: 'Material qabul', points: 38, likes: 20, dislikes: 0, viewed: false },
  { id: 3, name: 'Jamshid', avatar: 'https://i.pravatar.cc/150?u=jamshid', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800', title: 'Diagnostika', points: 32, likes: 15, dislikes: 2, viewed: true },
];

let posts = [];
let ratings = { daily: [], weekly: [], monthly: [] };

const notifications = [
  { title: 'Aziz yangi ish yukladi', body: '3-qavat elektr montaji yakunlandi', time: '08:35', unread: true },
  { title: 'Bekzod kamchilik qoldirdi', body: "Sifat xatosi: Kabel kanali to'g'ri mahkamlanmagan", time: '10:00', unread: true },
  { title: 'Siz TOP 3 ga kirdingiz!', body: "Tabriklaymiz! Oylik reytingda 3-o'rin.", time: 'Kecha', unread: false },
  { title: "Rahbar yangi e'lon joylashtirdi", body: "Ertangi ish rejasi e'lon qilindi.", time: 'Kecha', unread: false },
];

let currentUser = null;
let qrStream = null;
let qrScanTimer = null;
let html5QrCode = null;
let lastInvalidQrToastAt = 0;
let qrHandled = false;
let qrProcessing = false;
let currentCheckInMode = 'arrival';
let currentStoryIndex = 0;
let currentSheetPostId = null;
let sheetMode = 'comment';
let selectedCategory = DISLIKE_CATS[0];
let currentPeriod = 'daily';

async function api(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Server bilan bog\'lanib bo\'lmadi. Backend ishga tushirilganini tekshiring.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');
  return data;
}

function formatTime(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  clearPassedGate();
  currentUser = null;
}

function todayDate() {
  return new Date().toISOString().split('T')[0];
}

function getCheckInRecord() {
  try {
    return JSON.parse(localStorage.getItem(CHECKIN_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveCheckInRecord(record) {
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(record));
}

function getAttendanceStatus() {
  const record = getCheckInRecord();
  if (!record || record.userId !== currentUser?.id || record.date !== todayDate()) {
    return 'none';
  }
  if (record.checkOut) return 'finished';
  if (record.checkIn) return 'working';
  return 'none';
}

async function loadTodayAttendance() {
  if (!currentUser) return;
  try {
    const data = await api(`/attendance/today/${currentUser.id}`);
    if (data.status === 'none') {
      localStorage.removeItem(CHECKIN_KEY);
      return;
    }
    saveCheckInRecord({
      userId: currentUser.id,
      date: todayDate(),
      checkIn: data.checkInTime,
      checkOut: data.checkOutTime || null,
    });
  } catch {
    /* localStorage fallback */
  }
}

function updateAttendanceUI() {
  const record = getCheckInRecord();
  const checkInEl = document.getElementById('check-in');
  const checkOutEl = document.getElementById('check-out');
  const qrBtn = document.getElementById('qr-attendance-btn');

  if (checkInEl) checkInEl.textContent = record?.checkIn || '—';
  if (checkOutEl) checkOutEl.textContent = record?.checkOut || '—';

  const status = getAttendanceStatus();
  if (qrBtn) {
    if (status === 'working') {
      qrBtn.textContent = '📱 QR — Ishdan ketish';
    } else if (status === 'finished') {
      qrBtn.textContent = '✅ Ish kuni yakunlangan';
      qrBtn.disabled = true;
    } else {
      qrBtn.textContent = '📱 QR — Ishni boshlash';
      qrBtn.disabled = false;
    }
  }
}

function setCheckInScreenMode(mode) {
  currentCheckInMode = mode;
  const title = document.getElementById('checkin-title');
  const subtitle = document.getElementById('checkin-subtitle');
  const scanWrap = document.getElementById('checkin-scan-wrap');
  const demoBtn = document.getElementById('checkin-demo-btn');
  const demoHint = document.getElementById('checkin-demo-hint');
  const info = document.querySelector('.checkin-info');

  if (mode === 'arrival') {
    if (title) title.textContent = 'Ishga keldingizmi?';
    if (subtitle) subtitle.textContent = 'Bir xil QR kod — ish kuni boshlanadi';
    if (info) info.textContent = 'ℹ️ Ish joyidagi doimiy QR kodni skaner qiling (har kuni ishlatiladi).';
    if (scanWrap) scanWrap.hidden = false;
    if (demoBtn) {
      demoBtn.hidden = false;
      demoBtn.textContent = 'Demo: QR skanerlash';
      demoBtn.onclick = () => demoQrScan();
    }
    if (demoHint) demoHint.hidden = false;
  } else if (mode === 'departure') {
    if (title) title.textContent = 'Ishdan ketayapsizmi?';
    if (subtitle) subtitle.textContent = 'Bir xil QR kod — ish kuni yakunlanadi';
    if (info) info.textContent = 'ℹ️ Ertalab skaner qilgan QR kodni qayta skaner qiling (chop etilgan kod).';
    if (scanWrap) scanWrap.hidden = false;
    if (demoBtn) {
      demoBtn.hidden = false;
      demoBtn.textContent = 'Demo: QR skanerlash';
      demoBtn.onclick = () => demoQrScan();
    }
    if (demoHint) demoHint.hidden = false;
  } else if (mode === 'unlock') {
    if (title) title.textContent = 'Ilovaga kirish';
    if (subtitle) subtitle.textContent = 'QR kodni skaner qiling — bosh sahifa ochiladi';
    if (info) info.textContent = 'ℹ️ Ish joyidagi QR kodni skaner qiling.';
    if (scanWrap) scanWrap.hidden = false;
    if (demoBtn) {
      demoBtn.hidden = false;
      demoBtn.textContent = 'Demo: QR skanerlash';
      demoBtn.onclick = () => demoQrScan();
    }
    if (demoHint) demoHint.hidden = false;
  } else if (mode === 'finished') {
    if (title) title.textContent = 'Ish kuni yakunlandi';
    if (subtitle) subtitle.textContent = 'Bugungi ish vaqtingiz tugadi. Ertaga ko\'rishguncha!';
    if (info) info.textContent = 'ℹ️ Ertalab QR skaner qiling. Sinov uchun pastdagi demo tugmadan foydalaning.';
    if (scanWrap) scanWrap.hidden = true;
    if (demoBtn) {
      demoBtn.hidden = false;
      demoBtn.textContent = 'Demo: Qayta ishni boshlash';
      demoBtn.onclick = () => demoRestartWorkday();
    }
    if (demoHint) demoHint.hidden = false;
  }
}

function hasPassedGate() {
  return sessionStorage.getItem(GATE_KEY) === '1';
}

function setPassedGate() {
  sessionStorage.setItem(GATE_KEY, '1');
}

function clearPassedGate() {
  sessionStorage.removeItem(GATE_KEY);
}

async function stopQrScanner() {
  qrHandled = false;
  qrProcessing = false;
  if (qrScanTimer) {
    clearInterval(qrScanTimer);
    qrScanTimer = null;
  }
  setScanStatus('', false);
  if (qrStream) {
    qrStream.getTracks().forEach((t) => t.stop());
    qrStream = null;
  }
  if (html5QrCode) {
    try {
      if (html5QrCode.isScanning) await html5QrCode.stop();
      await html5QrCode.clear();
    } catch {
      /* scanner allaqachon to'xtagan */
    }
    html5QrCode = null;
  }
  const reader = document.getElementById('qr-reader');
  if (reader) {
    reader.classList.remove('is-active');
    reader.innerHTML = '';
  }
  showCameraPrompt();
}

function showCameraPrompt() {
  const prompt = document.getElementById('checkin-scan-btn');
  if (prompt) {
    prompt.hidden = false;
    prompt.classList.remove('is-loading');
  }
  hideCameraPermissionHelp();
}

function hideCameraPrompt() {
  const prompt = document.getElementById('checkin-scan-btn');
  if (prompt) prompt.hidden = true;
  hideCameraPermissionHelp();
}

function showCameraPermissionHelp() {
  const help = document.getElementById('checkin-camera-help');
  const prompt = document.getElementById('checkin-scan-btn');
  if (help) help.hidden = false;
  if (prompt) {
    prompt.hidden = true;
    prompt.classList.remove('is-loading');
  }
}

function hideCameraPermissionHelp() {
  const help = document.getElementById('checkin-camera-help');
  if (help) help.hidden = true;
}

function openCameraSettings() {
  toast('Manzil satridagi 🔒 belgisini bosing → Kamera → Ruxsat berish', 'danger');
}

function openQrPhotoCapture() {
  document.getElementById('qr-file-input')?.click();
}

function decodeQrFromImageData(imageData) {
  if (typeof jsQR !== 'function') return null;
  return jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const useBitmap = () => {
      createImageBitmap(file).then(resolve).catch(() => loadWithImage());
    };
    const loadWithImage = () => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Rasm ochilmadi'));
      };
      img.src = url;
    };
    if (window.createImageBitmap) useBitmap();
    else loadWithImage();
  });
}

async function handleQrImageFile(input) {
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;

  const prompt = document.getElementById('checkin-scan-btn');
  if (prompt) prompt.classList.add('is-loading');
  hideCameraPermissionHelp();

  try {
    const image = await loadImageFromFile(file);
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) throw new Error('Canvas topilmadi');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    if (image.close) image.close();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = decodeQrFromImageData(imageData);
    if (!code?.data) {
      toast('Rasmda QR kod topilmadi. workplace-qr.html sahifasidan rasm oling.', 'danger');
      return;
    }
    await handleQrScan(code.data);
  } catch {
    toast('Rasmni o\'qib bo\'lmadi. Boshqa rasm tanlang yoki Demo tugmadan foydalaning.', 'danger');
  } finally {
    if (prompt) prompt.classList.remove('is-loading');
  }
}

function isCameraPermissionError(err) {
  const msg = String(err?.message || err || '').toLowerCase();
  return (
    err?.name === 'NotAllowedError' ||
    err?.name === 'PermissionDeniedError' ||
    msg.includes('permission') ||
    msg.includes('not allowed') ||
    msg.includes('ruxsat')
  );
}

function normalizeQrData(raw) {
  const text = String(raw || '').trim();
  const wrk = text.match(/WRK-[A-Z0-9-]+/i);
  if (wrk) return wrk[0].toUpperCase();
  return text;
}

function setScanStatus(text, visible = true) {
  const el = document.getElementById('checkin-scan-status');
  if (!el) return;
  el.textContent = text;
  el.hidden = !visible;
}

function startJsQrBackupLoop() {
  if (qrScanTimer) clearInterval(qrScanTimer);
  qrScanTimer = setInterval(() => {
    if (qrProcessing) return;
    const video = document.querySelector('#qr-reader video');
    const canvas = document.getElementById('qr-canvas');
    if (!video?.videoWidth || !canvas || typeof jsQR !== 'function') return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (w < 80 || h < 80) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const code = jsQR(imageData.data, w, h, { inversionAttempts: 'attemptBoth' });
    if (code?.data) handleQrScan(code.data);
  }, 280);
}

async function startHtml5QrScanner() {
  if (typeof Html5Qrcode === 'undefined') {
    throw new Error('QR skaner kutubxonasi yuklanmadi');
  }

  const reader = document.getElementById('qr-reader');
  if (!reader) throw new Error('Skaner maydoni topilmadi');

  if (html5QrCode) {
    try {
      if (html5QrCode.isScanning) await html5QrCode.stop();
      await html5QrCode.clear();
    } catch {
      /* ignore */
    }
    html5QrCode = null;
  }

  if (qrScanTimer) {
    clearInterval(qrScanTimer);
    qrScanTimer = null;
  }

  reader.innerHTML = '';
  html5QrCode = new Html5Qrcode('qr-reader', { verbose: false });

  const config = {
    fps: 15,
    disableFlip: false,
    experimentalFeatures: { useBarCodeDetectorIfSupported: true },
  };

  const onScan = (decodedText) => {
    if (!qrProcessing && decodedText) handleQrScan(decodedText);
  };

  const cameraConfigs = [
    { facingMode: 'user' },
    { facingMode: { ideal: 'user' } },
    { facingMode: 'environment' },
  ];

  let lastError = null;
  for (const cameraConfig of cameraConfigs) {
    try {
      await html5QrCode.start(cameraConfig, config, onScan, () => {});
      reader.classList.add('is-active');
      setScanStatus('QR kodni ramka ichiga joylang');
      startJsQrBackupLoop();
      return;
    } catch (err) {
      lastError = err;
    }
  }

  try {
    const cameras = await Html5Qrcode.getCameras();
    if (cameras?.length) {
      for (const cam of cameras) {
        try {
          await html5QrCode.start(cam.id, config, onScan, () => {});
          reader.classList.add('is-active');
          setScanStatus('QR kodni ramka ichiga joylang');
          startJsQrBackupLoop();
          return;
        } catch (err) {
          lastError = err;
        }
      }
    }
  } catch (err) {
    lastError = err;
  }

  throw lastError || new Error('Kamera ochilmadi');
}

async function openQrCamera() {
  const prompt = document.getElementById('checkin-scan-btn');
  if (prompt) prompt.classList.add('is-loading');
  hideCameraPermissionHelp();

  if (!window.isSecureContext) {
    if (prompt) prompt.classList.remove('is-loading');
    toast('Kamera uchun xavfsiz ulanish (HTTPS yoki localhost) kerak.', 'danger');
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia && typeof Html5Qrcode === 'undefined') {
    if (prompt) prompt.classList.remove('is-loading');
    openQrPhotoCapture();
    return;
  }

  qrHandled = false;
  qrProcessing = false;
  const processing = document.getElementById('checkin-processing');
  if (processing) processing.hidden = true;

  try {
    hideCameraPrompt();
    await startHtml5QrScanner();
    if (prompt) prompt.classList.remove('is-loading');
  } catch (err) {
    await stopQrScanner();
    if (prompt) prompt.classList.remove('is-loading');
    if (isCameraPermissionError(err)) {
      showCameraPermissionHelp();
      toast('Kamera bloklangan. Quyidagi yo\'riqnoma yoki QR rasm tanlang.', 'danger');
      return;
    }
    showCameraPrompt();
    toast('Kamera ochilmadi. QR rasm tanlang yoki Demo tugmadan foydalaning.', 'danger');
  }
}

async function startQrScanner() {
  await openQrCamera();
}

async function handleQrScan(data) {
  if (qrProcessing) return;
  data = normalizeQrData(data);

  if (!isValidWorkQr(data)) {
    const now = Date.now();
    if (now - lastInvalidQrToastAt > 2500) {
      lastInvalidQrToastAt = now;
      toast('Noto\'g\'ri QR kod. Ishxona QR kodini skaner qiling.', 'danger');
    }
    return;
  }

  const status = getAttendanceStatus();
  if (status === 'finished') {
    toast('Bugungi ish kuni tugagan. Ertaga QR skaner qiling yoki Demo: Qayta ishni boshlash.');
    return;
  }

  qrProcessing = true;
  setScanStatus('QR topildi, qayd etilmoqda...');
  const processing = document.getElementById('checkin-processing');
  if (processing) processing.hidden = false;

  if (qrScanTimer) {
    clearInterval(qrScanTimer);
    qrScanTimer = null;
  }

  try {
    if (status === 'working') {
      if (currentCheckInMode === 'departure') {
        await completeEveningCheckOut();
      } else {
        await unlockApp();
      }
    } else {
      await completeMorningCheckIn();
    }
  } catch (err) {
    qrProcessing = false;
    setScanStatus('QR kodni ramka ichiga joylang');
    if (processing) processing.hidden = true;
    toast(err.message, 'danger');
    startJsQrBackupLoop();
  }
}

function demoQrScan() {
  handleQrScan(VALID_QR_DEMO);
}

async function resetTodayAttendance() {
  if (currentUser) {
    try {
      await api('/attendance/reset-today', {
        method: 'POST',
        body: JSON.stringify({ employeeId: currentUser.id }),
      });
    } catch {
      /* local reset yetadi */
    }
  }
  localStorage.removeItem(CHECKIN_KEY);
  clearPassedGate();
  qrProcessing = false;
}

async function demoRestartWorkday() {
  await resetTodayAttendance();
  toast('Yangi ish kuni boshlanmoqda...');
  await handleQrScan(VALID_QR_DEMO);
}

async function unlockApp() {
  setPassedGate();
  stopQrScanner();
  const processing = document.getElementById('checkin-processing');
  if (processing) processing.hidden = true;
  qrProcessing = false;
  showApp();
  toast('Ilovaga xush kelibsiz!');
}

async function completeMorningCheckIn() {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const result = await api('/attendance/checkin', {
    method: 'POST',
    body: JSON.stringify({ employeeId: currentUser.id }),
  });

  saveCheckInRecord({
    userId: currentUser.id,
    date: todayDate(),
    checkIn: result.checkInTime || time,
    checkOut: null,
  });

  updateAttendanceUI();
  setPassedGate();
  stopQrScanner();
  const processing = document.getElementById('checkin-processing');
  if (processing) processing.hidden = true;
  document.getElementById('screen-checkin').classList.remove('active');
  document.getElementById('screen-app').classList.add('active');
  renderAll();
  toast(result.message || 'Ish kuni boshlandi!');
}

async function completeEveningCheckOut() {
  const result = await api('/attendance/checkout', {
    method: 'POST',
    body: JSON.stringify({ employeeId: currentUser.id }),
  });

  const record = getCheckInRecord() || {
    userId: currentUser.id,
    date: todayDate(),
    checkIn: '—',
  };
  record.checkOut = result.checkOutTime || record.checkOut;
  saveCheckInRecord(record);

  updateAttendanceUI();
  clearPassedGate();
  stopQrScanner();
  const processing = document.getElementById('checkin-processing');
  if (processing) processing.hidden = true;
  document.getElementById('screen-app').classList.remove('active');
  setCheckInScreenMode('finished');
  document.getElementById('screen-checkin').classList.add('active');
  toast(result.message || 'Ish kuni yakunlandi. Xayr!');
}

function showCheckIn(mode = 'arrival') {
  qrHandled = false;
  qrProcessing = false;
  document.getElementById('screen-splash').classList.remove('active');
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-app').classList.remove('active');
  document.getElementById('screen-checkin').classList.add('active');
  stopQrScanner().then(() => {
    setCheckInScreenMode(mode);
    if (mode !== 'finished') openQrCamera();
  });
}

function isValidWorkQr(data) {
  const text = normalizeQrData(data);
  return text.startsWith('WRK-') || text.includes('WORKRANK');
}

async function getWorkplaceQrDataUrl() {
  if (typeof QRCode === 'undefined') {
    throw new Error('QR kutubxonasi yuklanmadi');
  }
  return QRCode.toDataURL(VALID_QR_DEMO, {
    width: 512,
    margin: 2,
    color: { dark: '#111827', light: '#ffffff' },
  });
}

async function downloadWorkplaceQrPng() {
  try {
    if (typeof QRCode !== 'undefined') {
      const dataUrl = await getWorkplaceQrDataUrl();
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = WORKPLACE_QR_FILENAME;
      link.click();
      toast('QR kod PNG yuklab olindi');
      return;
    }
  } catch {
    /* static fallback */
  }

  const link = document.createElement('a');
  link.href = '/assets/workrank-ishxona-qr.png';
  link.download = WORKPLACE_QR_FILENAME;
  link.click();
  toast('QR kod PNG yuklab olindi');
}

async function enterAfterAuth() {
  await loadTodayAttendance();
  updateAttendanceUI();
  const status = getAttendanceStatus();

  if (status === 'working' && hasPassedGate()) {
    showApp();
  } else if (status === 'finished') {
    clearPassedGate();
    showCheckIn('finished');
  } else if (status === 'working') {
    showCheckIn('unlock');
  } else {
    clearPassedGate();
    showCheckIn('arrival');
  }
}

function showApp() {
  stopQrScanner();
  document.getElementById('screen-splash').classList.remove('active');
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-checkin').classList.remove('active');
  document.getElementById('screen-app').classList.add('active');
  updateAttendanceUI();
  renderAll();
}

function showLogin() {
  document.getElementById('screen-splash').classList.remove('active');
  document.getElementById('screen-login').classList.add('active');
}

async function initApp() {
  localStorage.removeItem('workrank_auth');

  if (!isLoggedIn()) {
    setTimeout(showLogin, 2500);
    return;
  }
  try {
    currentUser = await api('/auth/me');
    enterAfterAuth();
  } catch {
    clearSession();
    setTimeout(showLogin, 2500);
  }
}

initApp();

async function doLogin() {
  const phone = document.getElementById('login-phone').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.querySelector('#screen-login .btn-primary');
  btn.disabled = true;
  btn.textContent = 'Kutilmoqda...';
  try {
    const { token, user } = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
    localStorage.setItem(TOKEN_KEY, token);
    currentUser = user;
    enterAfterAuth();
  } catch (err) {
    toast(err.message, 'danger');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Kirish';
  }
}

function doLogout() {
  stopQrScanner();
  clearSession();
  document.getElementById('screen-app').classList.remove('active');
  document.getElementById('screen-checkin').classList.remove('active');
  document.getElementById('screen-login').classList.add('active');
}

function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelector(`.nav-item[data-tab="${tab}"]`).classList.add('active');
}

async function renderAll() {
  renderStoryBar();
  renderStoryList();
  renderNotifications();
  renderDislikeChips();
  updateProfile();
  await Promise.all([loadPosts(), loadRating()]);
}

async function loadPosts() {
  try {
    const userId = currentUser?.id || '';
    const data = await api(`/posts/feed${userId ? `?userId=${userId}` : ''}`);
    posts = data.map((p) => ({
      id: p.id,
      name: p.employeeName,
      avatar: p.employeeAvatar,
      time: formatTime(p.createdAt),
      title: p.title,
      desc: p.description,
      image: p.imageUrl,
      likes: p.likesCount,
      dislikes: p.dislikesCount,
      comments: p.commentsCount,
      liked: p.liked || false,
      disliked: p.disliked || false,
      postComments: [],
    }));
    renderFeed();
  } catch (err) {
    toast(err.message, 'danger');
  }
}

async function loadPostFeedback(postId) {
  const userId = currentUser?.id || '';
  const data = await api(`/posts/${postId}/feedback?userId=${userId}`);
  const post = posts.find((p) => p.id === postId);
  if (post) {
    post.postComments = data.items;
    post.disliked = data.userDisliked;
  }
}

async function loadRating() {
  try {
    const data = await api(`/rating/${currentPeriod}`);
    ratings[currentPeriod] = data.map((r) => ({
      rank: r.rank,
      name: r.fullName,
      avatar: r.avatar,
      pos: r.position,
      points: r.points,
    }));
    renderRating();
  } catch (err) {
    toast(err.message, 'danger');
  }
}

function updateProfile() {
  if (!currentUser) return;
  const header = document.querySelector('.profile-header');
  if (!header) return;
  header.querySelector('.profile-avatar').src = currentUser.avatar;
  header.querySelector('h2').textContent = currentUser.fullName;
  header.querySelector('.position').textContent = currentUser.position;
  header.querySelector('.dept').textContent = currentUser.department;
}

function renderStoryBar() {
  document.getElementById('story-bar').innerHTML = stories.map((s, i) => `
    <div class="story-item" onclick="openStory(${i})">
      <div class="story-ring ${s.viewed ? 'viewed' : ''}">
        <img src="${s.avatar}" alt="" />
      </div>
      <span>${s.name}</span>
    </div>
  `).join('') + `<div class="story-item"><div class="story-ring viewed" style="display:flex;align-items:center;justify-content:center;font-weight:700;color:#6B7280">+20</div><span>Ko'proq</span></div>`;
}

function renderFeed() {
  document.getElementById('feed').innerHTML = posts.map(p => `
    <div class="post-card">
      <div class="post-header">
        <img src="${p.avatar}" alt="" />
        <div><div class="name">${p.name}</div><div class="time">${p.time}</div></div>
      </div>
      <div class="post-title">${p.title}</div>
      <div class="post-desc">${p.desc}</div>
      <img class="post-image" src="${p.image}" alt="" />
      <div class="post-stats">
        <span>👍 Like: ${p.likes}</span>
        <span>👎 Dislike: ${p.dislikes}</span>
        <span>💬 Comment: ${p.comments}</span>
      </div>
      <div class="post-actions">
        <button class="${p.liked ? 'liked' : ''}" onclick="likePost('${p.id}')">👍 Tasdiqlayman</button>
        <button class="${p.disliked ? 'disliked' : ''}" onclick="openDislike('${p.id}')">👎 Kamchilik topdim</button>
        <button onclick="openComments('${p.id}')">💬 Izohlar</button>
      </div>
    </div>
  `).join('');
}

function renderStoryList() {
  document.getElementById('story-list').innerHTML = stories.map((s, i) => `
    <div class="story-list-item" onclick="openStory(${i})">
      <img class="thumb" src="${s.image}" alt="" />
      <div class="info">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <img src="${s.avatar}" style="width:24px;height:24px;border-radius:50%" alt="" />
          <strong style="font-size:13px">${s.name}</strong>
        </div>
        <div style="font-weight:700;margin-bottom:4px">${s.title}</div>
        <div style="font-size:11px;color:#6B7280">⭐ ${s.points} ball · 👍 ${s.likes} · 👎 ${s.dislikes}</div>
      </div>
      ${!s.viewed ? '<div class="new-dot"></div>' : ''}
    </div>
  `).join('');
}

function renderRating() {
  const list = ratings[currentPeriod];
  document.getElementById('rating-list').innerHTML = list.map(r => {
    const medal = r.rank === 1 ? 'gold' : r.rank === 2 ? 'silver' : r.rank === 3 ? 'bronze' : '';
    return `
      <div class="rating-item ${r.rank <= 3 ? 'top3' : ''}">
        <div class="rank ${medal}">#${r.rank}</div>
        <img src="${r.avatar}" alt="" />
        <div class="info"><div class="name">${r.name}</div><div class="pos">${r.pos}</div></div>
        <div class="points"><small>Ball</small><strong>${r.points}</strong></div>
      </div>`;
  }).join('');
}

function renderNotifications() {
  document.getElementById('notif-list').innerHTML = notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}">
      <div class="notif-icon">🔔</div>
      <div><div class="title">${n.title}</div><div class="body">${n.body}</div><div class="time">${n.time}</div></div>
    </div>
  `).join('');
}

function renderDislikeChips() {
  document.getElementById('dislike-chips').innerHTML = DISLIKE_CATS.map((c, i) =>
    `<span class="chip ${c === selectedCategory ? 'active' : ''}" onclick="selectCategoryByIdx(${i})">${c}</span>`
  ).join('');
}

function selectCategoryByIdx(idx) {
  selectedCategory = DISLIKE_CATS[idx];
  renderDislikeChips();
}

async function openCommentSheet(postId, mode) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return;

  currentSheetPostId = postId;
  sheetMode = mode;

  document.getElementById('sheet-title').textContent =
    mode === 'dislike' ? 'Kamchilik haqida' : 'Izohlar';
  document.getElementById('dislike-extra').hidden = mode !== 'dislike';
  document.getElementById('comment-input').value = '';
  document.getElementById('comment-input').placeholder =
    mode === 'dislike' ? 'Kamchilik tavsifini yozing...' : "Izoh qo'shing...";

  const avatar = currentUser?.avatar || 'https://i.pravatar.cc/150?u=user';
  document.getElementById('comment-bar-avatar').src = avatar;

  if (mode === 'dislike') {
    selectedCategory = DISLIKE_CATS[0];
    renderDislikeChips();
  }

  try {
    await loadPostFeedback(postId);
  } catch (err) {
    toast(err.message, 'danger');
  }

  renderCommentsList();
  updateCommentPostBtn();
  document.getElementById('comment-sheet').classList.add('active');
  document.body.style.overflow = 'hidden';
  showVirtualKeyboard();
  setTimeout(() => document.getElementById('comment-input').focus(), 100);
}

function openComments(postId) {
  openCommentSheet(postId, 'comment');
}

function openDislike(postId) {
  const post = posts.find((p) => p.id === postId);
  if (post?.disliked) return;
  openCommentSheet(postId, 'dislike');
}

function closeCommentSheet() {
  document.getElementById('comment-sheet').classList.remove('active');
  hideVirtualKeyboard();
  document.body.style.overflow = '';
  currentSheetPostId = null;
}

function renderCommentsList() {
  const post = posts.find((p) => p.id === currentSheetPostId);
  const list = document.getElementById('comments-list');

  if (!post || !post.postComments?.length) {
    list.innerHTML = `<div class="ig-comments-empty">${sheetMode === 'dislike' ? 'Kamchilik haqida birinchi bo\'lib yozing' : 'Birinchi izohni qoldiring'}</div>`;
    return;
  }

  list.innerHTML = post.postComments.map((c) => `
    <div class="ig-comment">
      <img class="ig-comment-avatar" src="${c.avatar}" alt="" />
      <div class="ig-comment-body">
        <div class="ig-comment-line">
          <span class="ig-comment-user">${c.name}</span>
          <span class="ig-comment-text">${c.text}</span>
        </div>
        ${c.category ? `<span class="ig-comment-badge">${c.category}</span>` : ''}
        <div class="ig-comment-meta">
          <span>${c.time}</span>
        </div>
      </div>
      <button type="button" class="ig-comment-like" aria-label="Yoqtirish">♡</button>
    </div>
  `).join('');
}

function updateCommentPostBtn() {
  const text = document.getElementById('comment-input').value.trim();
  const disabled = !text;
  document.getElementById('comment-post-btn').disabled = disabled;
  const sendKey = document.getElementById('vk-send-key');
  if (sendKey) sendKey.disabled = disabled;
}

function handleCommentKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitCommentSheet();
  }
}

function submitCommentSheet() {
  const text = document.getElementById('comment-input').value.trim();
  if (!text) return;

  if (sheetMode === 'dislike') {
    saveDislike(text);
  } else {
    saveComment(text);
  }
}

function saveComment(text) {
  const post = posts.find((p) => p.id === currentSheetPostId);
  if (!post || !currentUser) return;

  api(`/posts/${currentSheetPostId}/comment`, {
    method: 'POST',
    body: JSON.stringify({
      text,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userAvatar: currentUser.avatar,
    }),
  })
    .then((result) => {
      post.postComments.unshift({
        id: result.comment.id,
        type: 'comment',
        name: result.comment.userName,
        avatar: result.comment.userAvatar,
        text: result.comment.text,
        time: 'hozir',
        timeSort: Date.now(),
      });
      post.comments = result.post.commentsCount;
      document.getElementById('comment-input').value = '';
      updateCommentPostBtn();
      renderCommentsList();
      renderFeed();
      toast('Izoh qo\'shildi');
    })
    .catch((err) => toast(err.message, 'danger'));
}

function saveDislike(text) {
  const post = posts.find((p) => p.id === currentSheetPostId);
  if (!post || post.disliked || !currentUser) return closeCommentSheet();

  api(`/posts/${currentSheetPostId}/dislike`, {
    method: 'POST',
    body: JSON.stringify({
      category: selectedCategory,
      comment: text,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userAvatar: currentUser.avatar,
    }),
  })
    .then((result) => {
      post.likes = result.post.likesCount;
      post.dislikes = result.post.dislikesCount;
      post.disliked = true;
      post.liked = false;
      post.postComments.unshift({
        id: result.dislike.id,
        type: 'dislike',
        name: result.dislike.userName,
        avatar: result.dislike.userAvatar,
        text: result.dislike.comment,
        category: result.dislike.category,
        time: 'hozir',
        timeSort: Date.now(),
      });
      closeCommentSheet();
      renderFeed();
      toast('Kamchilik saqlandi');
    })
    .catch((err) => toast(err.message, 'danger'));
}

function likePost(id) {
  const p = posts.find((x) => x.id === id);
  if (!p || p.liked || !currentUser) return;

  api(`/posts/${id}/like`, {
    method: 'POST',
    body: JSON.stringify({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userAvatar: currentUser.avatar,
    }),
  })
    .then((result) => {
      p.likes = result.post.likesCount;
      p.dislikes = result.post.dislikesCount;
      p.liked = true;
      p.disliked = false;
      renderFeed();
      toast('Tasdiqlandi');
    })
    .catch((err) => toast(err.message, 'danger'));
}

function openStory(index) {
  currentStoryIndex = index;
  stories[index].viewed = true;
  updateStoryViewer();
  document.getElementById('screen-story-viewer').classList.add('active');
  renderStoryBar();
}

function updateStoryViewer() {
  const s = stories[currentStoryIndex];
  document.getElementById('sv-avatar').src = s.avatar;
  document.getElementById('sv-name').textContent = s.name;
  document.getElementById('sv-image').src = s.image;
  document.getElementById('sv-title').textContent = s.title;
  document.getElementById('sv-points').textContent = s.points;
  document.getElementById('sv-likes').textContent = s.likes;
  document.getElementById('sv-dislikes').textContent = s.dislikes;
  document.getElementById('story-progress').innerHTML = stories.map((_, i) =>
    `<div class="${i < currentStoryIndex ? 'done' : i === currentStoryIndex ? 'active' : ''}"></div>`
  ).join('');
}

function closeStoryViewer() {
  document.getElementById('screen-story-viewer').classList.remove('active');
}

function nextStory() {
  if (currentStoryIndex < stories.length - 1) {
    currentStoryIndex++;
    stories[currentStoryIndex].viewed = true;
    updateStoryViewer();
    renderStoryBar();
  } else closeStoryViewer();
}

function prevStory() {
  if (currentStoryIndex > 0) { currentStoryIndex--; updateStoryViewer(); }
}

function showScreen(name) {
  if (name === 'notifications') document.getElementById('screen-notifications').classList.add('active');
}

function hideNotifications() {
  document.getElementById('screen-notifications').classList.remove('active');
}

function pickImage() { document.getElementById('file-input').click(); }

function handleFile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('upload-preview').innerHTML = `<img src="${e.target.result}" alt="" />`;
  };
  reader.readAsDataURL(file);
}

function submitPost() {
  const title = document.getElementById('upload-title').value.trim();
  const desc = document.getElementById('upload-desc').value.trim();
  const preview = document.querySelector('#upload-preview img');
  if (!title || !preview) { toast('Ish nomi va rasm majburiy!', 'danger'); return; }

  api('/posts/create', {
    method: 'POST',
    body: JSON.stringify({
      title,
      description: desc,
      imageUrl: preview.src,
      employeeId: currentUser.id,
      employeeName: currentUser.fullName,
      employeeAvatar: currentUser.avatar,
    }),
  })
    .then(() => {
      document.getElementById('upload-title').value = '';
      document.getElementById('upload-desc').value = '';
      document.getElementById('upload-preview').innerHTML = '<span class="upload-icon">☁️</span><p>Rasm yuklash</p>';
      loadPosts();
      switchTab('home');
      toast('Ish muvaffaqiyatli yuklandi!');
    })
    .catch((err) => toast(err.message, 'danger'));
}

function doCheckIn() {
  const status = getAttendanceStatus();
  if (status === 'finished') {
    toast('Bugungi ish kuni yakunlangan.', 'danger');
    showCheckIn('finished');
    return;
  }
  if (status === 'working') {
    showCheckIn('departure');
    return;
  }
  showCheckIn('arrival');
}

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.background = type === 'danger' ? '#EF4444' : '#22C55E';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

document.getElementById('rating-tabs').addEventListener('click', e => {
  if (e.target.classList.contains('tab')) {
    document.querySelectorAll('#rating-tabs .tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    currentPeriod = e.target.dataset.period;
    loadRating();
  }
});

renderDislikeChips();

const VK_LAYOUTS = {
  uz: {
    label: 'UZ',
    name: "O'zbek",
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['o\'', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'g\''],
    ],
    spaceLabel: "bo'shliq",
  },
  en: {
    label: 'EN',
    name: 'English',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ],
    spaceLabel: 'space',
  },
  ru: {
    label: 'RU',
    name: 'Русский',
    rows: [
      ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з'],
      ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д'],
      ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю'],
    ],
    spaceLabel: 'пробел',
  },
};

const VK_LANG_ORDER = ['uz', 'en', 'ru'];
let vkLang = 'uz';

function renderVirtualKeyboard() {
  const kb = document.getElementById('vk-keyboard');
  if (!kb) return;

  const layout = VK_LAYOUTS[vkLang];
  kb.innerHTML = '';

  const langBar = document.createElement('div');
  langBar.className = 'vk-lang-bar';
  langBar.innerHTML = VK_LANG_ORDER.map((code) =>
    `<button type="button" class="vk-lang-pill ${code === vkLang ? 'active' : ''}" onclick="vkSetLang('${code}')">${VK_LAYOUTS[code].label}</button>`
  ).join('');
  kb.appendChild(langBar);

  layout.rows.forEach((row) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'vk-row';
    row.forEach((key) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vk-key';
      btn.textContent = key;
      btn.onclick = () => vkType(key);
      rowEl.appendChild(btn);
    });
    kb.appendChild(rowEl);
  });

  const bottom = document.createElement('div');
  bottom.className = 'vk-row';
  bottom.innerHTML = `
    <button type="button" class="vk-key vk-key-action vk-key-lang" onclick="vkSwitchLang()" title="Tilni almashtirish">🌐</button>
    <button type="button" class="vk-key vk-key-action" onclick="vkBackspace()">⌫</button>
    <button type="button" class="vk-key vk-key-space" onclick="vkType(' ')">${layout.spaceLabel}</button>
    <button type="button" class="vk-key vk-key-action" onclick="vkType('.')">.</button>
    <button type="button" id="vk-send-key" class="vk-key vk-key-send" disabled onclick="submitCommentSheet()">↵</button>
  `;
  kb.appendChild(bottom);
  updateCommentPostBtn();
}

function vkSetLang(code) {
  if (!VK_LAYOUTS[code]) return;
  vkLang = code;
  renderVirtualKeyboard();
  document.getElementById('comment-input').focus();
}

function vkSwitchLang() {
  const idx = VK_LANG_ORDER.indexOf(vkLang);
  vkSetLang(VK_LANG_ORDER[(idx + 1) % VK_LANG_ORDER.length]);
}

function initVirtualKeyboard() {
  const kb = document.getElementById('vk-keyboard');
  if (!kb || kb.dataset.ready) return;
  renderVirtualKeyboard();
  kb.dataset.ready = '1';
}

function showVirtualKeyboard() {
  initVirtualKeyboard();
  document.getElementById('comment-sheet').classList.add('keyboard-open');
}

function hideVirtualKeyboard() {
  document.getElementById('comment-sheet').classList.remove('keyboard-open');
}

function vkType(char) {
  const input = document.getElementById('comment-input');
  input.value += char;
  updateCommentPostBtn();
  input.focus();
}

function vkBackspace() {
  const input = document.getElementById('comment-input');
  input.value = input.value.slice(0, -1);
  updateCommentPostBtn();
  input.focus();
}

initVirtualKeyboard();
