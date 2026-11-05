from lib import G
import json
pal=dict(K='#3a2414',sh='#fff1d6',sh2='#e9d3ae',sh3='#ffffff',on='#ffe08a',on2='#ffc94a',on3='#fff7d6',bu='#fffbe6',br='#c9a046',br2='#9a7a2c',br3='#e8c870',fr='#e08aa0')
def paths(g): return ''.join(f'<path fill="{pal[k]}" d="{"".join(v)}"/>' for k,v in g.paths().items())
def lamp(lit):
    g=G(16,46)
    a,b,c=('on','on2','on3') if lit else ('sh','sh2','sh3')
    g.poly([(4,0),(12,0),(15.5,12),(0.5,12)],a)
    for x in range(1,15):
        g.put(x,11,b)
    for y in range(1,11): g.put(4+y//4,y,c)
    for x in range(2,14,3): g.put(x,12,'fr')
    g.rect(7,13,8,42,'br'); g.rect(8,13,8,42,'br2'); g.rect(7,13,7,42,'br3')
    g.rect(3,43,12,44,'br'); g.rect(4,43,11,43,'br3'); g.rect(3,45,12,45,'br2')
    if lit: g.rect(6,12,9,13,'bu')
    g.outline('K')
    return g
P=json.load(open('props.json'))
P['lamp_off']=dict(svg=paths(lamp(False)),w=16,h=46); P['lamp_on']=dict(svg=paths(lamp(True)),w=16,h=46)
json.dump(P,open('props.json','w')); print('ok', list(P))
