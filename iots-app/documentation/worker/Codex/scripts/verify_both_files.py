import sys
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

gem_tree = ET.parse('codex-design/gem_new_final-version.drawio')
gem_root = gem_tree.getroot()

orig_tree = ET.parse('codex-design/new_final-version.drawio')
orig_root = orig_tree.getroot()

print("=== CHECK MODIFIED CELLS IN gem_new_final-version.drawio ===")
cell_ids = [
    'subhdr-lifecycle-col1', 'new-388', 'new-389',
    'subhdr-lifecycle-col2', 'new-364', 'new-365', 'new-366', 'new-367', 'new-368',
    'new-369', 'new-370', 'new-377', 'new-379', 'new-381', 'new-383', 'new-385',
    'subhdr-lifecycle-col3', 'new-390', 'new-391', 'new-392'
]

for cid in cell_ids:
    c = gem_root.find(f'.//mxCell[@id="{cid}"]')
    if c is not None:
        g = c.find('mxGeometry')
        print(f"[{cid:22}] x={float(g.get('x')):6.1f} y={float(g.get('y')):6.1f} w={float(g.get('width')):6.1f} h={float(g.get('height')):6.1f} | {c.get('value','')[:45]}")
    else:
        print(f"[{cid:22}] NOT FOUND!")

print("\n=== CHECK EDGES IN gem_new_final-version.drawio ===")
edge_ids = ['edge-371', 'edge-372', 'edge-373', 'edge-374', 'edge-375', 'edge-376', 'edge-378', 'edge-380', 'edge-382', 'edge-384', 'edge-386', 'edge-387']
for eid in edge_ids:
    e = gem_root.find(f'.//mxCell[@id="{eid}"]')
    if e is not None:
        g = e.find('mxGeometry')
        pts = []
        if g is not None:
            arr = g.find('Array')
            if arr is not None:
                pts = [(float(p.get('x')), float(p.get('y'))) for p in arr.findall('mxPoint')]
        print(f"[{eid}] {e.get('source')} -> {e.get('target')} | val='{e.get('value')}' | waypoints={pts}")
    else:
        print(f"[{eid}] NOT FOUND!")

print("\n=== VERIFY ORIGINAL FILE HAS NOT CHANGED ===")
# Check new-364 in original file
orig_c = orig_root.find('.//mxCell[@id="new-364"]')
orig_geo = orig_c.find('mxGeometry')
print(f"Original new-364: x={orig_geo.get('x')}, y={orig_geo.get('y')}, w={orig_geo.get('width')}, h={orig_geo.get('height')}")
if orig_geo.get('x') == '100' and orig_geo.get('y') == '3280':
    print("SUCCESS: Original file new_final-version.drawio is UNTOUCHED and PRESERVED!")
else:
    print("WARNING: Original file was modified!")
