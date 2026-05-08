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
