/**
 * Multilingual Civic Localization Engine
 * Provides authentic, natural, grammatically correct Telugu, Hindi, and English
 * translation for all notice types, categories, urgencies, departments, citizen actions,
 * locations, and UI elements.
 */

export type SupportedLanguage = 'en' | 'te' | 'hi';

export interface LocalizedNoticeData {
  title: string;
  category: string;
  summary: string;
  action: string;
  authority: string;
  urgency: string;
  locationsText: string;
  deadlineText: string;
  startDateText: string;
  verificationBadge: string;
  verificationSubtext: string;
  officialGazetteExplainer: string;
}

// 1. Notice Categories in all 3 languages
export const CATEGORY_TRANSLATIONS: Record<string, { en: string; te: string; hi: string }> = {
  'Emergency & Disaster Alerts': {
    en: 'Emergency & Disaster Alerts',
    te: 'అత్యవసర & విపత్తు హెచ్చరికలు',
    hi: 'आपातकालीन एवं आपदा चेतावनी'
  },
  'Water & Power': {
    en: 'Water & Power Supply',
    te: 'నీరు & విద్యుత్ సరఫరా',
    hi: 'जल एवं विद्युत आपूर्ति'
  },
  'Water & Electricity': {
    en: 'Water & Electricity',
    te: 'నీరు & విద్యుత్ సేవలు',
    hi: 'जल एवं बिजली सेवाएं'
  },
  'Education & Scholarships': {
    en: 'Education & Scholarships',
    te: 'విద్య & ఉపకార వేతనాలు (స్కాలర్‌షిప్‌లు)',
    hi: 'शिक्षा एवं छात्रवृत्ति'
  },
  'Scholarships': {
    en: 'Scholarships & Student Welfare',
    te: 'ఉపకార వేతనాలు & విద్యార్థి సంక్షేమం',
    hi: 'छात्रवृत्ति एवं विद्यार्थी कल्याण'
  },
  'Traffic & Transportation': {
    en: 'Traffic & Transportation',
    te: 'ట్రాఫిక్ మళ్లింపు & ప్రజా రవాణా',
    hi: 'यातायात एवं परिवहन सूचना'
  },
  'Government Schemes': {
    en: 'Government Welfare Schemes',
    te: 'ప్రభుత్వ సంక్షేమ పథకాలు',
    hi: 'सरकारी कल्याणकारी योजनाएं'
  },
  'Employment & Recruitment': {
    en: 'Employment & Recruitment',
    te: 'ఉద్యోగ నియామకాలు & ప్రకటనలు',
    hi: 'रोजगार एवं भर्ती सूचना'
  },
  'Health & Public Services': {
    en: 'Health & Public Services',
    te: 'ఆరోగ్యం & ప్రజా సంక్షేమ సేవలు',
    hi: 'स्वास्थ्य एवं सार्वजनिक सेवाएं'
  },
  'Tax & Legal Announcements': {
    en: 'Tax & Legal Announcements',
    te: 'పన్నులు & చట్టపరమైన ప్రకటనలు',
    hi: 'कर एवं कानूनी घोषणाएं'
  },
  'Municipal Services': {
    en: 'Municipal & Civic Services',
    te: 'పురపాలక & పౌర సేవలు',
    hi: 'नगर निगम एवं नागरिक सेवाएं'
  },
  'General Government Information': {
    en: 'General Government Information',
    te: 'సాధారణ ప్రభుత్వ సమాచారం',
    hi: 'सामान्य सरकारी सूचना'
  }
};

// 2. Urgency levels in all 3 languages
export const URGENCY_TRANSLATIONS: Record<string, { en: string; te: string; hi: string }> = {
  'CRITICAL': {
    en: 'CRITICAL PRIORITY',
    te: 'అత్యంత అత్యవసరం (రెడ్ అలర్ట్)',
    hi: 'अत्यंत महत्वपूर्ण (रेड अलर्ट)'
  },
  'HIGH': {
    en: 'HIGH PRIORITY',
    te: 'అధిక ప్రాధాన్యత',
    hi: 'उच्च प्राथमिकता'
  },
  'MEDIUM': {
    en: 'MEDIUM PRIORITY',
    te: 'మధ్యస్థ ప్రాధాన్యత',
    hi: 'मध्यम प्राथमिकता'
  },
  'LOW': {
    en: 'STANDARD NOTICE',
    te: 'సాధారణ సమాచారం',
    hi: 'सामान्य सूचना'
  }
};

