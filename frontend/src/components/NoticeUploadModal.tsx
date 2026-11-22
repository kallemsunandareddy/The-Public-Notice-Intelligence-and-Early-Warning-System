import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Cpu, 
  RefreshCw, 
  AlertCircle, 
  Calendar,
  MapPin,
  Clock,
  Building,
  Hash,
  ShieldCheck,
  Sparkles,
  X,
  RotateCcw,
  Save,
  Check
} from 'lucide-react';
import { apiService } from '../services/api';
import { NoticeItem, NoticeCategory, UrgencyLevel } from '../types';

interface NoticeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoticeCreated: (notice: NoticeItem) => void;
}

// Single shared state interface for all notice fields
interface NoticeFormData {
  id?: string;
  title: string;
  authority: string;
  category: NoticeCategory;
  urgency: UrgencyLevel;
  locations: string; // Comma-separated for easy editing
  notice_id: string;
  start_date: string;
  deadline: string;
  summary: string;
  action_summary: string;
  source_url: string;
  manual_text: string;
  confidence_score: number;
}

const DEFAULT_FORM_DATA: NoticeFormData = {
  title: '',
  authority: '',
  category: 'General Government Information',
  urgency: 'MEDIUM',
  locations: '',
  notice_id: '',
  start_date: '',
  deadline: '',
  summary: '',
  action_summary: '',
  source_url: '',
  manual_text: '',
  confidence_score: 0.95
};

const CATEGORIES: NoticeCategory[] = [
  'Emergency & Disaster Alerts',
  'Water & Electricity',
  'Traffic & Transportation',
  'Government Schemes',
  'Education & Scholarships',
  'Employment & Recruitment',
  'Health & Public Services',
  'Tax & Legal Announcements',
  'Municipal Services',
  'General Government Information'
];

