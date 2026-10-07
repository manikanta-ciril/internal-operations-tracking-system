import xml.etree.ElementTree as ET
import base64
import zlib
from urllib.parse import unquote, quote

tree = ET.parse('gemini-design/file.drawio')
root = tree.getroot()

for diagram in root.findall('diagram'):
    content = diagram.text
    if content and not diagram.find('mxGraphModel'):
        decoded = base64.b64decode(content)
        decompressed = zlib.decompress(decoded, -15)
        xml_str = unquote(decompressed.decode('utf-8'))
        
        # Replace the text with the actual uncompressed xml elements
        diagram.text = ""
        model_element = ET.fromstring(xml_str)
        diagram.append(model_element)

tree.write('gemini-design/decompressed.xml', encoding='utf-8', xml_declaration=True)
print("Decompressed to decompressed.xml")
