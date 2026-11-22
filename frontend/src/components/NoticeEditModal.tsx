import React, { useState } from 'react';
import { 
  X, 
  Save, 
  CheckCircle, 
  AlertTriangle, 
  Building, 
  Calendar, 
  MapPin, 
  Clock, 
  Hash, 
  FileText 
} from 'lucide-react';
import { NoticeItem, NoticeCategory, UrgencyLevel, NoticeStatus } from '../types';
import { apiService } from '../services/api';

interface NoticeEditModalProps {
  notice: NoticeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNoticeUpdated: (updated: NoticeItem) => void;
}

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
  'General Government Information',
];

export const NoticeEditModal: React.FC<NoticeEditModalProps> = ({
  notice,
  isOpen,
  onClose,
  onNoticeUpdated,
}) => {
  if (!isOpen || !notice) return null;

  const [title, setTitle] = useState(notice.title);
  const [authority, setAuthority] = useState(notice.authority);
  const [category, setCategory] = useState<NoticeCategory>(notice.category);
  const [urgency, setUrgency] = useState<UrgencyLevel>(notice.urgency);
  const [status, setStatus] = useState<NoticeStatus>(notice.status);
  const [summary, setSummary] = useState(notice.summary);
  const [actionSummary, setActionSummary] = useState(notice.action_summary);
  const [locations, setLocations] = useState((notice.locations || []).join(', '));
  const [startDate, setStartDate] = useState(notice.start_date || '');
  const [deadline, setDeadline] = useState(notice.deadline || '');
  const [contactInfo, setContactInfo] = useState(notice.contact_info || '');
  const [sourceUrl, setSourceUrl] = useState(notice.source_url || '');
  const [verificationNotes, setVerificationNotes] = useState(notice.verification_notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const locArray = locations.split(',').map((l) => l.trim()).filter(Boolean);
      const updates = {
        title: title.trim(),
        authority: authority.trim(),
        category,
        urgency,
        status,
        summary: summary.trim(),
        action_summary: actionSummary.trim(),
        locations: locArray,
        start_date: startDate.trim() || undefined,
        deadline: deadline.trim() || undefined,
        contact_info: contactInfo.trim() || undefined,
        source_url: sourceUrl.trim() || undefined,
        verification_notes: verificationNotes.trim() || undefined,
      };

      const updated = await apiService.updateNotice(notice.id, updates);
      onNoticeUpdated(updated);
      onClose();
    } catch (err: any) {
      alert('Failed to update notice: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-6 border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-600 rounded-lg text-white">
              <FileText className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold">Admin Correction & Verification Editor</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-semibold leading-none p-1 rounded"
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Notice Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1 flex items-center">
                <Building className="w-3 h-3 mr-1 text-blue-600" /> Issuing Department / Authority
              </label>
              <input
                type="text"
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1 flex items-center">
                <Hash className="w-3 h-3 mr-1 text-slate-500" /> Notice ID / Ref
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g. DEMO-SCH-2026-014"
                className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NoticeStatus)}
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1 flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-cyan-600" /> Affected Locations (comma-separated)
              </label>
              <input
                type="text"
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                placeholder="e.g. Kukatpally, Miyapur, Hyderabad"
                className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1 flex items-center">
                <Calendar className="w-3 h-3 mr-1 text-blue-600" /> Start Date
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="YYYY-MM-DD or date"
                className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1 flex items-center">
                <Clock className="w-3 h-3 mr-1 text-red-600" /> Deadline / End Date
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="YYYY-MM-DD or date"
                className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Citizen Plain Summary</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-emerald-800 uppercase mb-1">Recommended Citizen Action</label>
            <textarea
              rows={2}
              value={actionSummary}
              onChange={(e) => setActionSummary(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-emerald-300 bg-emerald-50/50 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Admin Verification Notes / Audit Comments</label>
            <input
              type="text"
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="e.g. Corrected department name and validated against official gazette"
              className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            <span>{isSaving ? 'Saving Corrections...' : 'Save Corrections Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
