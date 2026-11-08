'use strict';
let cur='habits',undoT=null,undoFn=null,fxQ=Promise.resolve(),selIcon='h-star';
function render(){$('#screen-'+cur).innerHTML=R[cur]();if(cur==='habits')fitNames()}
window.addEventListener('resize',()=>{if(cur==='habits')fitNames()});
function go(t){cur=t;document.querySelectorAll('.screen').forEach(s=>s.hidden=s.dataset.screen!==t);
  document.querySelectorAll('.tab').forEach(b=>{const on=b.dataset.tab===t;b.classList.toggle('is-active',on);on?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current')});render()}
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2200)}
function vib(p){if(D.cfg.vibrate&&navigator.vibrate)navigator.vibrate(p)}
function sheet(h){$('#sheet-panel').innerHTML=h;$('#sheet').hidden=false}
function closeSheet(){$('#sheet').hidden=true}
function confirmBox(msg,yes){sheet('<h2 class="h-date">'+msg+'</h2><div style="display:flex;gap:12px;margin-top:16px"><button class="btn" data-close style="flex:1">Hủy</button><button class="btn btn-primary" id="yes" style="flex:1">Đồng ý</button></div>');$('#yes').onclick=()=>{closeSheet();yes()}}
/* Hoàn tác 5 giây, vòng đếm ngược */
function showUndo(fn){undoFn=fn;const b=$('#undo');b.hidden=false;b.classList.remove('run');void b.offsetWidth;b.classList.add('run');clearTimeout(undoT);undoT=setTimeout(()=>{b.hidden=true;undoFn=null},5000)}
/* Hiệu ứng thăng cấp (xếp hàng, chạy lần lượt) */
function queueFx(id,from,to){fxQ=fxQ.then(()=>new Promise(res=>{const c=document.querySelector('.habit[data-id="'+id+'"]');
  if(!c||D.cfg.reduce||matchMedia('(prefers-reduced-motion:reduce)').matches){res();return}
  c.dataset.lv=from;c.classList.add('is-leveling');c.style.setProperty('--ngrad','linear-gradient(100deg,'+lvCol(to-1).join(',')+')');
  const mk=(cls,t)=>{const e=document.createElement('div');e.className=cls;if(t)e.innerHTML=t;c.appendChild(e);return e};
  const els=[mk('fx-bg'),mk('fx-wave','<i></i><i></i><i></i>'),mk('fx-label')];els[2].textContent='Thăng cấp: '+D.cfg.names[to-1];vib([20,50,90,50,20]);
  setTimeout(()=>{c.dataset.lv=to;c.style.cssText=lvStyle(to-1);const b=c.querySelector('.badge');if(b)b.innerHTML=badge(to)+bspan(D.cfg.names[to-1])},1000);
  setTimeout(()=>{els.forEach(e=>e.remove());c.classList.remove('is-leveling');if(cur==='habits')render();res()},2100)}))}
function doAdd(id){const h=D.habits.find(x=>x.id===id);if(!h)return;const b=stat(h),l=addLog(h,h.kind==='amount'?h.step:1);
  if(!l){toast('Đã đủ hôm nay');return}vib(15);const a=stat(h);render();const c=document.querySelector('.habit[data-id="'+id+'"]');if(c){const p=document.createElement('i');p.className='pop';p.textContent='+'+l.v;c.appendChild(p);setTimeout(()=>p.remove(),700)}showUndo(()=>{removeLog(l.id);render()});if(a.lv>b.lv)queueFx(id,b.lv,a.lv)}
function doMinus(id){const h=D.habits.find(x=>x.id===id),l=h&&lastToday(h);if(!l){toast('Hôm nay chưa có gì để trừ');return}removeLog(l.id);vib(15);render();showUndo(()=>{D.log.push(l);save();render()})}
/* Mở/đóng mô tả: khung được KÉO XUỐNG từ đáy thẻ, bấm lần nữa thì KÉO LÊN chui vào sau thẻ.
   Chiều cao vùng chứa và độ trượt của khung chạy cùng một nhịp (cùng thời lượng, cùng đường cong) → mép dưới khung luôn khớp mép dưới vùng chứa,
   các thẻ bên dưới dịch xuống/lên đúng bằng phần khung đã lộ ra. Bấm giữa chừng thì đảo chiều mượt từ vị trí hiện tại. */
function toggleDesc(btn){const id=btn.dataset.info,o=descOpen[id]=!descOpen[id],d=document.querySelector('[data-desc="'+id+'"]');
  btn.classList.toggle('is-open',o);btn.setAttribute('aria-expanded',o);if(!d)return;
  const inn=d.querySelector('.h-desc-in'),box=d.querySelector('.h-desc-box'),
    still=D.cfg.reduce||matchMedia('(prefers-reduced-motion:reduce)').matches||!inn.animate,
    from=inn.getBoundingClientRect().height; /* đo TRƯỚC khi đổi trạng thái (kể cả đang chạy dở) */
  inn.getAnimations().forEach(a=>a.cancel());box.getAnimations().forEach(a=>a.cancel());
  d.classList.toggle('is-open',o);
  if(still)return;
  const H=box.offsetHeight,tuck=parseFloat(getComputedStyle(d).getPropertyValue('--tuck'))||14,to=o?H:tuck,
    opt={duration:320,easing:'cubic-bezier(.3,.7,.2,1)'};
  inn.animate([{height:from+'px'},{height:to+'px'}],opt);
  box.animate([{transform:'translateY('+(from-H)+'px)'},{transform:'translateY('+(to-H)+'px)'}],opt)}
/* Chạm khung = cộng. Giữ 0,55 giây = trừ. Kéo/cuộn quá 10px thì hủy */
let pt=null,dId=null,sx=0,sy=0,moved=false,longHit=false;
document.addEventListener('pointerdown',e=>{if(e.target.closest('.h-info'))return;const c=e.target.closest('.habit');if(!c)return;dId=c.dataset.id;sx=e.clientX;sy=e.clientY;moved=false;longHit=false;
  pt=setTimeout(()=>{pt=null;if(!moved){longHit=true;doMinus(dId)}},550)});
document.addEventListener('pointermove',e=>{if(dId&&!moved&&Math.hypot(e.clientX-sx,e.clientY-sy)>10){moved=true;clearTimeout(pt);pt=null}});
document.addEventListener('pointerup',()=>{clearTimeout(pt);pt=null;const id=dId;dId=null;if(id&&!moved&&!longHit)doAdd(id)});
document.addEventListener('pointercancel',()=>{clearTimeout(pt);pt=null;dId=null});
document.addEventListener('contextmenu',e=>{if(e.target.closest('.habit'))e.preventDefault()});
document.addEventListener('click',e=>{const t=e.target,q=s=>t.closest(s);let m;
  if(m=q('[data-info]'))toggleDesc(m)
  else if(m=q('[data-tab]'))go(m.dataset.tab);
  else if(m=q('.seg button')){const g=m.parentNode;g.querySelectorAll('button').forEach(b=>b.classList.toggle('is-on',b===m));if(g.dataset.seg==='kind')$('#fform').dataset.kind=m.dataset.v;else if(g.dataset.seg==='atg'||g.dataset.seg==='amd')adjRefresh(true)}
  else if(m=q('[data-hx]')){histOpen[m.dataset.hx]=!histOpen[m.dataset.hx];render()}
  else if(m=q('[data-hd]')){statDay=m.dataset.hd;render()}
  else if(q('[data-fill]')){const b=Math.max(1,+$('#f-fb').value||10),d=Math.max(0,+$('#f-fi').value||0);document.querySelectorAll('.lvin').forEach((e,i)=>e.value=b+i*d)}
  else if(m=q('[data-adj]')){const p=m.dataset.adj.split('|'),x=D.habits.find(h=>h.id===p[0]);if(x){sheet(adjHtml(x,p[1]));adjRefresh(true)}}
  else if(q('[data-adj-save]'))adjSave()
  else if(q('[data-close]'))closeSheet();
  else if(q('[data-new]')){selIcon='h-star';sheet(formHtml());updateXp()}
  else if(m=q('[data-edit]')){const x=D.habits.find(h=>h.id===m.dataset.edit);selIcon=x.icon;sheet(formHtml(x));updateXp()}
  else if(m=q('[data-ic]')){selIcon=m.dataset.ic;document.querySelectorAll('[data-ic]').forEach(b=>b.classList.toggle('is-on',b===m))}
  else if(q('[data-th2]')){e.preventDefault();document.querySelectorAll('.lvin').forEach(e=>e.value=2)}
  else if(m=q('[data-save]')){const name=cut5($('#f-name').value.replace(/\s+/g,' ').trim()),n=(id,d)=>{const v=Math.floor(+$('#'+id).value);return isNaN(v)||v<0?d:v},sg=k=>document.querySelector('.seg[data-seg="'+k+'"] .is-on').dataset.v;
    if(!name){toast('Hãy nhập tên thói quen');return}
    const lvs=Array.from({length:12},(_,i)=>Math.max(1,n('f-l'+i,10))),kind=sg('kind');
    const o={name,icon:selIcon,kind,unit:$('#f-unit').value.trim(),desc:$('#f-desc').value.trim(),step:kind==='count'?1:Math.max(1,n('f-step',1)),goal:n('f-goal',1),mode:sg('mode'),limit:n('f-limit',0),lvs,th:lvs[0]};
    const x=D.habits.find(h=>h.id===m.dataset.save);if(x)Object.assign(x,o);else D.habits.push(Object.assign({id:uid()},o));save();closeSheet();render()}
  else if(m=q('[data-move]')){const p=m.dataset.move.split('|');moveHabit(p[0],p[1]);render()}
  else if(m=q('[data-arch]')){const x=D.habits.find(h=>h.id===m.dataset.arch);x.arch=!x.arch;save();render();toast(x.arch?'Đã lưu trữ':'Đã khôi phục')}
  else if(m=q('[data-del]')){const id=m.dataset.del;confirmBox('Xóa thói quen này và toàn bộ lịch sử của nó?',()=>{D.habits=D.habits.filter(h=>h.id!==id);D.log=D.log.filter(l=>l.h!==id);save();render()})}
  else if(m=q('[data-hdel]')){const l=removeLog(m.dataset.hdel);render();if(l)showUndo(()=>{D.log.push(l);save();render()})}
  else if(q('#undo')){if(undoFn)undoFn();undoFn=null;$('#undo').hidden=true}
  else if(q('[data-online]')){toggleOnline()}
  else if(q('[data-update]')){doUpdate()}
  else if(m=q('[data-sw]')){const k=m.dataset.sw;D.cfg[k]=!D.cfg[k];save();document.body.classList.toggle('reduce-motion',D.cfg.reduce);render()}
  else if(q('[data-export]'))exportJSON();
  else if(q('[data-reset]'))confirmBox('Xóa toàn bộ dữ liệu?',()=>setTimeout(()=>confirmBox('Chắc chắn chứ? Không thể khôi phục.',()=>{D=DEF();save();render();toast('Đã xóa dữ liệu')}),50))});
document.addEventListener('change',e=>{const t=e.target;
  if(t.dataset.name!==undefined){D.cfg.names[+t.dataset.name]=t.value.trim()||D.cfg.names[+t.dataset.name];save()}
  else if(t.dataset.day!==undefined){D.cfg.dayStart=+t.value;save()}
  else if(t.dataset.import!==undefined&&t.files[0]){const r=new FileReader();r.onload=()=>{const err=importJSON(r.result);err?toast(err):(toast('Đã nhập dữ liệu'),render())};r.readAsText(t.files[0])}});
/* ===== Chế độ online / cập nhật =====
   Công tắc trong Cài đặt: BẬT → app báo service worker chuyển sang online và tự kiểm tra bản mới
   (có thì tải về rồi tự tải lại trang). TẮT → quay về offline hoàn toàn (mặc định). */
const tmo=(p,ms)=>Promise.race([p,new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),ms))]);
function askSW(w,msg,ms){return new Promise(res=>{if(!w){res({ok:false});return}const ch=new MessageChannel(),t=setTimeout(()=>res({ok:false}),ms);
  ch.port1.onmessage=e=>{clearTimeout(t);res(e.data||{ok:false})};w.postMessage(msg,[ch.port2])})}
