let sessionState = { exIdx: 0, setIdx: 0, sideIdx: 0, completedSets: 0, phase: 'idle', remaining: 0, ivId: null };
let sessionStart = null;

function haptic(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function beep(freq = 660, dur = 0.12, vol = 0.25) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
    setTimeout(() => ctx.close(), (dur + 0.1) * 1000);
  } catch(e) {}
}

/* ══════════════════════════════════════════════════
   SESSION LOGIC
   Queue: warmup[] → exercises[] → cooldown[]
══════════════════════════════════════════════════ */
let sessionQueue = [];

function buildQueue() {
  return [
    ...workout.warmup.map(w => ({ ...w, qtype:'warmup' })),
    ...workout.exercises.map(e => ({ ...e, qtype:'main' })),
    ...workout.cooldown.map(c => ({ ...c, qtype:'cooldown' })),
  ];
}

document.getElementById('start-workout-btn').addEventListener('click', () => {
  sessionQueue = buildQueue();
  sessionState = { exIdx: 0, setIdx: 0, sideIdx: 0, completedSets: 0, phase: 'idle', remaining: 0, ivId: null };
  sessionStart = Date.now();
  loadQueueItem(0);
  showScreen('screen-session');
});

document.getElementById('session-back-btn').addEventListener('click', () => {
  const inProgress = sessionState.exIdx > 0 || sessionState.setIdx > 0 || sessionState.phase !== 'idle';
  if (inProgress && !confirm('Leave workout? Your progress will be lost.')) return;
  stopTimer();
  sessionState = { exIdx: 0, setIdx: 0, sideIdx: 0, completedSets: 0, phase: 'idle', remaining: 0, ivId: null };
  showScreen('screen-plan');
});

document.getElementById('plan-back-btn').addEventListener('click', () => {
  showScreen('screen-setup');
});

function loadQueueItem(idx) {
  stopTimer();
  sessionState.exIdx = idx;
  sessionState.setIdx = 0;
  sessionState.sideIdx = 0;
  sessionState.phase = 'idle';

  const item  = sessionQueue[idx];
  const total = sessionQueue.length;
  const qtype = item.qtype;

  // Progress bar
  const wu = workout.warmup.length;
  const ex = workout.exercises.length;
  document.getElementById('sess-progress-label').textContent =
    qtype === 'warmup'   ? `WARM-UP ${idx + 1} / ${wu}` :
    qtype === 'cooldown' ? `COOL-DOWN ${idx - wu - ex + 1} / ${workout.cooldown.length}` :
                           `EXERCISE ${idx - wu + 1} OF ${ex}`;
  document.getElementById('sess-progress-fill').style.width = (total <= 1 ? 100 : (idx / (total - 1)) * 100) + '%';
  document.getElementById('ctrl-prev').disabled = (idx === 0);

  // Number / phase label
  const numLabel =
    qtype === 'warmup'   ? ICONS.flame :
    qtype === 'cooldown' ? ICONS.snowflake :
    String(idx - wu + 1).padStart(2,'0');

  document.getElementById('sess-ex-num').innerHTML   = numLabel;
  document.getElementById('sess-ex-name').textContent = item.name;
  document.getElementById('sess-ex-desc').textContent = item.desc;
  document.getElementById('sess-ex-tip').innerHTML   = item.tip ? `${ICONS.lightbulb}<span>${item.tip}</span>` : '';

  const tagsEl = document.getElementById('sess-ex-tags');
  tagsEl.innerHTML = (item.tags||[]).map(t => `<span class="ex-tag ${tagClass(t)}">${t}</span>`).join('');

  const animEl = document.getElementById('sess-anim');
  if (qtype === 'main') {
    animEl.style.display = '';
    animEl.innerHTML = `<img src="IMAGES/${item.name}.png" alt="${item.name}" class="sess-img" loading="lazy" onerror="this.parentElement.style.display='none'">`;
  } else {
    animEl.innerHTML = '';
    animEl.style.display = 'none';
  }

  // Warmup / Cooldown — simple countdown, no sets
  if (qtype !== 'main') {
    const color = qtype === 'warmup' ? '#f59e0b' : '#06b6d4';
    const btnClass = qtype === 'warmup' ? 'warmup-mode' : 'cooldown-mode';
    document.getElementById('sets-dots').innerHTML = '';
    setRing(1, color);
    document.getElementById('big-phase').textContent = qtype === 'warmup' ? 'WARM-UP' : 'COOL-DOWN';
    document.getElementById('big-time').textContent  = pad(item.duration);
    document.getElementById('big-sets-label').textContent = `${item.duration}s`;
    document.getElementById('ctrl-main').textContent = 'START';
    document.getElementById('ctrl-main').className   = `ctrl-btn ctrl-main ${btnClass}`;
    document.getElementById('ctrl-skip').textContent = 'SKIP';
    document.getElementById('big-side-label').classList.remove('visible');
    return;
  }

  // Main exercise — set/rep flow
  const dots = document.getElementById('sets-dots');
  dots.innerHTML = '';
  for (let i = 0; i < item.sets; i++) {
    const d = document.createElement('div');
    d.className = 'set-dot';
    dots.appendChild(d);
  }
  setRing(1, '#e8380d');
  document.getElementById('big-phase').textContent = 'READY';
  document.getElementById('big-time').textContent  = item.work_secs > 0 ? pad(item.work_secs) : item.label;
  document.getElementById('big-sets-label').textContent = `SET 0 / ${item.sets}`;
  document.getElementById('ctrl-main').textContent = 'START';
  document.getElementById('ctrl-main').className   = 'ctrl-btn ctrl-main';
  document.getElementById('ctrl-skip').textContent = 'SKIP EX';
  updateDots(false);
  updateSideLabel(item);
}

