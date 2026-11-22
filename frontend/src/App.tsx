import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Smartphone, 
  ShieldCheck, 
  Bell, 
  Globe, 
  User, 
  LogIn, 
  LogOut,
  Layers,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AdminDashboard } from './components/AdminDashboard';
import { CitizenDashboard } from './components/CitizenDashboard';
import { NoticeUploadModal } from './components/NoticeUploadModal';
import { NoticeDetailModal } from './components/NoticeDetailModal';
import { LoginPage } from './components/LoginPage';
import { apiService, AuthUser } from './services/api';
import { NoticeItem, DashboardStats, NotificationRecord } from './types';

export function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => apiService.getStoredUser());
  const [activePortal, setActivePortal] = useState<'admin' | 'citizen'>(() => {
    const user = apiService.getStoredUser();
    return user?.role === 'admin' ? 'admin' : 'citizen';
  });
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [savedNotices, setSavedNotices] = useState<NoticeItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [selectedNoticeForDetail, setSelectedNoticeForDetail] = useState<NoticeItem | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Validate and sync authenticated user profile directly from server on load
  useEffect(() => {
    const syncProfileWithServer = async () => {
      const token = apiService.getStoredToken();
      if (!token) {
        setCurrentUser(null);
        return;
      }
      try {
        const verifiedProfile = await apiService.getProfile();
        if (verifiedProfile) {
          setCurrentUser(verifiedProfile);
          localStorage.setItem('civic_auth_user', JSON.stringify(verifiedProfile));
        }
      } catch (err: any) {
        console.warn('Session expired or invalid token:', err);
        apiService.logout();
        setCurrentUser(null);
      }
    };

    syncProfileWithServer();
  }, []);

  const fetchData = async () => {
    setIsRefreshing(true);
    setFetchError(null);
    try {
      // 1. Fetch public/citizen accessible feeds first
      const [fetchedNotices, fetchedNotifications, fetchedSaved] = await Promise.all([
        apiService.getNotices({ limit: 100 }),
        apiService.getCitizenNotifications(),
        apiService.getSavedNotices(),
      ]);
      setNotices(fetchedNotices);
      setNotifications(fetchedNotifications);
      setSavedNotices(fetchedSaved);

      // 2. If authenticated as admin, fetch protected admin statistics
      if (currentUser?.role === 'admin') {
        try {
          const fetchedStats = await apiService.getAdminDashboard();
          setAdminStats(fetchedStats);
        } catch (adminErr: any) {
          console.warn('Admin stats require valid admin token:', adminErr);
        }
      }
    } catch (err: any) {
      console.error('Error loading civic data:', err);
      setFetchError(err.response?.data?.detail || err.message || 'Unable to sync with Civic backend server on port 8000.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleToggleBookmark = async (noticeId: string) => {
    try {
      await apiService.toggleBookmarkNotice(noticeId);
      const updatedSaved = await apiService.getSavedNotices();
      setSavedNotices(updatedSaved);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNoticeCreated = (newNotice: NoticeItem) => {
    setNotices((prev) => [newNotice, ...prev]);
    fetchData();
  };

  const handleLogout = () => {
    apiService.logout();
    setCurrentUser(null);
    setActivePortal('citizen');
    setAdminStats(null);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    if (user.role === 'admin') {
      setActivePortal('admin');
    } else {
      setActivePortal('citizen');
    }
  };

  // If user explicitly asks for Login screen or needs to authenticate to enter admin
  if (showAuthModal || (!currentUser && activePortal === 'admin')) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onContinueAsCitizenGuest={() => {
          setShowAuthModal(false);
          setActivePortal('citizen');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Smart-City Government Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & National Emblem Accent */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-black text-xl shadow-md border border-cyan-300/30">
              🏛️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  CIVIC NOTICE INTELLIGENCE
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                  24x7 EARLY-WARNING
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Government of Telangana • Smart Public Information & Alert System
              </p>
            </div>
          </div>

          {/* Portal Switcher Pill: Admin Web vs Citizen App */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => {
                if (!currentUser || currentUser.role !== 'admin') {
                  setShowAuthModal(true);
                } else {
                  setActivePortal('admin');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activePortal === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>

            <button
              onClick={() => setActivePortal('citizen')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activePortal === 'citizen'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Citizen Portal</span>
            </button>
          </div>

          {/* Active User Persona Pill & Auth Controls */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-200">
                    {currentUser.full_name || currentUser.email}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {currentUser.role === 'admin' ? '🛡️ Administrator (CIO)' : '👤 Verified Citizen'}
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs text-white ${
                  currentUser.role === 'admin' ? 'bg-blue-700 border-blue-400' : 'bg-cyan-700 border-cyan-400'
                }`}>
                  {currentUser.role === 'admin' ? 'A' : 'C'}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 bg-slate-800 hover:bg-red-950/50 hover:text-red-400 border border-slate-700 rounded-lg text-slate-300 transition cursor-pointer"
                  title="Sign Out / Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {fetchError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-xl text-red-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span><strong>Backend Sync Issue:</strong> {fetchError}</span>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition text-[11px]"
            >
              Retry Sync
            </button>
          </div>
        )}

        {isLoading && notices.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Connecting to Civic Intelligence Backend Engine...</p>
          </div>
        ) : activePortal === 'admin' ? (
          currentUser?.role === 'admin' ? (
            <AdminDashboard
              stats={adminStats}
              notices={notices}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onRefresh={fetchData}
              isRefreshing={isRefreshing}
              onSelectNotice={(n) => setSelectedNoticeForDetail(n)}
            />
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4 max-w-lg mx-auto shadow-sm my-12">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Administrator Privileges Required</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Municipal Admin Command & Verification Node is restricted to authorized government verifiers. Please sign in with an official administrator account.
              </p>
              <div className="pt-2 flex justify-center space-x-3">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Admin Sign In
                </button>
                <button
                  onClick={() => setActivePortal('citizen')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Return to Citizen Portal
                </button>
              </div>
            </div>
          )
        ) : (
          <CitizenDashboard
            notices={notices}
            notifications={notifications}
            onSelectNotice={(n) => setSelectedNoticeForDetail(n)}
            savedNotices={savedNotices}
            onToggleBookmark={handleToggleBookmark}
          />
        )}
      </main>

      {/* Upload and AI Processing Modal */}
      <NoticeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onNoticeCreated={handleNoticeCreated}
      />

      {/* Notice Detail & Voice Modal */}
      <NoticeDetailModal
        notice={selectedNoticeForDetail}
        onClose={() => setSelectedNoticeForDetail(null)}
        onBookmarkToggle={handleToggleBookmark}
        isBookmarked={selectedNoticeForDetail ? savedNotices.some(s => s.id === selectedNoticeForDetail.id) : false}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-300">
            Public Notice Intelligence and Early-Warning System • Smart Civic Information Platform
          </p>
          <p className="text-[11px] text-slate-500">
            Protected by JWT Bearer Authentication, FastAPI Role-Based Access Control, and SQLite / PostgreSQL Engine.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