function syncMode(){if(!('serviceWorker' in navigator))return;
  navigator.serviceWorker.ready.then(r=>{if(r.active)r.active.postMessage({type:'mode',mode:isOnline()?'online':'offline'})}).catch(()=>{})}
function toggleOnline(){const on=!isOnline();try{localStorage.setItem('tq_online',on?'1':'0')}catch(e){}
  syncMode();render();if(on)doUpdate();else toast('Đã về chế độ offline')}
let updating=false;
async function doUpdate(){
  if(updating)return;
  if(!('serviceWorker' in navigator)){toast('Trình duyệt không hỗ trợ cập nhật');return}
  updating=true;toast('Đang kiểm tra bản mới…');
  try{
    const reg=await tmo(navigator.serviceWorker.ready,5000);
    await tmo(reg.update(),15000);
    const nw=reg.installing||reg.waiting;
    if(nw){ /* sw.js có phiên bản mới: nó tự tải đủ file, tự kích hoạt */
      toast('Đang tải bản mới…');
      await tmo(new Promise((res,rej)=>{
        if(nw.state==='activated'){res();return}
        nw.addEventListener('statechange',()=>{if(nw.state==='activated')res();else if(nw.state==='redundant')rej(new Error('fail'))})}),30000);
      toast('Đã cập nhật, đang mở lại…');setTimeout(()=>location.reload(),700);return}
    /* sw.js không đổi → vẫn làm mới toàn bộ file lõi (phòng khi quên tăng số phiên bản) */
    syncMode();
    const r=await askSW(reg.active,{type:'update'},20000);
    if(!r.ok)toast('Mạng yếu, chưa cập nhật được. Thử lại sau nhé');
    else if(r.changed){toast('Đã cập nhật, đang mở lại…');setTimeout(()=>location.reload(),700)}
    else toast('Bạn đang dùng bản mới nhất')
  }catch(e){toast('Không cập nhật được. Kiểm tra mạng rồi thử lại')}
  finally{updating=false}}
