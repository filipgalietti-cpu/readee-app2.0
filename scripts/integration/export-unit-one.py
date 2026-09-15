"""Export the clean release delta against its pinned production Git commit.
Run from the release worktree. Assets have their own manifest; no uploads or Git writes.
"""
from pathlib import Path
import subprocess, json, hashlib, shutil
root = Path.cwd()
base_commit = 'c0f77ed8aed5c3a0ae92e65e4b5171885ec8a591'
out = root.parent / (root.name + '-source-export')
def git(*args):
    return subprocess.check_output(['git', *args], cwd=root, stderr=subprocess.DEVNULL)
tracked = git('diff', '--name-only', '-z', base_commit).decode().split('\0')
untracked = git('ls-files', '--others', '--exclude-standard', '-z').decode().split('\0')
files = sorted({p for p in tracked + untracked if p and not p.startswith(('public/lesson-studio/', 'release-assets/', 'release-code/', 'docs/integration/'))})
entries = []
for name in files:
    path = root / name
    if not path.is_file() or path.is_symlink():
        raise RuntimeError(f'Unsupported deleted/symlink source: {name}')
    try:
        before = git('show', f'{base_commit}:{name}')
    except subprocess.CalledProcessError:
        before = None
    after = path.read_bytes()
    if before == after:
        continue
    destination = out / name
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, destination)
    entries.append({'path': name, 'beforeSha256': hashlib.sha256(before).hexdigest() if before is not None else None, 'afterSha256': hashlib.sha256(after).hexdigest(), 'bytes': len(after)})
manifest = {'baseCommit': base_commit, 'branch': git('branch', '--show-current').decode().strip(), 'warning': 'Clean production-main delta. Verify every before hash before applying. Assets and documentation are separate. Does not deploy or apply SQL.', 'files': entries}
(root / 'docs/integration/release-code-manifest.json').write_text(json.dumps(manifest, indent=2))
print(json.dumps({'files': len(entries), 'bytes': sum(e['bytes'] for e in entries)}))