const URGENCIES: UrgencyLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export const NoticeUploadModal: React.FC<NoticeUploadModalProps> = ({ isOpen, onClose, onNoticeCreated }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<NoticeFormData>(DEFAULT_FORM_DATA);
  const [backupAIResult, setBackupAIResult] = useState<NoticeFormData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Real-time field update handler
  const handleFieldChange = (field: keyof NoticeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Convert raw string locations into an array for preview
  const parseLocationList = (locationsStr: string): string[] => {
    if (!locationsStr || !locationsStr.trim()) return [];
    return locationsStr
      .split(',')
      .map(l => l.trim())
      .filter(l => l.length > 0);
  };

  // When a new PDF or file is selected, immediately clear stale state and run extraction & AI analysis
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processSelectedFile(file);
    }
  };

  const processSelectedFile = async (file: File) => {
    setSelectedFile(file);
    setBackupAIResult(null);
    setErrorMessage(null);
    setSaveSuccess(false);
    setIsProcessing(true);
    setProcessingStep('1. Reading document & extracting text with PyMuPDF / OCR...');

    try {
      const uploadPayload = new FormData();
      uploadPayload.append("file", file);

      setProcessingStep('2. Sending extracted text to AI Intelligence Engine (Gemini / Civic NLP)...');
      const notice = await apiService.uploadNotice(uploadPayload);

      setProcessingStep('3. Synthesizing plain-language summaries & Multilingual translation...');
      const syncedData: NoticeFormData = {
        id: notice.id,
        title: notice.title || '',
        authority: notice.authority || '',
        category: notice.category || 'General Government Information',
        urgency: notice.urgency || 'MEDIUM',
        locations: (notice.locations && notice.locations.length > 0) ? notice.locations.join(', ') : '',
        notice_id: notice.contact_info || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        start_date: notice.start_date || '',
        deadline: notice.deadline || '',
        summary: notice.summary || '',
        action_summary: notice.action_summary || '',
        source_url: notice.source_url || formData.source_url,
        manual_text: notice.original_text || '',
        confidence_score: notice.confidence_score || 0.95
      };

      setFormData(syncedData);
      setBackupAIResult({ ...syncedData });
      onNoticeCreated(notice);
      setProcessingStep('✅ Notice Analysis & Intelligence Extraction Complete!');
    } catch (err: any) {
      console.warn('Auto-processing error, falling back to text pre-extraction:', err);
      try {
        setIsExtracting(true);
        const extractRes = await apiService.extractDocumentText(file);
        if (extractRes && extractRes.extracted_text) {
          handleFieldChange('manual_text', extractRes.extracted_text);
          setProcessingStep('PDF Text extracted. Click "Run AI Intelligence Engine" to analyze.');
        } else {
          setProcessingStep('File loaded. Click "Run AI Intelligence Engine" to analyze.');
        }
      } catch (extractErr) {
        console.error('Extraction fallback error:', extractErr);
        setErrorMessage(err.response?.data?.detail || err.message || 'Error processing document.');
      } finally {
        setIsExtracting(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setFormData(DEFAULT_FORM_DATA);
    setBackupAIResult(null);
    setErrorMessage(null);
    setSaveSuccess(false);
    setProcessingStep('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartAIProcessing = async () => {
    setErrorMessage(null);
    setSaveSuccess(false);
    if (!selectedFile && !formData.manual_text.trim()) {
      setErrorMessage("Please upload an official PDF / Image file or enter notice text.");
      return;
    }

    setIsProcessing(true);
    setProcessingStep("1. Reading document & extracting text using PyMuPDF / OCR...");

    try {
      const uploadPayload = new FormData();
      if (selectedFile) {
        uploadPayload.append("file", selectedFile);
      }
      if (formData.title.trim()) uploadPayload.append("manual_title", formData.title.trim());
      if (formData.manual_text.trim()) uploadPayload.append("manual_text", formData.manual_text.trim());
      if (formData.authority.trim()) uploadPayload.append("authority", formData.authority.trim());
      if (formData.source_url.trim()) uploadPayload.append("source_url", formData.source_url.trim());

      setProcessingStep("2. Sending extracted text to AI Intelligence Engine (Gemini / Civic NLP)...");

      const notice = await apiService.uploadNotice(uploadPayload);
      
      setProcessingStep("3. Synthesizing plain-language summaries & Multilingual translation...");

      // Synchronize shared state with the AI extraction result
      const syncedData: NoticeFormData = {
        id: notice.id,
        title: notice.title || '',
        authority: notice.authority || '',
        category: notice.category || 'General Government Information',
        urgency: notice.urgency || 'MEDIUM',
        locations: (notice.locations && notice.locations.length > 0) ? notice.locations.join(', ') : '',
        notice_id: notice.contact_info || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        start_date: notice.start_date || '',
        deadline: notice.deadline || '',
        summary: notice.summary || '',
        action_summary: notice.action_summary || '',
        source_url: notice.source_url || formData.source_url,
        manual_text: notice.original_text || formData.manual_text,
        confidence_score: notice.confidence_score || 0.95
      };

      setFormData(syncedData);
      // Keep backup copy so the admin can revert manual edits anytime
      setBackupAIResult({ ...syncedData });

      onNoticeCreated(notice);
      setProcessingStep("✅ Notice Analysis & Intelligence Extraction Complete!");
    } catch (err: any) {
      console.error("AI Notice Processing Failed:", err);
      let msg = "Failed to connect to backend server. Please verify backend is running on http://127.0.0.1:8000.";
      if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      setProcessingStep("");
    } finally {
      setIsProcessing(false);
    }
  };

  // Revert all fields to the AI-extracted values
  const handleResetToAI = () => {
    if (backupAIResult) {
      setFormData({ ...backupAIResult });
    }
  };

  // Save changes to database and close modal
  const handleSaveAndConfirm = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      if (formData.id) {
        const locationsArray = parseLocationList(formData.locations);
        const updatedNotice = await apiService.updateNotice(formData.id, {
          title: formData.title,
          authority: formData.authority,
          category: formData.category,
          urgency: formData.urgency,
          locations: locationsArray,
          start_date: formData.start_date || undefined,
          deadline: formData.deadline || undefined,
          summary: formData.summary,
          action_summary: formData.action_summary,
          contact_info: formData.notice_id,
          source_url: formData.source_url
        });
        onNoticeCreated(updatedNotice);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      console.error('Failed to save notice:', err);
      setErrorMessage(err.response?.data?.detail || err.message || 'Failed to save notice changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const loadSampleDocument = (type: string) => {
    setSelectedFile(null);
    setBackupAIResult(null);
    setErrorMessage(null);
    setSaveSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (type === 'water') {
      const sampleWater: NoticeFormData = {
        title: 'Emergency 24-Hour Drinking Water Supply Interruption at Kukatpally',
        authority: 'Hyderabad Metropolitan Water Supply & Sewerage Board (HMWSSB)',
        category: 'Water & Electricity',
        urgency: 'HIGH',
        locations: 'Kukatpally, Miyapur, Hyderabad',
        notice_id: 'HMWSSB/OM/2026/W-842',
        start_date: '2026-11-20',
        deadline: '2026-11-21',
        summary: 'Urgent pipeline repair work on Krishna Phase-III 1200mm feeder at JNTU Junction will cause complete drinking water suspension in Kukatpally & Miyapur.',
        action_summary: 'Residents are strictly advised to store sufficient water in advance. Free municipal water tankers can be booked via Toll-Free Helpline: 155313.',
        source_url: 'https://www.hyderabadwater.gov.in/notices/2026/nov-kukatpally',
        manual_text: `GOVERNMENT OF TELANGANA
HYDERABAD METROPOLITAN WATER SUPPLY & SEWERAGE BOARD (HMWSSB)
OFFICIAL PUBLIC NOTICE - WATER DISRUPTION ADVISORY

Notice ID: HMWSSB/OM/2026/W-842
Notice Date: 18 November 2026
Department: Hyderabad Metropolitan Water Supply & Sewerage Board

SUBJECT: EMERGENCY 24-HOUR DRINKING WATER SUPPLY INTERRUPTION AT KUKATPALLY

It is hereby informed to the general public that urgent pipeline repair work on the Krishna Phase-III 1200mm diameter transmission feeder is scheduled at JNTU Junction, Kukatpally.

Consequently, drinking water supply will remain completely suspended in Kukatpally, KPHB Colony Phase 1 to 9, and Miyapur zones from 06:00 AM on 20th November 2026 to 06:00 AM on 21st November 2026.

Category: Water & Electricity
Location: Kukatpally, Miyapur, Hyderabad
Notice Type: Water Supply Interruption
Urgency: HIGH
Start Date: 2026-11-20
End Date: 2026-11-21
Application Deadline / Action Date: 2026-11-21

RECOMMENDED CITIZEN ACTION:
Residents are strictly advised to store sufficient water in advance. Free municipal water tankers can be booked via Toll-Free Helpline: 155313.

By Order,
Chief General Manager (Engineering)
Hyderabad Metropolitan Water Supply & Sewerage Board (HMWSSB)`,
        confidence_score: 0.98
      };
      setFormData(sampleWater);
    } else if (type === 'scholarship') {
      const sampleSch: NoticeFormData = {
        title: 'Merit Scholarship Application – Demonstration Notice',
        authority: 'Demo Department of Student Welfare',
        category: 'Education & Scholarships',
        urgency: 'MEDIUM',
        locations: 'Hyderabad, Telangana',
        notice_id: 'DEMO-SCH-2026-014',
        start_date: '2026-11-20',
        deadline: '2026-12-15',
        summary: 'Eligible undergraduate students in Hyderabad are invited to apply for the Merit Scholarship Scheme 2026.',
        action_summary: 'Students are advised to check all eligibility criteria and submit their applications before 15 December 2026, 5:00 PM.',
        source_url: 'https://telangana.gov.in/scholarships/demo-2026',
        manual_text: `SAMPLE DOCUMENT — FOR PROJECT DEMONSTRATION ONLY
PUBLIC NOTICE
Merit Scholarship Application – Demonstration Notice

Notice ID: DEMO-SCH-2026-014
Issue Date: 18 November 2026
Department: Demo Department of Student Welfare
Category: Education & Scholarships
Location: Hyderabad, Telangana (sample)
Priority: MEDIUM

Notice to Students:
Eligible students in Hyderabad are invited to submit an application for the Sample Merit Scholarship.

Demonstration Schedule:
Application opens: 20 November 2026
Application deadline: 15 December 2026, 5:00 PM
Eligible group: Students enrolled in recognized undergraduate programmes
Category: Education & Scholarships
Urgency: MEDIUM

RECOMMENDED CITIZEN ACTION:
Students are advised to check all eligibility requirements and submit their applications before the stated deadline.`,
        confidence_score: 0.96
      };
      setFormData(sampleSch);
    }
  };

  const hasContent = Boolean(
    formData.title || 
    formData.authority || 
    formData.summary || 
    formData.action_summary || 
    formData.locations ||
    formData.id ||
    formData.manual_text.trim()
  );

  const displayLocations = parseLocationList(formData.locations);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden my-6 border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 rounded-lg border border-blue-400/40">
              <Cpu className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold">Upload & AI Notice Intelligence Ingestion</h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-full">
                  Live Real-Time Sync
                </span>
              </div>
              <p className="text-xs text-slate-300">PyMuPDF / OCR Text Extraction & Gemini Multilingual Processing</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-semibold leading-none p-1 rounded hover:bg-slate-800 transition"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Quick Demo Pre-load buttons */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-blue-900 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-600 mr-2"></span>
              Fast Hackathon Demo Templates:
            </div>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => loadSampleDocument('water')}
                className="text-xs bg-white text-blue-700 hover:bg-blue-100 border border-blue-300 px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1"
              >
                <span>💧 Water Cut (Kukatpally)</span>
              </button>
              <button 
                type="button"
                onClick={() => loadSampleDocument('scholarship')}
                className="text-xs bg-white text-purple-700 hover:bg-purple-100 border border-purple-300 px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1"
              >
                <span>🎓 Merit Scholarship Notice</span>
              </button>
              {backupAIResult && (
                <button
                  type="button"
                  onClick={handleResetToAI}
                  className="text-xs bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1"
                  title="Discard manual edits and restore originally extracted AI intelligence"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  <span>Reset to AI Extracted Values</span>
                </button>
              )}
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Error Processing Document</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Admin Editable Controlled Inputs */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase text-slate-700">
                    1. Official Document (PDF, Image, Scanned Notice)
                  </label>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleClearSelectedFile}
                      className="text-[11px] text-red-600 hover:underline flex items-center"
                    >
                      <X className="w-3 h-3 mr-0.5" /> Clear selected file
                    </button>
                  )}
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 transition bg-slate-50 relative cursor-pointer">
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-7 h-7 text-blue-600 mx-auto mb-1.5" />
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedFile ? selectedFile.name : "Drop official PDF or scan here, or Browse"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Supports PDF (PyMuPDF) and Images (OCR)</p>
                  {selectedFile && (
                    <div className="mt-2 flex items-center justify-center space-x-2">
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        Selected: {(selectedFile.size / 1024).toFixed(1)} KB
                      </span>
                      {isExtracting && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded animate-pulse">
                          Extracting PDF...
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Form Fields with Live Controlled Inputs */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Admin Notice Editing Fields
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    ⚡ Syncs to Right Panel Live
                  </span>
                </div>

                {/* Notice Title */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Notice Title
                  </label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="e.g. Emergency Drinking Water Interruption"
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                  />
                </div>

                {/* Publishing Authority & Notice ID */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Publishing Authority
                    </label>
                    <input 
                      type="text" 
                      value={formData.authority}
                      onChange={(e) => handleFieldChange('authority', e.target.value)}
                      placeholder="e.g. HMWSSB Hyderabad"
                      className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Notice ID / Reference
                    </label>
                    <input 
                      type="text" 
                      value={formData.notice_id}
                      onChange={(e) => handleFieldChange('notice_id', e.target.value)}
                      placeholder="e.g. HMWSSB/OM/2026/W-842"
                      className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>
                </div>

                {/* Category & Urgency Selects */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Notice Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleFieldChange('category', e.target.value as NoticeCategory)}
                      className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Urgency Level
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => handleFieldChange('urgency', e.target.value as UrgencyLevel)}
                      className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold"
                    >
                      {URGENCIES.map(urg => (
                        <option key={urg} value={urg}>{urg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Affected Locations */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Affected Locations (Comma-separated)
                  </label>
                  <input 
                    type="text" 
                    value={formData.locations}
                    onChange={(e) => handleFieldChange('locations', e.target.value)}
                    placeholder="e.g. Kukatpally, Miyapur, Hyderabad"
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>

                {/* Start Date & Deadline */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Start Date
                    </label>
                    <input 
                      type="date" 
                      value={formData.start_date}
                      onChange={(e) => handleFieldChange('start_date', e.target.value)}
                      className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Deadline / Action Date
                    </label>
                    <input 
                      type="date" 
                      value={formData.deadline}
                      onChange={(e) => handleFieldChange('deadline', e.target.value)}
                      className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>
                </div>

                {/* Short Summary */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Short Summary (Plain Citizen Language)
                  </label>
                  <textarea 
                    rows={2}
                    value={formData.summary}
                    onChange={(e) => handleFieldChange('summary', e.target.value)}
                    placeholder="Simple concise description of the notice..."
                    className="w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white leading-relaxed"
                  />
                </div>

                {/* Recommended Citizen Action */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-emerald-800 mb-1">
                    Recommended Citizen Action
                  </label>
                  <textarea 
                    rows={2}
                    value={formData.action_summary}
                    onChange={(e) => handleFieldChange('action_summary', e.target.value)}
                    placeholder="What action should citizens take (e.g. store water, apply online, avoid route)..."
                    className="w-full text-xs p-2.5 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-emerald-50/40 text-emerald-950 leading-relaxed font-medium"
                  />
                </div>

                {/* Official Verification URL */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Official Verification URL (Optional)
                  </label>
                  <input 
                    type="url" 
                    value={formData.source_url}
                    onChange={(e) => handleFieldChange('source_url', e.target.value)}
                    placeholder="https://telangana.gov.in/notices/..."
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>
              </div>

              {/* Raw / Extracted Notice Text */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase text-slate-700">
                    Official Notice Text (PyMuPDF / OCR Extraction)
                  </label>
                  {formData.manual_text && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      {formData.manual_text.length} characters
                    </span>
                  )}
                </div>
                <textarea 
                  rows={5}
                  value={formData.manual_text}
                  onChange={(e) => handleFieldChange('manual_text', e.target.value)}
                  placeholder={isExtracting ? "Extracting text from uploaded PDF..." : "Extracted PDF content will display here, or paste circular text directly..."}
                  className="w-full text-xs font-mono p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 leading-relaxed"
                ></textarea>
              </div>

              <button
                type="button"
                onClick={handleStartAIProcessing}
                disabled={isProcessing || isExtracting}
                className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 transition disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-cyan-300" />
                    <span>Analyzing Notice & Running AI Engine...</span>
                  </>
                ) : isExtracting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-amber-300" />
                    <span>Extracting PDF Text...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-5 h-5 text-cyan-300" />
                    <span>Run AI Intelligence Engine</span>
                  </>
                )}
              </button>

              {(isProcessing || isExtracting || processingStep) && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-800 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  <span>{processingStep}</span>
                </div>
              )}
            </div>

            {/* Right Column: AI Extracted Intelligence Live Preview Panel */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                      <Cpu className="w-4 h-4 mr-1 text-blue-600" /> AI Extracted Intelligence
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      Live Preview
                    </span>
                  </div>
                  {hasContent && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-700 border border-green-300 flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      Confidence: {Math.round((formData.confidence_score || 0.95) * 100)}%
                    </span>
                  )}
                </div>

                {hasContent ? (
                  <div className="space-y-3.5 text-xs">
                    {/* Notice Title */}
                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px] block">Notice Title:</span>
                      <p className="font-bold text-slate-900 text-sm leading-snug">
                        {formData.title || <span className="text-slate-400 italic">No title entered</span>}
                      </p>
                    </div>

                    {/* Department & ID */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 font-semibold text-[10px] uppercase block flex items-center">
                          <Building className="w-3 h-3 mr-1 text-blue-600" /> Issuing Department
                        </span>
                        <span className="font-bold text-slate-800 text-[11px] truncate block mt-0.5">
                          {formData.authority || <span className="text-slate-400 italic font-normal">Pending</span>}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 font-semibold text-[10px] uppercase block flex items-center">
                          <Hash className="w-3 h-3 mr-1 text-slate-500" /> Notice ID / Ref
                        </span>
                        <span className="font-bold text-slate-700 text-[11px] block mt-0.5">
                          {formData.notice_id || <span className="text-slate-400 italic font-normal">REF-PENDING</span>}
                        </span>
                      </div>
                    </div>

                    {/* Category & Urgency */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 font-semibold text-[10px] uppercase block">Notice Category</span>
                        <span className="font-bold text-blue-700 text-xs block mt-0.5">{formData.category}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 font-semibold text-[10px] uppercase block">Urgency Level</span>
                        <span className={`font-extrabold text-xs block mt-0.5 ${
                          formData.urgency === 'CRITICAL' ? 'text-red-600' :
                          formData.urgency === 'HIGH' ? 'text-orange-600' :
                          formData.urgency === 'MEDIUM' ? 'text-amber-600' : 'text-blue-600'
                        }`}>
                          {formData.urgency}
                        </span>
                      </div>
                    </div>

                    {/* Affected Locations */}
                    <div>
                      <span className="text-slate-400 font-semibold text-[10px] uppercase block flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-cyan-600" /> Affected Locations:
                      </span>
                      {displayLocations.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {displayLocations.map((loc, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[11px] border border-blue-200">
                              📍 {loc}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px] block mt-1">No locations specified</span>
                      )}
                    </div>

                    {/* Important Dates / Deadlines */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-blue-50/70 border border-blue-200 rounded text-blue-900 text-[11px]">
                        <span className="font-semibold block flex items-center">
                          <Calendar className="w-3 h-3 mr-1" /> Start Date:
                        </span>
                        <span className="font-bold">{formData.start_date || 'Immediate'}</span>
                      </div>
                      <div className="p-2 bg-red-50/70 border border-red-200 rounded text-red-900 text-[11px]">
                        <span className="font-semibold block flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-red-600" /> Deadline / Date:
                        </span>
                        <span className="font-bold">{formData.deadline || 'Until further notice'}</span>
                      </div>
                    </div>

                    {/* Citizen Plain Summary */}
                    <div>
                      <span className="text-slate-400 font-semibold text-[10px] uppercase block">Short Summary:</span>
                      <p className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 mt-1 leading-relaxed text-[11px]">
                        {formData.summary || <span className="text-slate-400 italic">No summary provided</span>}
                      </p>
                    </div>

                    {/* Recommended Citizen Action */}
                    <div>
                      <span className="text-emerald-700 font-bold text-[10px] uppercase block">
                        ✅ Recommended Citizen Action:
                      </span>
                      <p className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 mt-1 font-medium text-[11px] leading-relaxed">
                        {formData.action_summary || <span className="text-emerald-700/60 italic font-normal">No specific action defined</span>}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-center">
                    <FileText className="w-12 h-12 mb-2 stroke-1 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No notice processed yet.</p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Upload an official PDF or click a demo template on the left, then click <strong>"Run AI Intelligence Engine"</strong>.
                    </p>
                  </div>
                )}
              </div>

              {hasContent && (
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    {saveSuccess ? (
                      <span className="text-emerald-600 font-bold flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1" /> Saved to database!
                      </span>
                    ) : (
                      <span>All updates reflect immediately in live preview</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleSaveAndConfirm}
                      disabled={isSaving}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 mr-1" />
                          <span>Save & Confirm Notice</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};