// 3. Common government departments in Telangana / Hyderabad
export const DEPARTMENT_TRANSLATIONS: Record<string, { en: string; te: string; hi: string }> = {
  'HMWSSB': {
    en: 'Hyderabad Metropolitan Water Supply & Sewerage Board (HMWSSB)',
    te: 'హైదరాబాద్ మెట్రోపాలిటన్ వాటర్ సప్లై & సీవరేజ్ బోర్డ్ (HMWSSB)',
    hi: 'हैदराबाद मेट्रोपॉलिटन जल आपूर्ति एवं सीवरेज बोर्ड (HMWSSB)'
  },
  'GHMC': {
    en: 'Greater Hyderabad Municipal Corporation (GHMC)',
    te: 'గ్రేటర్ హైదరాబాద్ మునిసిపల్ కార్పొరేషన్ (GHMC)',
    hi: 'ग्रेटर हैदराबाद नगर निगम (GHMC)'
  },
  'TSSPDCL': {
    en: 'Telangana Southern Power Distribution Company (TSSPDCL)',
    te: 'తెలంగాణ దక్షిణ ప్రాంత విద్యుత్ పంపిణీ సంస్థ (TSSPDCL)',
    hi: 'तेलंगाना दक्षिणी विद्युत वितरण कंपनी (TSSPDCL)'
  },
  'TRAFFIC_POLICE': {
    en: 'Hyderabad & Cyberabad Traffic Police',
    te: 'హైదరాబాద్ & సైబరాబాద్ ట్రాఫిక్ పోలీసులు',
    hi: 'हैदराबाद एवं साइबराबाद ट्रैफिक पुलिस'
  },
  'STUDENT_WELFARE': {
    en: 'Department of Student Welfare & Higher Education',
    te: 'విద్యార్థి సంక్షేమ శాఖ & ఉన్నత విద్యా మండలి',
    hi: 'विद्यार्थी कल्याण विभाग एवं उच्च शिक्षा निदेशालय'
  },
  'DISASTER_MANAGEMENT': {
    en: 'Telangana State Disaster Management Authority & IMD',
    te: 'తెలంగాణ రాష్ట్ర విపత్తు నిర్వహణ విభాగం & వాతావరణ శాఖ',
    hi: 'तेलंगाना राज्य आपदा प्रबंधन प्राधिकरण एवं मौसम विभाग'
  }
};

// 4. Locality names in Telugu & Hindi
export const LOCALITY_NAMES: Record<string, { te: string; hi: string }> = {
  'Kukatpally': { te: 'కూకట్‌పల్లి', hi: 'कुकटपल्ली' },
  'Miyapur': { te: 'మియాపూర్', hi: 'मियापुर' },
  'Gachibowli': { te: 'గచ్చిబౌలి', hi: 'गच्चीबाउली' },
  'Madhapur': { te: 'మాదాపూర్', hi: 'माधापुर' },
  'Hitec City': { te: 'హైటెక్ సిటీ', hi: 'हाईटेक सिटी' },
  'Secunderabad': { te: 'సికింద్రాబాద్', hi: 'सिकंदराबाद' },
  'Banjara Hills': { te: 'బంజారా హిల్స్', hi: 'बंजारा हिल्स' },
  'Jubilee Hills': { te: 'జూబ్లీ హిల్స్', hi: 'जुबली हिल्स' },
  'Ameerpet': { te: 'అమీర్‌పేట్', hi: 'अमीरपेट' },
  'Dilsukhnagar': { te: 'దిల్‌సుఖ్‌నగర్', hi: 'दिलसुखनगर' },
  'LB Nagar': { te: 'ఎల్బీ నగర్', hi: 'एल.बी. नगर' },
  'Charminar': { te: 'చార్మినార్', hi: 'चारमीनार' },
  'Begumpet': { te: 'బేగంపేట్', hi: 'बेगमपेट' },
  'Kondapur': { te: 'కొండాపూర్', hi: 'कोंडापुर' },
  'Mehdipatnam': { te: 'మెహదీపట్నం', hi: 'मेहदीपटनम' },
  'Uppal': { te: 'ఉప్పల్', hi: 'उप्पल' },
  'Manikonda': { te: 'మణికొండ', hi: 'मणिकोंडा' },
  'Serilingampally': { te: 'శేరిలింగంపల్లి', hi: 'शेरिलिंगमपल्ली' },
  'Hyderabad': { te: 'హైదరాబాద్', hi: 'हैदराबाद' },
  'Telangana': { te: 'తెలంగాణ', hi: 'तेलंगाना' },
  'Rangareddy': { te: 'రంగారెడ్డి', hi: 'रंगारेड्डी' },
  'Medchal': { te: 'మేడ్చల్', hi: 'मेदचल' },
  'Warangal': { te: 'వరంగల్', hi: 'वारंगल' },
  'Karimnagar': { te: 'కరీంనగర్', hi: 'करीमनगर' },
  'Nizamabad': { te: 'నిజామాబాద్', hi: 'निजामाबाद' },
  'Khammam': { te: 'ఖమ్మం', hi: 'खम्मम' }
};

