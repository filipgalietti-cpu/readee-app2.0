"""Build a checksummed release directory from the approved unit, including shared references.
No uploads. Run from the integration root. Source public files remain untouched.
"""
from pathlib import Path
import re,json,hashlib,shutil
root=Path.cwd(); public=root/'public'; out=root/'release-assets/k-unit-one'; out.mkdir(parents=True,exist_ok=True)
packages=['rhyme-time','pips-tree','syllable-beats','book-makers','letter-pairs','book-basics','big-kid-words','story-kinds','k-unit-1-checkpoint','audio']
files=set(); missing=set()
for package in packages:
 files.update(p for p in (public/'lesson-studio'/package).rglob('*') if p.is_file() and p.suffix in ['.mp3','.wav','.webp','.png','.jpg','.svg','.json','.ogg'])
# Shared app icons are referenced by name in JSX.
for directory in ['icons/fluent','images/ui','emojis/black']:
 files.update(p for p in (public/directory).rglob('*') if p.is_file())
source=json.loads((root/'docs/integration/imported-unit-one.json').read_text())['files']
source=[root/(f.replace('app/demo/lesson-studio/','app/components/approved-unit/lessons/')) for f in source]
seen=set()
def refs(p):
 if p in seen or not p.exists() or p.suffix not in ['.ts','.tsx','.css','.json']:return
 seen.add(p)
 for name in re.findall(r'''["'`(](/(?:lesson-studio|icons|emojis|images)/[^"'`\s){}$]+\.(?:mp3|wav|webp|png|jpg|svg|json|ogg))''',p.read_text()):
  asset=public/name.lstrip('/')
  if asset.is_file():files.add(asset)
  elif name.startswith('/lesson-studio/'):missing.add(name)
for p in source:refs(p)
while True:
 before=len(files)
 for p in list(files):refs(p)
 if len(files)==before:break
manifest=[]
for p in sorted(files):
 rel=p.relative_to(public);dest=out/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
 manifest.append({'path':'/'+str(rel),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
report={'files':len(manifest),'bytes':sum(p['bytes'] for p in manifest),'missingReferences':sorted(missing),'assets':manifest}
(root/'docs/integration/unit-one-assets.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k!='assets'},indent=2))
