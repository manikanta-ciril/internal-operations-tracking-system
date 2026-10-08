import sys
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

tree = ET.parse('codex-design/new_final-version.drawio')
root = tree.getroot()

for model in root.iter('mxGraphModel'):
    print("mxGraphModel attribs:", model.attrib)

layer2 = root.find('.//mxCell[@id="layer2"]')
print("layer2 geometry:", layer2.find('mxGeometry').attrib)

diagram = root.find('.//diagram')
print("diagram attribs:", diagram.attrib)
