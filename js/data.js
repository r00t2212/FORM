const CIRC_BIG = 2 * Math.PI * 80;

/* ══════════════════════════════════════════════════
   EXERCISE LIBRARY
   Each exercise has:
   - groups[]: which muscle group tabs it belongs to
   - avoidIf[]: injury keywords that should exclude it
   - safeFor[]:  injury keywords where it's actually beneficial
   - priority: higher = picked first
   - work_secs: 0 = rep-based, >0 = timed hold
══════════════════════════════════════════════════ */
const LIBRARY = [

  /* ── ABS & CORE ── */
  { name:'Dead Bug', groups:['abs_core','full_body'],
    tags:['Deep Core'], avoidIf:[], safeFor:['lower back','back'],
    desc:'Lie on back, arms up, knees at 90°. Lower opposite arm and leg toward the floor. Keep lower back pressed flat throughout.',
    tip:'The slower you move, the harder it is.', sets:3, work_secs:0, rest_secs:60, label:'8/SIDE', priority:9 },

  { name:'Hollow Body Hold', groups:['abs_core','full_body'],
    tags:['Deep Core'], avoidIf:['lower back','back'], safeFor:[],
    desc:'Lie on back, arms overhead, legs straight. Lift shoulder blades and feet off the floor. Hold the position while breathing steadily.',
    tip:'Bend knees to regress if your back arches.', sets:3, work_secs:20, rest_secs:45, label:'HOLD', priority:8 },

  { name:'Plank', groups:['abs_core','full_body'],
    tags:['Full Core'], avoidIf:['wrist','shoulder impingement'], safeFor:['lower back'],
    desc:'Forearms on the mat, body in a straight line. Squeeze glutes and brace your abs. Do not let hips sag or pike.',
    tip:'Place a bottle on your lower back — it should not roll off.', sets:3, work_secs:30, rest_secs:45, label:'HOLD', priority:9 },

  { name:'Side Plank', groups:['abs_core','full_body'],
    tags:['Obliques'], avoidIf:['shoulder impingement','wrist'], safeFor:['it band','knee','iliotibial'],
    desc:'Forearm on the mat, body straight, hips lifted. Drive hips slightly up to engage the oblique fully. Hold still.',
    tip:'Drop the bottom knee to regress.', sets:3, sides:2, work_secs:25, rest_secs:40, label:'HOLD', priority:8 },

  { name:'Slow Crunch', groups:['abs_core','full_body'],
    tags:['Upper Abs'], avoidIf:['neck'], safeFor:[],
    desc:'Feet flat, hands lightly behind head. Curl shoulder blades up, hold 1 second, lower in 3 seconds. Do not pull the neck.',
    tip:'Exhale fully at the top of each rep.', sets:3, work_secs:0, rest_secs:45, label:'15 REPS', priority:7 },

  { name:'Reverse Crunch', groups:['abs_core','full_body'],
    tags:['Lower Abs'], avoidIf:[], safeFor:[],
    desc:'Lie flat, hands under glutes. Bring knees to chest, curl hips slightly off the mat at the top. Lower with control.',
    tip:'The small hip curl at the top is the whole point.', sets:3, work_secs:0, rest_secs:45, label:'15 REPS', priority:7 },

  { name:'Bicycle Crunches', groups:['abs_core','full_body'],
    tags:['Obliques','Upper Abs'], avoidIf:['neck'], safeFor:[],
    desc:'Hands behind head. Bring one knee in while rotating the opposite elbow toward it. Move in a deliberate, slow pedalling rhythm.',
    tip:'Slower is harder — resist the urge to rush.', sets:3, work_secs:0, rest_secs:45, label:'20 REPS', priority:8 },

  { name:'Russian Twists', groups:['abs_core','full_body'],
    tags:['Obliques'], avoidIf:['lower back','back'], safeFor:[],
    desc:'Seated at 45°, feet lifted. Hold a bottle and rotate side to side, touching it to the floor each rep. Rotate from the torso.',
    tip:'Keep your chest open — don\'t round the back.', sets:3, work_secs:0, rest_secs:45, label:'20 REPS', priority:7 },

  { name:'Mountain Climbers', groups:['abs_core','full_body'],
    tags:['Full Core','Cardio'], avoidIf:['wrist','shoulder impingement','knee'], safeFor:[],
    desc:'High plank position. Drive knees to chest alternately in a running motion. Keep hips level and core tight throughout.',
    tip:'The faster you go, the more cardio benefit.', sets:3, work_secs:30, rest_secs:45, label:'30 SEC', priority:7 },

  { name:'V-Ups', groups:['abs_core'],
    tags:['Full Core'], avoidIf:['lower back','back'], safeFor:[],
    desc:'Lie flat, arms overhead. Simultaneously lift legs and torso to form a V shape, reaching hands toward toes. Lower with control.',
    tip:'Bend knees slightly to make this more accessible.', sets:3, work_secs:0, rest_secs:60, label:'12 REPS', priority:6 },

  { name:'Flutter Kicks', groups:['abs_core'],
    tags:['Lower Abs'], avoidIf:['lower back','back'], safeFor:[],
    desc:'Lie on back, hands under glutes. Lift legs 15cm off the floor and alternate kicking up and down in small rapid movements.',
    tip:'Press lower back firmly into the mat.', sets:3, work_secs:30, rest_secs:45, label:'30 SEC', priority:6 },

  { name:'Suitcase Hold', groups:['abs_core'],
    tags:['Obliques'], avoidIf:[], safeFor:['it band','iliotibial','knee'],
    desc:'Hold a heavy bag at one side and stand tall. Resist the pull — don\'t lean. Anti-lateral flexion challenge for the obliques.',
    tip:'Squeeze the glute on the loaded side.', sets:3, sides:2, work_secs:30, rest_secs:45, label:'HOLD', priority:6 },

  { name:'Knee Push-Up', groups:['chest','full_body'],
    tags:['Chest','Shoulder'], avoidIf:['shoulder impingement'], safeFor:['wrist'],
    desc:'Same as a standard push-up but knees on the mat. Reduces total load while keeping full chest range of motion. Great wrist-safe regression.',
    tip:'Keep hips in line — do not let them sag or pike.', sets:3, work_secs:0, rest_secs:60, label:'15 REPS', priority:6 },

  { name:'Fist Push-Up', groups:['chest'],
    tags:['Chest'], avoidIf:[], safeFor:['wrist'],
    desc:'Standard push-up performed on closed fists. Keeps the wrist in a neutral straight position, eliminating extension stress entirely.',
    tip:'Knuckles of index and middle finger take the load — keep fists tight.', sets:3, work_secs:0, rest_secs:60, label:'12 REPS', priority:7 },

  { name:'Isometric Chest Press', groups:['chest','arms'],
    tags:['Chest','Triceps'], avoidIf:[], safeFor:['wrist','shoulder impingement'],
    desc:'Press palms together at chest height and push hard. Hold the contraction. No movement — pure isometric tension through the pecs and triceps.',
    tip:'The harder you press, the more muscle fibers you recruit.', sets:3, work_secs:20, rest_secs:45, label:'HOLD', priority:6 },

  { name:'Isometric Tricep Extension', groups:['arms'],
    tags:['Triceps'], avoidIf:[], safeFor:['wrist','elbow'],
    desc:'Press one palm against the back of the other hand. Push the top hand down while resisting with the bottom arm. Alternate sides. Pure tricep contraction without wrist load.',
    tip:'Keep upper arms still — only the elbow joint works.', sets:3, work_secs:20, rest_secs:40, label:'HOLD', priority:6 },


  { name:'Push-Up', groups:['chest','full_body'],
    tags:['Chest','Shoulder'], avoidIf:['wrist'], safeFor:[],
    desc:'Hands shoulder-width apart, body straight. Lower chest to just above the floor, elbows at ~45°. Full range of motion — lock out at top.',
    tip:'The bottom stretch is where the chest works hardest.', sets:4, work_secs:0, rest_secs:60, label:'15 REPS', priority:10 },

  { name:'Wide Push-Up', groups:['chest'],
    tags:['Outer Chest'], avoidIf:['wrist','shoulder impingement'], safeFor:[],
    desc:'Hands wider than shoulders (1.5×). Elbows flare outward as you lower. Targets the outer pec and increases the chest stretch at the bottom.',
    tip:'If wrists ache, make fists or use folded towels.', sets:3, work_secs:0, rest_secs:60, label:'12 REPS', priority:8 },

  { name:'Decline Push-Up', groups:['chest'],
    tags:['Upper Chest'], avoidIf:['wrist','shoulder impingement'], safeFor:[],
    desc:'Feet elevated on a chair or sofa, hands on the floor. Body in a straight line. Targets the upper pec — often undertrained.',
    tip:'The higher the feet, the more this becomes a shoulder press.', sets:3, work_secs:0, rest_secs:60, label:'12 REPS', priority:7 },

  { name:'Archer Push-Up', groups:['chest'],
    tags:['Chest'], avoidIf:['wrist','shoulder impingement'], safeFor:[],
    desc:'Wide hand position. Lower to one side while the other arm stays extended straight. Alternate sides. Creates unilateral chest load.',
    tip:'Regress to a standard wide push-up if too difficult.', sets:3, work_secs:0, rest_secs:75, label:'8/SIDE', priority:7 },

  { name:'Pike Push-Up', groups:['chest','arms'],
    tags:['Shoulder'], avoidIf:['shoulder impingement','wrist'], safeFor:[],
    desc:'Start in downward dog position (hips high). Bend elbows and lower the top of your head toward the floor between your hands. Push back up.',
    tip:'More vertical torso = more shoulder press pattern.', sets:4, work_secs:0, rest_secs:60, label:'10 REPS', priority:9 },

  { name:'Prone Y-T-W Raises', groups:['chest','back'],
    tags:['Rear Delt','Mid Back'], avoidIf:[], safeFor:['shoulder impingement'],
    desc:'Lie face down. Arms form Y, T, then W shapes. Lift and hold each shape briefly. Targets posterior delt and lower traps.',
    tip:'These are small muscles — go slow, no weight needed.', sets:3, work_secs:0, rest_secs:45, label:'10/SHAPE', priority:8 },

  { name:'Shoulder Tap Plank', groups:['chest','abs_core'],
    tags:['Shoulder','Core'], avoidIf:['wrist','shoulder impingement'], safeFor:[],
    desc:'High plank. Lift one hand to tap the opposite shoulder, return, repeat other side. Prevent hip rotation by squeezing the core.',
    tip:'Wider feet make it easier; feet together makes it brutal.', sets:3, work_secs:0, rest_secs:45, label:'20 TAPS', priority:7 },

  /* ── BACK & BICEPS ── */
  { name:'Superman Hold', groups:['back','full_body'],
    tags:['Lower Back'], avoidIf:[], safeFor:['lower back','back'],
    desc:'Lie face down, arms extended overhead. Lift arms, chest and legs simultaneously. Squeeze glutes and hold. Lower with control.',
    tip:'Keep your neck neutral — eyes look at the mat.', sets:4, work_secs:30, rest_secs:45, label:'HOLD', priority:9 },

  { name:'Table Row', groups:['back','arms'],
    tags:['Lats','Biceps'], avoidIf:[], safeFor:[],
    desc:'Lie under a sturdy table, grip the edge. Body in a straight line. Pull your chest up to the table, squeezing shoulder blades together.',
    tip:'Drive elbows toward your hips, not your ears, to use the lats.', sets:4, work_secs:0, rest_secs:75, label:'12 REPS', priority:10 },

  { name:'Towel Door Row', groups:['back','arms'],
    tags:['Lats'], avoidIf:[], safeFor:[],
    desc:'Loop a towel around a door handle. Sit back with feet against the door. Pull your body toward it, driving elbows back.',
    tip:'Lean back further to increase the difficulty.', sets:3, work_secs:0, rest_secs:60, label:'10 REPS', priority:8 },

  { name:'Supinated Table Row', groups:['back','arms'],
    tags:['Biceps','Lats'], avoidIf:[], safeFor:[],
    desc:'Same as table row but with palms facing you. This supinated grip shifts emphasis toward the biceps while still training the back.',
    tip:'Vary grip each session between overhand and underhand.', sets:3, work_secs:0, rest_secs:60, label:'10 REPS', priority:7 },

  { name:'Reverse Snow Angel', groups:['back'],
    tags:['Mid Back','Rear Delt'], avoidIf:[], safeFor:['shoulder impingement'],
    desc:'Lie face down, arms by your sides. Lift arms off the floor and sweep them overhead like a snow angel, then back. Keep chest low.',
    tip:'Squeeze shoulder blades at every point in the arc.', sets:3, work_secs:0, rest_secs:45, label:'12 REPS', priority:7 },

  { name:'Towel Curl', groups:['arms','back'],
    tags:['Biceps'], avoidIf:['wrist'], safeFor:[],
    desc:'Hold a filled bag or backpack with a supinated grip. Curl to shoulder height, squeeze at the top, lower slowly in 3 seconds.',
    tip:'The 3-second negative is where growth happens — don\'t rush it.', sets:3, sides:2, work_secs:0, rest_secs:60, label:'12 REPS', priority:9 },

  { name:'Isometric Bicep Hold', groups:['arms'],
    tags:['Biceps'], avoidIf:['wrist'], safeFor:[],
    desc:'Sit at a table, palms under the tabletop. Push up as if lifting it, generating tension without movement. Hold the contraction steadily.',
    tip:'Aim for ~70% effort — breathe steadily throughout.', sets:3, sides:2, work_secs:20, rest_secs:45, label:'HOLD', priority:7 },

  /* ── TRICEPS & ARMS ── */
  { name:'Diamond Push-Up', groups:['arms','chest'],
    tags:['Triceps','Inner Chest'], avoidIf:['wrist'], safeFor:[],
    desc:'Hands form a diamond shape under your chest. Elbows track back close to the body as you lower. One of the best tricep exercises in calisthenics.',
    tip:'Do these on your knees to regress initially.', sets:4, work_secs:0, rest_secs:60, label:'12 REPS', priority:10 },

  { name:'Chair Dip', groups:['arms','chest'],
    tags:['Triceps'], avoidIf:['shoulder impingement','wrist'], safeFor:[],
    desc:'Hands on the edge of a stable chair, legs extended. Bend elbows to lower your body toward the floor (~90°), then push back up.',
    tip:'Keep elbows pointing straight back, not flared outward.', sets:4, work_secs:0, rest_secs:60, label:'12 REPS', priority:9 },

  { name:'Close Grip Push-Up', groups:['arms','chest'],
    tags:['Triceps'], avoidIf:['wrist'], safeFor:[],
    desc:'Hands just inside shoulder-width, fingers angled slightly inward. Elbows track back close to the ribs. Taxes the long head of the tricep.',
    tip:'Pair this with diamond push-ups as a superset.', sets:3, work_secs:0, rest_secs:60, label:'15 REPS', priority:8 },

  { name:'Tricep Floor Extension', groups:['arms'],
    tags:['Triceps Long Head'], avoidIf:['wrist','elbow'], safeFor:[],
    desc:'Lie on your back, hands on either side of your head. Press up by extending the elbows fully. Lower slowly back to start.',
    tip:'This hits the long head specifically — often missed by push-ups.', sets:3, work_secs:0, rest_secs:60, label:'12 REPS', priority:8 },

  { name:'Hammer Curl', groups:['arms'],
    tags:['Brachialis'], avoidIf:['wrist'], safeFor:[],
    desc:'Hold a bag with a neutral grip (palms facing each other). Curl in the same fashion as a regular curl. Targets the brachialis for arm thickness.',
    tip:'Brachialis development pushes the bicep peak higher.', sets:3, sides:2, work_secs:0, rest_secs:60, label:'12 REPS', priority:7 },

  { name:'Forearm Wrist Curl', groups:['arms'],
    tags:['Forearm'], avoidIf:['wrist'], safeFor:[],
    desc:'Seated, forearm resting on thigh, hand hanging off the knee. Curl and uncurl the wrist. Do both palms-up and palms-down variations.',
    tip:'Strong forearms are a prerequisite for all pulling movements.', sets:3, work_secs:0, rest_secs:30, label:'20 REPS', priority:5 },

  /* ── LEGS / RUNNER ── */
  { name:'Clamshell', groups:['legs','full_body'],
    tags:['Glute Med','ITB Rehab'], avoidIf:[], safeFor:['it band','iliotibial','knee','hip'],
    desc:'Lie on your side, hips stacked, knees at 90°. Keep feet together and rotate the top knee toward the ceiling. Squeeze the glute at the top.',
    tip:'This is the single most important exercise for ITB syndrome.', sets:3, sides:2, work_secs:0, rest_secs:45, label:'20/SIDE', priority:10 },

  { name:'Single-Leg Glute Bridge', groups:['legs','full_body'],
    tags:['Glutes','Hamstring'], avoidIf:[], safeFor:['it band','iliotibial','knee','lower back'],
    desc:'Lie on back, one foot flat, other leg raised. Drive through the heel to lift hips into a straight line. Squeeze the glute hard. Hold 2 seconds.',
    tip:'If hips rotate, your glute med is weak — keep training it.', sets:3, sides:2, work_secs:0, rest_secs:60, label:'12/SIDE', priority:9 },

  { name:'Side-Lying Hip Abduction', groups:['legs'],
    tags:['Glute Med','ITB Rehab'], avoidIf:[], safeFor:['it band','iliotibial','knee','hip'],
    desc:'Lie on your side, top leg straight. Lift the top leg 30–40cm, toes pointing slightly downward. Hold 1 second, lower with control.',
    tip:'Toes pointing down prevents the hip flexor from compensating.', sets:3, sides:2, work_secs:0, rest_secs:45, label:'15/SIDE', priority:9 },

  { name:'Wall Sit', groups:['legs','full_body'],
    tags:['VMO','Quad'], avoidIf:[], safeFor:['it band','iliotibial','knee'],
    desc:'Back flat against a wall, knees at exactly 90°. Hold the position. The VMO — critical for knee tracking — is the primary muscle working.',
    tip:'Push knees slightly outward to engage glutes and reduce knee valgus.', sets:4, work_secs:40, rest_secs:60, label:'HOLD', priority:9 },

  { name:'Reverse Lunge', groups:['legs','full_body'],
    tags:['Quad','Glute'], avoidIf:[], safeFor:['it band','iliotibial','knee'],
    desc:'Step backward, lower knee toward the mat. Front shin stays vertical, knee tracks over the 2nd toe. Push through the front heel to return.',
    tip:'Safer than forward lunges — less anterior knee stress.', sets:3, work_secs:0, rest_secs:60, label:'10/LEG', priority:8 },

  { name:'Slow Squat (3-1-3)', groups:['legs','full_body'],
    tags:['Quad','Glute'], avoidIf:[], safeFor:['it band','iliotibial'],
    desc:'Lower in 3 seconds, hold 1 second at the bottom, rise in 3 seconds. Full depth. This time-under-tension builds VMO without joint stress.',
    tip:'Drive knees outward over toes at the bottom position.', sets:4, work_secs:0, rest_secs:75, label:'10 REPS', priority:8 },

  { name:'Terminal Knee Extension', groups:['legs'],
    tags:['VMO','Knee Rehab'], avoidIf:[], safeFor:['it band','iliotibial','knee'],
    desc:'Stand with a slight knee bend. From that position, fully straighten and lock the knee, focusing on the final 20° of extension. The VMO fires hardest here.',
    tip:'Used by physios post-surgery — small movement, huge benefit.', sets:3, work_secs:0, rest_secs:40, label:'20/LEG', priority:10 },

  { name:'Nordic Hamstring Curl', groups:['legs'],
    tags:['Hamstring'], avoidIf:['knee','it band','iliotibial'], safeFor:[],
    desc:'Kneel on the mat, feet anchored under a sofa. Lower your body toward the mat as slowly as possible using only hamstring strength. Catch yourself with hands.',
    tip:'Even 3–5 slow reps per set is sufficient initially.', sets:3, work_secs:0, rest_secs:90, label:'5 REPS', priority:7 },

  { name:'Single-Leg Calf Raise', groups:['legs'],
    tags:['Calf','Achilles'], avoidIf:[], safeFor:['it band','iliotibial','knee'],
    desc:'Stand on one foot. Rise fully onto toes, then lower slowly in 3 seconds. The calf complex is the primary shock absorber for running.',
    tip:'Use a step for heel-drop range to build Achilles resilience.', sets:3, sides:2, work_secs:0, rest_secs:45, label:'15/LEG', priority:8 },

  { name:'Single-Leg RDL', groups:['legs','full_body'],
    tags:['Hamstring','Balance'], avoidIf:[], safeFor:['it band','iliotibial'],
    desc:'Stand on one leg, slight knee bend. Hinge at the hip, reaching one hand toward the floor while the back leg lifts behind. Keep a flat back.',
    tip:'Hips should stay level — rotating means weak glute med.', sets:3, sides:2, work_secs:0, rest_secs:60, label:'10/LEG', priority:8 },

  { name:'Glute Bridge', groups:['legs','full_body'],
    tags:['Glutes','Hamstring'], avoidIf:[], safeFor:['lower back','it band','iliotibial','knee'],
    desc:'Lie on back, feet flat on the mat. Drive hips up until body forms a straight line from knees to shoulders. Squeeze glutes at the top.',
    tip:'Push through heels, not toes, to bias the glutes.', sets:3, work_secs:0, rest_secs:45, label:'15 REPS', priority:7 },

];

