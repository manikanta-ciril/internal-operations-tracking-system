import xml.etree.ElementTree as ET
import base64
import zlib
from urllib.parse import quote

tree = ET.parse('gemini-design/decompressed.xml')
root = tree.getroot()

# Let's modify Diagram 0 and Diagram 1
for diagram in root.findall('diagram'):
    model = diagram.find('mxGraphModel')
    if model is not None:
        mxroot = model.find('root')
        
        # 1. Modify "Decide User Role" to "Determine Authorized Role / Workspace Context"
        for cell in mxroot.findall('mxCell'):
            if cell.get('value') == 'Decide User Role':
                cell.set('value', 'Determine Authorized Role(s) <br>&amp; Workspace Context Switcher')
                
                # We need to ensure html=1 is in the style
                style = cell.get('style', '')
                if 'html=1' not in style:
                    cell.set('style', style + ';html=1')
                
                # Increase size a bit to fit the text
                geom = cell.find('mxGeometry')
                if geom is not None:
                    geom.set('width', '180')
                    geom.set('height', '130')
                    # Center it by adjusting x slightly
                    x = float(geom.get('x'))
                    geom.set('x', str(x - 25))
                    
        # 2. Modify the labels on the edges that go out of "Decide User Role"
        # The edges themselves don't have the text, the text is on a child cell representing the label
        # We need to find cells with value like "(User: Admin)", "(User: Manager)", "(User: Employee)"
        for cell in mxroot.findall('mxCell'):
            val = cell.get('value', '')
            if '(User: Admin)' in val:
                cell.set('value', '<b>Administrative Workspace</b><br><i>Roles: Super Admin, Admin, IT System Analyst</i>')
                geom = cell.find('mxGeometry')
                if geom is not None:
                    geom.set('y', '30') # give it some space
            elif '(User: Manager)' in val:
                cell.set('value', '<b>Management Workspace</b><br><i>Roles: Chairman, Senior Mgr, General Mgr, Lead Mgr</i>')
                geom = cell.find('mxGeometry')
                if geom is not None:
                    geom.set('y', '30')
            elif '(User: Employee)' in val:
                cell.set('value', '<b>Execution Workspace</b><br><i>Roles: Executive, BDE, Creatives Comm Assoc</i>')
                geom = cell.find('mxGeometry')
                if geom is not None:
                    geom.set('y', '30')

# Also, the prompt asks to add an Intelligence and Analytics Layer at the end
# We can add a large box at the bottom to represent this
        # Find the max Y in the diagram to place the new layer below everything
        max_y = 0
        for cell in mxroot.findall('mxCell'):
            geom = cell.find('mxGeometry')
            if geom is not None and geom.get('y'):
                try:
                    y = float(geom.get('y'))
                    if y > max_y: max_y = y
                except ValueError:
                    pass
        
        # Add a new block for Intelligence & Analytics
        new_y = max_y + 200
        layer_cell = ET.Element('mxCell', id=f"analytics_layer_{diagram.get('id')}", value="<b style='font-size: 18px;'>Intelligence &amp; Analytical Layer</b><br><br>Converts Operational Records into Analytics, Reports, Performance Metrics, Workload Intelligence, &amp; Executive Overviews", style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;", parent="1", vertex="1")
        geom = ET.Element('mxGeometry', x="-400", y=str(new_y), width="1800", height="150", as_="geometry")
        geom.set('as', 'geometry')
        layer_cell.append(geom)
        mxroot.append(layer_cell)

tree.write('gemini-design/file.drawio', encoding='utf-8', xml_declaration=True)
print("Updated file.drawio (uncompressed)")
