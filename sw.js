const CACHE = 'form-v3';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './js/icons.js',
  './js/data.js',
  './js/ui.js',
  './js/workout.js',
  './js/session.js',
  './IMAGES/Archer Push-Up.png',
  './IMAGES/Bicycle Crunches.png',
  './IMAGES/Chair Dip.png',
  './IMAGES/Clamshell.png',
  './IMAGES/Close Grip Push-Up.png',
  './IMAGES/Dead Bug.png',
  './IMAGES/Decline Push-Up.png',
  './IMAGES/Diamond Push-Up.png',
  './IMAGES/Fist Push-Up.png',
  './IMAGES/Flutter Kicks.png',
  './IMAGES/Forearm Wrist Curl.png',
  './IMAGES/Glute Bridge.png',
  './IMAGES/Hammer Curl.png',
  './IMAGES/Hollow Body Hold.png',
  './IMAGES/Isometric Bicep Hold.png',
  './IMAGES/Isometric Chest Press.png',
  './IMAGES/Knee Push-Up.png',
  './IMAGES/Mountain Climbers.png',
  './IMAGES/Nordic Hamstring Curl.png',
  './IMAGES/Pike Push-Up.png',
  './IMAGES/Plank.png',
  './IMAGES/Prone Y-T-W Raises.png',
  './IMAGES/Push-Up.png',
  './IMAGES/Reverse Crunch.png',
  './IMAGES/Reverse Lunge.png',
  './IMAGES/Reverse Snow Angel.png',
  './IMAGES/Russian Twists.png',
  './IMAGES/Shoulder Tap Plank.png',
  './IMAGES/Side Plank.png',
  './IMAGES/Side-Lying Hip Abduction.png',
  './IMAGES/Single-Leg Calf Raise.png',
  './IMAGES/Single-Leg Glute Bridge.png',
  './IMAGES/Single-Leg RDL.png',
  './IMAGES/Slow Crunch.png',
  './IMAGES/Slow Squat (3-1-3).png',
  './IMAGES/Suitcase Hold.png',
  './IMAGES/Superman Hold.png',
  './IMAGES/Supinated Table Row.png',
  './IMAGES/Table Row.png',
  './IMAGES/Terminal Knee Extension.png',
  './IMAGES/Towel Door Row.png',
  './IMAGES/Tricep Floor Extension.png',
  './IMAGES/V-Ups.png',
  './IMAGES/Wall Sit.png',
  './IMAGES/Wide Push-Up.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});
