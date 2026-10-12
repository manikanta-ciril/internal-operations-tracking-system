import sys
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

tree = ET.parse('codex-design/new_final-version.drawio')
root = tree.getroot()

for cid in ['new-360', 'new-361', 'new-362', 'new-363', 'new-393', 'new-406', 'new-420']:
    c = root.find(f'.//mxCell[@id="{cid}"]')
    if c is not None:
        print(f"[{cid}] style={c.get('style')} val={c.get('value','')[:40]}")
