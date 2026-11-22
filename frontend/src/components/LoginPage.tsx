import React, { useState } from 'react';
import { 
  Building2, 
  Smartphone, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Radio,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { apiService, AuthUser } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onContinueAsCitizenGuest?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onContinueAsCitizenGuest }) => {
  const [roleMode, setRoleMode] = useState<'admin' | 'citizen'>('admin');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegisterMode) {
        const res = await apiService.register({
          email: email.trim(),
          password,
          full_name: fullName.trim() || undefined,
          role: roleMode,
          preferred_language: 'en'
        });
        onLoginSuccess(res.user);
      } else {
        const res = await apiService.login({
          email: email.trim(),
          password
        });
        
        // Enforce role consistency
        if (roleMode === 'admin' && res.user.role !== 'admin') {
          setErrorMessage('Access Denied: This account is registered as a Citizen. Switch to Citizen portal or use an Admin account.');
          apiService.logout();
          setIsLoading(false);
          return;
        }

        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const detail = err.response?.data?.detail;
      setErrorMessage(
        typeof detail === 'string' 
          ? detail 
          : 'Authentication failed. Please verify credentials or backend connection on port 8000.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white text-center border-b border-blue-900/50">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-black text-2xl shadow-lg border border-cyan-400/30 mb-3">
            🏛️
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 bg-blue-600/30 border border-blue-500/30 rounded-full text-[10px] font-bold text-cyan-300 uppercase tracking-widest mb-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Govt. of Telangana • Civic Intelligence</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Public Notice Verification & Early-Warning</h2>
          <p className="text-xs text-slate-300 mt-1">Secure Role-Based Access Control System</p>
        </div>

        {/* Role Selection Switcher */}
        <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex justify-center">
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex w-full max-w-xs shadow-inner">
            <button
              type="button"
              onClick={() => {
                setRoleMode('admin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                roleMode === 'admin' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleMode('citizen');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                roleMode === 'citizen' 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Citizen Portal</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Role Description Banner */}
          <div className={`p-3 rounded-xl border text-xs flex items-center space-x-2.5 ${
            roleMode === 'admin'
              ? 'bg-blue-50/70 border-blue-200 text-blue-900'
              : 'bg-cyan-50/70 border-cyan-200 text-cyan-900'
          }`}>
            {roleMode === 'admin' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Admin Verification Officer:</strong> Authorized to audit AI extractions, edit circulars, verify authenticity and publish alerts.
                </span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>
                  <strong>Citizen Access:</strong> Read-only access to published public notices, multilingual audio translations, bookmarks, and emergency alerts.
                </span>
              </>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start space-x-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Full Name for Registration */}
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={roleMode === 'admin' ? "admin@telangana.gov.in" : "citizen@example.com"}
                className="w-full text-xs pl-9 pr-3 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs pl-9 pr-9 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-bold text-white text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer ${
              roleMode === 'admin'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                : 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/25'
            } disabled:opacity-60`}
          >
            {isLoading ? (
              <span className="inline-flex items-center space-x-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating with Secure Backend...</span>
              </span>
            ) : (
              <>
                <span>{isRegisterMode ? 'Create Account & Sign In' : `Sign In to ${roleMode === 'admin' ? 'Admin Node' : 'Citizen Portal'}`}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Toggle Register / Login */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMessage(null);
              }}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>

            {onContinueAsCitizenGuest && roleMode === 'citizen' && (
              <button
                type="button"
                onClick={onContinueAsCitizenGuest}
                className="text-slate-600 hover:text-slate-900 font-medium hover:underline cursor-pointer"
              >
                Explore Feed as Guest &rarr;
              </button>
            )}
          </div>
        </form>

        {/* Security Compliance Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
          <span>Protected with JWT Bearer Token & Server-Enforced RBAC • State of Telangana</span>
        </div>
      </div>
    </div>
  );
};
