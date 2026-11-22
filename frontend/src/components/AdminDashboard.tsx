import React, { useState } from 'react';
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Send, 
  FileCheck, 
  Upload, 
  Search, 
  RefreshCw,
  XCircle,
  TrendingUp,
  Radio,
  Edit,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  FileText,
  ExternalLink,
  ShieldAlert,
  Flame,
  CalendarCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { DashboardStats, NoticeItem } from '../types';
import { apiService } from '../services/api';
import { NoticeEditModal } from './NoticeEditModal';
import { auditNoticeAuthenticity } from '../utils/sourceVerification';

interface AdminDashboardProps {
  stats: DashboardStats | null;
  notices: NoticeItem[];
  onOpenUploadModal: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onSelectNotice: (notice: NoticeItem) => void;
}

const URGENCY_COLORS: Record<string, string> = {
  CRITICAL: '#DC2626',
  HIGH: '#EA580C',
  MEDIUM: '#D97706',
  LOW: '#2563EB',
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  notices,
  onOpenUploadModal,
  onRefresh,
  isRefreshing = false,
  onSelectNotice,
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'verified' | 'approved' | 'published' | 'rejected' | 'demo'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Edit Modal State
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4500);
  };

  // Accurate counts calculated dynamically from the active notice records
  const totalCount = notices.length;
  const pendingCount = notices.filter(n => n.status === 'PENDING_REVIEW').length;
  const verifiedCount = notices.filter(n => n.status === 'VERIFIED').length;
  const approvedCount = notices.filter(n => n.status === 'APPROVED').length;
  const publishedCount = notices.filter(n => n.status === 'PUBLISHED').length;
  const rejectedCount = notices.filter(n => n.status === 'REJECTED').length;
  const criticalCount = notices.filter(n => n.urgency === 'CRITICAL').length;
  const deadlinesActiveCount = notices.filter(n => Boolean(n.deadline) && n.status !== 'REJECTED').length;
  const demoCount = notices.filter(n => auditNoticeAuthenticity(n).isDemo).length;

  // Filter notices based on tabs and category
  const filteredNotices = notices.filter((n) => {
    if (selectedTab === 'pending' && n.status !== 'PENDING_REVIEW') return false;
    if (selectedTab === 'verified' && n.status !== 'VERIFIED') return false;
    if (selectedTab === 'approved' && n.status !== 'APPROVED') return false;
    if (selectedTab === 'published' && n.status !== 'PUBLISHED') return false;
    if (selectedTab === 'rejected' && n.status !== 'REJECTED') return false;
    if (selectedTab === 'demo' && !auditNoticeAuthenticity(n).isDemo) return false;
    if (selectedCategory !== 'All' && n.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) || 
        n.summary.toLowerCase().includes(q) ||
        (n.authority && n.authority.toLowerCase().includes(q)) ||
        (n.contact_info && n.contact_info.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate live category distribution from active notices (or fall back to stats)
  const categoryCountsMap: Record<string, number> = {};
  notices.forEach(n => {
    const cat = n.category || 'General';
    categoryCountsMap[cat] = (categoryCountsMap[cat] || 0) + 1;
  });
  
  const liveCategoryData = Object.entries(categoryCountsMap).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count);

  const displayCategoryData = liveCategoryData.length > 0 ? liveCategoryData : (stats?.category_distribution || []);

  // Calculate live urgency distribution with exact counts and percentages
  const urgencyCountsMap: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };
  notices.forEach(n => {
    const urg = n.urgency || 'LOW';
    if (urgencyCountsMap[urg] !== undefined) {
      urgencyCountsMap[urg]++;
    } else {
      urgencyCountsMap[urg] = 1;
    }
  });

  const totalUrgencySum = notices.length || 1;
  const liveUrgencyData = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(u => ({
    name: u,
    count: urgencyCountsMap[u] || 0,
    percentage: Math.round(((urgencyCountsMap[u] || 0) / totalUrgencySum) * 100)
  })).filter(item => item.count > 0 || totalCount === 0);

  const handleVerify = async (noticeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoadingId(noticeId);
    try {
      await apiService.verifyNotice(noticeId, 'Verified authentic government notice');
      showToast('Notice marked as VERIFIED. Next step: Approve or Publish.');
      onRefresh();
    } catch (err: any) {
      showToast('Error verifying notice: ' + (err.response?.data?.detail || err.message), 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApprove = async (noticeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoadingId(noticeId);
    try {
      await apiService.approveNotice(noticeId, 'Approved for publishing by Chief Information Officer');
      showToast('Notice APPROVED for publication! Ready for instant broadcasting.');
      onRefresh();
    } catch (err: any) {
      showToast('Error approving notice: ' + (err.response?.data?.detail || err.message), 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePublishAndAlert = async (noticeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoadingId(noticeId);
    try {
      await apiService.publishNotice(noticeId, true);
      showToast('Notice officially PUBLISHED and live on Citizen Portal! Early-Warning Alerts dispatched.');
      onRefresh();
    } catch (err: any) {
      showToast('Error publishing notice: ' + (err.response?.data?.detail || err.message), 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (noticeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const reason = prompt('Please enter rejection reason:', 'Notice details could not be authenticated with official source');
    if (!reason) return;
    setActionLoadingId(noticeId);
    try {
      await apiService.rejectNotice(noticeId, reason);
      showToast('Notice marked as REJECTED. Hidden from Citizen Portal.', 'info');
      onRefresh();
    } catch (err: any) {
      showToast('Error rejecting notice: ' + (err.response?.data?.detail || err.message), 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (noticeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this notice? This action cannot be undone.')) {
      return;
    }
    setActionLoadingId(noticeId);
    try {
      await apiService.deleteNotice(noticeId);
      showToast('Notice deleted successfully and removed from database.', 'info');
      onRefresh();
    } catch (err: any) {
      showToast('Error deleting notice: ' + (err.response?.data?.detail || err.message), 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Custom Category Bar Chart Tooltip
  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : '0';
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
          <p className="font-bold text-sm text-cyan-300">{item.name}</p>
          <div className="mt-1 flex items-center justify-between space-x-4 text-slate-300">
            <span>Notice Count:</span>
            <span className="font-extrabold text-white text-sm">{item.count}</span>
          </div>
          <div className="mt-0.5 flex items-center justify-between space-x-4 text-slate-400 text-[11px]">
            <span>Share of Total:</span>
            <span>{pct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Urgency Doughnut Chart Tooltip
  const CustomUrgencyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : '0';
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
          <div className="flex items-center space-x-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: URGENCY_COLORS[item.name] || '#2563EB' }}
            />
            <span className="font-bold text-sm">{item.name} Priority</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between space-x-4 text-slate-300">
            <span>Total Notices:</span>
            <span className="font-extrabold text-white text-sm">{item.count}</span>
          </div>
          <div className="mt-0.5 flex items-center justify-between space-x-4 text-slate-400 text-[11px]">
            <span>Percentage:</span>
            <span className="font-bold text-cyan-300">{pct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Action Notification Toast */}
      {feedbackToast && (
        <div className={`p-4 rounded-xl border shadow-lg flex items-center justify-between text-xs font-semibold animate-in slide-in-from-top duration-300 ${
          feedbackToast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
          feedbackToast.type === 'error' ? 'bg-red-50 border-red-300 text-red-900' :
          'bg-blue-50 border-blue-300 text-blue-900'
        }`}>
          <div className="flex items-center space-x-2">
            {feedbackToast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> :
             feedbackToast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-600 shrink-0" /> :
             <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />}
            <span>{feedbackToast.message}</span>
          </div>
          <button 
            onClick={() => setFeedbackToast(null)}
            className="text-slate-400 hover:text-slate-700 ml-4 text-base font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Top Welcome Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-wrap items-center justify-between gap-4 border border-blue-900/50">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-600/30 border border-blue-500/30 rounded-full text-xs font-semibold text-cyan-300 mb-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Central Municipal Command & Verification Node</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Public Notice Verification & Early-Warning Control</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Audit AI extractions, verify authenticity with official government gazettes, approve and publish circulars.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700 flex items-center space-x-1.5 ${
              isRefreshing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            title="Refresh All Dashboard Statistics and Notices"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            {isRefreshing && <span className="text-xs font-semibold text-cyan-300 pr-1">Syncing...</span>}
          </button>
          <button
            onClick={onOpenUploadModal}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/25 flex items-center space-x-2 transition cursor-pointer"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Official Notice (PDF / OCR)</span>
          </button>
        </div>
      </div>

      {/* Accurate Live Analytics Metric Cards (Mutually Exclusive Statuses) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Notices Ingested */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Notices Ingested</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</p>
          <span className="text-[10px] text-blue-600 font-medium">All Database Records</span>
        </div>

        {/* 2. Pending Review */}
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">Pending Review</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Needs Verification</span>
        </div>

        {/* 3. Verified */}
        <div className="bg-white p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">Verified</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{verifiedCount}</p>
          <span className="text-[10px] text-blue-600 font-medium">Ready For Approval</span>
        </div>

        {/* 4. Approved */}
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Approved</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{approvedCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Ready To Publish</span>
        </div>

        {/* 5. Published */}
        <div className="bg-white p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-sm">
          <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">Published</p>
          <p className="text-2xl font-extrabold text-indigo-700 mt-1">{publishedCount}</p>
          <span className="text-[10px] text-indigo-600 font-medium">Live To Citizens</span>
        </div>

        {/* 6. Rejected */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-300 bg-slate-50/40 shadow-sm">
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Rejected</p>
          <p className="text-2xl font-extrabold text-slate-700 mt-1">{rejectedCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Unverified / Invalid</span>
        </div>

        {/* 7. Critical Warnings */}
        <div className="bg-white p-3.5 rounded-xl border border-red-200 bg-red-50/20 shadow-sm">
          <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide flex items-center">
            <Flame className="w-3 h-3 mr-1 text-red-600" /> Critical Warnings
          </p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{criticalCount}</p>
          <span className="text-[10px] text-red-600 font-medium">Immediate Alerts</span>
        </div>

        {/* 8. Deadlines Active */}
        <div className="bg-white p-3.5 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm">
          <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wide flex items-center">
            <CalendarCheck className="w-3 h-3 mr-1 text-purple-600" /> Deadlines Active
          </p>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">{deadlinesActiveCount}</p>
          <span className="text-[10px] text-purple-600 font-medium">Auto-Reminders</span>
        </div>
      </div>

      {/* Visual Analytics Charts Section (Improved Responsive Layout & Labels) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                Notices Ingestion by Civic Category
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Exact notice distribution across all categories from live database records
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
              {displayCategoryData.length} Categories
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayCategoryData}
                margin={{ top: 15, right: 15, left: -10, bottom: 50 }}
              >
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#475569' }} 
                  interval={0}
                  angle={-25} 
                  textAnchor="end"
                  height={50}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  allowDecimals={false} 
                />
                <Tooltip content={<CustomCategoryTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#1D4ED8" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgency Doughnut Chart (No Cut-Offs, Full Visibility, Accurate Percentages) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-cyan-600" />
                Urgency Classification Breakdown
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Proportion of critical, high, medium and low circulars
              </p>
            </div>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <Pie
                  data={liveUrgencyData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={68}
                  innerRadius={42}
                  paddingAngle={3}
                >
                  {liveUrgencyData.map((entry, index) => (
                    <Cell 
                      key={`urg-cell-${index}`} 
                      fill={URGENCY_COLORS[entry.name] || '#2563EB'} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomUrgencyTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Clean Urgency Legend with Exact Counts & Accurate Percentages */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {liveUrgencyData.map((item) => (
              <div 
                key={item.name} 
                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: URGENCY_COLORS[item.name] || '#2563EB' }}
                  />
                  <span className="font-bold text-slate-700 text-[11px]">{item.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-slate-900 text-xs">{item.count}</span>
                  <span className="text-[10px] text-slate-400 ml-1">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notices Review & Verification Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Toolbar Tabs */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedTab === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border'
              }`}
            >
              All Notices ({notices.length})
            </button>
            <button
              onClick={() => setSelectedTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                selectedTab === 'pending' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 mr-1" />
              <span>Pending Review ({pendingCount})</span>
            </button>
            <button
              onClick={() => setSelectedTab('verified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                selectedTab === 'verified' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              <span>Verified ({verifiedCount})</span>
            </button>
            <button
              onClick={() => setSelectedTab('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                selectedTab === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              <span>Approved ({approvedCount})</span>
            </button>
            <button
              onClick={() => setSelectedTab('published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedTab === 'published' ? 'bg-indigo-700 text-white shadow-sm' : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
              }`}
            >
              Published ({publishedCount})
            </button>
            <button
              onClick={() => setSelectedTab('rejected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedTab === 'rejected' ? 'bg-red-700 text-white shadow-sm' : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
            <button
              onClick={() => setSelectedTab('demo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedTab === 'demo' ? 'bg-amber-700 text-white shadow-sm' : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-300'
              }`}
              title="Filter notices uploaded for demonstration and software testing"
            >
              <span>🧪 Demo Documents ({demoCount})</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search title, department, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-52 bg-white"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-2.5 py-1.5 border rounded-lg bg-white outline-none text-slate-700 font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Emergency & Disaster Alerts">Disaster & Emergency</option>
              <option value="Water & Power">Water & Power</option>
              <option value="Water & Electricity">Water & Electricity</option>
              <option value="Scholarships">Scholarships</option>
              <option value="Traffic & Transportation">Traffic & Roads</option>
              <option value="Education & Scholarships">Education & Scholarships</option>
              <option value="Tax & Legal Announcements">Tax & Legal</option>
              <option value="Health & Public Services">Health & Public Services</option>
              <option value="General Government Information">General Information</option>
            </select>
          </div>
        </div>

        {/* Notice List */}
        <div className="divide-y divide-slate-100">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((notice) => {
              const audit = auditNoticeAuthenticity(notice);

              return (
                <div
                  key={notice.id}
                  onClick={() => onSelectNotice(notice)}
                  className="p-4 hover:bg-slate-50 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left Notice Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Urgency Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                        notice.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-300' :
                        notice.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                        notice.urgency === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                        'bg-blue-100 text-blue-700 border border-blue-300'
                      }`}>
                        {notice.urgency}
                      </span>

                      {/* Category Badge */}
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {notice.category}
                      </span>

                      {/* Workflow Status Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold tracking-wide uppercase ${
                        notice.status === 'PUBLISHED' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                        notice.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        notice.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        notice.status === 'REJECTED' ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                        'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                      }`}>
                        {notice.status}
                      </span>

                      {/* Distinct Authenticity & Demo Badge (Requirement 4) */}
                      {audit.isDemo ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center">
                          🧪 DEMO NOTICE
                        </span>
                      ) : audit.isAuthentic ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center">
                          <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                          OFFICIALLY VERIFIED
                        </span>
                      ) : notice.status === 'REJECTED' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700 border border-red-300 flex items-center">
                          <XCircle className="w-3 h-3 mr-1 text-red-600" />
                          UNVERIFIED NOTICE
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-blue-600" />
                          PENDING AUTHENTICATION
                        </span>
                      )}

                      {notice.contact_info && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border px-1.5 py-0.2 rounded">
                          REF: {notice.contact_info}
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400">
                        AI Conf: {Math.round((notice.confidence_score || 0.95) * 100)}%
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition">
                      {notice.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      {notice.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>🏢 {notice.authority}</span>
                      <span>📍 {notice.locations?.join(', ') || 'All Zones'}</span>
                      {notice.deadline && (
                        <span className="text-red-500 font-semibold">⏰ Deadline: {notice.deadline}</span>
                      )}
                      {audit.domainName && (
                        <span className="text-blue-600 font-medium">
                          🌐 {audit.domainName}
                        </span>
                      )}
                      {notice.verification_notes && (
                        <span className="text-slate-500 italic">📝 Note: {notice.verification_notes}</span>
                      )}
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {/* 1. Edit Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNotice(notice);
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center space-x-1 border cursor-pointer"
                      title="Correct or edit extracted notice info"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1 text-slate-600" />
                      <span>Edit</span>
                    </button>

                    {/* 2. Verify Action */}
                    {notice.status === 'PENDING_REVIEW' && (
                      <button
                        onClick={(e) => handleVerify(notice.id, e)}
                        disabled={actionLoadingId === notice.id}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-sm cursor-pointer"
                        title="Establish and confirm authenticity"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        <span>Verify</span>
                      </button>
                    )}

                    {/* 3. Approve Action */}
                    {(notice.status === 'PENDING_REVIEW' || notice.status === 'VERIFIED') && (
                      <button
                        onClick={(e) => handleApprove(notice.id, e)}
                        disabled={actionLoadingId === notice.id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-sm cursor-pointer"
                        title="Approve for public release"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        <span>Approve</span>
                      </button>
                    )}

                    {/* 4. Publish Action */}
                    {(notice.status === 'VERIFIED' || notice.status === 'APPROVED' || notice.status === 'PENDING_REVIEW') && (
                      <button
                        onClick={(e) => handlePublishAndAlert(notice.id, e)}
                        disabled={actionLoadingId === notice.id}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-sm cursor-pointer"
                        title="Broadcast notice to Citizen Portal"
                      >
                        <Send className="w-3.5 h-3.5 mr-1 text-cyan-300" />
                        <span>Publish</span>
                      </button>
                    )}

                    {/* 5. Reject Action */}
                    {notice.status !== 'REJECTED' && (
                      <button
                        onClick={(e) => handleReject(notice.id, e)}
                        disabled={actionLoadingId === notice.id}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg text-xs font-bold transition border cursor-pointer"
                        title="Mark notice as unverified / rejected"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* 6. Delete Action */}
                    <button
                      onClick={(e) => handleDelete(notice.id, e)}
                      disabled={actionLoadingId === notice.id}
                      className="px-2 py-1.5 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-700 rounded-lg text-xs transition border cursor-pointer"
                      title="Permanently delete notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onSelectNotice(notice)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                      Details &rarr;
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-slate-400">
              <FileCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No notices found in this filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Notice Modal */}
      <NoticeEditModal
        notice={editingNotice}
        isOpen={Boolean(editingNotice)}
        onClose={() => setEditingNotice(null)}
        onNoticeUpdated={(updated) => {
          showToast(`Notice "${updated.title}" updated and saved permanently!`);
          onRefresh();
        }}
      />
    </div>
  );
};
