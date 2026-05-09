let workout = null;  // { title, muscle, duration, injuryNote, exercises: [{name,tags,desc,tip,sets,workSecs,restSecs,label}] }

/* ══════════════════════════════════════════════════
   INJURY KEYWORD DETECTION
══════════════════════════════════════════════════ */
function detectInjuryKeywords(text) {
  const t = text.toLowerCase();
  const keywords = [];
  if (/\b(it band|iliotibial|itb)\b/.test(t))            keywords.push('it band', 'iliotibial');
  if (/\bknee\b/.test(t))                                  keywords.push('knee');
  if (/\b(lower back|lumbar|back pain)\b/.test(t))        keywords.push('lower back', 'back');
  if (/\bshoulder\b/.test(t))                              keywords.push('shoulder impingement', 'shoulder');
  if (/\bwrist\b/.test(t))                                 keywords.push('wrist');
  if (/\bneck\b/.test(t))                                  keywords.push('neck');
  if (/\belbow\b/.test(t))                                 keywords.push('elbow');
  if (/\bhip\b/.test(t))                                   keywords.push('hip');
  return [...new Set(keywords)];
}

function buildInjuryNote(injuryKeywords, muscle) {
  if (!injuryKeywords.length) return null;
  const notes = [];
  if (injuryKeywords.some(k => ['it band','iliotibial'].includes(k)))
    notes.push('ITB-aggravating movements avoided; hip abductor and VMO strengthening prioritised');
  if (injuryKeywords.includes('lower back') || injuryKeywords.includes('back'))
    notes.push('spinal flexion and heavy posterior chain exercises avoided');
  if (injuryKeywords.some(k => k.includes('shoulder')))
    notes.push('overhead and wide push patterns avoided');
  if (injuryKeywords.includes('knee'))
    notes.push('high-impact and deep knee flexion exercises replaced with VMO-safe alternatives');
  if (injuryKeywords.includes('wrist'))
    notes.push('wrist-loading exercises avoided');
  return 'Adaptations: ' + notes.join('; ') + '.';
}

function pickRandom(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}
function selectWarmup(muscle) {
  const pool = WARMUP[muscle] || WARMUP.full_body;
  return pickRandom(pool, 4).map(w => ({ ...w, type:'warmup' }));
}
function selectCooldown(muscle) {
  const pool = COOLDOWN[muscle] || COOLDOWN.full_body;
  return pickRandom(pool, 4).map(c => ({ ...c, type:'cooldown' }));
}

/* ══════════════════════════════════════════════════
   SMART EXERCISE SELECTOR
══════════════════════════════════════════════════ */
function selectExercises(muscles, duration, injuryKeywords) {
  // Normalise: always work with an array
  if (!Array.isArray(muscles)) muscles = [muscles];

  // Time budget: subtract 5 min warmup + 5 min cooldown
  const workMinutes = Math.max(10, duration - 10);
  const targetCount = Math.max(4, Math.min(11, Math.round(workMinutes / 4.2)));

  function prioritySort(arr) {
    return arr
      .map(ex => ({ ex, score: ex.priority + Math.random() * 4 }))
      .sort((a, b) => b.score - a.score)
      .map(({ ex }) => ex);
  }

  function pickFromPool(pool, n) {
    const safe    = pool.filter(ex => ex.safeFor.some(k => injuryKeywords.includes(k)));
    const neutral = pool.filter(ex =>
      !ex.avoidIf.some(k => injuryKeywords.includes(k)) && !safe.includes(ex)
    );
    const avoid   = pool.filter(ex => ex.avoidIf.some(k => injuryKeywords.includes(k)));
    const ordered = [...prioritySort(safe), ...prioritySort(neutral)];
    if (ordered.length === 0) ordered.push(...prioritySort(avoid));
    return ordered.slice(0, n);
  }

  let selected;

  // Expand 'full_body' into all 5 groups, then treat as multi-select
  const expandedMuscles = [...new Set(
    muscles.flatMap(m => m === 'full_body' ? ['abs_core','chest','back','arms','legs'] : [m])
  )];

  if (expandedMuscles.length === 1) {
    // Single group — straightforward pick
    const pool = LIBRARY.filter(ex => ex.groups.includes(expandedMuscles[0]));
    selected = pickFromPool(pool, targetCount);
  } else {
    // Multi-group — sample proportionally and interleave for balance
    const perGroup = Math.ceil(targetCount / expandedMuscles.length);
    const buckets = expandedMuscles.map(g =>
      pickFromPool(LIBRARY.filter(ex => ex.groups.includes(g)), perGroup + 1)
    );
    const interleaved = [];
    const seen = new Set();
    for (let i = 0; interleaved.length < targetCount; i++) {
      let added = false;
      for (const bucket of buckets) {
        if (interleaved.length >= targetCount) break;
        if (bucket[i] && !seen.has(bucket[i].name)) {
          interleaved.push(bucket[i]);
          seen.add(bucket[i].name);
          added = true;
        }
      }
      if (!added) break;
    }
    selected = interleaved;
  }

  // Scale sets based on duration
  return selected.map(ex => {
    const base = ex.sets;
    if (workMinutes <= 15)  return { ...ex, sets: Math.max(2, base - 1) };
    if (workMinutes >= 40)  return { ...ex, sets: Math.min(4, base + 1) };
    return ex;
  });
}

