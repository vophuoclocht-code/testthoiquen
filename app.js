'use strict';
/* ===== Mầm Thói Quen – dữ liệu lưu hoàn toàn trong máy (localStorage) ===== */
const $ = s => document.querySelector(s), pad = n => String(n).padStart(2, '0');
const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const KEY = 'mamthoiquen.v1';
// Màu theo hành trình sinh trưởng: đất → mầm → lá → rừng → hoa → quả → vàng kim
const PAL = [['#4C1D95', '#6D28D9'], ['#7E22CE', '#A855F7'], ['#C026D3', '#E879F9'], ['#E11D74', '#FB7185'], ['#F97316', '#FDBA74'], ['#FBBF24', '#FDE68A'], ['#FDE68A', '#FFFFFF']]; // tối → sáng dần theo cấp
const MT = [[22, 0], [34, 0], [46, 0], [60, 0], [80, 1], [90, 1], [100, 1]]; // [độ đậm màu thẻ %, chữ tối?]
const EM = ['🌰', '🌱', '🌿', '🌳', '🌸', '🍎', '👑'];
const DEFLV = [['Hạt giống', 0], ['Nảy mầm', 7], ['Cây non', 21], ['Cành lá', 45], ['Thân cây', 90], ['Tán rộng', 180], ['Đại thụ', 365]].map(([n, d]) => ({ n, d }));
const MSG = ['Mỗi ngày một chút, rồi sẽ thành rừng.', 'Bạn vừa tự thưởng cho tương lai của mình.', 'Kiên trì chính là siêu năng lực.', 'Chậm mà chắc, cây nào cũng lớn từ hạt.', 'Cứ tiếp tục, bạn đang làm rất tốt!'];
const DEF = { habits: [], checks: {}, cel: {}, nextId: 1, backup: 0, set: { theme: 'dark', dayStart: 0, haptic: true, levels: DEFLV } };

function norm(j) {
  const d = structuredClone(DEF); Object.assign(d, j); d.set = Object.assign(structuredClone(DEF.set), j.set || {});
  if (j.set?.names && !j.set.levels) d.set.levels = DEFLV.map((l, i) => ({ n: j.set.names[i] || l.n, d: l.d }));
  for (const k in d.checks) for (const id in d.checks[k]) d.checks[k][id] = d.checks[k][id].map(e => typeof e == 'number' ? [e, 1] : e);
  return d;
}
let S, tab = 'home', hist = { m: new Date(), sel: null, f: '' }, dip = null, tt, swOk = false;
try { S = norm(JSON.parse(localStorage[KEY] || '{}')); } catch (e) { S = norm({}); }
function save() { try { localStorage[KEY] = JSON.stringify(S); } catch (e) { toast('Không lưu được: bộ nhớ đầy hoặc bị chặn. Hãy sao lưu ngay.'); } }
navigator.storage?.persist?.();

/* ===== Ngày & tính toán ===== */
const LVS = () => S.set.levels, pi = (i, n) => n < 2 ? 0 : Math.round(i * 6 / (n - 1));
const lc = i => PAL[pi(i, LVS().length)], le = i => EM[pi(i, LVS().length)];
const lst = l => { const p = pi(l, LVS().length); return `--c0:${PAL[p][0]};--c1:${PAL[p][1]};--m:${MT[p][0]}%`; }, lf = l => MT[pi(l, LVS().length)][1];
const fmt = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parse = k => { const [a, b, c] = k.split('-'); return new Date(a, b - 1, c); };
const today = () => fmt(new Date(Date.now() - S.set.dayStart * 36e5));
const byId = id => S.habits.find(h => h.id == id);
const cnt = (id, k) => (S.checks[k]?.[id] || []).reduce((s, e) => s + e[1], 0);
const done = (h, k) => cnt(h.id, k) >= h.t;
const total = h => Object.keys(S.checks).filter(k => done(h, k)).length;
const lvOf = h => { const t = total(h); let i = 0; LVS().forEach((l, j) => { if (t >= l.d) i = j; }); return i; };
function streak(h) { const d = parse(today()); let n = 0; if (!done(h, fmt(d))) d.setDate(d.getDate() - 1); while (done(h, fmt(d))) { n++; d.setDate(d.getDate() - 1); } return n; }
function best(h) { let b = 0, c = 0, p = null; Object.keys(S.checks).sort().filter(k => done(h, k)).forEach(k => { const d = parse(k); c = p && Math.round((d - p) / 864e5) == 1 ? c + 1 : 1; p = d; b = Math.max(b, c); }); return b; }
const vib = p => { if (S.set.haptic) navigator.vibrate?.(p); };

