import sys
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

tree = ET.parse('codex-design/new_final-version.drawio')
root = tree.getroot()

edges = []
for cell in root.iter('mxCell'):
    if cell.get('edge') == '1':
        src = cell.get('source')
        tgt = cell.get('target')
        edges.append((cell.get('id'), src, tgt, cell.get('value', '')))

print(f"Total edges in diagram: {len(edges)}")