/* Khởi động */
load();document.body.classList.toggle('reduce-motion',D.cfg.reduce);go('habits');
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();
if('serviceWorker' in navigator){
  /* updateViaCache:'none' → luôn kiểm tra sw.js mới trực tiếp (không dùng bản tạm của trình duyệt). Lỗi mạng chỉ im lặng, không ảnh hưởng giao diện. */
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(()=>{});
  /* Lần đầu cài xong: báo để người dùng biết từ giờ mở không cần mạng */
  syncMode();
  navigator.serviceWorker.ready.then(()=>{try{if(!localStorage.getItem('tq_offline_ok')){localStorage.setItem('tq_offline_ok','1');toast('Đã sẵn sàng dùng không cần mạng')}}catch(e){}}).catch(()=>{})}

document.addEventListener('input',e=>{if(/^f-l\d$/.test(e.target.id))updateXp()});
/* Tên thói quen tối đa 5 chữ (tính theo từ cách nhau bởi dấu cách) */
const MAXW=5,cut5=v=>{const w=v.split(/\s+/).filter(Boolean);return w.length>MAXW?w.slice(0,MAXW).join(' '):v};
document.addEventListener('input',e=>{const t=e.target;if(t.id==='f-desc'){t.style.height='auto';t.style.height=t.scrollHeight+'px'}if(t.id==='f-name'){const c=cut5(t.value);if(c!==t.value){t.value=c;toast('Tên tối đa '+MAXW+' chữ')}}});