function mark(id, k, delta) {
  const h = byId(id); S.checks[k] ??= {}; const a = S.checks[k][id] ??= [], c = cnt(id, k);
  if (delta > 0) { const m = Math.min(h.s || 1, h.t - c); if (m > 0) a.push([k === today() ? Date.now() : parse(k).getTime() + 12 * 36e5, m]); } else a.pop();
  if (!a.length) delete S.checks[k][id];
  if (!Object.keys(S.checks[k]).length) delete S.checks[k];
  const lv = lvOf(h);
  if (lv > (S.cel[id] ?? 0)) { S.cel[id] = lv; save(); render(); celebrate(h, lv); return; } // hạ cấp thì im lặng
  save(); render();
}

/* ===== Hiệu ứng thăng cấp ===== */
function celebrate(h, l) {
  const L = lc(l), last = l == LVS().length - 1 && l > 0;
  $('#lv').innerHTML = `<div class="lc f${lf(l)}" style="${lst(l)}"><div class="bdg">${le(l)}</div><h2>${last ? '👑 Đại thành tựu!' : 'Chúc mừng! 🎉'}</h2><p><b>${esc(h.n)}</b> đã lên cấp<br><b>${esc(LVS()[l].n)}</b></p><p class="q">${MSG[Math.random() * MSG.length | 0]}</p><button class="pri" data-a="close">Tiếp tục</button></div>`;
  $('#lv').classList.add('on'); vib([40, 60, 40, 60, 160]);
  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) confetti([...L, '#fff', '#FACC15']);
}
function confetti(cols) {
  const c = $('#cv'), x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight; c.style.display = 'block';
  const P = Array.from({ length: 150 }, () => ({ x: innerWidth / 2, y: innerHeight * .45, vx: (Math.random() - .5) * 18, vy: -Math.random() * 18 - 4, s: 4 + Math.random() * 6, r: Math.random() * 6, col: cols[Math.random() * cols.length | 0] }));
  let f = 0;
  (function step() {
    x.clearRect(0, 0, c.width, c.height);
    P.forEach(p => { p.vy += .45; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.r += .2; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.col; x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); x.restore(); });
    if (++f < 170) requestAnimationFrame(step); else { x.clearRect(0, 0, c.width, c.height); c.style.display = 'none'; }
  })();
}
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 3000); }

