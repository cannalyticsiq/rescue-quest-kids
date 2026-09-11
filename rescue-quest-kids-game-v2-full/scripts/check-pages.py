from pathlib import Path
import re, json, sys
root=Path(__file__).resolve().parents[1]; errors=[]
required=['index.html','styles/main.css','src/app.js','src/api.js','src/store.js','src/puzzles.js','src/game.js','data/content.json','assets/characters/dino/idle.svg','assets/ui/pumpkin.svg']
for rel in required:
    if not (root/rel).exists(): errors.append('Missing: '+rel)
html=(root/'index.html').read_text()
for p in re.findall(r'(?:href|src)=["\']([^"\']+)["\']',html):
    if p.startswith(('http://','https://','#','data:')): continue
    if not (root/p.lstrip('./')).exists(): errors.append('Broken HTML reference: '+p)
d=json.loads((root/'data/content.json').read_text())
for it in d.get('inventory',[]):
    p=it.get('icon','')
    if p.startswith('./') and not (root/p[2:]).exists(): errors.append('Missing inventory icon: '+p)
print('PASS: v2 structure valid for GitHub Pages.' if not errors else 'FAILED\n- '+'\n- '.join(errors))
sys.exit(bool(errors))
