import sys, json, os
W='/home/claude/sudoku-repo/assets-neu/minispiel-obstsalat/werkzeug'
sys.path.insert(0, W)
from obstsalat_assets import uri, SP
from px_lite import render
from PIL import Image
H = json.load(open(SP + 'ham2.json')); a = H['art']; s = H['size']
def r(k): w, h = s[k]; return render(a[k], w, h)
faces = {'greifen': ['body', 'ears_up', 'eyes_look_l', 'mouth_open', 'nose', 'whisk0', 'paws_side_l'],
         'kauen': ['body', 'cheeks_s', 'ears_up', 'eyes_happy', 'mouth_chew', 'nose', 'whisk0', 'paws_hold'],
         'backen': ['body', 'cheeks_l', 'ears_up', 'eyes_happy', 'mouth_chew', 'nose', 'whisk1', 'paws_down', 'blush']}
out = {}; ims = []
for n, ls in faces.items():
    im = Image.new('RGBA', (48, 46))
    for k in ls: im.alpha_composite(r(k))
    out[n] = uri(im); ims.append(im)
json.dump(out, open('naschen.json', 'w'))
c = Image.new('RGBA', (150, 46), (150, 200, 130, 255))
for i, im in enumerate(ims): c.alpha_composite(im, (i * 50, 0))
c.resize((900, 276), Image.NEAREST).save('naschen.png')
