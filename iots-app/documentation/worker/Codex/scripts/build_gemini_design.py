import xml.etree.ElementTree as ET

# Canvas configuration
CANVAS_WIDTH = 5200
CANVAS_HEIGHT = 7600

root = ET.Element('mxfile', host="Electron", pages="1")
diagram = ET.SubElement(root, 'diagram', id="gemini-iots-architecture", name="CIRIL IOTS — Complete Operational Architecture")
model = ET.SubElement(diagram, 'mxGraphModel', 
                      dx="3024", dy="1456", grid="1", gridSize="10", 
                      guides="1", tooltips="1", connect="1", arrows="1", 
                      fold="1", page="1", pageScale="1", 
                      pageWidth=str(CANVAS_WIDTH), pageHeight=str(CANVAS_HEIGHT), 
                      background="#FFFFFF", math="0", shadow="0")
mxroot = ET.SubElement(model, 'root')

ET.SubElement(mxroot, 'mxCell', id="0")
ET.SubElement(mxroot, 'mxCell', id="1", parent="0")

edge_counter = 1

def add_vertex(cid, label, style, parent, x, y, w, h):
    cell = ET.Element('mxCell', id=cid, value=label, style=style, parent=parent, vertex="1")
    geom = ET.SubElement(cell, 'mxGeometry', x=str(x), y=str(y), width=str(w), height=str(h))
    geom.set('as', 'geometry')
    mxroot.append(cell)
    return cell

def add_edge(source, target, label="", style=None, parent="1", exitX=None, exitY=None, entryX=None, entryY=None):
    global edge_counter
    cid = f"edge_{edge_counter}"
    edge_counter += 1
    if style is None:
        style = "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;fontFamily=Segoe UI, Arial;fontSize=11;strokeColor=#4A5568;strokeWidth=1.5;labelBackgroundColor=#FFFFFF;"
    if exitX is not None and exitY is not None:
        style += f"exitX={exitX};exitY={exitY};"
    if entryX is not None and entryY is not None:
        style += f"entryX={entryX};entryY={entryY};"
        
    cell = ET.Element('mxCell', id=cid, value=label, style=style, parent=parent, edge="1", source=source, target=target)
    geom = ET.SubElement(cell, 'mxGeometry', relative="1")
    geom.set('as', 'geometry')
    mxroot.append(cell)
    return cell

# Style helpers
FONT_BASE = "fontFamily=Segoe UI, -apple-system, Roboto, Helvetica, Arial, sans-serif;"

def banner_style(fill, text_color="#FFFFFF", font_size=18):
    return f"rounded=1;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={fill};fontColor={text_color};fontSize={font_size};fontStyle=1;align=center;verticalAlign=middle;{FONT_BASE}"

def card_style(fill, stroke, font_color="#1A202C", font_size=12, bold=False):
    style = f"rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};fontColor={font_color};fontSize={font_size};spacing=8;strokeWidth=1.5;{FONT_BASE}"
    if bold:
        style += "fontStyle=1;"
    return style

def diamond_style(fill, stroke, font_color="#1A202C"):
    return f"rhombus;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};fontColor={font_color};fontSize=12;fontStyle=1;spacing=6;strokeWidth=1.5;{FONT_BASE}"

def container_style(fill, stroke, title_color="#FFFFFF", title_fill="#1A365D", start_size=40):
    return f"swimlane;startSize={start_size};rounded=1;arcSize=8;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};fontColor={title_color};fontSize=14;fontStyle=1;swimlaneFillColor={fill};swimlaneLine=0;strokeWidth=2;{FONT_BASE}"

def cylinder_style(fill, stroke, font_color="#FFFFFF"):
    return f"shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor={fill};strokeColor={stroke};fontColor={font_color};fontSize=13;fontStyle=1;{FONT_BASE}"

print("Building Gemini-designed IOTS Master Architecture...")