/* ══════════════════════════════════════════════════
   GENERATE (no API — built-in logic)
══════════════════════════════════════════════════ */
document.getElementById('generate-btn').addEventListener('click', generateWorkout);
document.getElementById('plan-regen-btn').addEventListener('click', generateWorkout);
document.getElementById('plan-share-btn').addEventListener('click', shareWorkout);

function generateWorkout() {
  if (!selectedMuscles.length) { showToast('Please select at least one muscle group'); return; }

  const btn = document.getElementById('generate-btn');
  btn.disabled = true;

  const duration   = parseInt(durSlider.value);
  const injuryKeys = getActiveInjuries();

  showScreen('screen-loading');

  const muscleLabels = {
    abs_core: 'Abs & Core', chest: 'Chest & Shoulders',
    back: 'Back & Biceps', arms: 'Triceps & Arms',
    legs: 'Legs (Runner)', full_body: 'Full Body'
  };

  setTimeout(() => {
    const exercises  = selectExercises(selectedMuscles, duration, injuryKeys);

    // Use the first selected muscle for warmup/cooldown (most representative)
    const primaryMuscle = selectedMuscles.length === 1 ? selectedMuscles[0] :
      selectedMuscles.includes('full_body') ? 'full_body' : selectedMuscles[0];

    const warmup     = selectWarmup(primaryMuscle);
    const cooldown   = selectCooldown(primaryMuscle);
    const titlePool  = TITLES[primaryMuscle] || TITLES.full_body;
    const title      = selectedMuscles.length > 1
      ? `${muscleLabels[selectedMuscles[0]] || 'COMBO'} + MORE`
      : (titlePool[Math.floor(Math.random() * titlePool.length)]);
    const injuryNote = buildInjuryNote(injuryKeys, primaryMuscle);

    const muscleLabel = selectedMuscles.length === 1
      ? muscleLabels[selectedMuscles[0]]
      : selectedMuscles.map(m => muscleLabels[m] || m).join(' · ');

    workout = {
      title,
      muscle: muscleLabel,
      duration,
      injuryNote,
      warmup,
      exercises,
      cooldown,
    };

    renderPlan();
    showScreen('screen-plan');
    btn.disabled = false;
  }, 300);
}

/* ══════════════════════════════════════════════════
   SWAP & SHARE
══════════════════════════════════════════════════ */
function swapExercise(idx) {
  const ex = workout.exercises[idx];
  const usedNames = new Set(workout.exercises.map(e => e.name));
  const injuryKeys = getActiveInjuries();
  const candidates = LIBRARY.filter(e =>
    e.groups.some(g => ex.groups.includes(g)) &&
    !usedNames.has(e.name) &&
    !injuryKeys.some(k => e.avoidIf.includes(k))
  );
  if (!candidates.length) { showToast('No other exercises available for this group'); return; }
  const picked = candidates
    .map(e => ({ e, score: e.priority + Math.random() * 4 }))
    .sort((a, b) => b.score - a.score)[0].e;
  const workMinutes = Math.max(10, workout.duration - 10);
  let sets = picked.sets;
  if (workMinutes <= 15) sets = Math.max(2, sets - 1);
  else if (workMinutes >= 40) sets = Math.min(4, sets + 1);
  workout.exercises[idx] = { ...picked, sets };
  renderPlan();
}

