#!/usr/bin/env python3
"""Key the white background out of an illustrated scene and size it as an email banner.
   python3 scripts/email-banner.py "<source png>" <key>   ->  public/images/email/banner-<key>.png (1500x750, 2:1)
   White connected to the border becomes transparent; white inside outlines (fur, eyes) stays."""
import sys
from collections import deque
from PIL import Image, ImageFilter
src, key = sys.argv[1], sys.argv[2]
ratio = float(sys.argv[3]) if len(sys.argv) > 3 else 2.0
# "top": seed the key only from the top edge and the upper halves of the sides, for scenes where
# white characters are cut off by the bottom edge (an audience seen from behind, for example).
seed_mode = sys.argv[4] if len(sys.argv) > 4 else "all"
im = Image.open(src).convert("RGBA"); w, h = im.size; px = im.load()
white = lambda p: p[0] > 235 and p[1] > 235 and p[2] > 235
seen = [[False] * w for _ in range(h)]; q = deque()
rows = (0,) if seed_mode == "top" else (0, h - 1)
side_limit = h // 2 if seed_mode == "top" else h
for x in range(w):
    for y in rows:
        if white(px[x, y]) and not seen[y][x]: seen[y][x] = True; q.append((x, y))
for y in range(side_limit):
    for x in (0, w - 1):
        if white(px[x, y]) and not seen[y][x]: seen[y][x] = True; q.append((x, y))
while q:
    x, y = q.popleft(); px[x, y] = (255, 255, 255, 0)
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and white(px[nx, ny]): seen[ny][nx] = True; q.append((nx, ny))
a = im.split()[3]; im.putalpha(Image.blend(a, a.filter(ImageFilter.MinFilter(3)), 0.5))
im = im.crop(im.getbbox())
W = max(im.width, int(im.height * ratio)); H = int(W / ratio)
canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0)); canvas.paste(im, ((W - im.width) // 2, (H - im.height) // 2), im)
out = f"public/images/email/banner-{key}.png"
canvas.resize((1500, int(1500 / ratio)), Image.LANCZOS).save(out)
print(out, canvas.size, "corner alpha", canvas.getpixel((0, 0))[3])