function adjSave(){const a=adjCalc();if(isNaN(a.n)){toast('Hãy nhập một số');return}
  if(a.r.md==='set'&&a.n<0){toast('Số mới không được âm');return}
  if(a.r.key>dayKey()){toast('Không chọn ngày trong tương lai');return}
  if(!a.d){toast('Không có thay đổi nào');return}
  if(a.cur+a.d<0){toast('Kết quả không được nhỏ hơn 0');return}
  const k=a.r.key,t=k===dayKey()?Date.now():new Date(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10),12).getTime(),o={t,note:$('#a-note').value.trim(),v:0,c:0,p:0};
  if(a.r.tg==='v'){o.v=a.d;o.c=a.h.kind==='count'?a.d:Math.round(a.d/(a.h.step||1))}else o.p=a.d;
  const l=addAdj(a.h,o);adjCtx=null;closeSheet();render();showUndo(()=>{removeLog(l.id);render()})}
document.addEventListener('change',e=>{if(e.target.id==='a-date')adjRefresh(true)});
document.addEventListener('input',e=>{if(e.target.id==='a-n')adjRefresh(false)});

/* Ô nhập số: khi chạm vào, con trỏ đặt ở CUỐI số (ví dụ 23|); chỉ nhận chữ số */
document.addEventListener('focusin',e=>{const t=e.target;if(t.matches&&t.matches('input[inputmode="numeric"]'))setTimeout(()=>{try{t.setSelectionRange(t.value.length,t.value.length)}catch(_){}},0)});
document.addEventListener('input',e=>{const t=e.target;if(t.matches&&t.matches('input[inputmode="numeric"]')&&/\D/.test(t.value))t.value=t.value.replace(/\D/g,'')});
