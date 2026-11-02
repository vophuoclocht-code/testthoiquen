// Đổi số phiên bản V mỗi khi cập nhật code để điện thoại tải bản mới
const V = 'mamthoiquen-v4';
const F = ['./', 'index.html', 'style.css', 'app.js', 'manifest.json', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
// Lưu từng file riêng: thiếu 1 file cũng không làm hỏng việc cài đặt
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => Promise.allSettled(F.map(f => c.add(f)))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => { if (e.request.method === 'GET') e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
