"""Side-by-side crops of the reference against this project's full-page screenshots.
usage: python3 scripts/compare.py <reference.png> <project.png> <label> [scale]
Regions are in reference page coordinates; the project shot is cropped at the same y unless an offset map is provided.
"""
import sys
from PIL import Image, ImageDraw

ref_p, project_p, label = sys.argv[1], sys.argv[2], sys.argv[3]
scale = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
ref = Image.open(ref_p).convert("RGB")
project = Image.open(project_p).convert("RGB")
W = min(ref.width, project.width)

REGIONS = {
  "desktop": [("01-nav-hero", 0, 900), ("02-about-ticker", 1380, 2100), ("03-projects", 2100, 3150), ("04-services", 3150, 4500),
              ("05-expertise", 4500, 5400), ("06-process", 5400, 6080), ("07-reviews", 6060, 6850), ("08-cta", 6850, 7540),
              ("09-contact", 7540, 8400), ("10-footer-top", 8400, 9100), ("11-footer-bottom", 9000, 9814)],
  "mobile": [("01-nav-hero", 0, 900), ("02-about", 880, 1560), ("03-projects", 1500, 3000), ("04-services", 3000, 3850), ("05-expertise", 3850, 4700),
             ("06-process", 4700, 6200), ("07-reviews", 6200, 6980), ("08-cta-contact", 6980, 8250), ("09-footer", 8250, 9068)],
  "tablet": [("01-nav-hero", 0, 1060), ("02-about", 1050, 1650), ("03-projects", 1640, 3120), ("04-services", 3100, 3950), ("05-expertise", 3950, 4800),
             ("06-process", 4800, 6300), ("07-reviews", 6300, 7000), ("08-cta-contact", 7000, 8250), ("09-footer", 8250, 9166)],
}[label]

for name, y0, y1 in REGIONS:
    h = y1 - y0
    a = ref.crop((0, y0, W, min(y1, ref.height)))
    b = project.crop((0, y0, W, min(y1, project.height)))
    a = a.resize((int(W * scale), int(a.height * scale)), Image.LANCZOS)
    b = b.resize((int(W * scale), int(b.height * scale)), Image.LANCZOS)
    out = Image.new("RGB", (a.width + b.width + 8, max(a.height, b.height) + 20), (255, 0, 0))
    out.paste(a, (0, 20)); out.paste(b, (a.width + 8, 20))
    d = ImageDraw.Draw(out)
    d.rectangle((0, 0, out.width, 20), fill=(30, 30, 30))
    d.text((6, 4), f"ORIGINAL  y={y0}-{y1}", fill=(255, 255, 255))
    d.text((a.width + 14, 4), f"project  ({label})", fill=(255, 255, 255))
    out.save(f"docs/design-references/compare/{label}-{name}.png")
    print("wrote", name, out.size)
