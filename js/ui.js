function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    if (s.id === id) {
      s.classList.remove('exit-left');
      s.classList.add('active');
    } else {
      s.classList.remove('active');
      s.classList.add('exit-left');
      setTimeout(() => s.classList.remove('exit-left'), 400);
    }
  });
}

/* ══════════════════════════════════════════════════
   SETUP INTERACTIONS
══════════════════════════════════════════════════ */
const durSlider = document.getElementById('dur-slider');
const durDisplay = document.getElementById('dur-display');
const sliderFill = document.getElementById('slider-fill');

durSlider.addEventListener('input', () => {
  const v = durSlider.value;
  durDisplay.innerHTML = `${v}<span>min</span>`;
  sliderFill.style.width = ((v - 15) / 45 * 100) + '%';
});

let selectedMuscles = [];
document.querySelectorAll('.muscle-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const id = chip.dataset.id;
    if (selectedMuscles.includes(id)) {
      selectedMuscles = selectedMuscles.filter(m => m !== id);
      chip.classList.remove('selected');
    } else {
      selectedMuscles.push(id);
      chip.classList.add('selected');
    }
  });
});

// Injury buttons — simple toggle
document.querySelectorAll('.injury-btn').forEach(btn => {
  btn.addEventListener('click', () => btn.classList.toggle('active'));
});

function getActiveInjuries() {
  return [...document.querySelectorAll('.injury-btn.active')].map(b => b.dataset.val);
}

function tagClass(tag) {
  const t = tag.toUpperCase();
  if (t.includes('ITB') || t.includes('REHAB') || t.includes('SAFE')) return 'tag-rehab';
  if (t.includes('WARN') || t.includes('AVOID') || t.includes('CAREFUL')) return 'tag-warn';
  return 'tag-muscle';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* ══════════════════════════════════════════════════
   WORKOUT HISTORY
══════════════════════════════════════════════════ */
function saveWorkoutHistory(entry) {
  try {
    const history = getWorkoutHistory();
    history.unshift(entry);
    localStorage.setItem('form_history', JSON.stringify(history.slice(0, 10)));
    renderHistoryBar();
  } catch(e) {}
}

function getWorkoutHistory() {
  try { return JSON.parse(localStorage.getItem('form_history') || '[]'); }
  catch { return []; }
}

function getStreak(history) {
  if (!history.length) return 0;
  const dayStart = ts => { const d = new Date(ts); d.setHours(0,0,0,0); return d.getTime(); };
  const days = [...new Set(history.map(w => dayStart(w.date)))].sort((a,b) => b - a);
  const todayStart = dayStart(Date.now());
  const yesterdayStart = todayStart - 86400000;
  if (days[0] < yesterdayStart) return 0;
  let streak = 0, expected = days[0];
  for (const day of days) {
    if (day === expected) { streak++; expected -= 86400000; }
    else break;
  }
  return streak;
}

function timeAgo(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function renderHistoryBar() {
  const bar = document.getElementById('history-bar');
  if (!bar) return;
  const history = getWorkoutHistory();
  if (!history.length) { bar.innerHTML = ''; return; }
  const streak = getStreak(history);
  const last = history[0];
  const streakHtml = streak > 1
    ? `<span class="history-streak">${streak}-DAY STREAK</span><span class="history-dot"></span>`
    : '';
  bar.innerHTML = `${streakHtml}<span class="history-last">${timeAgo(last.date)} · ${last.muscle} · ${last.duration}min</span>`;
}

renderHistoryBar();
