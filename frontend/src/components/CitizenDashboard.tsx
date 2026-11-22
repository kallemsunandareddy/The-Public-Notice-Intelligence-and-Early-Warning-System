import React, { useState } from 'react';
import { 
  Bell, 
  MapPin, 
  Search, 
  AlertTriangle, 
  Clock, 
  Droplets, 
  ShieldAlert, 
  GraduationCap, 
  HeartHandshake, 
  Landmark, 
  Sparkles, 
  Bookmark,
  Volume2,
  ChevronRight,
  Filter,
  Globe,
  BellRing,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';
import { NoticeItem, NotificationRecord } from '../types';
import { InteractiveNoticeMap } from './InteractiveNoticeMap';
import { 
  SupportedLanguage, 
  UI_STRINGS, 
  getFullyLocalizedNotice,
  CATEGORY_TRANSLATIONS,
  LOCALITY_NAMES
} from '../services/localizationService';

interface CitizenDashboardProps {
  notices: NoticeItem[];
  notifications: NotificationRecord[];
  onSelectNotice: (notice: NoticeItem) => void;
  savedNotices: NoticeItem[];
  onToggleBookmark: (noticeId: string) => void;
}

const CATEGORY_ITEMS = [
  { name: 'All', icon: Sparkles },
  { name: 'Emergency & Disaster Alerts', icon: ShieldAlert },
  { name: 'Water & Electricity', icon: Droplets },
  { name: 'Traffic & Transportation', icon: AlertTriangle },
  { name: 'Education & Scholarships', icon: GraduationCap },
  { name: 'Health & Public Services', icon: HeartHandshake },
  { name: 'Tax & Legal Announcements', icon: Landmark },
];

const TELANGANA_DISTRICTS = [
  { id: 'All', en: 'All Telangana', te: 'తెలంగాణ అంతటా', hi: 'संपूर्ण तेलंगाना' },
  { id: 'Hyderabad', en: 'Hyderabad', te: 'హైదరాబాద్', hi: 'हैदराबाद' },
  { id: 'Rangareddy', en: 'Rangareddy', te: 'రంగారెడ్డి', hi: 'रंगारेड्डी' },
  { id: 'Medchal', en: 'Medchal-Malkajgiri', te: 'మేడ్చల్-మల్కాజిగిరి', hi: 'मेदचल-मलकाजगिरि' },
  { id: 'Warangal', en: 'Warangal', te: 'వరంగల్', hi: 'वारंगल' },
  { id: 'Karimnagar', en: 'Karimnagar', te: 'కరీంనగర్', hi: 'करीमनगर' },
  { id: 'Nizamabad', en: 'Nizamabad', te: 'నిజామాబాద్', hi: 'निजामाबाद' },
  { id: 'Khammam', en: 'Khammam', te: 'ఖమ్మం', hi: 'खम्मम' }
];

const HYDERABAD_LOCALITIES = [
  { id: 'All', en: 'All Localities', te: 'అన్ని ప్రాంతాలు', hi: 'सभी इलाके' },
  { id: 'Kukatpally', en: 'Kukatpally', te: 'కూకట్‌పల్లి', hi: 'कुकटपल्ली' },
  { id: 'Gachibowli', en: 'Gachibowli', te: 'గచ్చిబౌలి', hi: 'गच्चीबाउली' },
  { id: 'Madhapur', en: 'Madhapur', te: 'మాదాపూర్', hi: 'माधापुर' },
  { id: 'Hitec City', en: 'Hitec City', te: 'హైటెక్ సిటీ', hi: 'हाईटेक सिटी' },
  { id: 'Secunderabad', en: 'Secunderabad', te: 'సికింద్రాబాద్', hi: 'सिकंदराबाद' },
  { id: 'Banjara Hills', en: 'Banjara Hills', te: 'బంజారా హిల్స్', hi: 'बंजारा हिल्स' },
  { id: 'Jubilee Hills', en: 'Jubilee Hills', te: 'జూబ్లీ హిల్స్', hi: 'जुबली हिल्स' },
  { id: 'Ameerpet', en: 'Ameerpet', te: 'అమీర్‌పేట్', hi: 'अमीरपेट' },
  { id: 'Miyapur', en: 'Miyapur', te: 'మియాపూర్', hi: 'मियापुर' },
  { id: 'LB Nagar', en: 'LB Nagar', te: 'ఎల్బీ నగర్', hi: 'एल.बी. नगर' },
  { id: 'Charminar', en: 'Charminar', te: 'చార్మినార్', hi: 'चारमीनार' },
  { id: 'Begumpet', en: 'Begumpet', te: 'బేగంపేట్', hi: 'बेगमपेट' },
  { id: 'Kondapur', en: 'Kondapur', te: 'కొండాపూర్', hi: 'कोंडापुर' },
  { id: 'Uppal', en: 'Uppal', te: 'ఉప్పల్', hi: 'उप्पल' }
];

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  notices,
  notifications,
  onSelectNotice,
  savedNotices,
  onToggleBookmark,
}) => {
  // Multilingual preference for Citizen Portal
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');

  // Location filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedLocality, setSelectedLocality] = useState<string>('All');

  // Category & Urgency filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('All');

  // Search by title, department, location, keywords
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active view tab
  const [activeView, setActiveView] = useState<'feed' | 'emergency' | 'deadlines' | 'map' | 'saved' | 'alerts'>('feed');

  // Reminder notification popup state
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Active localized UI dictionary
  const t = UI_STRINGS[selectedLanguage];

  // Filter only PUBLISHED notices for citizens
  const publishedNotices = notices.filter(n => n.status === 'PUBLISHED');

  // Smart Search & Multi-criteria Filtering
  const filteredNotices = publishedNotices.filter((n) => {
    // 1. Category filter
    if (selectedCategory !== 'All') {
      const noticeCat = String(n.category);
      if (selectedCategory === 'Water & Electricity') {
        if (!noticeCat.includes('Water') && !noticeCat.includes('Electricity') && !noticeCat.includes('Power')) return false;
      } else if (selectedCategory === 'Education & Scholarships') {
        if (!noticeCat.includes('Scholar') && !noticeCat.includes('Education')) return false;
      } else if (n.category !== selectedCategory) {
        return false;
      }
    }

    // 2. Urgency filter
    if (selectedUrgency !== 'All' && n.urgency !== selectedUrgency) {
      return false;
    }

    // 3. District / State filter
    if (selectedDistrict !== 'All') {
      const distLower = selectedDistrict.toLowerCase();
      const inLocations = n.locations && n.locations.some(l => l.toLowerCase().includes(distLower));
      const inText = (n.title + ' ' + n.summary + ' ' + (n.original_text || '')).toLowerCase().includes(distLower);
      if (!inLocations && !inText) return false;
    }

    // 4. Locality filter
    if (selectedLocality !== 'All') {
      const locLower = selectedLocality.toLowerCase();
      const inLocations = n.locations && n.locations.some(l => l.toLowerCase().includes(locLower));
      const inText = (n.title + ' ' + n.summary + ' ' + (n.original_text || '')).toLowerCase().includes(locLower);
      if (!inLocations && !inText) return false;
    }

    // 5. Smart Search (Title, Department, Location, Summary)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchSummary = n.summary.toLowerCase().includes(q);
      const matchAuthority = n.authority?.toLowerCase().includes(q);
      const matchCategory = n.category?.toLowerCase().includes(q);
      const matchLocation = n.locations?.some(l => l.toLowerCase().includes(q));
      if (!matchTitle && !matchSummary && !matchAuthority && !matchCategory && !matchLocation) {
        return false;
      }
    }

    return true;
  });

  // Emergency / Critical and High alerts
  const criticalAlerts = publishedNotices.filter(n => n.urgency === 'CRITICAL');
  const highPriorityNotices = publishedNotices.filter(n => n.urgency === 'HIGH');
  const upcomingDeadlines = publishedNotices.filter(n => Boolean(n.deadline));

  const handleSetReminder = (notice: NoticeItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const loc = getFullyLocalizedNotice(notice, selectedLanguage);
    const msg = selectedLanguage === 'te' 
      ? `రిమైండర్ సెట్ చేయబడింది: ${loc.title}` 
      : selectedLanguage === 'hi' 
      ? `स्मरण सेट किया गया: ${loc.title}`
      : `Reminder set for: ${loc.title}`;
    setReminderToast(msg);
    setTimeout(() => {
      setReminderToast(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {reminderToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-xs animate-slide-up">
          <BellRing className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span className="font-semibold">{reminderToast}</span>
          <button onClick={() => setReminderToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Citizen Hero Header with Multilingual Selection */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {selectedLanguage === 'te' ? 'AI ఆధారిత పౌర సమాచార వేదిక' :
                 selectedLanguage === 'hi' ? 'एआई-संचालित नागरिक सूचना मंच' :
                 'AI-Powered Citizen Notice Intelligence'}
              </span>
            </div>

            {/* Language Selector Pill */}
            <div className="flex items-center bg-black/40 backdrop-blur-md rounded-xl p-1 border border-white/20">
              <Globe className="w-3.5 h-3.5 mx-2 text-cyan-300" />
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedLanguage === 'en' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setSelectedLanguage('te')}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedLanguage === 'te' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => setSelectedLanguage('hi')}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedLanguage === 'hi' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t.tagline}
          </h1>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-3xl">
            {t.heroDescription}
          </p>

          {/* Location Preferences Selection Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-xs text-slate-300 font-semibold">{t.districtLabel}</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent text-xs text-white font-bold outline-none cursor-pointer"
              >
                {TELANGANA_DISTRICTS.map(dist => (
                  <option key={dist.id} value={dist.id} className="bg-slate-900 text-white">
                    {dist[selectedLanguage]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <span className="text-xs text-slate-300 font-semibold">{t.localityLabel}</span>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="bg-transparent text-xs text-white font-bold outline-none cursor-pointer"
              >
                {HYDERABAD_LOCALITIES.map(loc => (
                  <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                    {loc[selectedLanguage]}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick locality pills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {['Kukatpally', 'Gachibowli', 'Madhapur', 'Secunderabad'].map(locId => {
                const item = HYDERABAD_LOCALITIES.find(h => h.id === locId);
                const label = item ? item[selectedLanguage] : locId;
                return (
                  <button
                    key={locId}
                    onClick={() => setSelectedLocality(locId)}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition ${
                      selectedLocality === locId ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
              {(selectedLocality !== 'All' || selectedDistrict !== 'All') && (
                <button
                  onClick={() => { setSelectedDistrict('All'); setSelectedLocality('All'); }}
                  className="text-[11px] text-cyan-300 hover:underline ml-1"
                >
                  {selectedLanguage === 'te' ? 'రీసెట్' : selectedLanguage === 'hi' ? 'रीसेट' : 'Clear location'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Decorative backdrop element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial pointer-events-none" />
      </div>

      {/* Critical Disaster Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-2">
          {criticalAlerts.map((alertNotice) => {
            const locContent = getFullyLocalizedNotice(alertNotice, selectedLanguage);
            return (
              <div
                key={alertNotice.id}
                onClick={() => onSelectNotice(alertNotice)}
                className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-4 rounded-xl shadow-lg flex items-center justify-between cursor-pointer hover:brightness-105 transition border-2 border-red-400/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg animate-pulse">
                    <ShieldAlert className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] bg-white text-red-700 font-extrabold uppercase px-2 py-0.5 rounded">
                        🚨 {locContent.urgency}
                      </span>
                      <span className="text-xs font-semibold text-red-100">
                        📍 {locContent.locationsText}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm mt-0.5">{locContent.title}</h3>
                    <p className="text-xs text-red-100 line-clamp-1">{locContent.summary}</p>
                    <p className="text-xs font-bold text-amber-200 mt-0.5">⚠️ {t.actionRequired} {locContent.action}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* View Switcher Tabs & Smart Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveView('feed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeView === 'feed'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{t.publicFeed}</span>
              <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                {filteredNotices.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('emergency')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeView === 'emergency'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              <span>{t.emergencyAlerts}</span>
              <span className="px-1.5 py-0.2 bg-red-100 text-red-800 rounded-full text-[10px] font-extrabold">
                {criticalAlerts.length + highPriorityNotices.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('deadlines')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeView === 'deadlines'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              <span>{t.upcomingDeadlines}</span>
              <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-full text-[10px] font-extrabold">
                {upcomingDeadlines.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('map')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeView === 'map'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t.interactiveMap}</span>
            </button>

            <button
              onClick={() => setActiveView('alerts')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeView === 'alerts'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{t.broadcasts}</span>
              <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                {notifications.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('saved')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeView === 'saved'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{t.savedNotices} ({savedNotices.length})</span>
            </button>
          </div>

          {/* Smart Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns: Urgency & Active Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-semibold flex items-center">
              <Filter className="w-3 h-3 mr-1 text-blue-600" /> {t.filterUrgency}
            </span>
            {['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((urg) => (
              <button
                key={urg}
                onClick={() => setSelectedUrgency(urg)}
                className={`px-2.5 py-0.5 rounded-lg font-bold text-[11px] transition ${
                  selectedUrgency === urg
                    ? urg === 'CRITICAL' ? 'bg-red-600 text-white' :
                      urg === 'HIGH' ? 'bg-orange-600 text-white' :
                      urg === 'MEDIUM' ? 'bg-amber-500 text-white' :
                      'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {urg === 'All' ? t.allUrgency : urg}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            {selectedLanguage === 'te' 
              ? <>లభించిన ఫలితాలు: <strong className="text-slate-800">{filteredNotices.length}</strong> ప్రకటనలు</>
              : selectedLanguage === 'hi'
              ? <>उपलब्ध सूचनाएं: <strong className="text-slate-800">{filteredNotices.length}</strong></>
              : <>Showing <strong className="text-slate-800">{filteredNotices.length}</strong> matching notices</>}
          </div>
        </div>
      </div>

      {/* Main View Content Switcher */}
      {activeView === 'map' ? (
        <InteractiveNoticeMap
          notices={publishedNotices}
          onSelectNotice={onSelectNotice}
          selectedLocality={selectedLocality === 'All' ? 'All' : selectedLocality}
          onSelectLocality={(l) => setSelectedLocality(l)}
        />
      ) : activeView === 'alerts' ? (
        /* Alerts Broadcast Center */
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center">
                <Bell className="w-4 h-4 mr-1.5 text-blue-600" /> {t.broadcasts}
              </h3>
              <p className="text-xs text-slate-400">Pushed via Firebase Cloud Messaging & Web Notification Gateway</p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded">
              Gateway Status: Active
            </span>
          </div>

          <div className="space-y-3">
            {notifications.map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/40 transition flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                      record.urgency === 'CRITICAL' ? 'bg-red-600 text-white' :
                      record.urgency === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {record.urgency}
                    </span>
                    <span className="text-xs text-slate-400">
                      Channel: {record.channel} • Delivered to {record.recipient_count} citizens
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{record.title}</h4>
                  <p className="text-xs text-slate-600">{record.message}</p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium shrink-0">
                  {new Date(record.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : activeView === 'emergency' ? (
        /* Emergency Alerts Tab */
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-sm font-bold text-red-950">
                  {selectedLanguage === 'te' ? 'అత్యవసర & విపత్తు హెచ్చరికలు' : selectedLanguage === 'hi' ? 'सक्रिय आपातकालीन एवं आपदा चेतावनी' : 'Active Emergency & Urgent Civic Warnings'}
                </h3>
                <p className="text-xs text-red-700">Immediate citizen advisories requiring proactive measures or caution</p>
              </div>
            </div>
            <span className="text-xs font-extrabold bg-red-600 text-white px-2.5 py-1 rounded-full">
              {criticalAlerts.length + highPriorityNotices.length} {t.emergencyAlerts}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...criticalAlerts, ...highPriorityNotices].map((n) => {
              const loc = getFullyLocalizedNotice(n, selectedLanguage);
              const isSaved = savedNotices.some(s => s.id === n.id);
              return (
                <div
                  key={n.id}
                  onClick={() => onSelectNotice(n)}
                  className="bg-white p-5 rounded-2xl border-2 border-red-200 hover:border-red-400 shadow-sm cursor-pointer transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded text-white ${
                      n.urgency === 'CRITICAL' ? 'bg-red-600 animate-pulse' : 'bg-orange-600'
                    }`}>
                      {loc.urgency}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleBookmark(n.id); }}
                      className={`p-1.5 rounded-lg border transition ${
                        isSaved ? 'text-amber-500 border-amber-200 bg-amber-50' : 'text-slate-400 border-slate-200'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">{loc.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{loc.summary}</p>
                  <div className="p-2.5 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 font-semibold">
                    ⚠️ {t.actionRequired} {loc.action}
                  </div>
                  <div className="pt-2 border-t flex justify-between items-center text-[11px] text-slate-500">
                    <span>📍 {loc.locationsText}</span>
                    <span>🏛️ {loc.authority}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeView === 'deadlines' ? (
        /* Upcoming Deadlines Tab */
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-sm font-bold text-purple-950">{t.upcomingDeadlines}</h3>
                <p className="text-xs text-purple-700">Time-sensitive applications, submission windows and service dates</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-purple-600 text-white px-2.5 py-1 rounded-full">
              {upcomingDeadlines.length} {t.upcomingDeadlines}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingDeadlines.map((n) => {
              const loc = getFullyLocalizedNotice(n, selectedLanguage);
              return (
                <div
                  key={n.id}
                  onClick={() => onSelectNotice(n)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-400 shadow-sm cursor-pointer transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      {loc.category}
                    </span>
                    <span className="text-xs font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      ⏰ {loc.deadlineText}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{loc.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{loc.summary}</p>
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                    {t.actionRequired} {loc.action}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-[11px] text-slate-500">🏛️ {loc.authority}</span>
                    <button
                      onClick={(e) => handleSetReminder(n, e)}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1"
                    >
                      <BellRing className="w-3.5 h-3.5 mr-1" />
                      <span>{t.setReminder}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeView === 'saved' ? (
        /* Saved Bookmarks */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <Bookmark className="w-4 h-4 mr-1.5 text-amber-500" /> {t.savedNotices}
            </h3>
            <span className="text-xs text-slate-500">{savedNotices.length} saved</span>
          </div>
          {savedNotices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedNotices.map((n) => {
                const loc = getFullyLocalizedNotice(n, selectedLanguage);
                return (
                  <div
                    key={n.id}
                    onClick={() => onSelectNotice(n)}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 cursor-pointer transition space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
                        {loc.category}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleBookmark(n.id); }}
                        className="text-amber-500 hover:text-slate-400"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{loc.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{loc.summary}</p>
                    {n.deadline && (
                      <p className="text-xs font-bold text-red-600">⏰ {loc.deadlineText}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border text-slate-400">
              <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">{t.noSavedNotices}</p>
            </div>
          )}
        </div>
      ) : (
        /* Standard Feed View with Category Shortcuts and Notice Cards */
        <div className="space-y-6">
          {/* Category Shortcuts */}
          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
            {CATEGORY_ITEMS.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              const translatedCatName = cat.name === 'All' 
                ? (selectedLanguage === 'te' ? 'అన్నీ' : selectedLanguage === 'hi' ? 'सभी' : 'All')
                : (CATEGORY_TRANSLATIONS[cat.name] ? CATEGORY_TRANSLATIONS[cat.name][selectedLanguage] : cat.name);

              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : ''}`} />
                  <span>{translatedCatName}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notices Main Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  {selectedLanguage === 'te' ? `పౌర ప్రకటనలు & హెచ్చరికలు (${filteredNotices.length})` :
                   selectedLanguage === 'hi' ? `सार्वजनिक सूचनाएं एवं परामर्श (${filteredNotices.length})` :
                   `Public Announcements & Advisories (${filteredNotices.length})`}
                </h3>
                <span className="text-xs text-slate-400">
                  {selectedLanguage === 'te' ? 'పౌరుల కోసం ధ్రువీకరించబడిన సమాచారం' :
                   selectedLanguage === 'hi' ? 'नागरिकों के लिए सत्यापित सूचनाएं' :
                   'Authenticated & published notices for citizens'}
                </span>
              </div>

              {filteredNotices.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border text-slate-400 space-y-2">
                  <AlertCircle className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">{t.noNoticesFound}</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedUrgency('All');
                      setSelectedLocality('All');
                      setSelectedDistrict('All');
                      setSearchQuery('');
                    }}
                    className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                  >
                    {t.resetFilters}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredNotices.map((notice) => {
                    const isSaved = savedNotices.some(s => s.id === notice.id);
                    const localized = getFullyLocalizedNotice(notice, selectedLanguage);

                    return (
                      <div
                        key={notice.id}
                        onClick={() => onSelectNotice(notice)}
                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition cursor-pointer space-y-3"
                      >
                        {/* Top Badges */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              notice.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                              notice.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                              notice.urgency === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {localized.urgency}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {localized.category}
                            </span>
                            {(notice.title.toLowerCase().includes('sample') ||
                              notice.title.toLowerCase().includes('demonstration') ||
                              (notice.original_text && notice.original_text.toLowerCase().includes('fictional')) ||
                              (notice.authority && notice.authority.toLowerCase().includes('demo'))) ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                {t.demoNotice}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                {t.officialNotice}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); onSelectNotice(notice); }}
                              className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
                              title={t.listenNow}
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onToggleBookmark(notice.id); }}
                              className={`p-1.5 rounded-lg border transition ${
                                isSaved ? 'text-amber-500 border-amber-200 bg-amber-50' : 'text-slate-400 border-slate-200 hover:bg-slate-50'
                              }`}
                              title="Save Notice"
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Title in Selected Language */}
                        <h4 className="text-base font-bold text-slate-900 hover:text-blue-600 transition leading-snug">
                          {localized.title}
                        </h4>

                        {/* Plain Language Summary */}
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {localized.summary}
                        </p>

                        {/* Action Step Highlight */}
                        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 font-medium flex items-center space-x-2">
                          <span className="font-bold shrink-0">{t.actionRequired}</span>
                          <span className="truncate">{localized.action}</span>
                        </div>

                        {/* Footer Details */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                          <span className="flex items-center font-medium text-slate-600">
                            🏛️ {localized.authority}
                          </span>
                          <div className="flex items-center space-x-3">
                            <span>📍 {localized.locationsText}</span>
                            {notice.deadline && (
                              <button
                                onClick={(e) => handleSetReminder(notice, e)}
                                className="text-red-500 font-semibold hover:underline flex items-center"
                              >
                                ⏰ {localized.deadlineText}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Upcoming Deadlines & AI Explainer */}
            <div className="space-y-6">
              {/* Upcoming Deadlines Widget */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-purple-600" /> {t.upcomingDeadlines}
                  </h3>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    Active Reminders
                  </span>
                </div>
                <p className="text-xs text-slate-400">Automated reminder engine triggers 7d, 3d & 1d in advance</p>

                <div className="space-y-2.5 pt-1">
                  {upcomingDeadlines.map((n) => {
                    const loc = getFullyLocalizedNotice(n, selectedLanguage);
                    return (
                      <div
                        key={n.id}
                        onClick={() => onSelectNotice(n)}
                        className="p-3 rounded-xl border border-slate-100 hover:border-purple-300 hover:bg-purple-50/30 transition cursor-pointer"
                      >
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                            {loc.category}
                          </span>
                          <span className="font-extrabold text-red-600">
                            Due: {n.deadline}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-800 truncate">{loc.title}</h5>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{loc.action}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Multilingual Voice Feature Callout */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs uppercase">
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  <span>Multilingual Civic Access</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedLanguage === 'te' 
                    ? 'తెలుగు, హిందీ మరియు ఆంగ్లంలో నోటీసులను చదవండి లేదా వినండి'
                    : selectedLanguage === 'hi'
                    ? 'हिंदी, तेलुगु एवं अंग्रेजी में सूचनाएं पढ़ें अथवा सुनें'
                    : 'Read or Listen to Notices in Telugu, Hindi & English'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedLanguage === 'te'
                    ? 'ప్రతి పౌర ప్రకటన సరళమైన భాషలోకి అనువదించబడి AI వాయిస్ ద్వారా స్పష్టంగా చదవబడుతుంది.'
                    : selectedLanguage === 'hi'
                    ? 'प्रत्येक सार्वजनिक परिपत्र को स्पष्ट एवं सरल भाषा में एआई वॉयस द्वारा सुनाया जाता है।'
                    : 'Every public circular is automatically converted into plain language and narrated via AI text-to-speech with full Listen, Pause, Resume, and Stop controls.'}
                </p>
                <div className="flex space-x-2 text-xs">
                  <button 
                    onClick={() => setSelectedLanguage('en')}
                    className={`px-2.5 py-1 rounded-md border font-semibold transition ${selectedLanguage === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => setSelectedLanguage('te')}
                    className={`px-2.5 py-1 rounded-md border font-semibold transition ${selectedLanguage === 'te' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700'}`}
                  >
                    తెలుగు
                  </button>
                  <button 
                    onClick={() => setSelectedLanguage('hi')}
                    className={`px-2.5 py-1 rounded-md border font-semibold transition ${selectedLanguage === 'hi' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700'}`}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
