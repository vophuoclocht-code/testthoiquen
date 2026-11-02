# Tạo icon PNG từ logo (chạy: python3 gen_icons.py)
from PIL import Image, ImageDraw
SS=2; S=1024
hx=lambda h:tuple(int(h[i:i+2],16) for i in (1,3,5))
def lerp(st,t):
    t=max(0,min(1,t))
    for (a,ca),(b,cb) in zip(st,st[1:]):
        if t<=b:
            u=(t-a)/(b-a); return tuple(int(ca[i]+(cb[i]-ca[i])*u) for i in range(3))
    return st[-1][1]
def q(p0,c,p1,n=20): return [((1-t)**2*p0[0]+2*(1-t)*t*c[0]+t*t*p1[0],(1-t)**2*p0[1]+2*(1-t)*t*c[1]+t*t*p1[1]) for t in [i/n for i in range(n)]]
import math
def make(size,mk=False):
    k=.72 if mk else 1
    T=lambda x,y:((256+(x-256)*k)*SS,(256+(y-256)*k)*SS)
    bgs=[(0,hx('#3A0868')),(.55,hx('#7B1FA2')),(1,hx('#E65FDA'))]
    im=Image.new('RGB',(S,S)); px=im.load()
    for y in range(S):
        for x in range(S): px[x,y]=lerp(bgs,(x+y)/(2*S))
    def vg(y0,y1,st):
        g=Image.new('RGB',(S,S)); d=ImageDraw.Draw(g); a=T(0,y0)[1]; b=T(0,y1)[1]
        for y in range(S): d.line([(0,y),(S,y)],fill=lerp(st,(y-a)/(b-a)))
        return g
    def paint(fn,g):
        m=Image.new('L',(S,S),0); fn(ImageDraw.Draw(m)); im.paste(g,(0,0),m)
    ar=[(0,hx('#FF3D5A')),(.5,hx('#FFA24D')),(1,hx('#FFC4EA'))]
    def arcs(d):
        w=int(22*SS*k)
        for rx,ry in [(110,75),(160,112),(210,150)]:
            pts=[T(256+rx*math.cos(math.radians(t)),262+ry*math.sin(math.radians(t))) for t in [-30+i*(240/80) for i in range(81)]]
            d.line(pts,fill=255,width=w,joint='curve')
            for c in (pts[0],pts[-1]): d.ellipse([c[0]-w/2,c[1]-w/2,c[0]+w/2,c[1]+w/2],fill=255)
    paint(arcs,vg(225,412,ar))
    star=q((256,140),(264,214),(328,222))+q((328,222),(264,232),(256,305))+q((256,305),(248,232),(184,222))+q((184,222),(248,214),(256,140))
    def rh(cx,cy,ang,hl=38,hw=10):
        a=math.radians(ang); pts=[(0,-hl),(hw,0),(0,hl),(-hw,0)]
        return [T(cx+x*math.cos(a)-y*math.sin(a),cy+x*math.sin(a)+y*math.cos(a)) for x,y in pts]
    def shapes(d):
        d.polygon([T(*p) for p in star],fill=255)
        for a in (rh(256,78,0),rh(160,118,-40),rh(352,118,40)): d.polygon(a,fill=255)
    paint(shapes,vg(40,305,[(0,hx('#FFE9A8')),(1,hx('#FFB86B'))]))
    im=im.convert('RGBA')
    if not mk:
        m=Image.new('L',(S,S),0); ImageDraw.Draw(m).rounded_rectangle([0,0,S-1,S-1],radius=int(S*.22),fill=255); im.putalpha(m)
    return im.resize((size,size),Image.LANCZOS)
make(192).save('icons/icon-192.png'); make(512).save('icons/icon-512.png')
make(512,True).save('icons/maskable-512.png'); make(180,True).convert('RGB').save('icons/apple-touch-icon.png')
