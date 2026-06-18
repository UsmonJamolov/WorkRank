const DISLIKE_CATS = ['Sifat xatosi', 'Xavfsizlik xatosi', 'Tugallanmagan ish', "Noto'g'ri material", 'Boshqa'];

let stories = [
  { id: 1, name: 'Aziz', avatar: 'https://i.pravatar.cc/150?u=aziz', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', title: 'Elektr montaj', points: 45, likes: 12, dislikes: 1, viewed: false },
  { id: 2, name: 'Bekzod', avatar: 'https://i.pravatar.cc/150?u=bekzod', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800', title: 'Material qabul', points: 38, likes: 20, dislikes: 0, viewed: false },
  { id: 3, name: 'Jamshid', avatar: 'https://i.pravatar.cc/150?u=jamshid', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800', title: 'Diagnostika', points: 32, likes: 15, dislikes: 2, viewed: true },
];

let posts = [
  { id: 1, name: 'Azizbek', avatar: 'https://i.pravatar.cc/150?u=azizbek', time: '08:35', title: '3-qavat elektr montaji yakunlandi', desc: "Barcha kabel kanallari o'rnatildi va tekshiruvdan o'tkazildi.", image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', likes: 15, dislikes: 2, comments: 7, liked: false, disliked: false },
  { id: 2, name: 'Bekzod', avatar: 'https://i.pravatar.cc/150?u=bekzod', time: '10:15', title: 'Material qabul qilish yakunlandi', desc: 'Yangi kabel va avtomatlar omborga qabul qilindi.', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800', likes: 22, dislikes: 0, comments: 4, liked: false, disliked: false },
  { id: 3, name: 'Jamshid', avatar: 'https://i.pravatar.cc/150?u=jamshid', time: '14:00', title: 'Diagnostika tekshiruvi', desc: "2-qavat elektr tarmog'i to'liq diagnostika qilindi.", image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800', likes: 18, dislikes: 1, comments: 5, liked: false, disliked: false },
];

const ratings = {
  daily: [
    { rank: 1, name: 'Azizbek', avatar: 'https://i.pravatar.cc/150?u=azizbek', pos: 'Elektr montajchi', points: 240 },
    { rank: 2, name: 'Bekzod', avatar: 'https://i.pravatar.cc/150?u=bekzod', pos: 'Elektr montajchi', points: 220 },
    { rank: 3, name: 'Jamshid', avatar: 'https://i.pravatar.cc/150?u=jamshid', pos: 'Diagnost', points: 210 },
    { rank: 4, name: 'Aziz', avatar: 'https://i.pravatar.cc/150?u=aziz', pos: 'Omborchi', points: 195 },
  ],
  weekly: [
    { rank: 1, name: 'Bekzod', avatar: 'https://i.pravatar.cc/150?u=bekzod', pos: 'Elektr montajchi', points: 980 },
    { rank: 2, name: 'Azizbek', avatar: 'https://i.pravatar.cc/150?u=azizbek', pos: 'Elektr montajchi', points: 920 },
    { rank: 3, name: 'Jamshid', avatar: 'https://i.pravatar.cc/150?u=jamshid', pos: 'Diagnost', points: 850 },
  ],
  monthly: [
    { rank: 1, name: 'Azizbek', avatar: 'https://i.pravatar.cc/150?u=azizbek', pos: 'Elektr montajchi', points: 1200 },
    { rank: 2, name: 'Bekzod', avatar: 'https://i.pravatar.cc/150?u=bekzod', pos: 'Elektr montajchi', points: 980 },
    { rank: 3, name: 'Jamshid', avatar: 'https://i.pravatar.cc/150?u=jamshid', pos: 'Diagnost', points: 870 },
  ],
};

const notifications = [
  { title: 'Aziz yangi ish yukladi', body: '3-qavat elektr montaji yakunlandi', time: '08:35', unread: true },
  { title: 'Bekzod kamchilik qoldirdi', body: "Sifat xatosi: Kabel kanali to'g'ri mahkamlanmagan", time: '10:00', unread: true },
  { title: 'Siz TOP 3 ga kirdingiz!', body: "Tabriklaymiz! Oylik reytingda 3-o'rin.", time: 'Kecha', unread: false },
  { title: "Rahbar yangi e'lon joylashtirdi", body: "Ertangi ish rejasi e'lon qilindi.", time: 'Kecha', unread: false },
];

let currentStoryIndex = 0;
let currentDislikePostId = null;
let selectedCategory = DISLIKE_CATS[0];
let currentPeriod = 'daily';

// SPLASH → LOGIN
setTimeout(() => {
  document.getElementById('screen-splash').classList.remove('active');
  document.getElementById('screen-login').classList.add('active');
}, 2500);

function doLogin() {
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-app').classList.add('active');
  renderAll();
}

function doLogout() {
  document.getElementById('screen-app').classList.remove('active');
  document.getElementById('screen-login').classList.add('active');
}

function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelector(`.nav-item[data-tab="${tab}"]`).classList.add('active');
}

function renderAll() {
  renderStoryBar();
  renderFeed();
  renderStoryList();
  renderRating();
  renderNotifications();
  renderDislikeChips();
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
        <button class="${p.liked ? 'liked' : ''}" onclick="likePost(${p.id})">👍 Tasdiqlayman</button>
        <button class="${p.disliked ? 'disliked' : ''}" onclick="openDislike(${p.id})">👎 Kamchilik topdim</button>
        <button onclick="toast('Izoh qo\'shildi!')">💬 Izohlar</button>
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
  document.getElementById('dislike-chips').innerHTML = DISLIKE_CATS.map(c =>
    `<span class="chip ${c === selectedCategory ? 'active' : ''}" onclick="selectCategory('${c}')">${c}</span>`
  ).join('');
}

function selectCategory(c) { selectedCategory = c; renderDislikeChips(); }

function likePost(id) {
  const p = posts.find(x => x.id === id);
  if (!p || p.liked) return;
  if (p.disliked) { p.dislikes--; p.disliked = false; }
  p.likes++; p.liked = true;
  renderFeed();
}

function openDislike(id) {
  currentDislikePostId = id;
  document.getElementById('dislike-comment').value = '';
  selectedCategory = DISLIKE_CATS[0];
  renderDislikeChips();
  document.getElementById('dislike-modal').classList.add('active');
}

function closeDislike() {
  document.getElementById('dislike-modal').classList.remove('active');
  currentDislikePostId = null;
}

function saveDislike() {
  const comment = document.getElementById('dislike-comment').value.trim();
  if (!comment) { toast('Izoh majburiy!', 'danger'); return; }
  const p = posts.find(x => x.id === currentDislikePostId);
  if (p && !p.disliked) {
    if (p.liked) { p.likes--; p.liked = false; }
    p.dislikes++; p.disliked = true;
    renderFeed();
  }
  closeDislike();
  toast('Kamchilik saqlandi');
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
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  posts.unshift({
    id: Date.now(), name: 'Azizbek', avatar: 'https://i.pravatar.cc/150?u=azizbek',
    time, title, desc, image: preview.src, likes: 0, dislikes: 0, comments: 0, liked: false, disliked: false
  });
  document.getElementById('upload-title').value = '';
  document.getElementById('upload-desc').value = '';
  document.getElementById('upload-preview').innerHTML = '<span class="upload-icon">☁️</span><p>Rasm yuklash</p>';
  renderFeed();
  switchTab('home');
  toast('Ish muvaffaqiyatli yuklandi!');
}

function doCheckIn() {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  document.getElementById('check-in').textContent = time;
  toast('Davomat muvaffaqiyatli qayd etildi!');
}

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.background = type === 'danger' ? '#EF4444' : '#22C55E';
  el.textContent = msg;
  document.getElementById('phone-frame').appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

document.getElementById('rating-tabs').addEventListener('click', e => {
  if (e.target.classList.contains('tab')) {
    document.querySelectorAll('#rating-tabs .tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    currentPeriod = e.target.dataset.period;
    renderRating();
  }
});

renderDislikeChips();
