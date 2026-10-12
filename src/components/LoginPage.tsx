import React, { useState, useRef } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  Upload,
  Camera,
  X,
  AlertCircle,
  Moon,
  Sun,
  Lock,
  Mail,
  User,
  BadgeCheck,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Department } from '../types';
import { processImageFile } from '../utils/imageUpload';

interface LoginPageProps {
  departments: Department[];
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
];

export const LoginPage: React.FC<LoginPageProps> = ({ departments }) => {
  const { login, register, switchDemoUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Mode: Default to 'register' for first-time users as required
  const [mode, setMode] = useState<'register' | 'login'>('register');

  // Registration state
  const [fullName, setFullName] = useState('');
  const [universityEmail, setUniversityEmail] = useState('');
  const [studentEmployeeId, setStudentEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'FACULTY' | 'STAFF'>('STUDENT');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [yearLevel, setYearLevel] = useState('2nd Year');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>(AVATAR_PRESETS[0]);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('juan.delacruz@university.edu');
  const [loginPassword, setLoginPassword] = useState('password123');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle direct photo upload from device
  const handleDeviceAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setError('');
    try {
      const dataUrl = await processImageFile(file, 400, 0.85);
      setProfilePictureUrl(dataUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo from device.');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !universityEmail.trim() || !studentEmployeeId.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register({
        fullName: fullName.trim(),
        universityEmail: universityEmail.trim(),
        studentEmployeeId: studentEmployeeId.trim(),
        password: password.trim(),
        role,
        departmentId,
        yearLevel,
        profilePictureUrl,
      });
    } catch (err: any) {
      setError(err.message || 'Account registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter your university email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(loginEmail.trim(), loginPassword.trim());
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Check your university email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAccess = async (userId: string) => {
    setLoading(true);
    setError('');
    try {
      await switchDemoUser(userId);
    } catch (err: any) {
      setError(err.message || 'Could not access demo profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <header className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-serif">
                  Campus Bentahan
                </span>
                <span className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide border border-indigo-200 dark:border-indigo-800">
                  UNIVERSITY
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5 hidden sm:block">
                The Verified Student Marketplace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Night Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-xs font-semibold"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Night Mode'}
              aria-label="Toggle night mode"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Night Mode</span>
                </>
              )}
            </button>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Verified Campus Network</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          
          {/* Left Column: Campus Value Proposition (Adapts for Mobile, iPad, Desktop) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Official Student-to-Student Exchange
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-serif text-slate-900 dark:text-white leading-[1.15]">
              Buy & Sell with trusted campus peers.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Welcome to <strong className="text-slate-900 dark:text-white">Campus Bentahan</strong>—the student marketplace built exclusively for your university. Trade textbooks, drafting kits, scientific calculators, dorm essentials, and uniforms securely.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">100% University Verified</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Requires student ID and valid institutional email. No fake accounts or outside scammers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Designated Safe Meetup Zones</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Exchange items inside monitored spots: Central Library, Student Center, and Main Gate checkpoints.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Affordable Student Prices</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pass down academic supplies to lower batch students with friendly peer haggling and zero listing fees.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Demo Accounts Selector */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                Instant Demo Access (Test Any Role in 1 Click):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                {DEMO_USERS.map((demo) => (
                  <button
                    key={demo.id}
                    onClick={() => handleQuickDemoAccess(demo.id)}
                    disabled={loading}
                    className="p-2.5 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl text-left transition flex flex-col group disabled:opacity-50"
                  >
                    <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                      {demo.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {demo.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card (Create Account or Sign In) */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8">
              
              {/* Segmented Mode Switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition ${
                    mode === 'register'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Create Student Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition ${
                    mode === 'login'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Mode 1: Create Account Form */}
              {mode === 'register' ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Your Campus Account</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Fill out your university credentials to start browsing and selling items.
                    </p>
                  </div>

                  {/* Profile Photo Direct Device Upload Section */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Profile Photo (Upload from Device or Select Avatar)
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Avatar preview */}
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500 shrink-0 shadow-sm">
                        <img
                          src={profilePictureUrl}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                        {avatarUploading && (
                          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-[10px] font-bold">
                            Uploading...
                          </div>
                        )}
                      </div>

                      {/* Device upload controls */}
                      <div className="flex-1 space-y-2 w-full text-center sm:text-left">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleDeviceAvatarUpload}
                          className="hidden"
                          id="avatar-device-upload"
                        />
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <label
                            htmlFor="avatar-device-upload"
                            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition"
                          >
                            <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            Upload from Device
                          </label>

                          <label
                            htmlFor="avatar-device-upload"
                            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition"
                          >
                            <Camera className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            Take Photo
                          </label>
                        </div>

                        {/* Presets */}
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 mr-1">Or pick:</span>
                          {AVATAR_PRESETS.map((p, idx) => (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => setProfilePictureUrl(p)}
                              className={`w-6 h-6 rounded-full overflow-hidden border transition ${
                                profilePictureUrl === p
                                  ? 'ring-2 ring-indigo-500 scale-110'
                                  : 'opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img src={p} alt="Preset" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full Name & Student ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Juan Dela Cruz"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Student / Employee ID <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. 2022-10842"
                          value={studentEmployeeId}
                          onChange={(e) => setStudentEmployeeId(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* University Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      University Institutional Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="yourname@university.edu"
                        value={universityEmail}
                        onChange={(e) => setUniversityEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Must end in .edu, .ac, or contain campus/univ for verified badge issuance.
                    </p>
                  </div>

                  {/* Role, Department & Year Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Campus Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="FACULTY">Faculty</option>
                        <option value="STAFF">Campus Staff</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        College / Dept
                      </label>
                      <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                      >
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.code} ({dept.college})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Year Level
                      </label>
                      <select
                        value={yearLevel}
                        onChange={(e) => setYearLevel(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="1st Year">1st Year (Freshman)</option>
                        <option value="2nd Year">2nd Year (Sophomore)</option>
                        <option value="3rd Year">3rd Year (Junior)</option>
                        <option value="4th Year">4th Year (Senior)</option>
                        <option value="5th Year">5th Year (Senior+)</option>
                        <option value="Faculty / Grad">Faculty / Graduate</option>
                      </select>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Create Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-950 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
                  >
                    <span>{loading ? 'Creating Campus Account...' : 'Create Account & Enter Campus Bentahan'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 pt-1">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      Sign In here
                    </button>
                  </p>
                </form>
              ) : (
                /* Mode 2: Sign In Form */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sign In to Campus Bentahan</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enter your university email and password to access your listings and chats.
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      University Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="yourname@university.edu"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-950 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
                  >
                    <span>{loading ? 'Verifying Account...' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 pt-1">
                    First time here?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      Create an account now
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* University Compliance Footer */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Campus Bentahan</span>
            <span>•</span>
            <span>University Student Affairs & Safety Monitored</span>
          </div>
          <p>© {new Date().getFullYear()} Campus Bentahan. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};
