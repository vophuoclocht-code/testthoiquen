'use strict';
const $=s=>document.querySelector(s);
const DOW=['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
const ic=(n,c='')=>'<svg class="ic '+c+'"><use href="#'+n+'"/></svg>';
const LV=['#6D28D9','#B02ACB','#F97316','#FCD34D'],LV2=['#6a2bc4','#a050e6','#dba0f7','#fbeaff'];
/* Huy hiệu: số vòng sóng = số cấp, ngôi sao vàng ở tâm */
const bspan=n=>'<span style="font-size:'+Math.min(.74,Math.max(.5,10.5/[...n].length)).toFixed(2)+'rem">'+esc(n)+'</span>';
/* Màu khung theo 12 cấp: nội suy tím → hồng → cam → vàng kim */
const hx=c=>[1,3,5].map(i=>parseInt(c.substr(i,2),16)),mix=(a,b,t)=>{const A=hx(a),B=hx(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
const ANC=[['#6D28D9','#A855F7'],['#B02ACB','#EC4899'],['#F97316','#FBBF24'],['#FCD34D','#FFF7D1']];
function lvCol(L){const p=L/11*3,i=Math.min(2,Math.floor(p)),t=p-i;return [mix(ANC[i][0],ANC[i+1][0],t),mix(ANC[i][1],ANC[i+1][1],t)]}
function lvStyle(L){const c=lvCol(L);return '--c0:'+c[0]+';--c1:'+c[1]+';--gl:'+c[1]+';--fg:'+(L>=7?'#331400':'#fff')}
/* Huy hiệu = cảnh phủ kín ô 84x84, tên cấp đè lên bằng lớp mờ.
   Cấp 1 Khổ Hải: quả cầu chìm dưới nước.  Cấp 2 Vọng Tâm: quả cầu GIỮ NGUYÊN vị trí cấp 1 (dưới nước, đỉnh chạm mặt nước tại tâm sóng), thêm 3 vòng sóng.  Cấp 3 Mệnh Tuyền: quả cầu nổi trên mặt nước, đáy chạm mặt nước, 3 vòng sóng.  Cấp 4 Linh Triều: như Mệnh Tuyền nhưng 6 vòng sóng.  Cấp 5-6: bay cao dần.
   Cấp 6 Bỉ Ngạn trở đi: chỉ còn bầu trời, không có nước.
   7 Tinh Huy: 1 ngôi sao 4 cánh.  8-9: thêm sao con.  10 Pháp Tướng: sao con xếp thành vòng tròn quanh sao chính.
   11 Quy Chân: vòng tròn khép lại, có đường tròn bao quanh.  12 Kim Tính: hợp thành 1 ngôi sao ở chính giữa, 8 tia sáng đều nhau. */
function badge(lv){const L=lv-1,x=42;
  const st=(cx,cy,s,fl,o)=>'<path d="M'+cx+' '+(cy-s)+'Q'+(cx+s*.2)+' '+(cy-s*.2)+' '+(cx+s)+' '+cy+'Q'+(cx+s*.2)+' '+(cy+s*.2)+' '+cx+' '+(cy+s)+'Q'+(cx-s*.2)+' '+(cy+s*.2)+' '+(cx-s)+' '+cy+'Q'+(cx-s*.2)+' '+(cy-s*.2)+' '+cx+' '+(cy-s)+'z" fill="'+fl+'"'+(o?' opacity="'+o+'"':'')+'/>';
  /* Gợn sóng trên mặt nước nhìn nghiêng: elip dẹt (ry = rx*0.27), tâm trên mặt nước (y=50), vòng càng xa càng rộng, càng mờ */
  const rip=(o,n)=>Array.from({length:n},(_,i)=>{const rx=n>3?8+i*6.2:9+i*7,ry=rx*.27,op=Math.max(0,o*(1-i*(n>3?.13:.2)));return '<ellipse cx=\"'+x+'\" cy=\"50\" rx=\"'+rx.toFixed(1)+'\" ry=\"'+ry.toFixed(1)+'\" fill=\"none\" stroke=\"#ffc457\" stroke-width=\"'+(1.5-i*.06).toFixed(2)+'\" opacity=\"'+op.toFixed(2)+'\"/>'}).join('');
  let g='<svg viewBox="0 0 84 84" aria-hidden="true"><defs><linearGradient id="bdk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a24b0"/><stop offset="1" stop-color="#e060c4"/></linearGradient><linearGradient id="bdw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a58f0"/><stop offset="1" stop-color="#5b25ad"/></linearGradient><radialGradient id="bdg"><stop offset="0" stop-color="#fff6c9" stop-opacity=".95"/><stop offset="1" stop-color="#ffd24d" stop-opacity="0"/></radialGradient></defs>';
  g+=L<=4?'<rect width="84" height="40" fill="url(#bdk)"/><rect y="40" width="84" height="44" fill="url(#bdw)"/>':'<rect width="84" height="84" fill="url(#bdk)"/>';
  if(L<=5){const m=[1,1,1,1,4,5][L],r=4.2+m*.5,f=mix('#ffc4ec','#ffe9a0',m/5),
      y=L<=1?50+r:L<=3?50-r:[34,31][L-4]; /* L0-1: cùng một vị trí (dưới nước, đỉnh chạm mặt nước y=50), không di chuyển | L2-3: đứng trên mặt nước | L4-5: bay cao */
    if(L===2||L===3)g+=rip(.85,L===3?6:3); /* sóng vẽ TRƯỚC: nửa sóng phía sau bị quả cầu che, quả cầu chạm mặt nước */
    for(let i=1;i<=Math.min(m-1,3);i++)g+='<circle cx="'+x+'" cy="'+(y+r+i*4.5).toFixed(1)+'" r="'+(1.7-i*.3).toFixed(1)+'" fill="#ffd24d" opacity="'+(.65-i*.15).toFixed(2)+'"/>';
    g+='<circle cx="'+x+'" cy="'+y+'" r="'+(r*2.6).toFixed(1)+'" fill="url(#bdg)" opacity="'+(m===0?.2:.3+m*.1).toFixed(2)+'"/><circle cx="'+x+'" cy="'+y+'" r="'+r.toFixed(1)+'" fill="'+f+'"/><circle cx="'+(x-r*.3).toFixed(1)+'" cy="'+(y-r*.3).toFixed(1)+'" r="'+(r*.35).toFixed(1)+'" fill="#fff" opacity=".85"/>';
    if(L<=1)g+='<rect y="40" width="84" height="44" fill="#8a4ee6" opacity="'+(L===1?.3:.4)+'"/>'; /* lớp nước phủ lên: quả cầu nằm dưới nước */
    if(L===1)g+=rip(.9,3)+'<ellipse cx="'+x+'" cy="50" rx="3" ry=".85" fill="#fff6c9" opacity=".9"/>'; /* Mệnh Tuyền: sóng trên mặt nước, đỉnh quả cầu (dưới nước) chạm mặt nước đúng tâm sóng */
    if(L===4)g+=rip(.23,3);
  }else{const k=L-6,y=31,r=[11,11,11,12,13,16][k];
    const S=[[12,12],[72,11],[14,48],[70,49],[7,30],[78,31],[31,7],[54,56]];
    let pts=k===1?S.slice(0,4):k===2?S:[];
    if(k===3||k===4){const R=k===3?27:21;pts=Array.from({length:8},(_,i)=>{const a=-Math.PI/2+i*Math.PI/4;return [x+R*Math.cos(a),y+R*Math.sin(a)]});
      g+='<circle cx="'+x+'" cy="'+y+'" r="'+R+'" fill="none" stroke="#fff6c9" stroke-width=".9" opacity="'+(k===3?.25:.5)+'"/>'}
    pts.forEach((p,i)=>{g+=st(+p[0].toFixed(1),+p[1].toFixed(1),2.5+(i%2)*.5,'#fff6c9',.95)});
    if(k===0)g+='<circle cx="'+x+'" cy="'+y+'" r="'+(r*1.9)+'" fill="none" stroke="#fff0b3" stroke-width="1" opacity=".55"/>';
    g+='<circle cx="'+x+'" cy="'+y+'" r="'+(r*(k===5?3:2.2)).toFixed(1)+'" fill="url(#bdg)" opacity="'+[.6,.65,.7,.75,.85,.98][k]+'"/>';
    if(k===5){let d='';for(let i=0;i<8;i++){const a=i*Math.PI/4,c=Math.cos(a),s=Math.sin(a);d+='M'+(x+r*1.25*c).toFixed(1)+' '+(y+r*1.25*s).toFixed(1)+'L'+(x+r*1.7*c).toFixed(1)+' '+(y+r*1.7*s).toFixed(1)}
      g+='<path d="'+d+'" stroke="#fff6c9" stroke-width="1" stroke-linecap="round" opacity=".8"/>'}
    g+=st(x,y,r,mix('#ffe08a','#fffbe0',k/5))}
  return g+'</svg>'}
function ringSvg(p){return '<svg class="ring" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#eee7fa" stroke-width="7"/><circle cx="32" cy="32" r="26" fill="none" stroke="url(#gp)" stroke-width="7" stroke-linecap="round" stroke-dasharray="163.4" stroke-dashoffset="'+(163.4*(1-p)).toFixed(1)+'" transform="rotate(-90 32 32)"/></svg>'}
/* Cỡ chữ tên thói quen và icon đi cùng nhau, giảm dần khi tên dài */
function nameFs(n){const L=[...n].length;return L<=7?1.6:L<=11?1.45:L<=16?1.25:1.05}
function nameIc(x,fs){const p=Math.round(fs*24);return '<svg class="ic" style="width:'+p+'px;height:'+p+'px"><use href="#'+x.icon+'"/></svg>'}
function rHabits(){const hs=D.habits.filter(h=>!h.arch),n=new Date(),nm=D.cfg.names;
  let h='<h1 class="h-date">'+DOW[n.getDay()]+', '+n.getDate()+' tháng '+(n.getMonth()+1)+'</h1>';
  if(!hs.length)h+='<div class="empty">Chưa có thói quen nào.<br>Vào tab Quản lý để thêm thói quen đầu tiên.</div>';
  for(const x of hs){const s=stat(x),u=x.unit?' '+esc(x.unit):'',len=String(s.today.v).length,sub=s.full?'Đủ hôm nay':(x.goal>0?'Mục tiêu '+x.goal+u:''),fs=nameFs(x.name);
    /* Cấu trúc: [huy hiệu 84px] + [cột nội dung cao đúng 84px: hàng trên = tên + số lần, hàng dưới = thanh lên cấp] → mép trên/dưới luôn thẳng hàng */
    h+='<article class="habit'+(s.full?' is-full':'')+'" data-lv="'+s.lv+'" data-id="'+x.id+'" style="'+lvStyle(s.lv-1)+'">'+
    '<div class="badge">'+badge(s.lv)+bspan(nm[s.lv-1])+'</div>'+
    '<div class="hc"><div class="hrow"><div class="h-main"><div class="h-name" style="font-size:'+fs+'rem">'+nameIc(x,fs)+'<span>'+esc(x.name)+'</span></div>'+(sub?'<div class="h-sub2">'+sub+'</div>':'')+'</div>'+
    '<div class="count"><b class="cnum'+(len>=4?' xl':len==3?' l':'')+'">'+s.today.v+'</b><span>'+(x.goal>0?'/ '+x.goal+u:(x.unit?esc(x.unit):'hôm nay'))+'</span></div></div>'+
    '<div class="pg"><div class="wave"><i style="--pct:'+(s.into/s.th*100).toFixed(1)+'%"></i></div><em class="pgn">'+s.into+'/'+s.th+(s.stars?' ★'+s.stars:'')+'</em></div></div>'+'</article>'+
    (x.desc?'<div class="h-desc'+(descOpen[x.id]?' is-open':'')+'" data-desc="'+x.id+'" style="'+lvStyle(s.lv-1)+'"><button type="button" class="h-info'+(descOpen[x.id]?' is-open':'')+'" data-info="'+x.id+'" aria-label="Xem mô tả" aria-expanded="'+(!!descOpen[x.id])+'"><svg class="h-tab" width="54" height="14" viewBox="0 0 54 14" aria-hidden="true"><path class="f" d="M0 0H54V2.5A5 5 0 0 0 49 7.5V8A5 5 0 0 1 44 13H10A5 5 0 0 1 5 8V7.5A5 5 0 0 0 0 2.5Z"/><path class="s" d="M0 2.5A5 5 0 0 1 5 7.5V8A5 5 0 0 0 10 13H44A5 5 0 0 0 49 8V7.5A5 5 0 0 1 54 2.5"/><g class="h-chev"><path d="M23.2 6.4L27 10.2L30.8 6.4"/></g></svg></button><div class="h-desc-in"><div class="h-desc-box">'+esc(x.desc)+'</div></div></div>':'')}
  return h}
/* Tên thói quen (tối đa 5 chữ) + biểu tượng luôn nằm gọn trong chiều dài thanh tiến độ (cột h-main rộng đúng bằng thanh).
   Thứ tự thử: 1 dòng chữ to → 2 dòng → 3 dòng, chữ và biểu tượng thu nhỏ cùng nhau cho vừa khung. */
function fitNames(){document.querySelectorAll('.habit .h-name').forEach(el=>{
  const sp=el.querySelector('span'),ico=el.querySelector('svg'),main=el.parentNode,AV=60; /* AV = chiều cao tối đa của vùng tên + dòng phụ (84 - thanh tiến độ - khoảng cách) */
  const set=f=>{el.style.fontSize=f+'rem';ico.style.width=ico.style.height=Math.round(f*20)+'px'};
  const lines=n=>{if(n===1){sp.style.whiteSpace='nowrap';sp.style.display='block';sp.style.webkitLineClamp='unset'}
    else{sp.style.whiteSpace='normal';sp.style.display='-webkit-box';sp.style.webkitBoxOrient='vertical';sp.style.webkitLineClamp=String(n)}};
  const okW=()=>sp.scrollWidth<=sp.clientWidth+1,okH=n=>n===1||sp.scrollHeight<=sp.clientHeight+1;
  const tryRun=(n,from,to,needH)=>{lines(n);for(let f=from;f>=to-1e-6;f=Math.round((f-.05)*100)/100){set(f);if(okW()&&okH(n)&&(!needH||main.offsetHeight<=AV))return true}return false};
  if(tryRun(1,1.5,1.25,false))return;
  if(tryRun(2,1.3,.95,true))return;
  if(tryRun(3,1.0,.85,true))return;
  lines(3);set(.85)})}
/* Mỗi cấp một số điểm riêng do người dùng nhập: lvs = [cấp1→2, cấp2→3, cấp3→4, mỗi ★] */
function xpChips(L){return L.map((v,k)=>'<span class="xp" style="background:'+LV[k]+';color:'+(k>=2?'#331400':'#fff')+'">'+(k<3?(k+1)+'→'+(k+2):'mỗi ★')+' <b>'+v+'</b></span>').join('')}
function updateXp(){}
const MODE={log:'1 điểm / lần',day:'1 điểm / ngày đạt mục tiêu',amount:'điểm theo lượng'};
function rManage(){const act=D.habits.filter(x=>!x.arch),arc=D.habits.filter(x=>x.arch),nm=D.cfg.names;
  let h='<h1 class="h-date">Quản lý</h1><p class="h-sub">'+act.length+' thói quen đang theo dõi</p><button class="btn btn-primary" data-new style="width:100%;margin:14px 0">'+ic('ui-plus')+' Thêm thói quen</button>';
  act.forEach((x,i)=>{const s=stat(x),c=lvCol(s.lv-1),fg=s.lv>=8?'#331400':'#fff',first=i===0,last=i===act.length-1;
    h+='<div class="mg"><div class="mg-top"><span class="mg-ic" style="background:linear-gradient(135deg,'+c[0]+','+c[1]+')!important;color:'+fg+'!important">'+ic(x.icon,'l')+'</span><div class="grow"><div class="t">'+esc(x.name)+'</div><div class="n">'+esc(nm[s.lv-1])+(s.stars?' '+'★'.repeat(s.stars):'')+'</div><div class="n">'+s.pts+' điểm</div></div></div>'+
    /* Hàng sắp xếp riêng, nút lớn, mờ đi khi đã ở đầu/cuối danh sách */
    '<div class="mg-mv"><button data-move="'+x.id+'|top"'+(first?' disabled':'')+'>'+ic('ui-top','s')+' Lên đầu</button><button data-move="'+x.id+'|-1"'+(first?' disabled':'')+'>'+ic('ui-up','s')+' Lên</button><button data-move="'+x.id+'|1"'+(last?' disabled':'')+'>'+ic('ui-down','s')+' Xuống</button></div>'+
    '<div class="mg-btns"><button data-adj="'+x.id+'|'+dayKey()+'">'+ic('ui-settings','s')+' Điều chỉnh</button><button data-edit="'+x.id+'">'+ic('ui-edit','s')+' Sửa</button><button data-arch="'+x.id+'">'+ic('ui-archive','s')+' Lưu trữ</button><button class="btn-danger" data-del="'+x.id+'">'+ic('ui-trash','s')+' Xóa</button></div></div>'});
  if(!act.length)h+='<div class="empty">Chưa có thói quen nào. Bấm "Thêm thói quen" để bắt đầu.</div>';
  if(arc.length){h+='<div class="day-head">Đã lưu trữ</div><div class="group">';
    arc.forEach(x=>h+='<div class="row">'+ic(x.icon)+'<div class="grow t">'+esc(x.name)+'</div><button data-arch="'+x.id+'" class="chip">Khôi phục</button><button data-del="'+x.id+'" aria-label="Xóa">'+ic('ui-trash')+'</button></div>');h+='</div>'}
  return h}
const unitOf=x=>x.unit||'lần';
const dLab=k=>{const t=dayKey(),y=dayKey(Date.now()-864e5);return k===t?'Hôm nay':k===y?'Hôm qua':k.slice(8)+'/'+k.slice(5,7)};
let histOpen={},statDay=null,descOpen={};
/* Lịch sử: mỗi ngày gom theo thói quen, hiện tổng số lần nhấn; bấm vào để xem từng lần */
function rHistory(){let h='<h1 class="h-date">Lịch sử</h1>';const L=D.log.slice().sort((a,b)=>b.t-a.t),by={};
  for(const l of L){const k=dayKey(l.t);by[k]=by[k]||{};(by[k][l.h]=by[k][l.h]||[]).push(l)}
  const ks=Object.keys(by);if(!ks.length)h+='<div class="empty">Chưa có ghi nhận nào</div>';
  for(const k of ks){h+='<div class="day-head">'+dLab(k)+'</div><div class="group">';
    for(const id in by[k]){const x=D.habits.find(y=>y.id===id);if(!x)continue;const ls=by[k][id],key=k+'|'+id,open=!!histOpen[key],u=esc(unitOf(x));
      const cnt=Math.max(0,ls.reduce((a,l)=>a+(l.c!==undefined?l.c:1),0)),tot=Math.max(0,ls.reduce((a,l)=>a+l.v,0)),pp=ls.reduce((a,l)=>a+(l.p||0),0),adj=ls.some(l=>l.adj),sub=[];
      if(x.kind==='amount')sub.push('Tổng '+tot+' '+u);if(pp)sub.push('Điểm chỉnh '+(pp>0?'+':'−')+Math.abs(pp));else if(adj)sub.push('đã điều chỉnh');
      h+='<div class="hx"><button class="row hx-h" data-hx="'+key+'" aria-expanded="'+open+'">'+ic(x.icon)+'<div class="grow"><div class="t">'+esc(x.name)+'</div>'+(sub.length?'<div class="n">'+sub.join(' · ')+'</div>':'')+'</div><span class="hx-n"><b>'+cnt+'</b> lần</span>'+ic(open?'ui-up':'ui-down','s')+'</button>';
      if(open)h+='<div class="hx-d">'+ls.map(l=>{const d=new Date(l.t),tm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'),del='<button data-hdel="'+l.id+'" aria-label="Xóa">'+ic('ui-trash','s')+'</button>';
        if(l.adj){const amt=l.p?(l.p>0?'+':'−')+Math.abs(l.p)+' điểm':(l.v>0?'+':'−')+Math.abs(l.v)+' '+u;
          return '<div class="row entry"><div class="grow"><div class="n"><span class="adj-tag">Điều chỉnh</span> '+tm+'</div><b>'+amt+'</b>'+(l.note?'<div class="n" style="font-style:italic">Lý do: '+esc(l.note)+'</div>':'')+'</div>'+del+'</div>'}
        return '<div class="row entry"><div class="grow n">'+tm+'</div><b>+'+l.v+' '+u+'</b>'+del+'</div>'}).join('')+
        '<div class="row"><button class="btn" data-adj="'+id+'|'+k+'" style="width:100%">'+ic('ui-settings','s')+' Điều chỉnh ngày này</button></div></div>';
      h+='</div>'}
    h+='</div>'}
  return h}
/* Sheet điều chỉnh: sửa số lần/lượng hoặc điểm, đặt thành số mới hoặc cộng/trừ, kèm lý do */
let adjCtx=null;
function adjCur(h,key){const e=perDay(h)[key]||{n:0,v:0,p:0};return{v:e.v,p:dayPts(h,e)}}
function adjHtml(h,key){adjCtx={id:h.id};
  return '<div class="f"><h2 class="h-date">Điều chỉnh</h2><p class="h-sub">'+esc(h.name)+'</p><div class="fcard" style="margin-top:12px">'+
  '<div class="field"><label for="a-date">Ngày</label><input type="date" id="a-date" value="'+key+'" max="'+dayKey()+'"></div>'+
  '<div class="seg" data-seg="atg"><button type="button" data-v="v" class="is-on">Số lần</button><button type="button" data-v="p">Điểm</button></div>'+
  '<div class="seg" data-seg="amd" style="margin-top:10px"><button type="button" data-v="set" class="is-on">Đặt thành</button><button type="button" data-v="add">Cộng thêm</button><button type="button" data-v="sub">Trừ bớt</button></div>'+
  '<div class="field" style="margin-top:12px"><label for="a-n" id="a-lab"></label><input type="text" inputmode="numeric" pattern="[0-9]*" id="a-n" value="0"><small id="a-prev"></small></div>'+
  '<div class="field"><label for="a-note">Lý do (không bắt buộc)</label><input type="text" id="a-note" maxlength="80" placeholder="Ví dụ: quên bấm hôm qua"></div></div>'+
  '<div class="fsave"><button class="btn btn-primary" data-adj-save style="width:100%">Lưu điều chỉnh</button></div></div>'}
function adjRead(){const q=k=>document.querySelector('.seg[data-seg="'+k+'"] .is-on').dataset.v;return{key:$('#a-date').value||dayKey(),tg:q('atg'),md:q('amd')}}
function adjCalc(){const h=D.habits.find(x=>x.id===adjCtx.id),r=adjRead(),c=adjCur(h,r.key),cur=r.tg==='v'?c.v:c.p,n=Math.round(+$('#a-n').value);
  return{h,r,cur,u:r.tg==='v'?unitOf(h):'điểm',n,d:isNaN(n)?0:(r.md==='set'?n-cur:r.md==='sub'?-n:n)}}
function adjRefresh(reset){if(!adjCtx||!$('#a-n'))return;let a=adjCalc();if(reset){$('#a-n').value=a.r.md==='set'?a.cur:0;a=adjCalc()}
  $('#a-lab').textContent=(a.r.md==='set'?'Số mới':a.r.md==='sub'?'Trừ bớt':'Cộng thêm')+' ('+a.u+')';
  $('#a-prev').textContent='Hiện tại '+a.cur+' '+a.u+' → sau khi chỉnh '+Math.max(0,a.cur+a.d)+' '+a.u+(a.d?' ('+(a.d>0?'+':'−')+Math.abs(a.d)+')':'')}
function rStats(){const st=streaks(),n=new Date(),y=n.getFullYear(),m=n.getMonth(),dim=new Date(y,m+1,0).getDate(),off=(new Date(y,m,1).getDay()+6)%7,td=dayKey();if(!statDay)statDay=td;
  let h='<h1 class="h-date">Thống kê</h1><div class="stat-row"><div>'+ic('ui-flame')+'<b>'+st.cur+'</b><span>ngày liên tiếp</span></div><i></i><div><b>'+st.best+'</b><span>ngày dài nhất</span></div></div>';
  h+='<div class="day-head">Tháng '+(m+1)+'</div><div class="heat">'+['T2','T3','T4','T5','T6','T7','CN'].map(d=>'<i style="background:none">'+d+'</i>').join('')+'<i style="background:none"></i>'.repeat(off);
  for(let d=1;d<=dim;d++){const k=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),r=dayRatio(k);
    h+='<i data-hd="'+k+'" data-h="'+(r>=1?4:r>=.66?3:r>=.33?2:r>0?1:0)+'" class="'+(k===statDay?'sel':'')+(k===td?' tdy':'')+'">'+d+'</i>'}
  /* Chi tiết ngày đang chọn, dùng đơn vị của từng thói quen */
  const items=D.habits.map(x=>{const e=perDay(x)[statDay];return e?{x,e}:null}).filter(Boolean);
  h+='</div><div class="day-head">'+(statDay===td?'Hôm nay':'Ngày '+dLab(statDay))+'</div><div class="group">';
  h+=items.length?items.map(o=>'<div class="row">'+ic(o.x.icon)+'<div class="grow"><div class="t">'+esc(o.x.name)+'</div><div class="n">'+o.e.n+' lần nhấn</div></div><b>'+o.e.v+' '+esc(unitOf(o.x))+'</b></div>').join(''):'<div class="empty">Không có ghi nhận</div>';
  h+='</div><div class="day-head">Theo thói quen</div><div class="group">';
  for(const x of D.habits){const s=stat(x),tot=Object.values(perDay(x)).reduce((a,e)=>a+e.v,0);
    h+='<div class="row">'+ic(x.icon)+'<div class="grow"><div class="t">'+esc(x.name)+'</div><div class="n">'+esc(D.cfg.names[s.lv-1])+(s.stars?' '+'★'.repeat(s.stars):'')+' · '+s.pts+' điểm</div></div><b>'+tot+' '+esc(unitOf(x))+'</b></div>'}
  return h+'</div>'}
function sw(k,on){return '<button class="switch" role="switch" aria-checked="'+on+'" data-sw="'+k+'"></button>'}
function rSettings(){let h='<h1 class="h-date">Cài đặt</h1><details class="group"><summary class="row xs"><span class="grow">Tên 12 cấp</span>'+ic('ui-down','s')+'</summary>';
  D.cfg.names.forEach((t,i)=>h+='<div class="row"><div class="grow">Tên cấp '+(i+1)+'</div><input type="text" maxlength="20" value="'+esc(t)+'" data-name="'+i+'" style="width:150px"></div>');
  h+='</details><div class="group"><div class="row"><div class="grow">Giờ bắt đầu ngày mới</div><select data-day style="width:110px"><option value="0"'+(D.cfg.dayStart==0?' selected':'')+'>00:00</option><option value="3"'+(D.cfg.dayStart==3?' selected':'')+'>03:00</option></select></div>'+
  '<div class="row"><div class="grow">Rung</div>'+sw('vibrate',D.cfg.vibrate)+'</div><div class="row"><div class="grow">Giảm hiệu ứng</div>'+sw('reduce',D.cfg.reduce)+'</div></div><div class="group">'+
  '<div class="row"><button class="btn" data-export>'+ic('ui-download')+' Xuất sao lưu</button><label class="btn" style="margin-left:auto">'+ic('ui-upload')+' Nhập<input type="file" accept=".json,application/json" data-import hidden></label></div>'+
  '<div class="row"><button class="btn btn-danger" data-reset>Xóa toàn bộ dữ liệu</button></div></div><p class="h-sub" style="text-align:center">Đã sẵn sàng dùng không cần mạng</p>';
  return h}
const R={habits:rHabits,manage:rManage,history:rHistory,stats:rStats,settings:rSettings};
function formHtml(x){const isNew=!x;x=x||{name:'',icon:'h-star',kind:'count',unit:'lần',step:1,goal:1,mode:'log',limit:0};
  const L=lvsOf(x.id?x:{th:10,inc:5}),nm=D.cfg.names;
  const seg=(k,o,c)=>'<div class="seg" data-seg="'+k+'">'+o.map(a=>'<button type="button" data-v="'+a[0]+'" class="'+(a[0]==c?'is-on':'')+'">'+a[1]+'</button>').join('')+'</div>';
  const num=(id,l,v,m,s,cls)=>'<div class="field '+(cls||'')+'"><label for="'+id+'">'+l+'</label><input type="text" inputmode="numeric" pattern="[0-9]*" id="'+id+'" min="'+m+'" value="'+v+'">'+(s?'<small>'+s+'</small>':'')+'</div>';
  const lab=['Thăng cấp 1: '+nm[0]+' → '+nm[1],'Thăng cấp 2: '+nm[1]+' → '+nm[2],'Thăng cấp 3: '+nm[2]+' → '+nm[3],'Mỗi ★ sau '+nm[3]];
  return '<div class="f" id="fform" data-kind="'+x.kind+'"><h2 class="h-date">'+(x.id?'Sửa':'Thêm')+' thói quen</h2>'+
  '<div class="fcard"><h3 class="fsec">Thông tin</h3><div class="field"><label for="f-name">Tên</label><input type="text" id="f-name" maxlength="40" value="'+esc(x.name)+'"></div>'+
  '<div class="field"><label for="f-desc">Mô tả (tuỳ chọn)</label><textarea id="f-desc" rows="3" placeholder="Ghi chú về thói quen này…">'+esc(x.desc||'')+'</textarea></div>'+
  '<div class="field" style="margin:0"><label>Biểu tượng</label><div class="icon-grid">'+HICONS.map(i=>'<button type="button" data-ic="'+i+'" class="'+(i===x.icon?'is-on':'')+'">'+ic(i)+'</button>').join('')+'</div></div></div>'+
  '<div class="fcard"><h3 class="fsec">Cách ghi nhận</h3>'+seg('kind',[['count','Đếm lần'],['amount','Theo lượng']],x.kind)+
  '<div class="g2" style="margin-top:12px"><div class="field"><label for="f-unit">Đơn vị</label><input type="text" id="f-unit" maxlength="12" placeholder="lần, ml, trang…" value="'+esc(x.unit)+'"></div>'+num('f-step','Cộng nhanh',x.step,1,'','only-amount')+'</div>'+
  num('f-goal','Mục tiêu mỗi ngày',x.goal,0,'Nhập 0 = không đặt mục tiêu (làm 1 lần là xong, không giới hạn số lượng)')+'</div>'+
  '<div class="fcard"><h3 class="fsec">Cách tính điểm</h3>'+seg('mode',[['log','Mỗi lần'],['day','Mỗi ngày'],['amount','Theo lượng']],x.mode)+
  '<small class="hint">Mỗi lần: 1 lần ghi nhận = 1 điểm. Mỗi ngày: đạt mục tiêu = 1 điểm. Theo lượng: điểm bằng tổng lượng.</small>'+
  '<div style="margin-top:12px">'+num('f-limit','Điểm tối đa mỗi ngày',x.limit,0,'Nhập 0 = không giới hạn')+'</div></div>'+
  '<details class="fcard xpd"><summary><span>Điểm cần thăng cấp</span><small>'+esc(nm[0])+' → '+esc(nm[11])+'</small>'+ic('ui-down','s')+'</summary>'+
  '<div class="qf"><div class="field"><label for="f-fb">Cấp đầu</label><input type="text" inputmode="numeric" pattern="[0-9]*" id="f-fb" min="1" value="'+L[0]+'"></div><div class="field"><label for="f-fi">Mỗi cấp thêm</label><input type="text" inputmode="numeric" pattern="[0-9]*" id="f-fi" min="0" value="'+Math.max(0,L[1]-L[0])+'"></div><button type="button" class="btn" data-fill>Điền nhanh</button></div>'+
  L.map((v,i)=>'<div class="lr2"><label for="f-l'+i+'">'+(i<11?esc(nm[i])+' → '+esc(nm[i+1]):'Mỗi ★ sau '+esc(nm[11]))+'</label><input class="lvin" type="text" inputmode="numeric" pattern="[0-9]*" id="f-l'+i+'" min="1" value="'+v+'"></div>').join('')+
  '<small class="hint"><a href="#" data-th2>Chế độ thử hiệu ứng: đặt tất cả = 2</a></small></details>'+
  '<div class="fsave"><button class="btn btn-primary" data-save="'+(x.id||'')+'" style="width:100%">Lưu</button></div></div>'}