document.getElementById('ctrl-main').addEventListener('click', handleMainBtn);
document.getElementById('ctrl-skip').addEventListener('click', () => { stopTimer(); nextQueueItem(); });
document.getElementById('ctrl-prev').addEventListener('click', () => {
  if (sessionState.exIdx === 0) return;
  stopTimer();
  loadQueueItem(sessionState.exIdx - 1);
});

function handleMainBtn() {
  const item  = sessionQueue[sessionState.exIdx];
  const qtype = item.qtype;

  if (qtype !== 'main') {
    if (sessionState.phase === 'idle') {
      startSimpleCountdown(item);
    } else if (sessionState.phase === 'counting') {
      if (sessionState.ivId) { stopTimer(); document.getElementById('ctrl-main').textContent = 'RESUME'; }
      else { resumeSimpleCountdown(item); }
    } else if (sessionState.phase === 'done') {
      nextQueueItem();
    }
    return;
  }

  const isHold = item.work_secs > 0;
  if (sessionState.phase === 'idle' || sessionState.phase === 'idle-next') {
    sessionState.setIdx++;
    document.getElementById('big-sets-label').textContent = `SET ${sessionState.setIdx} / ${item.sets}`;
    sessionState.sideIdx = 0;
    updateSideLabel(item);
    stopTimer();
    if (isHold) { startWork(item); }
    else {
      sessionState.phase = 'work';
      document.getElementById('big-phase').textContent = 'GO!';
      document.getElementById('big-time').textContent  = item.label;
      setRing(1, '#e8380d');
      document.getElementById('ctrl-main').textContent = item.sides === 2 ? 'LEFT DONE' : 'SET DONE';
      document.getElementById('ctrl-main').className   = 'ctrl-btn ctrl-main';
    }
  } else if (sessionState.phase === 'switch') {
    // User confirmed right side — start it
    if (isHold) { startWork(item); }
    else {
      sessionState.phase = 'work';
      document.getElementById('big-phase').textContent = 'GO!';
      document.getElementById('big-time').textContent  = item.label;
      setRing(1, '#e8380d');
      document.getElementById('ctrl-main').textContent = 'RIGHT DONE';
      document.getElementById('ctrl-main').className   = 'ctrl-btn ctrl-main';
    }
  } else if (sessionState.phase === 'work') {
    if (!isHold) { stopTimer(); afterSet(item); }
    else {
      if (sessionState.ivId) { stopTimer(); document.getElementById('ctrl-main').textContent = 'RESUME'; }
      else { document.getElementById('ctrl-main').textContent = 'PAUSE'; resumeWork(item); }
    }
  } else if (sessionState.phase === 'rest') {
    stopTimer(); afterRest(item);
  } else if (sessionState.phase === 'done') {
    nextQueueItem();
  }
}

function startSimpleCountdown(item) {
  const color = item.qtype === 'warmup' ? '#f59e0b' : '#06b6d4';
  const btnClass = item.qtype === 'warmup' ? 'warmup-mode' : 'cooldown-mode';
  sessionState.phase = 'counting';
  sessionState.remaining = item.duration;
  setRing(1, color);
  document.getElementById('big-phase').textContent = item.qtype === 'warmup' ? 'WARM-UP' : 'COOL-DOWN';
  document.getElementById('big-time').textContent  = pad(sessionState.remaining);
  document.getElementById('ctrl-main').textContent = 'PAUSE';
  document.getElementById('ctrl-main').className   = `ctrl-btn ctrl-main ${btnClass}`;
  sessionState.ivId = setInterval(() => {
    sessionState.remaining--;
    document.getElementById('big-time').textContent = pad(Math.max(0, sessionState.remaining));
    setRing(sessionState.remaining / item.duration, color);
    if (sessionState.remaining <= 0) {
      stopTimer(); sessionState.phase = 'done';
      document.getElementById('big-phase').textContent = 'DONE!';
      document.getElementById('big-time').textContent  = '✓';
      setRing(1, '#22c55e');
      document.getElementById('ctrl-main').textContent = 'NEXT →';
      document.getElementById('ctrl-main').className   = 'ctrl-btn ctrl-main done-mode';
    }
  }, 1000);
}

