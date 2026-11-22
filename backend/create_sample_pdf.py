import fitz  # PyMuPDF

doc = fitz.open()
page = doc.new_page()

text = """GOVERNMENT OF TELANGANA
HYDERABAD METROPOLITAN WATER SUPPLY & SEWERAGE BOARD (HMWSSB)
OFFICIAL PUBLIC NOTICE - WATER DISRUPTION ADVISORY

Notice ID: HMWSSB/OM/2026/W-842
Notice Date: 18 November 2026
Department: Hyderabad Metropolitan Water Supply & Sewerage Board

SUBJECT: EMERGENCY 24-HOUR DRINKING WATER SUPPLY INTERRUPTION AT KUKATPALLY

It is hereby informed to the general public that urgent pipeline repair work on the Krishna Phase-III 1200mm diameter transmission feeder is scheduled at JNTU Junction, Kukatpally.

Consequently, drinking water supply will remain completely suspended in Kukatpally, KPHB Colony Phase 1 to 9, and Miyapur zones from 06:00 AM on 20th November 2026 to 06:00 AM on 21st November 2026.

Category: Water & Power
Location: Kukatpally, Miyapur, Hyderabad
Notice Type: Water Supply Interruption
Urgency: HIGH
Start Date: 2026-11-20
End Date: 2026-11-21
Application Deadline / Action Date: 2026-11-20

RECOMMENDED CITIZEN ACTION:
Residents are strictly advised to store sufficient water in advance. Free municipal water tankers can be booked via Toll-Free Helpline: 155313.

By Order,
Chief General Manager (Engineering)
Hyderabad Metropolitan Water Supply & Sewerage Board (HMWSSB)
"""

page.insert_text((50, 72), text, fontsize=11)
doc.save("C:\\NxtWave\\sample_public_notice_demo.pdf")
doc.close()
print("Sample PDF created successfully at C:\\NxtWave\\sample_public_notice_demo.pdf")
