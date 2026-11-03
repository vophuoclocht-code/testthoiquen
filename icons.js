/* Bộ icon SVG tự vẽ – nét bo tròn, dày đều, dùng màu của chữ (currentColor) để hợp mọi nền */
(function(){
const P={
'ui-habits':'M12 3c.8 4.5 3 6.7 8 9-5 2.3-7.2 4.5-8 9-.8-4.5-3-6.7-8-9 5-2.3 7.2-4.5 8-9z',
'ui-manage':'M5 7h14M5 12h14M5 17h9',
'ui-history':'M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z',
'ui-stats':'M5 20V10M12 20V4M19 20v-7',
'ui-settings':'M4 8h10M18 8h2M4 16h2M10 16h10M16 6v4M8 14v4',
'ui-undo':'M9 7L4 12l5 5M4 12h10a6 6 0 010 8h-3',
'ui-up':'M6 15l6-6 6 6','ui-down':'M6 9l6 6 6-6','ui-top':'M6 5h12M6 17l6-6 6 6','ui-archive':'M4 7h16v4H4zM6 11v8h12v-8M10 15h4',
'ui-plus':'M12 5v14M5 12h14','ui-minus':'M5 12h14',
'ui-trash':'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13',
'ui-edit':'M4 20l4-1 11-11-3-3L5 16l-1 4z','ui-check':'M5 12l5 5 9-10',
'ui-flame':'M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z',
'ui-download':'M12 4v11M7 11l5 5 5-5M5 20h14','ui-upload':'M12 16V5M7 9l5-5 5 5M5 20h14',
'h-book':'M4 5h7v14H4zM13 5h7v14h-7z','h-meditate':'M12 5a2 2 0 100 .1M5 19c0-4 3-7 7-7s7 3 7 7z',
'h-moon':'M20 14A8 8 0 1110 4a7 7 0 0010 10z','h-gym':'M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12',
'h-water':'M12 3c4 5 6 8 6 11a6 6 0 01-12 0c0-3 2-6 6-11z','h-run':'M14 4a1.5 1.5 0 100 .1M8 20l3-6 3 2v4M11 14l-1-4 4-1 2 3',
'h-code':'M9 8l-4 4 4 4M15 8l4 4-4 4','h-heart':'M12 20s-7-4.5-7-10a4 4 0 017-2 4 4 0 017 2c0 5.500-7 10-7 10z',
'h-leaf':'M5 19c0-8 5-13 14-14 0 9-5 14-13 14zM5 19l7-7','h-sun':'M12 8a4 4 0 100 8 4 4 0 000-8M12 2v2M12 20v2M2 12h2M20 12h2',
'h-pen':'M4 20l4-1 11-11-3-3L5 16zM14 6l4 4','h-star':'M12 3c.8 4.5 3 6.7 8 9-5 2.3-7.2 4.5-8 9-.8-4.5-3-6.7-8-9 5-2.3 7.2-4.5 8-9z'};
window.HICONS=Object.keys(P).filter(k=>k[0]==='h');
let s='<defs><linearGradient id="gp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff2cf7"/><stop offset="1" stop-color="#6a14b8"/></linearGradient></defs>';
for(const k in P)s+='<symbol id="'+k+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="'+P[k]+'"/></symbol>';
document.getElementById('sprite').innerHTML=s;
})();
