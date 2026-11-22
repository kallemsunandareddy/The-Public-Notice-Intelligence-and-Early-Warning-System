from datetime import datetime, timedelta
from app.database import SessionLocal, Base, engine
from app.models import User, UserLocation, Notice, NotificationRecord
from app.core.auth import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(User).count() > 0:
        db.close()
        return

    print("Seeding initial civic data, demonstration notices and users...")
    
    # 1. Admin User
    admin = User(
        email="admin@smartcity.gov.in",
        hashed_password=get_password_hash("admin123"),
        full_name="Dr. K. S. Rao (Chief Information Officer)",
        role="admin",
        phone="+91 98765 43210",
        preferred_language="en"
    )
    db.add(admin)

    # 2. Citizen Users
    citizen1 = User(
        email="citizen@hyderabad.in",
        hashed_password=get_password_hash("citizen123"),
        full_name="Rajesh Sharma",
        role="citizen",
        phone="+91 91234 56789",
        preferred_language="te"
    )
    db.add(citizen1)
    
    citizen2 = User(
        email="ananya.p@gmail.com",
        hashed_password=get_password_hash("citizen123"),
        full_name="Ananya Patel",
        role="citizen",
        phone="+91 99887 76655",
        preferred_language="hi"
    )
    db.add(citizen2)
    db.commit()

    # User Locations
    loc1 = UserLocation(user_id=citizen1.id, state="Telangana", district="Hyderabad", city="Hyderabad", locality="Kukatpally")
    loc2 = UserLocation(user_id=citizen1.id, state="Telangana", district="Hyderabad", city="Hyderabad", locality="Miyapur")
    loc3 = UserLocation(user_id=citizen2.id, state="Telangana", district="Hyderabad", city="Hyderabad", locality="Gachibowli")
    db.add_all([loc1, loc2, loc3])
    db.commit()

    # 3. Comprehensive Sample Notices for Realistic Demonstration
    sample_notices = [
        {
            "title": "Emergency 24-Hour Drinking Water Supply Interruption",
            "category": "Water & Electricity",
            "urgency": "HIGH",
            "status": "PUBLISHED",
            "authority": "Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB)",
            "source_url": "https://www.hyderabadwater.gov.in/notices/2026/11/kukatpally-pipeline-shutdown",
            "summary": "Water supply will be completely suspended in Kukatpally and Miyapur for 24 hours on Nov 20 due to major Krishna drinking water pipeline repairs.",
            "detailed_summary": "HMWSSB has notified that due to urgent replacement of a 1200mm dia Krishna Phase-III trunk main pipeline at JNTU Junction, drinking water supply will be unavailable from 06:00 AM on Nov 20 to 06:00 AM on Nov 21.",
            "action_summary": "Store sufficient drinking water in advance. Free water tankers can be booked via 155313 helpline.",
            "translations": {
                "en": {
                    "title": "Emergency 24-Hour Drinking Water Supply Interruption",
                    "summary": "Water supply will be suspended in Kukatpally and Miyapur for 24 hours starting Nov 20 due to pipeline repairs.",
                    "action": "Store water beforehand and utilize tanker booking if necessary."
                },
                "te": {
                    "title": "కూకట్‌పల్లి, మియాపూర్‌లో 24 గంటల పాటు మంచినీటి సరఫరా నిలిపివేత",
                    "summary": "పైప్‌లైన్ మరమ్మతుల కారణంగా నవంబర్ 20న కూకట్‌పల్లి మరియు మియాపూర్ పరిసర ప్రాంతాలలో తాగునీటి సరఫరా నిలిపివేయబడుతుంది.",
                    "action": "ముందస్తుగా సరిపడా తాగునీటిని నిల్వ ఉంచుకోవాలని, అత్యవసరమైతే 155313 నంబర్‌కు సంప్రదించాలని కోరడమైనది."
                },
                "hi": {
                    "title": "कूकटपल्ली और मियापुर में 24 घंटे जलापूर्ति बाधित रहेगी",
                    "summary": "पाइपलाइन मरम्मत कार्य के चलते 20 नवंबर को 24 घंटे के लिए पानी की आपूर्ति बंद रहेगी।",
                    "action": "पर्याप्त मात्रा में पानी पहले से जमा कर लें। आपात स्थिति में 155313 पर संपर्क करें।"
                }
            },
            "locations": ["Kukatpally", "Miyapur", "Hyderabad"],
            "target_audience": "Residents of Kukatpally, KPHB Colony, and Miyapur zones",
            "start_date": "2026-11-20",
            "start_time": "06:00",
            "end_time": "06:00",
            "deadline": "2026-11-20",
            "confidence_score": 0.98,
            "requires_human_review": False
        },
        {
            "title": "CRITICAL: Heavy Rainfall & Urban Flood Advisory (Red Alert)",
            "category": "Emergency & Disaster Alerts",
            "urgency": "CRITICAL",
            "status": "PUBLISHED",
            "authority": "India Meteorological Department (IMD) & Disaster Management Dept",
            "source_url": "https://telangana.gov.in/disaster-management/red-alert-nov26",
            "summary": "Severe thunderstorm with extremely heavy rainfall (over 150mm) forecasted across Hyderabad over the next 12 hours. High risk of urban waterlogging.",
            "detailed_summary": "IMD Hyderabad has sounded a Red Alert. Widespread convective cloud formation will result in intense downpours across Gachibowli, Madhapur, Serilingampally and Secunderabad. Citizens are strictly instructed to avoid unnecessary outdoor travel.",
            "action_summary": "Stay indoors, avoid low-lying roads and underpasses, keep emergency numbers (GHMC Control: 040-21111111) handy.",
            "translations": {
                "en": {
                    "title": "CRITICAL: Heavy Rainfall & Urban Flood Advisory (Red Alert)",
                    "summary": "Extremely heavy rainfall predicted across Hyderabad. High risk of waterlogging.",
                    "action": "Stay indoors and avoid unnecessary transit."
                },
                "te": {
                    "title": "అత్యవసర హెచ్చరిక: హైదరాబాద్‌లో భారీ వర్షం మరియు వరద ముప్పు (రెడ్ అలర్ట్)",
                    "summary": "వచ్చే 12 గంటల్లో నగరంలో భారీ నుండి అతి భారీ వర్షాలు కురిసే అవకాశం ఉన్నందున రెడ్ అలర్ట్ జారీ చేశారు.",
                    "action": "పౌరులు ఇళ్లలోనే సురక్షితంగా ఉండాలి. అత్యవసర సాయం కోసం 040-21111111 నంబర్‌కు డయల్ చేయండి."
                },
                "hi": {
                    "title": "अति आवश्यक: हैदराबाद में भारी बारिश और बाढ़ का रेड अलर्ट",
                    "summary": "अगले 12 घंटों में अत्यधिक भारी बारिश की संभावना के चलते रेड अलर्ट जारी किया गया है।",
                    "action": "घरों में ही रहें, जलभराव वाले क्षेत्रों में जाने से बचें।"
                }
            },
            "locations": ["Gachibowli", "Madhapur", "Secunderabad", "Hyderabad"],
            "target_audience": "All citizens across Greater Hyderabad Municipal Corporation",
            "start_date": "2026-11-17",
            "deadline": "2026-11-18",
            "confidence_score": 0.99,
            "requires_human_review": False
        },
        {
            "title": "Major Traffic Diversion at Gachibowli Flyover & Bio-Diversity Junction",
            "category": "Traffic & Transportation",
            "urgency": "HIGH",
            "status": "PUBLISHED",
            "authority": "Cyberabad Traffic Police Commissionerate",
            "source_url": "https://trafficpolice.cyberabad.gov.in/advisories/nov-diversions",
            "summary": "Traffic restrictions imposed on Gachibowli-Mehdipatnam corridor from 10 PM to 5 AM for 4 days due to Strategic Road Development metro-girder launching.",
            "detailed_summary": "Commuters travelling towards Hitec City and Financial District from Mehdipatnam are advised to take the Outer Ring Road service road or Telecom Nagar bypass. Heavy vehicles barred.",
            "action_summary": "Use alternate Outer Ring Road (ORR) route or plan extra travel buffer time of 25 minutes.",
            "translations": {
                "en": {
                    "title": "Major Traffic Diversion at Gachibowli Flyover",
                    "summary": "Traffic diversions from 10 PM to 5 AM on Gachibowli corridor for metro works.",
                    "action": "Plan alternate routes via ORR service road."
                },
                "te": {
                    "title": "గచ్చిబౌలి ఫ్లైఓవర్ వద్ద ట్రాఫిక్ మళ్లింపు మార్గదర్శకాలు",
                    "summary": "మెట్రో మరియు రహదారి పనుల కారణంగా గచ్చిబౌలి ప్రాంతంలో రాత్రి వేళల్లో ట్రాఫిక్ మళ్లించబడుతుంది.",
                    "action": "ఓఆర్ఆర్ లేదా టెలికాం నగర్ బైపాస్ మార్గాలను ఎంచుకోండి."
                },
                "hi": {
                    "title": "गचीबोवली फ्लाईओवर पर ट्रैफिक डायवर्जन",
                    "summary": "सड़क निर्माण कार्य के कारण रात 10 बजे से सुबह 5 बजे तक यातायात डायवर्ट रहेगा।",
                    "action": "वैकल्पिक मार्ग का उपयोग करें।"
                }
            },
            "locations": ["Gachibowli", "Hitec City", "Madhapur", "Hyderabad"],
            "target_audience": "IT professionals, commuters and commercial transport operators",
            "start_date": "2026-11-19",
            "deadline": "2026-11-23",
            "confidence_score": 0.96,
            "requires_human_review": False
        },
        {
            "title": "Post-Matric & Higher Education Merit Scholarship Scheme (Last Date)",
            "category": "Education & Scholarships",
            "urgency": "MEDIUM",
            "status": "PUBLISHED",
            "authority": "Telangana State Council of Higher Education (TSCHE)",
            "source_url": "https://telanganaepass.cgg.gov.in/notifications",
            "summary": "Online applications open for Tuition Fee Reimbursement and ePASS Post-Matric scholarships for Academic Year 2026-27.",
            "detailed_summary": "Eligible SC/ST/BC/EBC students enrolled in engineering, medicine, degree and polytechnic courses must verify Aadhaar authentication and upload income certificate before the closing window.",
            "action_summary": "Complete student ePASS online submission and college biometric verification by Nov 30, 2026.",
            "translations": {
                "en": {
                    "title": "Post-Matric Merit Scholarship Scheme (Last Date: Nov 30)",
                    "summary": "ePASS scholarship registration open for all eligible higher education students.",
                    "action": "Upload required certificates before November 30 deadline."
                },
                "te": {
                    "title": "పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్ దరఖాస్తు గడువు నవంబర్ 30 వరకు",
                    "summary": "అర్హులైన విద్యార్థులు తమ ఫీజు రీయింబర్స్‌మెంట్ మరియు స్కాలర్‌షిప్ దరఖాస్తులను ePASS వెబ్‌సైట్‌లో సమర్పించాలి.",
                    "action": "నవంబర్ 30 లోగా కళాశాల ధ్రువీకరణ మరియు బయోమెట్రిక్ పూర్తి చేయండి."
                },
                "hi": {
                    "title": "पोस्ट-मैट्रिक छात्रवृत्ति आवेदन की अंतिम तिथि: 30 नवंबर",
                    "summary": "उच्च शिक्षा में अध्ययनरत पात्र छात्र ई-पास पोर्टल पर छात्रवृत्ति आवेदन कर सकते हैं।",
                    "action": "30 नवंबर से पहले दस्तावेज़ सत्यापन पूरा करें।"
                }
            },
            "locations": ["Telangana", "Hyderabad"],
            "target_audience": "Undergraduate, Postgraduate and Diploma Students",
            "start_date": "2026-11-01",
            "deadline": "2026-11-30",
            "confidence_score": 0.95,
            "requires_human_review": False
        },
        {
            "title": "Special Dengue & Vector-Borne Prevention Medical Camps",
            "category": "Health & Public Services",
            "urgency": "LOW",
            "status": "PUBLISHED",
            "authority": "Department of Health, Medical and Family Welfare",
            "source_url": "https://chfw.telangana.gov.in",
            "summary": "Free diagnostic checkups, platelets testing and anti-larval fogging drives organized across 50 municipal wards this weekend.",
            "detailed_summary": "Basthi Dawakhanas and Urban Primary Health Centres will provide free consultation, paracetamol and rapid NS1 antigen tests from 9 AM to 4 PM.",
            "action_summary": "Visit your nearest Basthi Dawakhana in case of persistent fever or symptoms.",
            "translations": {
                "en": {
                    "title": "Special Dengue Prevention Medical Camps",
                    "summary": "Free health screening and tests available at all local Basthi Dawakhanas this weekend.",
                    "action": "Get free medical screening if experiencing fever."
                },
                "te": {
                    "title": "ఉచిత డెంగ్యూ నివారణ వైద్య శిబిరాలు",
                    "summary": "ఈ వారాంతంలో అన్ని బస్తీ దవాఖానాల్లో ఉచిత రక్త పరీక్షలు మరియు వైద్య సేవలు అందుబాటులో ఉంటాయి.",
                    "action": "జ్వరం లక్షణాలు ఉంటే సమీపంలోని బస్తీ దవాఖానాను సందర్శించండి."
                },
                "hi": {
                    "title": "नि:शुल्क डेंगू रोकथाम स्वास्थ्य शिविर",
                    "summary": "इस सप्ताहांत सभी बस्ती दवाखानों में मुफ्त रक्त परीक्षण और स्वास्थ्य सेवाएं उपलब्ध रहेंगी।",
                    "action": "बुखार के लक्षण होने पर नजदीकी स्वास्थ्य केंद्र पर जाएं।"
                }
            },
            "locations": ["Ameerpet", "Secunderabad", "LB Nagar", "Hyderabad"],
            "target_audience": "General Citizens and Families",
            "start_date": "2026-11-21",
            "deadline": "2026-11-22",
            "confidence_score": 0.93,
            "requires_human_review": False
        },
        {
            "title": "Property Tax Early-Bird Rebate Announcement (5% Discount)",
            "category": "Tax & Legal Announcements",
            "urgency": "LOW",
            "status": "PENDING_REVIEW", # Demo item awaiting government admin approval
            "authority": "Greater Hyderabad Municipal Corporation (GHMC) Revenue Wing",
            "source_url": "https://ghmc.gov.in/property-tax-2026",
            "summary": "GHMC offers 5% rebate on annual property tax payments cleared before December 15 through digital payment modes.",
            "detailed_summary": "Property owners in residential and commercial categories can pay online via GHMC Citizen App or MeeSeva centres to avail the direct cash discount.",
            "action_summary": "Pay your property tax via the official GHMC portal before Dec 15 to receive the 5% reduction.",
            "translations": {
                "en": {
                    "title": "Property Tax Early-Bird 5% Rebate Scheme",
                    "summary": "Get 5% concession on property tax paid before Dec 15.",
                    "action": "Pay online via GHMC portal to get concession."
                },
                "te": {
                    "title": "ఆస్తి పన్నుపై 5% ముందస్తు రాయితీ",
                    "summary": "డిసెంబర్ 15 లోగా ఆస్తి పన్ను చెల్లించే పౌరులకు 5 శాతం తగ్గింపు వర్తిస్తుంది.",
                    "action": "జీహెచ్‌ఎంసీ పోర్టల్ ద్వారా ఆన్‌లైన్‌లో చెల్లించి రాయితీ పొందండి."
                },
                "hi": {
                    "title": "संपत्ति कर पर 5% की छूट",
                    "summary": "15 दिसंबर से पहले संपत्ति कर का भुगतान करने पर 5% की छूट मिलेगी।",
                    "action": "जीएचएमसी पोर्टल पर ऑनलाइन भुगतान करें।"
                }
            },
            "locations": ["Hyderabad"],
            "target_audience": "Residential and Commercial Property Owners",
            "start_date": "2026-11-15",
            "deadline": "2026-12-15",
            "confidence_score": 0.97,
            "requires_human_review": True
        }
    ]

    for item in sample_notices:
        n = Notice(**item)
        db.add(n)
    db.commit()

    # Seed notification records
    published_list = db.query(Notice).filter(Notice.status == "PUBLISHED").all()
    for pub in published_list:
        notif = NotificationRecord(
            notice_id=pub.id,
            title=f"[{pub.urgency}] {pub.title}",
            message=pub.summary,
            urgency=pub.urgency,
            channel="PUSH",
            target_locations=pub.locations or ["Hyderabad"],
            recipient_count=1840,
            delivery_status="DELIVERED",
            sent_at=datetime.utcnow() - timedelta(hours=2)
        )
        db.add(notif)
    db.commit()
    db.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()