/* ===== Màn hình ===== */
// Bộ icon nét đơn sắc, tô gradient xanh đậm → nhạt (cùng phong cách logo)
const IC = {
  home: '<path d="M12 21v-8"/><path d="M12 13c-4 0-6.5-2-6.5-6 4 0 6.5 2 6.5 6z"/><path d="M12 16c3.5 0 5.5-1.8 5.5-5-3.5 0-5.5 1.8-5.5 5z"/><path d="M8.5 19.5l1.5 1.5 3-3"/>',
  manage: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  hist: '<rect x="4" y="5" width="16" height="15" rx="3.5"/><path d="M8 3v4M16 3v4M4 10h16"/><path d="M12 18v-4"/><path d="M12 15c-2.5 0-3.5-1-3.5-2.5 2.5 0 3.5 1 3.5 2.5z"/>',
  set: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M10 11v6M14 11v6"/>',
  drag: '<path d="M5 9h14M5 15h14"/>', play: '<path d="M8 5l11 7-11 7z"/>',
  save: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14"/>', open: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 20h14"/>',
  install: '<rect x="7" y="2.5" width="10" height="19" rx="3"/><path d="M12 8v6M9.5 11.5L12 14l2.5-2.5"/>',
  demo: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/>',
  reset: '<path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/>', chevL: '<path d="M15 5l-7 7 7 7"/>', chevR: '<path d="M9 5l7 7-7 7"/>'
};
const ico = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
const NAV = [['home', 'Thói quen', 'home'], ['manage', 'Quản lý', 'manage'], ['hist', 'Lịch sử', 'hist'], ['set', 'Cài đặt', 'set']];
const standalone = () => matchMedia('(display-mode:standalone)').matches || navigator.standalone;
function render() {
  document.documentElement.dataset.t = S.set.theme == 'auto' ? (matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark') : S.set.theme;
  $('#nav').innerHTML = NAV.map(n => `<button class="${tab == n[0] ? 'on' : ''}" data-a="tab" data-v="${n[0]}" aria-label="${n[1]}">${ico(n[2])}${n[1]}</button>`).join('');
  const v = { home, manage, hist: histV, set: setV }[tab]();
  $('#top').innerHTML = v[0]; $('#view').innerHTML = v[1];
}

function home() {
  const k = today(), hs = S.habits, n = hs.filter(h => done(h, k)).length, pc = hs.length ? n / hs.length * 100 : 0;
  const date = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
  const top = `<h1>${date}</h1><div class="bar big"><i style="width:${pc}%"></i></div><small>Hôm nay ${n}/${hs.length}</small>`;
  if (!hs.length) return [top, `<div class="empty"><div>${ico('home')}</div><p>Chưa có thói quen nào.<br>Gieo hạt đầu tiên nhé.</p><button class="pri" data-a="add">Thêm thói quen đầu tiên</button></div>`];
  const nb = (Date.now() - S.backup > 12096e5 ? `<div class="note" data-a="tab" data-v="set">${ico('save')} Đã lâu chưa sao lưu. Bấm để sao lưu dữ liệu.</div>` : '') + (dip && !standalone() ? `<div class="note" data-a="inst">${ico('install')} Cài ứng dụng lên màn hình chính</div>` : '');
  return [top, nb + hs.map(h => {
    const l = lvOf(h), L = lc(l), c = cnt(h.id, k), ok = c >= h.t, nx = LVS()[l + 1], cur = LVS()[l], tt = total(h);
    const txt = ok ? '✓' : h.t > 1 ? c + '/' + h.t : '', fs = txt.length > 6 ? 12 : txt.length > 4 ? 15 : 19;
    return `<div class="card l${pi(l, LVS().length)} f${lf(l)}${ok ? ' ok' : ''}" style="${lst(l)}"><div class="ic">${esc(h.i)}</div><div class="inf"><span class="lvl">${le(l)} ${esc(cur.n)}</span><b>${esc(h.n)}</b><div class="bar"><i style="width:${nx ? Math.min(100, (tt - cur.d) / (nx.d - cur.d) * 100) : 100}%"></i></div><small>🔥 ${streak(h)}${!ok && streak(h) > 0 ? ' ⚠️' : ''} · ${nx ? `còn ${nx.d - tt} ngày lên ${esc(nx.n)}` : 'cấp cao nhất 👑'}</small></div><button class="chk" style="font-size:${fs}px" data-a="tick" data-id="${h.id}" aria-label="Tích ${esc(h.n)}">${txt}</button></div>`;
  }).join('')];
}

function manage() {
  return [`<h1>Quản lý</h1>`, `<button class="pri fab" data-a="add">${ico('plus')} Thêm thói quen</button>` + S.habits.map(h => `<div class="row" data-id="${h.id}"><span class="hd" aria-label="Kéo để sắp xếp">${ico('drag')}</span><span>${esc(h.i)}</span><b>${esc(h.n)}</b><small>${h.t}/ngày</small><button data-a="edit" data-id="${h.id}" aria-label="Sửa">${ico('edit')}</button><button data-a="del" data-id="${h.id}" aria-label="Xóa">${ico('trash')}</button></div>`).join('')];
}

function histV() {
  const m = hist.m, y = m.getFullYear(), mo = m.getMonth(), off = (new Date(y, mo, 1).getDay() + 6) % 7, dim = new Date(y, mo + 1, 0).getDate();
  const hs = S.habits.filter(h => !hist.f || h.id == hist.f), T = today(), sel = hist.sel || T;
  let g = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => `<small>${d}</small>`).join('') + '<i></i>'.repeat(off);
  for (let d = 1; d <= dim; d++) {
    const k = fmt(new Date(y, mo, d)), p = hs.length ? hs.filter(h => done(h, k)).length / hs.length : 0;
    g += `<button class="day${k == T ? ' td' : ''}${k == sel ? ' sl' : ''}" data-a="day" data-k="${k}" style="--p:${p.toFixed(2)};${p > .5 ? 'color:#1A0B2E' : ''}" aria-label="Ngày ${d}">${p == 1 ? '★' : d}</button>`;
  }
  const fut = sel > T, sd = parse(sel);
  const rows = hs.map(h => {
    const c = cnt(h.id, sel), ts = (S.checks[sel]?.[h.id] || []).map(([t, a]) => new Date(t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + (a > 1 ? ` (+${a})` : '')).join(', ');
    return `<div class="dr"><span>${esc(h.i)}</span><div><b>${esc(h.n)}</b><small>${ts || 'Chưa tích'}</small></div><div class="st">${fut ? '' : `<button data-a="hm" data-id="${h.id}" data-k="${sel}" aria-label="Bớt">${ico('minus')}</button>`}<b>${c}/${h.t}</b>${fut ? '' : `<button data-a="hp" data-id="${h.id}" data-k="${sel}" aria-label="Thêm">${ico('plus')}</button>`}</div></div>`;
  }).join('');
  let st = '';
  if (hist.f && byId(hist.f)) {
    const h = byId(hist.f); let r = 0; const d = parse(T);
    for (let i = 0; i < 30; i++) { if (done(h, fmt(d))) r++; d.setDate(d.getDate() - 1); }
    st = `<div class="stats"><div><b>${streak(h)}</b><small>Chuỗi hiện tại</small></div><div><b>${best(h)}</b><small>Chuỗi dài nhất</small></div><div><b>${total(h)}</b><small>Tổng ngày hoàn thành</small></div><div><b>${Math.round(r / 30 * 100)}%</b><small>Tỉ lệ 30 ngày</small></div></div>`;
  }
  return [`<h1>Lịch sử</h1>`,
    `<div class="mh"><button data-a="pm" aria-label="Tháng trước">${ico('chevL')}</button><b>Tháng ${mo + 1}, ${y}</b><button data-a="nm" aria-label="Tháng sau">${ico('chevR')}</button></div><div class="grid">${g}</div><select class="sel" data-h="1"><option value="">Tất cả thói quen</option>${S.habits.map(h => `<option value="${h.id}"${hist.f == h.id ? ' selected' : ''}>${esc(h.i)} ${esc(h.n)}</option>`).join('')}</select>${st}<p><b>${sd.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}</b> · <small>Hoàn thành ${hs.filter(h => done(h, sel)).length}/${hs.length}</small></p>${rows || '<small>Chưa có thói quen.</small>'}`];
}

function setV() {
  const s = S.set, sel = (key, opts) => `<select data-s="${key}">${opts.map(o => `<option value="${o[0]}"${s[key] == o[0] ? ' selected' : ''}>${o[1]}</option>`).join('')}</select>`;
  const ua = navigator.userAgent, how = /iPhone|iPad/.test(ua) ? 'Safari: bấm Chia sẻ ⬆️ → Thêm vào MH chính.' : /Android/.test(ua) ? 'Chrome: menu ⋮ → Cài đặt ứng dụng (hoặc Thêm vào màn hình chính).' : 'Trên máy tính: bấm biểu tượng cài đặt ở cuối thanh địa chỉ, hoặc menu ⋮ → Truyền, lưu và chia sẻ → Cài đặt trang.';
  const inst = standalone() ? '✅ Đang chạy dạng ứng dụng.' : dip ? `<button class="pri" data-a="inst">${ico('install')} Cài đặt ứng dụng</button>` : `<small>${how}</small>`;
  return [`<h1>Cài đặt</h1>`, `
<div class="set"><h3>Giao diện</h3><label>Chủ đề${sel('theme', [['dark', 'Tối'], ['light', 'Sáng'], ['auto', 'Theo hệ thống']])}</label>
<label>Giờ bắt đầu ngày mới${sel('dayStart', [[0, '00:00'], [2, '02:00'], [3, '03:00'], [4, '04:00']])}</label>
<label>Rung khi tích<input type="checkbox" data-s="haptic" ${s.haptic ? 'checked' : ''}></label></div>
<div class="set"><h3>Cấp độ</h3><small>Tên cấp và số ngày hoàn thành để đạt cấp đó. Bấm nút ▶ để xem thử hiệu ứng thăng cấp.</small><div style="height:8px"></div>${s.levels.map((l, i) => `<div class="lr"><span>${le(i)}</span><input type="text" data-ln="${i}" value="${esc(l.n)}" maxlength="20" aria-label="Tên cấp ${i + 1}"><input type="number" data-ld="${i}" value="${l.d}" min="0" inputmode="numeric" ${i ? '' : 'disabled'} aria-label="Số ngày"><small>ngày</small><button data-a="prev" data-i="${i}" aria-label="Xem thử">${ico('play')}</button></div>`).join('')}<div class="btns"><button class="ghost" data-a="addlv">${ico('plus')} Thêm cấp</button><button class="ghost" data-a="rmlv">${ico('minus')} Bớt cấp cuối</button><button class="ghost" data-a="rslv">${ico('reset')} Mặc định</button></div></div>
<div class="set"><h3>Sao lưu dữ liệu</h3><small>Dữ liệu chỉ nằm trong máy này. Hãy xuất file định kỳ.</small><div class="btns"><button class="pri" data-a="exp">${ico('save')} Xuất file</button><button class="ghost" data-a="imp">${ico('open')} Nhập file</button><input id="file" type="file" accept=".json,application/json" hidden></div></div>
<div class="set"><h3>Ứng dụng</h3>${inst}<p><small>Offline: ${swOk ? 'sẵn sàng ✅' : 'chưa sẵn sàng ❌ (hãy mở bằng link https của GitHub Pages)'}</small></p><div class="btns"><button class="ghost" data-a="demo">${ico('demo')} Nạp dữ liệu demo</button>${S.habits.some(h => h.demo) ? '<button class="ghost" data-a="undemo">Xóa demo</button>' : ''}<button class="ghost" data-a="wipe">${ico('trash')} Xóa toàn bộ</button></div><p><small>Phiên bản 1.1</small></p></div>`];
}

/* ===== Thêm / sửa thói quen ===== */
function edit(id) {
  const h = id ? byId(id) : { n: '', i: '🌱', t: 1, s: 1, note: '' }, d = $('#dlg');
  d.innerHTML = `<form method="dialog"><h3>${id ? 'Sửa' : 'Thêm'} thói quen</h3><label>Tên<input id="fn" value="${esc(h.n)}" maxlength="40"></label><label>Biểu tượng (emoji)<input id="fi" value="${esc(h.i)}" maxlength="4"></label><label>Mục tiêu mỗi ngày (số tùy ý, ví dụ 37 hoặc 2341)<input id="ft" type="number" min="1" value="${h.t}" inputmode="numeric"></label><label>Mỗi lần bấm cộng thêm<input id="fs" type="number" min="1" value="${h.s || 1}" inputmode="numeric"></label><label>Vì sao tôi làm việc này<input id="fo" value="${esc(h.note || '')}" maxlength="80"></label><div class="bt"><button class="ghost" value="x">Hủy</button><button class="pri" id="ok">Lưu</button></div></form>`;
  d.showModal();
  $('#ok').onclick = e => {
    e.preventDefault(); const n = $('#fn').value.trim(); if (!n) { $('#fn').focus(); return; }
    const o = { n, i: $('#fi').value.trim() || '🌱', t: Math.max(1, Math.floor(+$('#ft').value) || 1), s: Math.max(1, Math.floor(+$('#fs').value) || 1), note: $('#fo').value.trim() };
    if (id) Object.assign(h, o); else { S.habits.push({ id: S.nextId++, ...o }); if (!S.backup) S.backup = Date.now(); }
    save(); d.close(); render();
  };
}

/* ===== Hành động ===== */
const fixLv = () => { const L = LVS(); L[0].d = 0; for (let i = 1; i < L.length; i++) L[i].d = Math.max(L[i].d, L[i - 1].d + 1); S.habits.forEach(h => S.cel[h.id] = lvOf(h)); save(); render(); };
const A = {
  tab: b => { tab = b.dataset.v; render(); scrollTo(0, 0); },
  tick: b => { // bấm khi chưa xong: +1 lần; bấm khi đã xong: hủy lần tích gần nhất
    const id = +b.dataset.id, h = byId(id), k = today(); vib(15);
    if (cnt(id, k) >= h.t) { mark(id, k, -1); return; }
    mark(id, k, 1); document.querySelector(`.chk[data-id="${id}"]`)?.classList.add('pop');
  },
  close: () => $('#lv').classList.remove('on'),
  add: () => edit(), edit: b => edit(+b.dataset.id),
  del: b => { const h = byId(b.dataset.id); if (confirm(`Xóa "${h.n}" và toàn bộ lịch sử của nó?`)) { rm(h.id); save(); render(); } },
  day: b => { hist.sel = b.dataset.k; render(); },
  pm: () => { hist.m = new Date(hist.m.getFullYear(), hist.m.getMonth() - 1, 1); render(); },
  nm: () => { hist.m = new Date(hist.m.getFullYear(), hist.m.getMonth() + 1, 1); render(); },
  hp: b => mark(+b.dataset.id, b.dataset.k, 1), hm: b => mark(+b.dataset.id, b.dataset.k, -1),
  prev: b => celebrate(S.habits[0] || { n: 'Thói quen của bạn' }, +b.dataset.i),
  addlv: () => { const L = LVS(); if (L.length >= 12) return toast('Tối đa 12 cấp'); const d = L[L.length - 1].d; L.push({ n: 'Cấp ' + (L.length + 1), d: d ? Math.ceil(d * 1.5) : 7 }); fixLv(); },
  rmlv: () => { if (LVS().length > 1) { LVS().pop(); fixLv(); } },
  rslv: () => { S.set.levels = structuredClone(DEFLV); fixLv(); },
  exp: () => {
    S.backup = Date.now(); save();
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' }));
    a.download = 'mam-thoi-quen-' + fmt(new Date()) + '.json'; a.click(); toast('Đã xuất file sao lưu');
  },
  imp: () => $('#file').click(),
  inst: () => { dip?.prompt(); dip = null; },
  demo: () => {
    [['Uống nước', '💧', 4, 9], ['Đọc sách', '📖', 1, 22], ['Tập thể dục', '🏃', 1, 50], ['Thiền', '🧘', 1, 105]].forEach(([n, i, t, dd]) => {
      const id = S.nextId++; S.habits.push({ id, n, i, t, s: 1, note: '', demo: 1 });
      for (let j = 1; j <= dd; j++) { if (j % 9 == 0) continue; const x = parse(today()); x.setDate(x.getDate() - j); (S.checks[fmt(x)] ??= {})[id] = Array.from({ length: t }, (_, q) => [x.getTime() + (8 + q) * 36e5, 1]); }
      S.cel[id] = lvOf(byId(id));
    });
    save(); tab = 'home'; render(); toast('Đã nạp demo. "Đọc sách" chỉ cần tích hôm nay để lên cấp!');
  },
  undemo: () => { S.habits.filter(h => h.demo).forEach(h => rm(h.id)); save(); render(); },
  wipe: () => { if (confirm('Xóa TOÀN BỘ dữ liệu?') && confirm('Chắc chắn chứ? Không thể khôi phục nếu chưa sao lưu.')) { S = norm({}); save(); render(); } }
};
function rm(id) { S.habits = S.habits.filter(h => h.id != id); delete S.cel[id]; for (const k in S.checks) { delete S.checks[k][id]; if (!Object.keys(S.checks[k]).length) delete S.checks[k]; } }

document.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) A[b.dataset.a]?.(b); });
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.s) { S.set[t.dataset.s] = t.type == 'checkbox' ? t.checked : isNaN(t.value) ? t.value : +t.value; save(); render(); }
  else if (t.dataset.ln != null) { LVS()[+t.dataset.ln].n = t.value.trim() || 'Cấp ' + (+t.dataset.ln + 1); save(); render(); }
  else if (t.dataset.ld != null) { LVS()[+t.dataset.ld].d = Math.max(0, Math.floor(+t.value) || 0); fixLv(); }
  else if (t.dataset.h) { hist.f = t.value; render(); }
  else if (t.id == 'file' && t.files[0]) {
    t.files[0].text().then(x => {
      const j = JSON.parse(x); if (!Array.isArray(j.habits) || typeof j.checks != 'object') throw 0;
      if (confirm(`File có ${j.habits.length} thói quen. Ghi đè toàn bộ dữ liệu hiện tại?`)) { S = norm(j); save(); render(); toast('Đã nhập dữ liệu'); }
    }).catch(() => toast('File không hợp lệ'));
  }
});

