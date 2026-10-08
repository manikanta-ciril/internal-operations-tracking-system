import sys
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

tree = ET.parse('codex-design/new_final-version.drawio')
root = tree.getroot()

print("=== ELEMENTS BELOW Y=3160 ===")
below = []
for cell in root.iter('mxCell'):
    geo = cell.find('mxGeometry')
    if geo is not None and geo.get('y') is not None:
        y = float(geo.get('y'))
        parent = cell.get('parent')
        cid = cell.get('id')
        val = cell.get('value', '').replace('\n', ' ')[:40]
        if y >= 3160:
            below.append((y, parent, cid, float(geo.get('x',0)), float(geo.get('width',0)), float(geo.get('height',0)), val))

below.sort()
print(f"Total elements with y >= 3160: {len(below)}")
# Group by Y ranges
ranges = {}
for y, p, cid, x, w, h, val in below:
    bucket = int(y // 500) * 500
    ranges.setdefault(bucket, []).append((y, p, cid, x, w, h, val))

for bucket, items in sorted(ranges.items()):
    print(f"\nBucket {bucket} - {bucket+499} ({len(items)} cells):")
    for y, p, cid, x, w, h, val in items[:5]:
        print(f"  y={y:6.1f} x={x:6.1f} w={w:6.1f} h={h:6.1f} [{cid}] parent={p} | {val}")
    if len(items) > 5:
        print(f"  ... and {len(items)-5} more cells")
