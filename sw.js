/* Service worker – chạy offline hoàn toàn.
   >>> MỖI LẦN ĐẨY CODE MỚI: tăng số phiên bản bên dưới (v1 → v2 → v3…) <<< */
const CACHE = 'thoiquen-v28';

// Danh sách file cần lưu. Dùng allSettled nên thiếu 1 file cũng không làm hỏng cài đặt.
const FILES = [
  './', './index.html', './style.css',
  './icons.js', './core.js', './ui.js', './app.js',
  './manifest.webmanifest',
  './icon-180.png', './icon-192.png', './icon-512.png',
  './icon-maskable-192.png', './icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(FILES.map((f) => c.add(new Request(f, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

// Xóa cache của các phiên bản cũ
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Lấy từ cache trước (nhanh, offline), đồng thời cập nhật ngầm cho lần mở sau
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const refresh = fetch(req)
        .then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; })
        .catch(() => null);
      if (cached) { e.waitUntil(refresh); return cached; }
      const res = await refresh;
      if (res) return res;
      if (req.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
      return Response.error();
    })
  );
});
