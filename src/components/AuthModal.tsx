import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Sparkles,
  X,
  ShieldCheck,
  CheckCircle,
  Database,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { UserProfile, StorageService, DEFAULT_USER } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const [mode, setMode] = useState<'profile' | 'login' | 'signup'>('profile');
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(currentUser.role || 'Student / Scholar');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'signup' && (!displayName.trim() || !email.trim() || !password)) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (mode === 'login' && (!email.trim() || !password)) {
      setError('Please enter your email and password.');
      return;
    }

    // Create / update profile
    const updated: UserProfile = {
      id: 'user_' + email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
      email: email.trim(),
      displayName: displayName.trim() || email.split('@')[0],
      role,
      isGuest: false,
    };

    StorageService.setCurrentUser(updated);
    onUpdateUser(updated);
    setSuccess('Account profile updated successfully!');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleGuestMode = () => {
    const guestUser: UserProfile = {
      id: 'user_guest_' + Date.now(),
      email: 'guest@studymind.local',
      displayName: 'Guest Scholar',
      role: 'Guest Learner',
      isGuest: true,
    };
    StorageService.setCurrentUser(guestUser);
    onUpdateUser(guestUser);
    onClose();
  };

  const handleResetToDefault = () => {
    StorageService.setCurrentUser(DEFAULT_USER);
    onUpdateUser(DEFAULT_USER);
    setDisplayName(DEFAULT_USER.displayName);
    setEmail(DEFAULT_USER.email);
    setRole(DEFAULT_USER.role || 'Student / Scholar');
    setSuccess('Switched back to primary profile.');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-purple-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-purple-600/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            StudyMind AI Account
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Personalized study workspace, histories, and exam progress.
          </p>
        </div>

        {/* Cloud vs Local Explanation Banner */}
        <div className="mb-5 p-3 rounded-2xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-900 flex items-start gap-2.5">
          <Database className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <p className="font-bold">Private Partition Active</p>
            <p className="text-slate-600">
              Each user gets a dedicated, isolated workspace for chat logs, exam records, and notes. Firebase Auth & Firestore sync can be toggled via environment settings.
            </p>
          </div>
        </div>

        {/* Error or Success notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Mode Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-bold text-slate-600">
          <button
            onClick={() => setMode('profile')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'profile' ? 'bg-white text-purple-700 shadow-2xs' : 'hover:text-purple-600'
            }`}
          >
            Current Profile
          </button>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-purple-700 shadow-2xs' : 'hover:text-purple-600'
            }`}
          >
            Switch / Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'signup' ? 'bg-white text-purple-700 shadow-2xs' : 'hover:text-purple-600'
            }`}
          >
            New Account
          </button>
        </div>

        {mode === 'profile' ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                  {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {currentUser.displayName}
                  </h4>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    {currentUser.role || 'Scholar'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleResetToDefault}
                className="w-full py-2.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold transition-all"
              >
                Reset to Default Profile (Mounika Reddy)
              </button>
              <button
                onClick={handleGuestMode}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Switch to Temporary Guest Session
              </button>
            </div>
          </div>
        ) : (
          /* Login / Signup Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Mounika Reddy"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-400 font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-400 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-400 font-medium"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Academic Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-400 font-medium"
                >
                  <option value="Student / Scholar">Student / Scholar</option>
                  <option value="Competitive Exam Aspirant">Competitive Exam Aspirant (UPSC/APPSC/TSPSC)</option>
                  <option value="Software Engineer / Learner">Software Engineer / Tech Learner</option>
                  <option value="Educator / Teacher">Educator / Teacher</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-sm shadow-purple-600/20 transition-all"
            >
              {mode === 'signup' ? 'Create Study Account' : 'Sign In to Workspace'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