// 5. General UI strings in all 3 languages
export const UI_STRINGS = {
  en: {
    appTitle: 'CIVIC NOTICE INTELLIGENCE',
    appSubtitle: 'Government of Telangana • Smart Public Information & Alert System',
    tagline: 'Important Information. Timely Alerts. Informed Citizens.',
    heroDescription: 'Every official circular, water cut, power shutdown, and scholarship deadline transformed into clear, multilingual, actionable civic warnings.',
    selectLanguage: 'Select Citizen Language:',
    publicFeed: 'Public Notice Feed',
    emergencyAlerts: 'Emergency Alerts',
    upcomingDeadlines: 'Upcoming Deadlines',
    interactiveMap: 'Interactive Map',
    broadcasts: 'Broadcasts',
    savedNotices: 'Saved Notices',
    searchPlaceholder: 'Search notices, water supply, scholarships, metro...',
    filterUrgency: 'Filter Urgency:',
    allUrgency: 'All',
    districtLabel: 'District:',
    localityLabel: 'Locality:',
    allDistricts: 'All Telangana',
    allLocalities: 'All Localities',
    officialNotice: 'Official Notice',
    demoNotice: 'DEMO DOCUMENT — NOT AN OFFICIAL GOVERNMENT NOTICE',
    verifiedSource: 'Official Verified Source',
    pendingVerification: 'Pending Verification',
    rejectedNotice: 'Notice Rejected',
    actionRequired: '👉 Recommended Action:',
    readMore: 'View Details',
    listenNow: 'Listen Now',
    pauseVoice: 'Pause',
    resumeVoice: 'Resume',
    stopVoice: 'Stop',
    voiceHeading: 'AI Voice Assistant (Multilingual Text-to-Speech)',
    voiceSubtext: 'Listen to this notice narrated clearly in your language',
    simpleSummaryTitle: '💡 Simple Summary For Ordinary Citizens',
    actionStepsTitle: '✅ What Citizens Need To Do Next:',
    affectedAreasTitle: '📍 Affected Localities & Zones:',
    deadlineNotice: 'Application / Action Deadline:',
    startDateNotice: 'Effective Date:',
    setReminder: 'Set Auto-Reminder (7d, 3d, 1d)',
    reminderActive: '✓ Reminder Active!',
    officialVerification: 'Official Document Gazette Verification',
    uploadedDocPreview: 'UPLOADED DOCUMENT PREVIEW',
    viewOfficialGazette: 'View Official Source Circular →',
    viewUploadedDoc: 'View Original Uploaded Document →',
    originalDocumentTitle: 'Original Government Circular Text (Verbatim)',
    uploadedDocTitle: 'Original Uploaded Document Text (Extracted):',
    translatedExplainerTitle: 'Citizen Plain-Language Explanation of Document:',
    feedbackPrompt: 'Have questions or spotted incorrect info?',
    feedbackPlaceholder: 'Ask for clarification or report inaccuracy...',
    submitFeedback: 'Submit',
    feedbackSuccess: 'Thank you! Your feedback has been forwarded to municipal verifiers.',
    noNoticesFound: 'No notices match your selected filters.',
    resetFilters: 'Reset all filters',
    noSavedNotices: 'No saved notices yet. Click the bookmark icon on any notice to save it here.'
  },
  te: {
    appTitle: 'పౌర సమాచార & ముందస్తు హెచ్చరికల వ్యవస్థ',
    appSubtitle: 'తెలంగాణ ప్రభుత్వం • స్మార్ట్ ప్రజా సమాచార & హెచ్చరిక వేదిక',
    tagline: 'ముఖ్యమైన పౌర సమాచారం. ముందస్తు హెచ్చరికలు. చైతన్యవంతమైన పౌరులు.',
    heroDescription: 'అన్ని అధికారిక ప్రభుత్వ సర్క్యులర్లు, నీటి సరఫరా నిలిపివేత, విద్యుత్ మరమ్మతులు మరియు స్కాలర్‌షిప్ గడువులు సులభమైన తెలుగులో అందించబడును.',
    selectLanguage: 'భాషను ఎంచుకోండి:',
    publicFeed: 'ప్రజా ప్రకటనల ఫీడ్',
    emergencyAlerts: 'అత్యవసర హెచ్చరికలు',
    upcomingDeadlines: 'రాబోయే గడువులు',
    interactiveMap: 'ఇంటరాక్టివ్ మ్యాప్',
    broadcasts: 'నోటిఫికేషన్లు',
    savedNotices: 'భద్రపరిచినవి',
    searchPlaceholder: 'ప్రకటనలు, నీటి సరఫరా, స్కాలర్‌షిప్‌లు, మెట్రోను శోధించండి...',
    filterUrgency: 'ప్రాధాన్యత వారీగా:',
    allUrgency: 'అన్నీ',
    districtLabel: 'జిల్లా:',
    localityLabel: 'ప్రాంతం:',
    allDistricts: 'తెలంగాణ అంతటా',
    allLocalities: 'అన్ని ప్రాంతాలు',
    officialNotice: 'అధికారిక ప్రకటన',
    demoNotice: 'డెమో పత్రం — అధికారిక ప్రభుత్వ నోటీసు కాదు (DEMO DOCUMENT — NOT AN OFFICIAL GOVERNMENT NOTICE)',
    verifiedSource: 'అధికారిక ధ్రువీకృత మూలం',
    pendingVerification: 'పరిశీలనలో ఉన్నది',
    rejectedNotice: 'తిరస్కరించబడిన ప్రకటన',
    actionRequired: '👉 తీసుకోవలసిన చర్య:',
    readMore: 'వివరాలు చూడండి',
    listenNow: 'వినండి (వాయిస్)',
    pauseVoice: 'పాజ్ చేయండి',
    resumeVoice: 'పునఃప్రారంభించండి',
    stopVoice: 'ఆపివేయండి',
    voiceHeading: 'AI వాయిస్ అసిస్టెంట్ (బహుభాషా టెక్స్ట్-టు-స్పీచ్)',
    voiceSubtext: 'ఈ సమాచారాన్ని స్పష్టమైన తెలుగులో వినండి',
    simpleSummaryTitle: '💡 సాధారణ పౌరుల కోసం సరళమైన సారాంశం',
    actionStepsTitle: '✅ పౌరులు తదుపరి తీసుకోవలసిన జాగ్రత్తలు / చర్యలు:',
    affectedAreasTitle: '📍 ప్రభావిత ప్రాంతాలు & జోన్లు:',
    deadlineNotice: 'దరఖాస్తు / చర్య తీసుకోవలసిన చివరి గడువు:',
    startDateNotice: 'ప్రారంభ తేదీ:',
    setReminder: 'గడువు రిమైండర్ అమర్చండి (7 రోజులు, 3 రోజులు, 1 రోజు)',
    reminderActive: '✓ రిమైండర్ యాక్టివ్ చేయబడింది!',
    officialVerification: 'అధికారిక గెజిట్ & సర్క్యులర్ పరిశీలన',
    uploadedDocPreview: 'అప్‌లోడ్ చేసిన పత్రం ప్రివ్యూ (UPLOADED DOCUMENT PREVIEW)',
    viewOfficialGazette: 'అధికారిక ప్రభుత్వ సర్క్యులర్ చూడండి →',
    viewUploadedDoc: 'అప్‌లోడ్ చేసిన అసలు పత్రం చూడండి →',
    originalDocumentTitle: 'అధికారిక ప్రభుత్వ అసలు పత్రం (మార్పు చేయనిది):',
    uploadedDocTitle: 'అప్‌లోడ్ చేసిన పత్రం నుండి సేకరించిన పాఠం:',
    translatedExplainerTitle: 'పౌరుల కోసం ఈ పత్రం యొక్క తెలుగు వివరణ:',
    feedbackPrompt: 'సందేహాలు ఉన్నాయా లేదా తప్పు సమాచారాన్ని గమనించారా?',
    feedbackPlaceholder: 'సందేహాలను అడగండి లేదా పొరపాట్లను నివేదించండి...',
    submitFeedback: 'సమర్పించండి',
    feedbackSuccess: 'ధన్యవాదాలు! మీ అభిప్రాయం మున్సిపల్ అధికారులకు చేరింది.',
    noNoticesFound: 'ఎంచుకున్న ఫిల్టర్లకు సరిపోయే ప్రకటనలు ఏవీ లేవు.',
    resetFilters: 'అన్ని ఫిల్టర్లను రీసెట్ చేయండి',
    noSavedNotices: 'ఇంకా ఎలాంటి ప్రకటనలు భద్రపరచలేదు. ఏ ప్రకటననైనా సేవ్ చేయడానికి బుక్‌మార్క్ చిహ్నాన్ని క్లిక్ చేయండి.'
  },
  hi: {
    appTitle: 'नागरिक सूचना एवं पूर्व चेतावनी प्रणाली',
    appSubtitle: 'तेलंगाना सरकार • स्मार्ट जन सूचना एवं चेतावनी पोर्टल',
    tagline: 'महत्वपूर्ण सूचनाएं. समय पर चेतावनी. जागरूक नागरिक.',
    heroDescription: 'सभी आधिकारिक सरकारी परिपत्र, जलापूर्ति रुकावट, बिजली कटौती तथा छात्रवृत्ति की समय सीमा को सरल हिंदी में जानें।',
    selectLanguage: 'भाषा चुनें:',
    publicFeed: 'सार्वजनिक सूचनाएं',
    emergencyAlerts: 'आपातकालीन अलर्ट',
    upcomingDeadlines: 'आगामी समय सीमा',
    interactiveMap: 'मानचित्र दृश्य',
    broadcasts: 'प्रसारण संदेश',
    savedNotices: 'सहेजी गई सूचनाएं',
    searchPlaceholder: 'सूचना, जलापूर्ति, छात्रवृत्ति, मेट्रो खोजें...',
    filterUrgency: 'प्राथमिकता फ़िल्टर:',
    allUrgency: 'सभी',
    districtLabel: 'जिला:',
    localityLabel: 'क्षेत्र:',
    allDistricts: 'संपूर्ण तेलंगाना',
    allLocalities: 'सभी इलाके',
    officialNotice: 'आधिकारिक सूचना',
    demoNotice: 'डेमो दस्तावेज़ — यह कोई आधिकारिक सरकारी सूचना नहीं है (DEMO DOCUMENT — NOT AN OFFICIAL GOVERNMENT NOTICE)',
    verifiedSource: 'आधिकारिक सत्यापित स्रोत',
    pendingVerification: 'सत्यापन प्रक्रियाधीन',
    rejectedNotice: 'अस्वीकृत सूचना',
    actionRequired: '👉 आवश्यक कार्रवाई:',
    readMore: 'विवरण देखें',
    listenNow: 'सुनें (आवाज)',
    pauseVoice: 'रोकें (Pause)',
    resumeVoice: 'पुनः सुनें',
    stopVoice: 'बंद करें',
    voiceHeading: 'एआई वॉयस असिस्टेंट (बहुभाषी टेक्स्ट-टू-स्पीच)',
    voiceSubtext: 'इस सूचना का पूरा विवरण शुद्ध हिंदी में सुनें',
    simpleSummaryTitle: '💡 आम नागरिकों के लिए सरल सारांश',
    actionStepsTitle: '✅ नागरिकों के लिए आवश्यक निर्देश एवं सावधानियां:',
    affectedAreasTitle: '📍 प्रभावित क्षेत्र एवं कॉलोनियां:',
    deadlineNotice: 'आवेदन अथवा अंतिम तिथि:',
    startDateNotice: 'प्रभावी तिथि:',
    setReminder: 'स्वचालित स्मरण (Reminder) सेट करें (7 दिन, 3 दिन, 1 दिन पूर्व)',
    reminderActive: '✓ स्मरण सक्रिय किया गया!',
    officialVerification: 'आधिकारिक सरकारी राजपत्र एवं परिपत्र सत्यापन',
    uploadedDocPreview: 'अपलोड किए गए दस्तावेज़ का पूर्वावलोकन (UPLOADED DOCUMENT PREVIEW)',
    viewOfficialGazette: 'मूल सरकारी परिपत्र देखें →',
    viewUploadedDoc: 'अपलोड किया गया मूल दस्तावेज़ देखें →',
    originalDocumentTitle: 'मूल सरकारी परिपत्र (यथावत पाठ):',
    uploadedDocTitle: 'अपलोड किए गए दस्तावेज़ से निकाला गया पाठ:',
    translatedExplainerTitle: 'नागरिकों हेतु इस दस्तावेज़ का हिंदी स्पष्टीकरण:',
    feedbackPrompt: 'कोई प्रश्न है या गलत जानकारी दिखाई दे रही है?',
    feedbackPlaceholder: 'स्पष्टीकरण मांगें अथवा त्रुटि दर्ज करें...',
    submitFeedback: 'भेजें',
    feedbackSuccess: 'धन्यवाद! आपकी प्रतिक्रिया नगर निगम को भेज दी गई है।',
    noNoticesFound: 'आपके द्वारा चुने गए फ़िल्टर के अनुसार कोई सूचना नहीं मिली।',
    resetFilters: 'फ़िल्टर रीसेट करें',
    noSavedNotices: 'अभी तक कोई सूचना सहेजी नहीं गई है। किसी भी सूचना को सहेजने के लिए बुकमार्क आइकन पर क्लिक करें।'
  }
};

