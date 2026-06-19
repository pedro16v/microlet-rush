#!/usr/bin/env python3
"""Optimize Microlet Rush sprite assets.

The source art in sprites/ is 1024x1024 (mostly RGB, no alpha) but is rendered
at 32-128px in-game, so the originals are ~20x larger than needed and the
opaque-background sprites render as boxes. This script writes downscaled,
recompressed copies into sprites/opt/ (mirroring the source layout) and, for
sprite-like assets with a uniform background, keys that background out to alpha.

Originals are never modified. Re-run after updating source art:

    python tools/optimize-assets.py

Requires Pillow (pip install Pillow).
"""

import os
from collections import deque
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "sprites")
OUT = os.path.join(ROOT, "sprites", "opt")

# target size + whether to attempt background->alpha keying, per relative path
SPRITES = {
    "microlets/silver_omega.png":   (256, 256, True),
    "microlets/esperansa.png":      (256, 256, True),
    "microlets/kuitadu.png":        (256, 256, True),
    "microlets/realize_dream.png":  (256, 256, True),
    "obstacles/pothole.png":        (128, 128, True),
    "obstacles/yellow_taxi.png":    (128, 128, True),
    "pickups/coin.png":             (96, 96, True),
    "pickups/fuel.png":             (96, 96, True),
    "pickups/passenger.png":        (96, 96, True),
}

# full-bleed parallax layers: downscale, keep tileable, no keying.
# saved as JPEG (no alpha needed) for much smaller photographic compression.
BACKGROUNDS = {
    "background/sky.jpg":       ("background/sky.png", 1024, 512),
    "background/mountains.jpg": ("background/mountains.png", 1024, 512),
    "background/buildings.jpg": ("background/buildings.png", 900, 300),
    "background/roadside.jpg":  ("background/roadside.png", 1024, 512),
    "background/road.jpg":      ("background/road.png", 1024, 512),
}
JPEG_QUALITY = 82

KEY_TOLERANCE = 42  # max RGB euclidean distance treated as "same as background"


def color_dist(a, b):
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def key_background(img):
    """Flood-fill from the borders, turning background-colored pixels transparent.

    Edge flood-fill (not a global color key) so we never punch holes in interior
    pixels that happen to match the background color. Returns (rgba_image, applied).
    """
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()

    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    # if corners disagree a lot, the background isn't uniform -> skip keying
    for i in range(len(corners)):
        for j in range(i + 1, len(corners)):
            if color_dist(corners[i], corners[j]) > KEY_TOLERANCE:
                return img, False

    bg = corners[0]
    visited = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            q.append((x, y))

    cleared = 0
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        idx = y * w + x
        if visited[idx]:
            continue
        visited[idx] = 1
        r, g, b, a = px[x, y]
        if color_dist((r, g, b), bg) <= KEY_TOLERANCE:
            px[x, y] = (r, g, b, 0)
            cleared += 1
            q.append((x + 1, y))
            q.append((x - 1, y))
            q.append((x, y + 1))
            q.append((x, y - 1))

    # require a meaningful chunk removed, else treat as "no real background"
    applied = cleared > (w * h) * 0.02
    return img, applied


def process(src_rel, out_rel, size, do_key):
    src_path = os.path.join(SRC, src_rel)
    out_path = os.path.join(OUT, out_rel)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img = Image.open(src_path)
    before = os.path.getsize(src_path)
    img = img.resize(size, Image.LANCZOS)
    keyed = False
    if do_key:
        img, keyed = key_background(img)
        img.save(out_path, "PNG", optimize=True)
    else:
        img.convert("RGB").save(out_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
    after = os.path.getsize(out_path)
    print(
        f"  {out_rel:34s} {size[0]}x{size[1]:<5d} "
        f"{before/1024:7.0f}KB -> {after/1024:6.0f}KB"
        f"{'  [keyed]' if keyed else ''}"
    )
    return before, after


def main():
    print("Optimizing sprites ->", os.path.relpath(OUT, ROOT))
    tot_before = tot_after = 0
    for rel, (w, h, key) in SPRITES.items():
        b, a = process(rel, rel, (w, h), key)
        tot_before += b
        tot_after += a
    for out_rel, (src_rel, w, h) in BACKGROUNDS.items():
        b, a = process(src_rel, out_rel, (w, h), False)
        tot_before += b
        tot_after += a
    print(f"Total: {tot_before/1024/1024:.1f}MB -> {tot_after/1024/1024:.2f}MB")


if __name__ == "__main__":
    main()
