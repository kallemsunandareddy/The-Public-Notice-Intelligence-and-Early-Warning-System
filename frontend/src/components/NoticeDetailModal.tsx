import React, { useState, useRef, useEffect } from 'react';
import { NoticeItem } from '../types';
import { 
  Volume2, 
  VolumeX, 
  Bookmark, 
  Globe, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Building, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Pause, 
  Square, 
  Calendar, 
  Share2, 
  Check, 
  BellRing, 
  Info,
  FileText,
  FileCheck
} from 'lucide-react';
import { apiService } from '../services/api';
import { 
  SupportedLanguage, 
  UI_STRINGS, 
  getFullyLocalizedNotice 
} from '../services/localizationService';
import { auditNoticeAuthenticity } from '../utils/sourceVerification';

interface NoticeDetailModalProps {
  notice: NoticeItem | null;
  onClose: () => void;
  onBookmarkToggle?: (id: string) => void;
  isBookmarked?: boolean;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({
  notice,
  onClose,
  onBookmarkToggle,
  isBookmarked = false
}) => {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [speechState, setSpeechState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop any ongoing speech when modal unmounts or notice changes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [notice]);

  // When language changes while playing, restart playback cleanly in newly selected language
  useEffect(() => {
    if (speechState === 'playing') {
      window.speechSynthesis.cancel();
      setSpeechState('idle');
      setTimeout(() => {
        handlePlay();
      }, 150);
    }
  }, [currentLang]);

  if (!notice) return null;

  // Active UI dictionary for current language
  const t = UI_STRINGS[currentLang];

  // Dynamic Natural Localization for the current notice
  const localized = getFullyLocalizedNotice(notice, currentLang);

  // Text-To-Speech implementation using browser SpeechSynthesis API in chosen language
  const handlePlay = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    if (speechState === 'paused') {
      window.speechSynthesis.resume();
      setSpeechState('playing');
      return;
    }

    window.speechSynthesis.cancel();

    let intro = 'Government Public Notice.';
    let actionLabel = 'Recommended Action:';
    if (currentLang === 'te') {
      intro = 'ప్రభుత్వ ప్రజా ప్రకటన.';
      actionLabel = 'పౌరులు తీసుకోవలసిన చర్య:';
    } else if (currentLang === 'hi') {
      intro = 'सरकारी सार्वजनिक सूचना.';
      actionLabel = 'नागरिकों के लिए आवश्यक निर्देश:';
    }

    const textToRead = `${intro} ${localized.title}. ${localized.authority}. ${localized.summary}. ${actionLabel} ${localized.action}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);

    // Language voices where supported
    utterance.lang = currentLang === 'te' ? 'te-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;

    // Pick best matching native voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(currentLang));
      if (match) utterance.voice = match;
    }

    utterance.onend = () => setSpeechState('idle');
    utterance.onerror = () => setSpeechState('idle');

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeechState('playing');
  };

  const handlePause = () => {
    if ('speechSynthesis' in window && speechState === 'playing') {
      window.speechSynthesis.pause();
      setSpeechState('paused');
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeechState('idle');
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    try {
      await apiService.submitFeedback({
        notice_id: notice.id,
        feedback_type: 'SUMMARY_RATING',
        comments: feedbackText,
        rating: 5
      });
      setFeedbackSent(true);
      setFeedbackText('');
    } catch (e) {
      setFeedbackSent(true);
    }
  };

  const handleSetReminder = () => {
    setReminderSet(true);
    setTimeout(() => setReminderSet(false), 4000);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${localized.title} - ${window.location.origin}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-red-600 text-white animate-pulse';
      case 'HIGH':
        return 'bg-orange-600 text-white';
      case 'MEDIUM':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  // Authenticity audit: accurately distinguishes Demo, Authentic Government, and Unverified documents
  const audit = auditNoticeAuthenticity(notice);
  const isDemoDocument = audit.isDemo;
  const isOfficiallyVerified = audit.isAuthentic;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-6 border border-slate-200">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider ${getUrgencyBadge(notice.urgency)}`}>
              {localized.urgency}
            </span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded font-medium">
              {localized.category}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
              notice.status === 'PUBLISHED' ? 'bg-emerald-600 text-white' :
              notice.status === 'APPROVED' ? 'bg-green-600 text-white' :
              notice.status === 'VERIFIED' ? 'bg-blue-600 text-white' :
              notice.status === 'REJECTED' ? 'bg-red-600 text-white' :
              'bg-amber-500 text-white'
            }`}>
              {notice.status === 'PENDING_REVIEW' ? t.pendingVerification : notice.status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition text-slate-300"
              title="Share Notice"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onBookmarkToggle && onBookmarkToggle(notice.id)}
              className={`p-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition ${isBookmarked ? 'text-amber-400' : 'text-slate-300'}`}
              title="Bookmark Notice"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl font-bold px-2 leading-none"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Multilingual Switcher Header */}
        <div className="bg-slate-100 px-6 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>{t.selectLanguage}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentLang('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                currentLang === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-200 border'
              }`}
            >
              <span>English</span>
            </button>
            <button
              onClick={() => setCurrentLang('te')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                currentLang === 'te' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-200 border'
              }`}
            >
              <span>తెలుగు (Telugu)</span>
            </button>
            <button
              onClick={() => setCurrentLang('hi')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                currentLang === 'hi' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-200 border'
              }`}
            >
              <span>हिन्दी (Hindi)</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* Dynamic Verification Status Alert Banner */}
          {isDemoDocument ? (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-amber-900 text-xs">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-bold">{t.demoNotice}</span>
              </div>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-semibold">
                {localized.verificationSubtext}
              </span>
            </div>
          ) : isOfficiallyVerified ? (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-emerald-900 text-xs">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{t.verifiedSource}</span>
              </div>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-semibold">
                {localized.verificationSubtext}
              </span>
            </div>
          ) : notice.status === 'REJECTED' ? (
            <div className="p-3 bg-red-50 border border-red-300 rounded-xl flex items-center justify-between text-red-900 text-xs">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-bold">{t.rejectedNotice}</span>
              </div>
              <span className="text-[10px] bg-red-200 text-red-900 px-2 py-0.5 rounded font-semibold">
                {currentLang === 'te' ? 'అధికారులచే తిరస్కరించబడింది' : currentLang === 'hi' ? 'प्रशासन द्वारा अस्वीकृत' : 'Rejected by Administration'}
              </span>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-300 rounded-xl flex items-center justify-between text-blue-900 text-xs">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-bold">{t.pendingVerification}</span>
              </div>
              <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-semibold">
                {currentLang === 'te' ? 'పరిశీలనలో ఉన్నది' : currentLang === 'hi' ? 'सत्यापन प्रक्रियाधीन' : 'Under Review'}
              </span>
            </div>
          )}

          {/* Title & Authority */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              {localized.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center text-slate-700 font-medium">
                <Building className="w-3.5 h-3.5 mr-1 text-blue-600" /> {localized.authority}
              </span>
              <span className="flex items-center">
                {isDemoDocument ? (
                  <span className="flex items-center text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" /> {t.demoNotice}
                  </span>
                ) : isOfficiallyVerified ? (
                  <span className="flex items-center text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> {t.verifiedSource}
                  </span>
                ) : (
                  <span className="flex items-center text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" /> {t.pendingVerification}
                  </span>
                )}
              </span>
              {notice.deadline && (
                <span className="flex items-center text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded">
                  <Clock className="w-3.5 h-3.5 mr-1" /> {localized.deadlineText}
                </span>
              )}
            </div>
          </div>

          {/* AI Voice Assistant with Complete Listen, Pause, Resume, Stop Controls in Native Voice */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-lg text-white transition ${speechState === 'playing' ? 'bg-cyan-600 animate-pulse' : 'bg-blue-600'}`}>
                {speechState === 'playing' ? <Volume2 className="w-5 h-5" /> : speechState === 'paused' ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-bold text-blue-950 flex items-center space-x-1.5">
                  <span>{t.voiceHeading}</span>
                  <span className="text-[10px] bg-blue-200/70 text-blue-900 px-1.5 py-0.2 rounded font-semibold uppercase">
                    {currentLang === 'te' ? 'తెలుగు' : currentLang === 'hi' ? 'हिन्दी' : 'English'}
                  </span>
                </p>
                <p className="text-[11px] text-blue-700">
                  {speechState === 'playing' 
                    ? (currentLang === 'te' ? 'తెలుగులో స్పష్టంగా చదవబడుతోంది...' : currentLang === 'hi' ? 'हिंदी में सूचना पढ़ी जा रही है...' : 'Reading notice aloud in English...') 
                    : speechState === 'paused' 
                    ? (currentLang === 'te' ? 'వాయిస్ పాజ్ చేయబడింది. కొనసాగించడానికి పునఃప్రారంభించండి క్లిక్ చేయండి.' : currentLang === 'hi' ? 'आवाज रोकी गई है। जारी रखने के लिए पुनः सुनें पर क्लिक करें।' : 'Voice paused. Click Resume to continue listening.') 
                    : t.voiceSubtext}
                </p>
              </div>
            </div>

            {/* Audio Action Buttons */}
            <div className="flex items-center space-x-2">
              {speechState === 'playing' ? (
                <>
                  <button
                    onClick={handlePause}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition flex items-center space-x-1 shadow-sm cursor-pointer"
                    title="Pause voice"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>{t.pauseVoice}</span>
                  </button>
                  <button
                    onClick={handleStop}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition flex items-center space-x-1 shadow-sm cursor-pointer"
                    title="Stop voice"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>{t.stopVoice}</span>
                  </button>
                </>
              ) : speechState === 'paused' ? (
                <>
                  <button
                    onClick={handlePlay}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center space-x-1 shadow-sm cursor-pointer"
                    title="Resume voice"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{t.resumeVoice}</span>
                  </button>
                  <button
                    onClick={handleStop}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-600 hover:bg-slate-700 text-white transition flex items-center space-x-1 cursor-pointer"
                    title="Stop voice"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>{t.stopVoice}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handlePlay}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.listenNow}</span>
                </button>
              )}
            </div>
          </div>

          {/* Citizen Plain Summary Card */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center">
              {t.simpleSummaryTitle}
            </h4>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {localized.summary}
            </p>
          </div>

          {/* Citizen Action Step */}
          <div className="border-l-4 border-emerald-500 bg-emerald-50 p-4 rounded-r-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
              {t.actionStepsTitle}
            </h4>
            <p className="text-sm font-semibold text-emerald-800">
              {localized.action}
            </p>
          </div>

          {/* Affected Localities & Deadline Reminder Widget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" /> {t.affectedAreasTitle}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {localized.locationsText ? (
                  localized.locationsText.split(',').map((loc, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold border border-blue-200">
                      📍 {loc.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    {currentLang === 'te' ? 'రాష్ట్రవ్యాప్త ప్రాంతాలు' : currentLang === 'hi' ? 'राज्यव्यापी क्षेत्र' : 'State-wide (All areas)'}
                  </span>
                )}
              </div>
            </div>

            {notice.deadline && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-purple-600" /> {t.deadlineNotice}
                  </span>
                  <p className="text-xs font-extrabold text-red-600 mt-1">
                    {localized.deadlineText}
                  </p>
                </div>
                <button
                  onClick={handleSetReminder}
                  className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>{reminderSet ? t.reminderActive : t.setReminder}</span>
                </button>
              </div>
            )}
          </div>

          {/* Document Verification & Preview Section (Accurate Separation of Demo vs Authentic Gazette) */}
          <div className="border rounded-xl p-4 bg-white space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                {isDemoDocument ? (
                  <>
                    <FileText className="w-4 h-4 mr-1 text-amber-600" />
                    <span>{t.uploadedDocPreview || 'UPLOADED DOCUMENT PREVIEW'}</span>
                  </>
                ) : isOfficiallyVerified ? (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
                    <span>{t.officialVerification}</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4 mr-1 text-blue-600" />
                    <span>{t.uploadedDocPreview || 'UPLOADED DOCUMENT PREVIEW'}</span>
                  </>
                )}
              </h4>
              {notice.source_url && (
                <a
                  href={notice.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  {isDemoDocument ? (t.viewUploadedDoc || 'View Original Uploaded Document →') : t.viewOfficialGazette}
                </a>
              )}
            </div>

            {/* Translated Explainer for citizens with accurate attribution */}
            <div className={`p-3 border rounded-xl text-xs flex items-start space-x-2 ${
              isDemoDocument 
                ? 'bg-amber-50/70 border-amber-200 text-amber-950' 
                : 'bg-blue-50/70 border-blue-200 text-blue-950'
            }`}>
              <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isDemoDocument ? 'text-amber-600' : 'text-blue-600'}`} />
              <div>
                <p className="font-bold">{t.translatedExplainerTitle}</p>
                <p className={`mt-0.5 leading-relaxed ${isDemoDocument ? 'text-amber-900' : 'text-blue-900'}`}>
                  {localized.summary} {localized.action}
                </p>
                <p className={`mt-1 text-[11px] font-medium italic ${isDemoDocument ? 'text-amber-700' : 'text-blue-700'}`}>
                  {localized.officialGazetteExplainer}
                </p>
              </div>
            </div>

            {/* Verbatim unedited document text & preview */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                {isDemoDocument ? (t.uploadedDocTitle || 'Original Uploaded Document Text (Extracted):') : t.originalDocumentTitle}
              </span>
              {notice.original_text ? (
                <div className="text-xs text-slate-600 max-h-36 overflow-y-auto p-3 bg-slate-50 rounded font-mono border leading-relaxed">
                  {notice.original_text}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  {isDemoDocument 
                    ? (currentLang === 'te' ? 'అప్‌లోడ్ చేసిన డెమో పత్రం నుండి సేకరించబడింది.' : currentLang === 'hi' ? 'अपलोड किए गए डेमो दस्तावेज़ से निकाला गया।' : 'Extracted from uploaded demo document.')
                    : (currentLang === 'te' ? 'అధికారిక గెజిట్ నుండి సంగ్రహించబడింది.' : currentLang === 'hi' ? 'आधिकारिक राजपत्र से लिया गया।' : 'Extracted from verified government gazette.')}
                </p>
              )}
            </div>
          </div>

          {/* Citizen Feedback & Question Section - Completely Localized */}
          <div className="border-t pt-4">
            <h4 className="text-xs font-bold text-slate-700 mb-2">
              {t.feedbackPrompt}
            </h4>
            {feedbackSent ? (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs font-medium">
                {t.feedbackSuccess}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={t.feedbackPlaceholder}
                  className="flex-1 text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleSendFeedback}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  <span>{t.submitFeedback}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
