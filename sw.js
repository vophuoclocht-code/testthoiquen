/* Service worker – OFFLINE-FIRST + công tắc "Chế độ online" trong Cài đặt.
   - OFFLINE (mặc định): mọi thứ lấy từ bộ nhớ máy, KHÔNG gọi mạng → mở app là hiện giao diện ngay.
   - ONLINE (bật trong Cài đặt): ưu tiên lấy bản mới từ mạng (chờ tối đa 5 giây, mạng yếu thì dùng bản trong máy),
     đồng thời lưu lại để lần offline sau dùng bản mới.
   Cập nhật: bật công tắc Online là app tự kiểm tra + tải bản mới. (Tăng số phiên bản bên dưới vẫn có tác dụng, không bắt buộc nữa.) */
const CACHE = 'thoiquen-v36';
const MODE_CACHE = 'thoiquen-mode';   // nhớ chế độ online/offline (SW không đọc được localStorage)
const NET_TIMEOUT = 5000;

/* File lõi: phải tải ĐỦ thì bản mới mới được kích hoạt (thiếu 1 file → giữ bản cũ). */
const CORE = [
  './', './index.html', './style.css',
  './icons.js', './core.js', './ui.js', './app.js',
  './manifest.webmanifest',
  './icon-180.png', './icon-192.png'
];

/* ---- Chế độ ---- */
let modeP = null;
const getMode = () => modeP || (modeP = caches.open(MODE_CACHE)
  .then((c) => c.match('./__mode')).then((r) => (r ? r.text() : 'offline')).catch(() => 'offline'));
async function setMode(m) {
  modeP = Promise.resolve(m);
  const c = await caches.open(MODE_CACHE);
  await c.put('./__mode', new Response(m));
}

/* ---- Tải mạng có giới hạn thời gian, luôn bỏ qua cache HTTP của trình duyệt ---- */
function netFetch(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), NET_TIMEOUT);
  return fetch(url, { cache: 'reload', signal: ctl.signal }).finally(() => clearTimeout(t));
}
const same = (a, b) => {
  if (a.byteLength !== b.byteLength) return false;
  const x = new Uint8Array(a), y = new Uint8Array(b);
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  return true;
};

/* Làm mới TOÀN BỘ file lõi theo kiểu "được ăn cả, ngã về không": tải đủ + đọc xong hết rồi mới ghi vào cache. */
async function refreshAll() {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15000);
    const fresh = await Promise.all(CORE.map(async (f) => {
      const res = await fetch(new Request(f, { cache: 'reload' }), { signal: ctl.signal });
      if (!res.ok) throw new Error(f);
      return [f, res, await res.clone().arrayBuffer()];
    })).finally(() => clearTimeout(t));
    const cache = await caches.open(CACHE);
    let changed = 0;
    for (const [f, , buf] of fresh) {
      const old = await cache.match(f);
      if (!old || !same(buf, await old.arrayBuffer())) changed++;
    }
    for (const [f, res] of fresh) await cache.put(f, res);
    return { ok: true, changed };
  } catch (_) { return { ok: false }; }
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(CORE.map((f) => cache.add(new Request(f, { cache: 'reload' }))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE && k !== MODE_CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === 'mode') e.waitUntil(setMode(d.mode === 'online' ? 'online' : 'offline'));
  else if (d.type === 'update') {
    e.waitUntil(refreshAll().then((r) => { if (e.ports[0]) e.ports[0].postMessage(r); }));
  }
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const isNav = req.mode === 'navigate';
    const key = isNav ? './index.html' : url.origin + url.pathname;   // khóa cache, bỏ phần ?query

    // ONLINE: thử mạng trước (có giới hạn thời gian), được thì lưu lại; mạng yếu/lỗi thì rơi xuống cache
    if ((await getMode()) === 'online') {
      try {
        const res = await netFetch(isNav ? './index.html' : url.origin + url.pathname);
        if (res && res.ok) { cache.put(key, res.clone()); return res; }
      } catch (_) { /* rơi xuống dùng cache */ }
    }

    // OFFLINE (và dự phòng): trả từ cache ngay, không chờ mạng
    const hit = await cache.match(key, { ignoreSearch: true });
    if (hit) return hit;

    try {
      const res = await fetch(req);
      if (res && res.ok && !isNav) cache.put(key, res.clone());
      return res;
    } catch (_) { return Response.error(); }
  })());
});
