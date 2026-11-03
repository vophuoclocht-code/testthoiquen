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
/* Chạm khung = cộng. Giữ 0,55 giây = trừ. Kéo/cuộn quá 10px thì hủy */
let pt=null,dId=null,sx=0,sy=0,moved=false,longHit=false;
document.addEventListener('pointerdown',e=>{const c=e.target.closest('.habit');if(!c)return;dId=c.dataset.id;sx=e.clientX;sy=e.clientY;moved=false;longHit=false;
  pt=setTimeout(()=>{pt=null;if(!moved){longHit=true;doMinus(dId)}},550)});
document.addEventListener('pointermove',e=>{if(dId&&!moved&&Math.hypot(e.clientX-sx,e.clientY-sy)>10){moved=true;clearTimeout(pt);pt=null}});
document.addEventListener('pointerup',()=>{clearTimeout(pt);pt=null;const id=dId;dId=null;if(id&&!moved&&!longHit)doAdd(id)});
document.addEventListener('pointercancel',()=>{clearTimeout(pt);pt=null;dId=null});
document.addEventListener('contextmenu',e=>{if(e.target.closest('.habit'))e.preventDefault()});
document.addEventListener('click',e=>{const t=e.target,q=s=>t.closest(s);let m;
  if(m=q('[data-tab]'))go(m.dataset.tab);
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
  else if(m=q('[data-save]')){const name=$('#f-name').value.trim(),n=(id,d)=>{const v=Math.floor(+$('#'+id).value);return isNaN(v)||v<0?d:v},sg=k=>document.querySelector('.seg[data-seg="'+k+'"] .is-on').dataset.v;
    if(!name){toast('Hãy nhập tên thói quen');return}
    const lvs=Array.from({length:12},(_,i)=>Math.max(1,n('f-l'+i,10))),kind=sg('kind');
    const o={name,icon:selIcon,kind,unit:$('#f-unit').value.trim(),step:kind==='count'?1:Math.max(1,n('f-step',1)),goal:n('f-goal',1),mode:sg('mode'),limit:n('f-limit',0),lvs,th:lvs[0]};
    const x=D.habits.find(h=>h.id===m.dataset.save);if(x)Object.assign(x,o);else D.habits.push(Object.assign({id:uid()},o));save();closeSheet();render()}
  else if(m=q('[data-move]')){const p=m.dataset.move.split('|');moveHabit(p[0],p[1]);render()}
  else if(m=q('[data-arch]')){const x=D.habits.find(h=>h.id===m.dataset.arch);x.arch=!x.arch;save();render();toast(x.arch?'Đã lưu trữ':'Đã khôi phục')}
  else if(m=q('[data-del]')){const id=m.dataset.del;confirmBox('Xóa thói quen này và toàn bộ lịch sử của nó?',()=>{D.habits=D.habits.filter(h=>h.id!==id);D.log=D.log.filter(l=>l.h!==id);save();render()})}
  else if(m=q('[data-hdel]')){const l=removeLog(m.dataset.hdel);render();if(l)showUndo(()=>{D.log.push(l);save();render()})}
  else if(q('#undo')){if(undoFn)undoFn();undoFn=null;$('#undo').hidden=true}
  else if(m=q('[data-sw]')){const k=m.dataset.sw;D.cfg[k]=!D.cfg[k];save();document.body.classList.toggle('reduce-motion',D.cfg.reduce);render()}
  else if(q('[data-export]'))exportJSON();
  else if(q('[data-reset]'))confirmBox('Xóa toàn bộ dữ liệu?',()=>setTimeout(()=>confirmBox('Chắc chắn chứ? Không thể khôi phục.',()=>{D=DEF();save();render();toast('Đã xóa dữ liệu')}),50))});
document.addEventListener('change',e=>{const t=e.target;
  if(t.dataset.name!==undefined){D.cfg.names[+t.dataset.name]=t.value.trim()||D.cfg.names[+t.dataset.name];save()}
  else if(t.dataset.day!==undefined){D.cfg.dayStart=+t.value;save()}
  else if(t.dataset.import!==undefined&&t.files[0]){const r=new FileReader();r.onload=()=>{const err=importJSON(r.result);err?toast(err):(toast('Đã nhập dữ liệu'),render())};r.readAsText(t.files[0])}});
/* Khởi động */
load();document.body.classList.toggle('reduce-motion',D.cfg.reduce);go('habits');
setTimeout(()=>{const s=$('#splash');if(s)s.remove()},800);
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js');

document.addEventListener('input',e=>{if(/^f-l\d$/.test(e.target.id))updateXp()});

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
