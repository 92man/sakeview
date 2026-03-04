const CACHE_VERSION = 'sakeview-v81';
const IMAGE_CACHE = 'sakeview-images-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css?v=57',
  '/sake-selector.css?v=1',
  '/community.css?v=4',
  '/certification.css?v=1',
  '/flavor-wheel.css?v=2',
  '/chat.css?v=1',
  '/age-consent.js?v=1',
  '/utils.js?v=2',
  '/featured.js?v=1',
  '/sake-selector.js?v=1',
  '/certification.js?v=1',
  '/app.js?v=44',
  '/flavor_wheel.js?v=27',
  '/policy_pages.js?v=12',
  '/sake_database.js?v=13',
  '/sake_chat.js?v=4',
  '/tasting_dictionary.js?v=14',
  '/icon.svg',
  '/manifest.json'
];

// Install — precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache-first for Supabase Storage images (immutable once uploaded)
  if (url.hostname.includes('supabase.co') &&
      (url.pathname.includes('/storage/v1/object/public/') ||
       url.pathname.includes('/storage/v1/render/image/public/'))) {
    event.respondWith(imageCacheFirst(request));
    return;
  }

  // Network-first for Supabase API calls
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Network-first for external CDN resources (fonts, libraries)
  if (url.origin !== self.location.origin) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Network-first for HTML pages (always get latest)
  if (request.mode === 'navigate' || request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for other same-origin static assets (icons, images, JS)
  event.respondWith(cacheFirst(request));
});

async function imageCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('', { status: 404 });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return offlineFallback();
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // API 요청은 JSON 에러 응답 반환
    const url = new URL(request.url);
    if (url.hostname.includes('supabase.co')) {
      return new Response(
        JSON.stringify({ error: 'offline', message: '오프라인 상태입니다.' }),
        { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }
    return offlineFallback();
  }
}

function offlineFallback() {
  return new Response(
    `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>오프라인 - 사케를 보다</title>
  <style>
    body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #383961; color: #DBDFAC; text-align: center; }
    .container { padding: 40px; }
    h1 { font-size: 2em; margin-bottom: 16px; }
    p { font-size: 1.1em; opacity: 0.8; }
    button { margin-top: 24px; background: #DBDFAC; color: #383961; border: none; padding: 12px 24px; border-radius: 8px; font-size: 1em; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <h1>오프라인 상태입니다</h1>
    <p>인터넷 연결을 확인한 후 다시 시도해 주세요.</p>
    <button onclick="location.reload()">다시 시도</button>
  </div>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
