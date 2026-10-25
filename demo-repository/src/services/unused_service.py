"""
Legacy analytics reporting service.
No longer utilized after v2 migration.
"""

def generate_legacy_xml_report(data):
    xml = "<report>"
    for k, v in data.items():
        xml += f"<{k}>{v}</{k}>"
    xml += "</report>"
    return xml