function resumeSimpleCountdown(item) {
  const color = item.qtype === 'warmup' ? '#f59e0b' : '#06b6d4';
  const btnClass = item.qtype === 'warmup' ? 'warmup-mode' : 'cooldown-mode';
  document.getElementById('ctrl-main').textContent = 'PAUSE';
  document.getElementById('ctrl-main').className   = `ctrl-btn ctrl-main ${btnClass}`;
  sessionState.ivId = setInterval(() => {
    sessionState.remaining--;
    document.getElementById('big-time').textContent = pad(Math.max(0, sessionState.remaining));
    setRing(sessionState.remaining / item.duration, color);
    if (sessionState.remaining <= 0) {
      stopTimer(); sessionState.phase = 'done';
      document.getElementById('big-phase').textContent = 'DONE!';
      document.getElementById('big-time').textContent  = '✓';
      setRing(1, '#22c55e');
      document.getElementById('ctrl-main').textContent = 'NEXT →';
      document.getElementById('ctrl-main').className   = 'ctrl-btn ctrl-main done-mode';
    }
  }, 1000);
}

function startWork(item) {
  sessionState.phase = 'work';
  sessionState.remaining = item.work_secs;
  document.getElementById('big-phase').textContent = 'WORK';
  document.getElementById('big-time').textContent  = pad(sessionState.remaining);
  setRing(1, '#e8380d');
  document.getElementById('ctrl-main').textContent = 'PAUSE';
  document.getElementById('ctrl-main').className   = 'ctrl-btn ctrl-main';
  document.getElementById('ctrl-skip').textContent = 'SKIP EX';
  sessionState.ivId = setInterval(() => {
    sessionState.remaining--;
    document.getElementById('big-time').textContent = pad(Math.max(0, sessionState.remaining));
    setRing(sessionState.remaining / item.work_secs, '#e8380d');
    if (sessionState.remaining <= 0) { stopTimer(); afterSet(item); }
  }, 1000);
}

function resumeWork(item) {
  sessionState.ivId = setInterval(() => {
    sessionState.remaining--;
    document.getElementById('big-time').textContent = pad(Math.max(0, sessionState.remaining));
    setRing(sessionState.remaining / item.work_secs, '#e8380d');
    if (sessionState.remaining <= 0) { stopTimer(); afterSet(item); }
  }, 1000);
}

function afterSet(item) {
  const sides = item.sides || 1;

  if (sides === 2 && sessionState.sideIdx === 0) {
    // Completed LEFT side — switch to RIGHT before resting
    sessionState.sideIdx = 1;
    updateSideLabel(item);
    // Brief "SWITCH" phase, then restart same set work immediately (no rest between sides)
    stopTimer();
    sessionState.phase = 'switch';
    document.getElementById('big-phase').textContent = 'SWITCH';
    document.getElementById('big-time').textContent  = item.work_secs > 0 ? pad(item.work_secs) : item.label;
    setRing(1, '#f59e0b');
    document.getElementById('ctrl-main').textContent = 'START RIGHT';
    document.getElementById('ctrl-main').className   = 'ctrl-btn ctrl-main warmup-mode';
    document.getElementById('ctrl-skip').textContent = 'SKIP EX';
    return;
  }

  // Both sides done (or bilateral) — reset side, count the set, then rest/done
  sessionState.sideIdx = 0;
  sessionState.completedSets++;
  updateSideLabel(item);
  updateDots(false);
  sessionState.setIdx < item.sets ? startRest(item) : exDone();
}

function updateSideLabel(item) {
  const el = document.getElementById('big-side-label');
  if (!item.sides || item.sides < 2) {
    el.classList.remove('visible');
    return;
  }
  el.classList.add('visible');
  el.textContent = sessionState.sideIdx === 0 ? '← LEFT' : 'RIGHT →';
}