/* ===== Kéo-thả đổi vị trí ===== */
let drag = null;
document.addEventListener('pointerdown', e => { const h = e.target.closest('.hd'); if (!h) return; e.preventDefault(); drag = h.closest('.row'); drag.classList.add('lift'); h.setPointerCapture(e.pointerId); vib(8); });
document.addEventListener('pointermove', e => {
  if (!drag) return;
  const o = document.elementsFromPoint(e.clientX, e.clientY).find(x => x.classList?.contains('row') && x != drag);
  if (o) { const r = o.getBoundingClientRect(); o.parentNode.insertBefore(drag, e.clientY < r.top + r.height / 2 ? o : o.nextSibling); }
  if (e.clientY < 100) scrollBy(0, -14); else if (e.clientY > innerHeight - 140) scrollBy(0, 14);
});
const drop = () => {
  if (!drag) return; drag.classList.remove('lift'); drag = null;
  const ids = [...document.querySelectorAll('.row')].map(r => +r.dataset.id);
  S.habits.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)); save(); toast('Đã lưu thứ tự');
};
document.addEventListener('pointerup', drop); document.addEventListener('pointercancel', drop);

addEventListener('beforeinstallprompt', e => { e.preventDefault(); dip = e; render(); });
addEventListener('appinstalled', () => { dip = null; render(); });
render();

/* ===== PWA ===== */
if ('serviceWorker' in navigator) {
  const had = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').then(r => {
    r.onupdatefound = () => { const w = r.installing; w.onstatechange = () => { if (w.state == 'installed' && navigator.serviceWorker.controller) { toast('Có bản mới, đang cập nhật…'); w.postMessage('skip'); } }; };
  }).catch(() => { });
  navigator.serviceWorker.ready.then(() => { swOk = true; if (tab == 'set') render(); });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) location.reload(); });
}
