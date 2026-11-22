import re

text2 = """SAMPLE DOCUMENT — FOR PROJECT DEMONSTRATION ONLY
PUBLIC NOTICE
Merit Scholarship Application – Demonstration Notice
Notice ID
DEMO-SCH-2026-014
Issue Date
18 November 2026
"""

m = re.search(r'\bnotice\s*(?:id|no|number|ref)\b[\s:=-]*\n?([A-Za-z0-9_\-/\.]+)', text2, re.IGNORECASE)
print("Matched with word boundary:", m.groups() if m else None)

text1 = """Notice ID: HMWSSB/OM/2026/W-842
Notice Date: 18 November 2026
Application Deadline / Action Date: 2026-11-20
"""
m1 = re.search(r'\bnotice\s*(?:id|no|number|ref)\b[\s:=-]*\n?([A-Za-z0-9_\-/\.]+)', text1, re.IGNORECASE)
print("Matched text1:", m1.groups() if m1 else None)

dm1 = re.search(r'\b(?:application\s*deadline|last date|due date|deadline)\b[\s:=-]*(?:/\s*action\s*date\s*[:=\-]*)?\n?([^\n\r]+)', text1, re.IGNORECASE)
print("Deadline text1:", dm1.groups() if dm1 else None)