function startRest(item) {
  sessionState.phase = 'rest';
  sessionState.remaining = item.rest_secs;
  document.getElementById('big-phase').textContent = 'REST';
  document.getElementById('big-time').textContent  = pad(sessionState.remaining);
  setRing(1, '#3b82f6');
  document.getElementById('ctrl-main').textContent = 'SKIP REST';
  document.getElementById('ctrl-main').className   = 'ctrl-btn ctrl-main rest-mode';
  document.getElementById('ctrl-skip').textContent = 'SKIP EX';
  sessionState.ivId = setInterval(() => {
    sessionState.remaining--;
    document.getElementById('big-time').textContent = pad(Math.max(0, sessionState.remaining));
    setRing(sessionState.remaining / item.rest_secs, '#3b82f6');
    if (sessionState.remaining <= 0) { stopTimer(); afterRest(item); }
  }, 1000);
}

function afterRest(item) {
  beep(880, 0.08);
  setTimeout(() => beep(880, 0.08), 120);
  haptic([30, 60, 30]);
  sessionState.phase = 'idle-next';
  sessionState.sideIdx = 0;
  updateSideLabel(item);
  document.getElementById('big-phase').textContent = 'NEXT SET';
  document.getElementById('big-time').textContent  = item.work_secs > 0 ? pad(item.work_secs) : item.label;
  setRing(1, '#e8380d');
  document.getElementById('ctrl-main').textContent = item.sides === 2 ? 'START LEFT' : 'START SET';
  document.getElementById('ctrl-main').className   = 'ctrl-btn ctrl-main';
}

function exDone() {
  stopTimer();
  haptic([40, 30, 40]);
  sessionState.phase = 'done';
  document.getElementById('big-phase').textContent = 'DONE!';
  document.getElementById('big-time').textContent  = '✓';
  setRing(1, '#22c55e');
  document.getElementById('ctrl-main').textContent = 'NEXT EXERCISE →';
  document.getElementById('ctrl-main').className   = 'ctrl-btn ctrl-main done-mode';
  document.getElementById('ctrl-skip').textContent = 'SKIP EX';
  updateDots(true);
}

function nextQueueItem() {
  const next = sessionState.exIdx + 1;
  next >= sessionQueue.length ? finishWorkout() : loadQueueItem(next);
}

function finishWorkout() {
  stopTimer();
  haptic([80, 40, 80, 40, 120]);
  const mins      = Math.round((Date.now() - sessionStart) / 60000);
  const totalSets = workout.exercises.reduce((a,e) => a + e.sets, 0);
  const doneSets  = sessionState.completedSets;
  const pct       = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 100;

  document.getElementById('finish-exs').textContent  = workout.exercises.length;
  document.getElementById('finish-sets').textContent = doneSets;
  document.getElementById('finish-mins').textContent = Math.max(1, mins);
  document.getElementById('finish-sub').textContent  = `${workout.muscle} complete — warm-up to cool-down. Well done.`;
  document.getElementById('finish-completion-fill').style.width  = pct + '%';
  document.getElementById('finish-completion-label').textContent = `${doneSets} / ${totalSets} sets · ${pct}% complete`;
  document.getElementById('sess-progress-fill').style.width = '100%';
  document.getElementById('sess-progress-label').textContent = 'ALL DONE';
  document.getElementById('finish-overlay').classList.add('show');
  saveWorkoutHistory({ date: Date.now(), muscle: workout.muscle, duration: Math.max(1, mins), exercises: workout.exercises.length, sets: doneSets, totalSets });
}

document.getElementById('finish-share-btn').addEventListener('click', shareWorkout);
document.getElementById('finish-btn').addEventListener('click', () => {
  document.getElementById('finish-overlay').classList.remove('show');
  workout = null; sessionQueue = []; selectedMuscles = [];
  document.querySelectorAll('.muscle-chip').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.injury-btn').forEach(b => b.classList.remove('active'));
  showScreen('screen-setup');
});
/* ══════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════ */
function stopTimer() {
  if (sessionState.ivId) { clearInterval(sessionState.ivId); sessionState.ivId = null; }
}

function pad(n) { return String(Math.max(0,n)).padStart(2,'0'); }

function setRing(frac, color) {
  const fg = document.getElementById('big-ring-fg');
  fg.style.strokeDashoffset = CIRC_BIG * (1 - Math.max(0, Math.min(1, frac)));
  fg.style.stroke = color;
}

function updateDots(allDone = false) {
  const dots = document.querySelectorAll('#sets-dots .set-dot');
  dots.forEach((d, i) => {
    d.className = 'set-dot';
    if (allDone) {
      d.classList.add('done');
    } else if (i < sessionState.setIdx - 1) {
      d.classList.add('done');
    } else if (i === sessionState.setIdx - 1) {
      d.classList.add('active');
    }
  });
}