/* ══════════════════════════════════════════════════
   WORKOUT TITLES per muscle group
══════════════════════════════════════════════════ */
const TITLES = {
  abs_core:  ['CORE BURN', 'ABS SESSION', 'CORE FORGE', 'STABILITY BLOCK'],
  chest:     ['PUSH SESSION', 'CHEST & SHOULDERS', 'PUSH FORGE', 'UPPER BODY PUSH'],
  back:      ['PULL SESSION', 'BACK & BICEPS', 'PULL FORGE', 'BACK BUILDER'],
  arms:      ['ARM BLAST', 'TRICEPS & BICEPS', 'ARM SESSION', 'ARMS BURNOUT'],
  legs:      ['LEG DAY', 'RUNNER STRENGTH', 'KNEE & HIP SESSION', 'LEG FORGE'],
  full_body: ['FULL BODY BURN', 'TOTAL SESSION', 'FULL BODY FORGE', 'COMPLETE WORKOUT'],
};

/* ══════════════════════════════════════════════════
   WARMUP & COOLDOWN LIBRARIES
══════════════════════════════════════════════════ */
const WARMUP = {
  abs_core: [
    { name:'Cat-Cow', desc:'On all fours, arch your back up then sink it down. Move slowly through the full range.', duration:40 },
    { name:'Hip Circles', desc:'Lying on back, knees bent, draw slow circles with both knees together. 10 each direction.', duration:40 },
    { name:'Pelvic Tilts', desc:'Lying on back, feet flat. Gently tilt pelvis to press lower back into the mat, then release.', duration:30 },
    { name:'Dead Bug (easy)', desc:'Slow alternating arm-leg lowers with no hold at all. Just to wake the core pattern.', duration:40 },
    { name:'Bird Dog (slow)', desc:'On all fours, extend opposite arm and leg. Hold 2 seconds, switch sides. Activates the whole core.', duration:40 },
    { name:'Knees-to-Chest Rock', desc:'Lying on back, hug both knees to chest. Rock gently side to side to mobilise the lower back.', duration:35 },
    { name:'Supine Knee Sway', desc:'Lying on back, knees bent and together. Let both knees drop slowly left then right. 10 each side.', duration:35 },
  ],
  chest: [
    { name:'Arm Circles', desc:'Large slow circles with both arms — 10 forward, 10 backward. Loosen the shoulder joint fully.', duration:40 },
    { name:'Shoulder Rolls', desc:'Roll shoulders forward 10 times, then backward 10 times. Feel the full range.', duration:30 },
    { name:'Wall Angels', desc:'Stand against a wall, arms in goal-post shape. Slowly slide arms overhead and back down.', duration:40 },
    { name:'Scapular Push-Ups', desc:'High plank, arms straight. Squeeze and spread shoulder blades without bending elbows. 12 reps.', duration:35 },
    { name:'Thread the Needle', desc:'On all fours, slide one arm under your body until the shoulder touches the mat. 6 slow reps each side.', duration:40 },
    { name:'Doorframe Chest Opener', desc:'Press both forearms on a doorframe at 90°, step forward gently until you feel the chest open.', duration:35 },
  ],
  back: [
    { name:'Cat-Cow', desc:'On all fours, arch and sink the back slowly. Breathe into each position. 10 reps.', duration:40 },
    { name:'Shoulder Rolls', desc:'Roll shoulders forward 10 times, then backward 10 times. Upper back opens up.', duration:30 },
    { name:'Prone Snow Angel', desc:'Face down, arms by sides. Sweep arms slowly from hips to overhead and back. 10 reps.', duration:40 },
    { name:'Hip Hinge (slow)', desc:'Stand tall, soft knee bend, hinge forward from the hips keeping a flat back. 10 slow reps.', duration:35 },
    { name:'Child\'s Pose', desc:'Kneel, sit back on heels, reach arms forward. Focus on opening the lats as you breathe.', duration:40 },
    { name:'Thread the Needle', desc:'On all fours, slide one arm under your body until shoulder touches the mat. 6 each side.', duration:40 },
  ],
  arms: [
    { name:'Arm Swings', desc:'Swing arms loosely across your body and out to the sides. 20 reps. Just loosen up.', duration:30 },
    { name:'Wrist Circles', desc:'Make fists, rotate wrists in slow circles — 10 each direction, each hand.', duration:30 },
    { name:'Elbow Circles', desc:'Hands on shoulders, draw slow circles with your elbows. 10 forward, 10 backward.', duration:35 },
    { name:'Shoulder Rolls', desc:'Roll shoulders forward 10 times, then backward 10 times. Breathe deeply.', duration:30 },
    { name:'Cross-Body Arm Swings', desc:'Stand tall, swing both arms wide then cross them at the front. 20 reps. Warms the elbow and shoulder.', duration:30 },
    { name:'Finger Spreads', desc:'Extend arms forward, spread fingers wide then make a tight fist. 15 reps. Preps tendons for load.', duration:25 },
  ],
  legs: [
    { name:'Hip Circles', desc:'Stand on one leg, draw large slow circles with the raised knee. 10 each direction, each leg.', duration:45 },
    { name:'Leg Swings (forward)', desc:'Hold a wall, swing one leg forward and back in a controlled arc. 15 each leg.', duration:40 },
    { name:'Leg Swings (lateral)', desc:'Hold a wall, swing one leg side to side across the body. 15 each leg.', duration:40 },
    { name:'Glute Bridge (easy)', desc:'Slow controlled glute bridges with no hold at top. Just to activate the posterior chain.', duration:40 },
    { name:'Standing Hip Circles', desc:'Hands on hips, draw large slow circles with your hips. 10 each direction. Great ITB prep.', duration:35 },
    { name:'Ankle Circles', desc:'Lift one foot, draw slow circles with the ankle — 10 each direction per foot. Preps the Achilles.', duration:30 },
  ],
  full_body: [
    { name:'Arm Circles', desc:'Large slow arm circles — 10 forward, 10 backward. Wake up the shoulders.', duration:35 },
    { name:'Hip Circles', desc:'Stand on one leg, draw slow circles with the raised knee. 10 each direction per leg.', duration:40 },
    { name:'Cat-Cow', desc:'On all fours, arch and sink the back slowly. Breathe into each position. 10 reps.', duration:40 },
    { name:'Leg Swings', desc:'Hold a wall, swing each leg forward-back then side-to-side. 12 reps each direction.', duration:40 },
    { name:'Shoulder Rolls', desc:'Roll shoulders forward 10 times, then backward 10 times. Breathe into each roll.', duration:30 },
    { name:'Wrist Circles', desc:'Extend arms forward, rotate wrists in slow circles — 10 each direction.', duration:30 },
  ],
};