function shareWorkout() {
  if (!workout) return;
  const lines = [
    `${workout.title} — ${workout.duration}min · ${workout.muscle}`,
    '',
    'WARM-UP',
    ...workout.warmup.map(w => `  ${w.name} (${w.duration}s)`),
    '',
    'WORKOUT',
    ...workout.exercises.map((ex, i) => `  ${i+1}. ${ex.name} — ${ex.sets}× ${ex.label}`),
    '',
    'COOL-DOWN',
    ...workout.cooldown.map(c => `  ${c.name} (${c.duration}s)`),
    '',
    'Built with FORM',
  ];
  const text = lines.join('\n');
  if (navigator.share) {
    navigator.share({ title: workout.title, text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text)
      .then(() => showToast('Workout copied to clipboard'))
      .catch(() => showToast('Could not copy — try a modern browser'));
  }
}

/* ══════════════════════════════════════════════════
   RENDER PLAN
══════════════════════════════════════════════════ */
function renderPlan() {
  document.getElementById('plan-title').textContent = workout.title;

  const meta = document.getElementById('plan-meta');
  meta.innerHTML = `
    <div class="plan-badge"><span class="dot"></span>${workout.duration} min</div>
    <div class="plan-badge green"><span class="dot"></span>${workout.exercises.length} exercises</div>
    <div class="plan-badge blue"><span class="dot"></span>${workout.muscle}</div>
  `;

  const notice = document.getElementById('plan-notice');
  if (workout.injuryNote) {
    notice.textContent = '⚠ ' + workout.injuryNote;
    notice.classList.add('visible');
  } else {
    notice.classList.remove('visible');
  }

  const list = document.getElementById('exercise-list');
  list.innerHTML = '';
  list.onclick = e => {
    const btn = e.target.closest('.ex-swap-btn');
    if (btn) swapExercise(parseInt(btn.dataset.idx));
  };

  // ── Warmup section ──
  const wuHeader = document.createElement('div');
  wuHeader.className = 'plan-phase-header warmup-header';
  wuHeader.innerHTML = `<span class="phase-icon">🔥</span> WARM-UP <span class="phase-duration">~5 min</span>`;
  list.appendChild(wuHeader);
  workout.warmup.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'ex-card warmup-card';
    card.innerHTML = `
      <div class="ex-card-num" style="color:#f59e0b">${String(i+1).padStart(2,'0')}</div>
      <div class="ex-card-body">
        <div class="ex-card-name">${item.name}</div>
        <div class="ex-card-desc">${item.desc}</div>
      </div>
      <div class="ex-card-sets">
        <div class="ex-sets-val" style="font-size:1.1rem">${item.duration}s</div>
        <div class="ex-sets-unit">hold/do</div>
      </div>`;
    list.appendChild(card);
  });

  // ── Main workout section ──
  const mainHeader = document.createElement('div');
  mainHeader.className = 'plan-phase-header main-header';
  mainHeader.innerHTML = `<span class="phase-icon">⚡</span> WORKOUT <span class="phase-duration">${workout.exercises.length} exercises</span>`;
  list.appendChild(mainHeader);
  workout.exercises.forEach((ex, i) => {
    const card = document.createElement('div');
    card.className = 'ex-card';
    card.innerHTML = `
      <div class="ex-anim-wrap"><img src="IMAGES/${ex.name}.png" alt="${ex.name}" class="ex-img" loading="lazy" onerror="this.style.display='none'"></div>
      <div class="ex-card-body">
        <div class="ex-card-name">${ex.name}</div>
        <div class="ex-card-tags">${(ex.tags||[]).map(t => `<span class="ex-tag ${tagClass(t)}">${t}</span>`).join('')}</div>
        <div class="ex-card-desc">${ex.desc}</div>
      </div>
      <div class="ex-card-sets">
        <div class="ex-sets-val">${ex.sets}×</div>
        <div class="ex-sets-unit">${ex.label}</div>
        <div class="ex-sets-rest">${ex.rest_secs}s rest</div>
        <button class="ex-swap-btn" data-idx="${i}">⇄ Swap</button>
      </div>`;
    list.appendChild(card);
  });

  // ── Cooldown section ──
  const cdHeader = document.createElement('div');
  cdHeader.className = 'plan-phase-header cooldown-header';
  cdHeader.innerHTML = `<span class="phase-icon">❄️</span> COOL-DOWN <span class="phase-duration">~5 min</span>`;
  list.appendChild(cdHeader);
  workout.cooldown.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'ex-card cooldown-card';
    card.innerHTML = `
      <div class="ex-card-num" style="color:#06b6d4">${String(i+1).padStart(2,'0')}</div>
      <div class="ex-card-body">
        <div class="ex-card-name">${item.name}</div>
        <div class="ex-card-desc">${item.desc}</div>
      </div>
      <div class="ex-card-sets">
        <div class="ex-sets-val" style="font-size:1.1rem">${item.duration}s</div>
        <div class="ex-sets-unit">hold/do</div>
      </div>`;
    list.appendChild(card);
  });
}