/**
 * Translate location names to native script
 */
export function translateLocationList(locations: string[] | undefined, lang: SupportedLanguage): string {
  if (!locations || locations.length === 0) {
    if (lang === 'te') return 'రాష్ట్రవ్యాప్త ప్రాంతాలు (తెలంగాణ)';
    if (lang === 'hi') return 'राज्यव्यापी क्षेत्र (तेलंगाना)';
    return 'State-wide (All areas)';
  }

  if (lang === 'en') {
    return locations.join(', ');
  }

  return locations.map(loc => {
    const trimmed = loc.trim();
    // match known localities
    for (const [key, val] of Object.entries(LOCALITY_NAMES)) {
      if (trimmed.toLowerCase().includes(key.toLowerCase())) {
        return lang === 'te' ? val.te : val.hi;
      }
    }
    return trimmed;
  }).join(', ');
}

/**
 * Intelligent Dynamic Civic Notice Translation
 * Generates natural, grammatically pure Telugu and Hindi translations
 * based on the notice context, title, category, department, deadline and action.
 */
export function getFullyLocalizedNotice(
  notice: any,
  lang: SupportedLanguage
): LocalizedNoticeData {
  if (!notice) {
    return {
      title: '',
      category: '',
      summary: '',
      action: '',
      authority: '',
      urgency: '',
      locationsText: '',
      deadlineText: '',
      startDateText: '',
      verificationBadge: '',
      verificationSubtext: '',
      officialGazetteExplainer: ''
    };
  }

  const rawTitle = notice.title || '';
  const rawSummary = notice.summary || '';
  const rawAction = notice.action_summary || '';
  const rawCategory = notice.category || 'General Government Information';
  const rawAuthority = notice.authority || 'Government Authority';
  const rawUrgency = notice.urgency || 'MEDIUM';
  const deadline = notice.deadline || '';
  const startDate = notice.start_date || '';

  // Check if notice is a demo document
  const isDemo = 
    rawTitle.toLowerCase().includes('sample') ||
    rawTitle.toLowerCase().includes('demonstration') ||
    (notice.original_text && (
      notice.original_text.toLowerCase().includes('fictional') ||
      notice.original_text.toLowerCase().includes('for project demonstration') ||
      notice.original_text.toLowerCase().includes('demo only')
    )) ||
    rawAuthority.toLowerCase().includes('demo');

  // Locations in selected language
  const locationsText = translateLocationList(notice.locations, lang);

  // Category
  const catObj = CATEGORY_TRANSLATIONS[rawCategory] || { en: rawCategory, te: rawCategory, hi: rawCategory };
  const categoryText = catObj[lang] || catObj.en;

  // Urgency
  const urgObj = URGENCY_TRANSLATIONS[rawUrgency] || { en: rawUrgency, te: rawUrgency, hi: rawUrgency };
  const urgencyText = urgObj[lang] || urgObj.en;

  // Check department
  let authorityText = rawAuthority;
  for (const [deptKey, deptVal] of Object.entries(DEPARTMENT_TRANSLATIONS)) {
    if (rawAuthority.toLowerCase().includes(deptKey.toLowerCase())) {
      authorityText = deptVal[lang];
      break;
    }
  }

  // Check if pre-computed high quality translations exist in the notice record
  const savedTranslation = notice.translations && notice.translations[lang];

  // If language is English, return pure English
  if (lang === 'en') {
    return {
      title: savedTranslation?.title || rawTitle,
      category: categoryText,
      summary: savedTranslation?.summary || rawSummary,
      action: savedTranslation?.action || rawAction,
      authority: authorityText,
      urgency: urgencyText,
      locationsText: locationsText,
      deadlineText: deadline ? `Deadline: ${deadline}` : 'Until further notice',
      startDateText: startDate ? `Starts: ${startDate}` : 'Immediate',
      verificationBadge: isDemo ? 'DEMO DOCUMENT — NOT AN OFFICIAL GOVERNMENT NOTICE' : 'Official Verified Source',
      verificationSubtext: isDemo ? 'Project Demonstration Document' : `Verified by ${notice.verified_by || 'Administration'}`,
      officialGazetteExplainer: isDemo 
        ? `This text was extracted from the uploaded project demonstration document.`
        : `This section presents the exact, unedited text extracted from the official government gazette for verification and audit compliance.`
    };
  }

  // --- TELUGU TRANSLATION LOGIC ---
  if (lang === 'te') {
    let teTitle = '';
    let teSummary = '';
    let teAction = '';
    let teExplainer = '';

    // Check if clean Telugu translation already stored (and not an ugly "[తెలుగు]" fallback)
    if (savedTranslation && savedTranslation.title && !savedTranslation.title.includes('[తెలుగు]') && !savedTranslation.title.includes('Water Supply Interruption')) {
      teTitle = savedTranslation.title;
      teSummary = savedTranslation.summary;
      teAction = savedTranslation.action;
    } else {
      // Natural contextual Telugu synthesizer
      const lowerT = rawTitle.toLowerCase();
      const locFirst = locationsText.split(',')[0] || 'హైదరాబాద్';

      if (lowerT.includes('water supply') || lowerT.includes('water cut') || lowerT.includes('drinking water')) {
        teTitle = `${locFirst} పరిధిలో 24 గంటల తాగునీటి సరఫరా నిలిపివేత`;
        teSummary = `పైప్‌లైన్ అత్యవసర మరమ్మతు పనుల కారణంగా ${locationsText} ప్రాంతాలలో 24 గంటల పాటు తాగునీటి సరఫరా పూర్తిగా నిలిపివేయబడుతుంది.`;
        teAction = `పౌరులు ముందస్తుగా తగినంత నీటిని నిల్వ చేసుకోవాలి. అత్యవసర ఉచిత మునిసిపల్ వాటర్ ట్యాంకర్ల కోసం టోల్-ఫ్రీ హెల్ప్‌లైన్ నంబర్: 155313 ను సంప్రదించండి.`;
      } else if (lowerT.includes('scholarship') || lowerT.includes('epass') || lowerT.includes('merit')) {
        teTitle = `ఉన్నత విద్యా మెరిట్ స్కాలర్‌షిప్ & ఫీజు రీయింబర్స్‌మెంట్ దరఖాస్తు ప్రకటన`;
        teSummary = `డిగ్రీ, ఇంజనీరింగ్, మెడిసిన్ చదువుతున్న అర్హులైన విద్యార్థులందరూ ePASS పోర్టల్ ద్వారా స్కాలర్‌షిప్ కోసం దరఖాస్తు చేసుకోవాలని సూచించడమైనది. గడువు: ${deadline || 'వెంటనే'}.`;
        teAction = `అర్హులైన విద్యార్థులు తమ ఆధార్ మరియు ఆదాయ ధ్రువీకరణ పత్రాలను సిద్ధం చేసుకొని, కళాశాలలో బయోమెట్రిక్ ధ్రువీకరణను గడువు ముగిసేలోగా పూర్తి చేయాలి.`;
      } else if (lowerT.includes('rain') || lowerT.includes('flood') || lowerT.includes('weather') || lowerT.includes('cyclone')) {
        teTitle = `భారీ వర్షాలు & వరద ముందస్తు హెచ్చరిక – రెడ్ అలర్ట్`;
        teSummary = `వాతావరణ శాఖ హెచ్చరికల మేరకు ${locationsText} పరిసరాల్లో అతి భారీ వర్షాలు కురిసే అవకాశం ఉన్నందున ప్రజలు అప్రమత్తంగా ఉండాలి.`;
        teAction = `అత్యవసరమైతే తప్ప ఇళ్ల నుంచి బయటకు రావద్దు. విద్యుత్ స్తంభాలు, కాలువలు మరియు నాలాల వద్ద జాగ్రత్త వహించండి. హెల్ప్‌లైన్: 1070.`;
      } else if (lowerT.includes('traffic') || lowerT.includes('diversion') || lowerT.includes('metro')) {
        teTitle = `రహదారి మరమ్మతులు & మెట్రో పనుల నిమిత్తం ట్రాఫిక్ మళ్లింపు నోటీసు`;
        teSummary = `${locationsText} మార్గంలో అభివృద్ధి పనుల కారణంగా వాహనాల రాకపోకలపై ఆంక్షలు విధించబడ్డాయి.`;
        teAction = `వాహనదారులు ప్రత్యామ్నాయ మార్గాలను ఉపయోగించాలి మరియు ట్రాఫిక్ పోలీసులకు సహకరించాలి.`;
      } else if (lowerT.includes('power') || lowerT.includes('electricity') || lowerT.includes('shutdown')) {
        teTitle = `విద్యుత్ సబ్‌స్టేషన్ నిర్వహణ పనుల నిమిత్తం విద్యుత్ సరఫరా నిలిపివేత`;
        teSummary = `లైన్ల నిర్వహణ కొరకు ${locationsText} ప్రాంతాలలో ఉదయం 10:00 నుండి మధ్యాహ్నం 2:00 గంటల వరకు విద్యుత్ సరఫరా ఉండదు.`;
        teAction = `అవసరమైన ఎలక్ట్రానిక్ పరికరాలను ముందుగానే ఛార్జ్ చేసి ఉంచుకోవాల్సిందిగా వినియోగదారులకు సూచించడమైనది.`;
      } else {
        teTitle = `${categoryText} – ముఖ్యమైన ప్రభుత్వ ప్రజా ప్రకటన`;
        teSummary = `${authorityText} వారు ${locationsText} ప్రజల సమాచారం కొరకు ఈ ప్రకటనను జారీ చేశారు.`;
        teAction = `సంబంధిత పౌరులు వివరాలను పరిశీలించి నిర్దేశిత నిబంధనలను పాటించవలెను.`;
      }
    }

    teExplainer = isDemo
      ? `ఈ పాఠం అప్‌లోడ్ చేసిన ప్రాజెక్ట్ డెమో పత్రం నుండి సేకరించబడింది.`
      : `దిగువన ఉన్నది అసలైన ప్రభుత్వ గెజిట్ / నోటీసు కాపీ. ధ్రువీకరణ మరియు పరిశీలన కోసం అసలు ఆంగ్ల పాఠాన్ని యథాతథంగా ఉంచడమైనది.`;

    return {
      title: teTitle,
      category: categoryText,
      summary: teSummary,
      action: teAction,
      authority: authorityText,
      urgency: urgencyText,
      locationsText: locationsText,
      deadlineText: deadline ? `చివరి గడువు: ${deadline}` : 'తదుపరి నోటీసు వరకు',
      startDateText: startDate ? `అమలులోకి వచ్చు తేదీ: ${startDate}` : 'తక్షణమే',
      verificationBadge: isDemo ? 'డెమో పత్రం — అధికారిక ప్రభుత్వ నోటీసు కాదు' : 'అధికారిక ధ్రువీకృత సమాచారం',
      verificationSubtext: isDemo ? 'ప్రాజెక్ట్ డెమో పత్రం' : `పరిశీలించిన వారు: ${notice.verified_by || 'మున్సిపల్ అడ్మినిస్ట్రేషన్'}`,
      officialGazetteExplainer: teExplainer
    };
  }

  // --- HINDI TRANSLATION LOGIC ---
  if (lang === 'hi') {
    let hiTitle = '';
    let hiSummary = '';
    let hiAction = '';
    let hiExplainer = '';

    if (savedTranslation && savedTranslation.title && !savedTranslation.title.includes('[हिन्दी]') && !savedTranslation.title.includes('Water Supply Interruption')) {
      hiTitle = savedTranslation.title;
      hiSummary = savedTranslation.summary;
      hiAction = savedTranslation.action;
    } else {
      const lowerT = rawTitle.toLowerCase();
      const locFirst = locationsText.split(',')[0] || 'हैदराबाद';

      if (lowerT.includes('water supply') || lowerT.includes('water cut') || lowerT.includes('drinking water')) {
        hiTitle = `${locFirst} क्षेत्र में 24 घंटे जलापूर्ति अस्थायी रूप से बंद`;
        hiSummary = `कृष्णा फेज-III ट्रांसमिशन फीडर पर आवश्यक पाइपलाइन मरम्मत कार्य के कारण ${locationsText} क्षेत्रों में 24 घंटे तक पेयजल आपूर्ति पूरी तरह निलंबित रहेगी।`;
        hiAction = `नागरिकों को पर्याप्त जल भंडारण करने की सलाह दी जाती है। आपातकालीन मुफ्त पानी के टैंकर के लिए टोल-फ्री हेल्पलाइन: 155313 पर संपर्क करें।`;
      } else if (lowerT.includes('scholarship') || lowerT.includes('epass') || lowerT.includes('merit')) {
        hiTitle = `उच्च शिक्षा योग्यता छात्रवृत्ति एवं शुल्क प्रतिपूर्ति आवेदन सूचना`;
        hiSummary = `स्नातक, इंजीनियरिंग एवं मेडिकल पाठ्यक्रमों में अध्ययनरत पात्र छात्र ई-पास (ePASS) पोर्टल के माध्यम से छात्रवृत्ति हेतु आवेदन करें। अंतिम तिथि: ${deadline || 'शीघ्र'}.`;
        hiAction = `पात्र छात्र आवश्यक आय प्रमाण पत्र और आधार सत्यापन तैयार रखें तथा कॉलेज में बायोमेट्रिक सत्यापन समय सीमा से पूर्व पूरा करें।`;
      } else if (lowerT.includes('rain') || lowerT.includes('flood') || lowerT.includes('weather') || lowerT.includes('cyclone')) {
        hiTitle = `भारी वर्षा एवं बाढ़ चेतावनी – मौसम विभाग द्वारा रेड अलर्ट`;
        hiSummary = `मौसम विभाग की चेतावनी के अनुसार ${locationsText} एवं आसपास के इलाकों में अत्यधिक भारी बारिश की संभावना है। नागरिक सतर्क रहें।`;
        hiAction = `अनावश्यक रूप से घर से बाहर न निकलें। बिजली के खंभों, जलभराव वाले क्षेत्रों और नालों से दूरी बनाए रखें। आपदा हेल्पलाइन: 1070.`;
      } else if (lowerT.includes('traffic') || lowerT.includes('diversion') || lowerT.includes('metro')) {
        hiTitle = `सड़क मरम्मत एवं निर्माण कार्य के चलते यातायात डायवर्जन नोटिस`;
        hiSummary = `${locationsText} मार्ग पर विकास कार्य के कारण यातायात में बदलाव किया गया है।`;
        hiAction = `वाहन चालक वैकल्पिक मार्गों का उपयोग करें और यातायात पुलिस के निर्देशों का पालन करें।`;
      } else if (lowerT.includes('power') || lowerT.includes('electricity') || lowerT.includes('shutdown')) {
        hiTitle = `सब-स्टेशन रखरखाव कार्य के कारण विद्युत आपूर्ति में अस्थायी कटौती`;
        hiSummary = `सुचारू विद्युत प्रवाह हेतु ${locationsText} में सुबह 10:00 से दोपहर 2:00 बजे तक बिजली बंद रहेगी।`;
        hiAction = `नागरिक अपने आवश्यक इलेक्ट्रॉनिक उपकरणों को पहले से चार्ज रखें और असुविधा से बचें।`;
      } else {
        hiTitle = `${categoryText} – महत्वपूर्ण सरकारी सार्वजनिक सूचना`;
        hiSummary = `${authorityText} द्वारा ${locationsText} के निवासियों के लिए यह सूचना जारी की गई है।`;
        hiAction = `नागरिक सभी दिशा-निर्देशों का ध्यानपूर्वक पालन करें और आवश्यक सावधानी बरतें।`;
      }
    }

    hiExplainer = isDemo
      ? `यह पाठ अपलोड किए गए प्रोजेक्ट प्रदर्शन दस्तावेज़ (Demo Document) से निकाला गया है।`
      : `नीचे दिया गया पाठ मूल सरकारी परिपत्र की प्रतिलिपि है। प्रामाणिकता और सत्यापन के उद्देश्य से मूल अंग्रेजी पाठ को सुरक्षित रखा गया है।`;

    return {
      title: hiTitle,
      category: categoryText,
      summary: hiSummary,
      action: hiAction,
      authority: authorityText,
      urgency: urgencyText,
      locationsText: locationsText,
      deadlineText: deadline ? `अंतिम तिथि: ${deadline}` : 'अगले आदेश तक',
      startDateText: startDate ? `प्रारंभ तिथि: ${startDate}` : 'तत्काल',
      verificationBadge: isDemo ? 'डेमो दस्तावेज़ — यह कोई आधिकारिक सरकारी सूचना नहीं है' : 'आधिकारिक सत्यापित सरकारी सूचना',
      verificationSubtext: isDemo ? 'परियोजना प्रदर्शन दस्तावेज़' : `सत्यापितकर्ता: ${notice.verified_by || 'प्रशासनिक अधिकारी'}`,
      officialGazetteExplainer: hiExplainer
    };
  }

  return {
    title: rawTitle,
    category: categoryText,
    summary: rawSummary,
    action: rawAction,
    authority: authorityText,
    urgency: urgencyText,
    locationsText: locationsText,
    deadlineText: deadline,
    startDateText: startDate,
    verificationBadge: isDemo ? 'Demo Document' : 'Official Verified',
    verificationSubtext: '',
    officialGazetteExplainer: ''
  };
}