const COOLDOWN = {
  abs_core: [
    { name:'Childs Pose', desc:'Kneel, sit back on heels, reach arms forward along the mat. Breathe into your lower back.', duration:45 },
    { name:'Supine Twist', desc:'Lying on back, draw one knee across your body and look the other way. 40s each side.', duration:50 },
    { name:'Cobra Stretch', desc:'Face down, press up onto hands, extend the spine gently. Hold and breathe steadily.', duration:35 },
    { name:'Diaphragmatic Breathing', desc:'Lie flat, one hand on belly. Inhale 4 counts, hold 4, exhale 6. Let everything release.', duration:50 },
    { name:'Knee Hug Hold', desc:'Lying on back, draw both knees to chest and hold. Breathe into the lower back to release tension.', duration:45 },
    { name:'Seated Forward Fold', desc:'Sit with legs extended. Reach forward along the shins as far as comfortable. Hold and breathe slowly.', duration:45 },
  ],
  chest: [
    { name:'Doorframe Chest Stretch', desc:'Press one forearm against a wall at 90°, rotate body away gently. 40s each side.', duration:50 },
    { name:'Thread the Needle', desc:'On all fours, slide one arm under your body until your shoulder touches the mat. 35s each side.', duration:50 },
    { name:'Cross-Body Shoulder Stretch', desc:'Pull one arm across your chest with the opposite hand. Feel the rear delt release. 35s each side.', duration:50 },
    { name:'Wrist Circles', desc:'Make fists and rotate wrists slowly — 10 circles each direction. Never skip after push work.', duration:30 },
    { name:'Prayer Stretch', desc:'Palms together at chest height, slowly lower hands toward the floor until you feel the pec stretch.', duration:35 },
    { name:'Overhead Reach', desc:'Lie on back, arms extended overhead. Let gravity passively open the chest and anterior shoulder.', duration:40 },
  ],
  back: [
    { name:'Childs Pose', desc:'Kneel, sit back on heels, arms extended. Focus on opening the lats as you breathe.', duration:45 },
    { name:'Lat Stretch', desc:'Grab a doorframe at shoulder height, shift your hips away until you feel the lat stretch. 40s each.', duration:50 },
    { name:'Thoracic Towel Roll', desc:'Roll a towel, lie over it between shoulder blades. Let gravity open the upper back. 60s.', duration:60 },
    { name:'Neck Side Stretch', desc:'Tilt one ear to your shoulder, apply gentle hand pressure. Breathe slowly. 30s each side.', duration:45 },
    { name:'Supine Twist', desc:'Lying on back, draw one knee across your body and look the other way. 40s each side.', duration:50 },
    { name:'Cross-Body Shoulder Stretch', desc:'Pull one arm across your chest with the opposite hand. Feel the rear delt and upper back release.', duration:45 },
  ],
  arms: [
    { name:'Overhead Tricep Stretch', desc:'Arm overhead, elbow bent, gently pull the elbow back with your other hand. 35s each side.', duration:45 },
    { name:'Cross-Body Bicep Stretch', desc:'Arm extended across chest at shoulder height, palm up. Apply gentle pressure. 35s each side.', duration:45 },
    { name:'Wrist Flexor Stretch', desc:'Arm extended, palm up, pull fingers back gently with the other hand. 30s each side.', duration:40 },
    { name:'Prayer Stretch', desc:'Palms together at chest height, slowly lower hands toward the floor until you feel the stretch.', duration:35 },
    { name:'Doorframe Bicep Stretch', desc:'Grip a doorframe at hip height with a supinated grip, rotate body away gently. 35s each side.', duration:45 },
    { name:'Extended Wrist Stretch', desc:'Extend one arm, gently pull all fingers back then push them down. 30s each direction per hand.', duration:40 },
  ],
  legs: [
    { name:'Pigeon Pose', desc:'Front knee bent 90°, back leg extended. Lean forward gently. Opens hip rotators — key for IT band.', duration:60 },
    { name:'Figure-4 Glute Stretch', desc:'Lying on back, cross one ankle over the opposite knee. Pull the lower leg toward you. 50s each side.', duration:60 },
    { name:'Standing Quad Stretch', desc:'Stand on one leg, pull the other foot toward your glute, knee pointing straight down. 40s each.', duration:50 },
    { name:'Downward Dog Calf Stretch', desc:'Hands and feet on the mat, hips high. Alternate pressing each heel toward the floor. 5s holds each.', duration:45 },
    { name:'Standing Calf Stretch', desc:'Step one foot back, press the heel down and lean into a wall. Full gastrocnemius stretch. 40s each.', duration:50 },
    { name:'Kneeling Hip Flexor Stretch', desc:'One knee on the mat, front foot forward. Shift weight forward gently until you feel the hip flexor.', duration:50 },
  ],
  full_body: [
    { name:'Childs Pose', desc:'Kneel, sit back on heels, arms long in front. Hold and breathe into your lower back. 45s.', duration:45 },
    { name:'Supine Twist', desc:'Lying on back, draw one knee across your body and look the other way. 40s each side.', duration:50 },
    { name:'Figure-4 Glute Stretch', desc:'Lying on back, cross ankle over knee and pull gently toward you. 45s each side.', duration:55 },
    { name:'Diaphragmatic Breathing', desc:'Lie flat, one hand on belly. Inhale 4 counts, hold 4, exhale 6. Let everything settle.', duration:50 },
    { name:'Childs Pose with Side Reach', desc:'From child\'s pose, walk hands to one side to stretch the lat. Hold 30s each side.', duration:50 },
    { name:'Cobra Stretch', desc:'Face down, press up onto hands, extend the spine gently. Opens chest and hip flexors. Hold and breathe.', duration:35 },
  ],
};
