import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  ArrowRight,
  Flame,
  Swords,
  Crown,
  Dumbbell,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Check,
} from 'lucide-react';
import { HunterClassArchetype, HunterAccount } from '../types/auth';
import { authService, CLASS_BONUSES, DEMO_HUNTER } from '../services/authService';
import { soundFx } from '../utils/audio';

interface AuthViewProps {
  onAuthSuccess: (hunter: HunterAccount) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpClass, setSignUpClass] = useState<HunterClassArchetype>('Shadow Monarch');
  const [signUpTitle, setSignUpTitle] = useState('The Awakened');
  const [agreedToSystem, setAgreedToSystem] = useState(true);

  // Recovery state
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<string | null>(null);

  // Password Strength Evaluation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { rank: 'E', score: 0, label: 'Unranked', color: 'text-slate-500', bar: 'bg-slate-700', width: '10%' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { rank: 'E', score: 1, label: 'E-Rank (Vulnerable)', color: 'text-slate-400', bar: 'bg-slate-500', width: '25%' };
      case 2:
        return { rank: 'D', score: 2, label: 'D-Rank (Adequate)', color: 'text-cyan-400', bar: 'bg-cyan-500 shadow-[0_0_8px_#00D4FF]', width: '45%' };
      case 3:
        return { rank: 'C', score: 3, label: 'C-Rank (Hardened)', color: 'text-emerald-400', bar: 'bg-emerald-500 shadow-[0_0_8px_#10B981]', width: '65%' };
      case 4:
        return { rank: 'B', score: 4, label: 'B-Rank (Formidable)', color: 'text-indigo-400', bar: 'bg-indigo-500 shadow-[0_0_10px_#6366F1]', width: '80%' };
      case 5:
      default:
        if (pass.length >= 12) {
          return { rank: 'S', score: 5, label: 'S-Rank (Monarch Grade)', color: 'text-amber-400', bar: 'bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_15px_#F59E0B]', width: '100%' };
        }
        return { rank: 'A', score: 5, label: 'A-Rank (Monarch Shielded)', color: 'text-purple-400', bar: 'bg-purple-500 shadow-[0_0_12px_#A855F7]', width: '92%' };
    }
  };

  const strength = getPasswordStrength(signUpPassword);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMsg('SYSTEM ERROR: Enter Hunter ID/Email and Passcode.');
      return;
    }

    setIsSubmitting(true);
    soundFx.playClick();

    setTimeout(() => {
      const res = authService.login({
        emailOrHunterId: loginIdentifier,
        password: loginPassword,
        rememberMe,
      });

      setIsSubmitting(false);

      if (res.success && res.user) {
        soundFx.playQuestComplete();
        setSuccessMsg(res.message || 'Access Authorized.');
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 500);
      } else {
        setErrorMsg(res.message || 'Verification Failed.');
      }
    }, 450);
  };

  const handleDemoLogin = () => {
    soundFx.playClick();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg('Engaging Monarch Override Link...');

    setTimeout(() => {
      const res = authService.login({
        emailOrHunterId: DEMO_HUNTER.email,
        password: DEMO_HUNTER.password,
        rememberMe: true,
      });

      setIsSubmitting(false);
      if (res.success && res.user) {
        soundFx.playLevelUp();
        onAuthSuccess(res.user);
      } else {
        setErrorMsg('Demo hunter initialization failed.');
      }
    }, 500);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signUpName.trim()) {
      setErrorMsg('AWAKENING DENIED: Hunter Codename is required.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setErrorMsg('AWAKENING DENIED: A valid Comm Link (Email) is required.');
      return;
    }
    if (signUpPassword.length < 4) {
      setErrorMsg('AWAKENING DENIED: Passcode must be at least 4 characters.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMsg('AWAKENING DENIED: Passcode verification mismatch.');
      return;
    }
    if (!agreedToSystem) {
      setErrorMsg('AWAKENING DENIED: You must accept the Hunter System Mandate.');
      return;
    }

    setIsSubmitting(true);
    soundFx.playClick();

    setTimeout(() => {
      const res = authService.signUp({
        hunterName: signUpName,
        email: signUpEmail,
        password: signUpPassword,
        hunterClass: signUpClass,
        title: signUpTitle,
        avatar: signUpClass === 'Shadow Monarch' ? 'shadow-monarch' : 'sung-jinwoo',
      });

      setIsSubmitting(false);

      if (res.success && res.user) {
        soundFx.playLevelUp();
        setSuccessMsg(res.message || 'Awakening Complete.');
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 750);
      } else {
        setErrorMsg(res.message || 'Registration rejected by System.');
      }
    }, 600);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail || !newPassword) {
      setRecoveryStatus('Provide both Comm Link and New Passcode.');
      return;
    }
    const res = authService.resetPassword(recoveryEmail, newPassword);
    setRecoveryStatus(res.message || '');
    if (res.success) {
      soundFx.playQuestComplete();
      setTimeout(() => {
        setShowRecoveryModal(false);
        setLoginPassword(newPassword);
        setLoginIdentifier(recoveryEmail);
      }, 1400);
    }
  };

  const classes: {
    type: HunterClassArchetype;
    icon: typeof Crown;
    border: string;
    text: string;
  }[] = [
    { type: 'Shadow Monarch', icon: Crown, border: 'border-violet-500/60', text: 'text-violet-400' },
    { type: 'Shadow Assassin', icon: Swords, border: 'border-cyan-400/60', text: 'text-cyan-400' },
    { type: 'Iron Vanguard', icon: Shield, border: 'border-slate-400/60', text: 'text-slate-300' },
    { type: 'Blood Necromancer', icon: Flame, border: 'border-rose-500/60', text: 'text-rose-400' },
    { type: 'Storm Striker', icon: Dumbbell, border: 'border-amber-400/60', text: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen bg-[#07070B] text-slate-100 flex flex-col justify-center items-center p-3 sm:p-6 relative overflow-hidden select-none font-sans">
      {/* Background Ambience: Gate grid & glowing orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-black to-[#07070B] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Cyber Grid Lines Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #00D4FF 1px, transparent 1px), linear-gradient(to bottom, #00D4FF 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Container Card */}
      <div className="relative w-full max-w-xl z-10">
        {/* Holographic Header Emblem */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-hud text-xs tracking-widest mb-3 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>SOLO LEVELING HUNTER SYSTEM</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <h1 className="font-hud text-2xl sm:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-violet-400 drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]">
            SHADOW FITNESS
          </h1>
          <p className="font-tech text-xs sm:text-sm text-slate-400 tracking-wider mt-1 uppercase">
            {mode === 'login' ? 'System Access // Hunter Verification' : 'Awakening Protocol // Player Registration'}
          </p>
        </div>

        {/* Auth Box with Cyberpunk Hex styling */}
        <div className="bg-[#0B0C13]/95 border-2 border-cyan-500/30 rounded-xl p-5 sm:p-7 shadow-[0_0_35px_rgba(0,0,0,0.8),0_0_20px_rgba(0,212,255,0.15)] backdrop-blur-xl relative">
          {/* Glowing Top Bar Accent */}
          <div className="absolute -top-[2px] left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-black/60 border border-cyan-500/20 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs sm:text-sm font-hud font-bold tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>HUNTER LOGIN</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs sm:text-sm font-hud font-bold tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-violet-950/80 border border-violet-400 text-violet-300 shadow-[0_0_15px_rgba(123,92,255,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>AWAKEN (SIGN UP)</span>
            </button>
          </div>

          {/* System Notification Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/50 rounded-lg flex items-start gap-2.5 text-rose-300 text-xs font-tech animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg flex items-start gap-2.5 text-emerald-300 text-xs font-tech animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block font-hud text-[11px] text-cyan-300 uppercase tracking-wider mb-1.5">
                  Hunter Comm Link or Codename
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="hunter@shadow.system or Hunter Jin"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/70 border border-slate-700/80 rounded-lg text-white font-tech text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-hud text-[11px] text-cyan-300 uppercase tracking-wider">
                    Hunter Passcode
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setShowRecoveryModal(true);
                      setRecoveryStatus(null);
                    }}
                    className="text-[11px] font-tech text-cyan-400 hover:text-cyan-300 underline tracking-wide cursor-pointer"
                  >
                    Forgot Passcode?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter security passcode..."
                    className="w-full pl-9 pr-10 py-2.5 bg-black/70 border border-slate-700/80 rounded-lg text-white font-tech text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-cyan-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-black border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="font-tech text-xs text-slate-300">
                    Persist Hunter Biometrics (Stay Logged In)
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 mt-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-hud text-xs sm:text-sm font-black tracking-widest uppercase rounded-lg shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>VERIFYING HUNTER...</span>
                  </>
                ) : (
                  <>
                    <span>ACCESS SYSTEM HUD</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-[#0B0C13] px-3 font-hud text-[10px] text-slate-500 uppercase tracking-widest shrink-0">
                  OR QUICK ACCESS
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              {/* Quick Demo Access Button */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-violet-950/40 hover:bg-violet-950/70 border border-violet-500/40 hover:border-violet-400 text-violet-300 font-hud text-xs font-bold tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(123,92,255,0.2)] cursor-pointer"
              >
                <Crown className="w-4 h-4 text-violet-400" />
                <span>QUICK AWAKE // DEMO HUNTER (HUNTER JIN)</span>
              </button>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Hunter Codename */}
              <div>
                <label className="block font-hud text-[11px] text-violet-300 uppercase tracking-wider mb-1.5">
                  Hunter Codename (Player Identity)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Sung Jinwoo or Shadow Blade"
                    className="w-full pl-9 pr-3 py-2 bg-black/70 border border-slate-700/80 rounded-lg text-white font-tech text-sm placeholder-slate-500 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all"
                  />
                </div>
              </div>

              {/* Comm Link (Email) */}
              <div>
                <label className="block font-hud text-[11px] text-violet-300 uppercase tracking-wider mb-1.5">
                  System Comm Link (Email Address)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="hunter@domain.com"
                    className="w-full pl-9 pr-3 py-2 bg-black/70 border border-slate-700/80 rounded-lg text-white font-tech text-sm placeholder-slate-500 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all"
                  />
                </div>
              </div>

              {/* Hunter Class Archetype Picker */}
              <div>
                <label className="block font-hud text-[11px] text-violet-300 uppercase tracking-wider mb-1.5">
                  Awakened Class Archetype
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {classes.map((cls) => {
                    const Icon = cls.icon;
                    const isSelected = signUpClass === cls.type;
                    return (
                      <button
                        key={cls.type}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setSignUpClass(cls.type);
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'bg-violet-950/80 border-violet-400 shadow-[0_0_12px_rgba(123,92,255,0.4)] scale-[1.02]'
                            : 'bg-black/60 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? cls.text : 'text-slate-500'}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-violet-300" />}
                        </div>
                        <span className={`font-hud text-[10px] font-bold block ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {cls.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {signUpClass && (
                  <p className="font-tech text-[11px] text-slate-400 mt-1.5 px-1 italic">
                    Perks: {CLASS_BONUSES[signUpClass]?.desc}
                  </p>
                )}
              </div>

              {/* Starting Title */}
              <div>
                <label className="block font-hud text-[11px] text-violet-300 uppercase tracking-wider mb-1.5">
                  Starter Hunter Title
                </label>
                <select
                  value={signUpTitle}
                  onChange={(e) => setSignUpTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/70 border border-slate-700/80 rounded-lg text-white font-tech text-sm focus:outline-none focus:border-violet-400"
                >
                  <option value="The Awakened">The Awakened (Basic Tier)</option>
                  <option value="Solo Challenger">Solo Challenger (+Daily Discipline)</option>
                  <option value="Gate Breaker">Gate Breaker (+Strength Volume)</option>
                  <option value="Shadow Initiate">Shadow Initiate (+Perception)</option>
                  <option value="Wolf Slayer">Wolf Slayer (+Speed Agility)</option>
                </select>
              </div>

              {/* Passcode & Strength Meter */}
              <div>
                <label className="block font-hud text-[11px] text-violet-300 uppercase tracking-wider mb-1.5">
                  Hunter Security Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Enter min. 4 characters..."
                    className="w-full pl-9 pr-10 py-2 bg-black/70 border border-slate-700/80 rounded-lg text-white font-tech text-sm placeholder-slate-500 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-violet-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Gauge */}
                {signUpPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-hud">
                      <span className="text-slate-400 text-[10px]">Passcode Mana Grade:</span>
                      <span className={`font-bold ${strength.color}`}>{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/60 rounded-full border border-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.bar}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Passcode */}
              <div>
                <label className="block font-hud text-[11px] text-violet-300 uppercase tracking-wider mb-1.5">
                  Confirm Security Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Re-enter passcode..."
                    className="w-full pl-9 pr-10 py-2 bg-black/70 border border-slate-700/80 rounded-lg text-white font-tech text-sm placeholder-slate-500 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-violet-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signUpConfirmPassword && signUpPassword !== signUpConfirmPassword && (
                  <span className="text-[11px] font-tech text-rose-400 mt-1 block">
                    Passcodes do not match.
                  </span>
                )}
              </div>

              {/* System Mandate Agreement */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToSystem}
                    onChange={(e) => setAgreedToSystem(e.target.checked)}
                    className="rounded mt-0.5 bg-black border-slate-700 text-violet-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="font-tech text-xs text-slate-300">
                    I accept the System Mandate. I pledge to complete daily physical quests and conquer penalty zones without hesitation.
                  </span>
                </label>
              </div>

              {/* Submit Awakening */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 mt-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-hud text-xs sm:text-sm font-black tracking-widest uppercase rounded-lg shadow-[0_0_20px_rgba(123,92,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>AWAKENING HUNTER SOUL...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-cyan-300" />
                    <span>COMMENCE AWAKENING CEREMONY</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center">
          <p className="font-tech text-[11px] text-slate-500">
            System Protocol v2.5 // Solo Leveling Fitness Integration
          </p>
        </div>
      </div>

      {/* SYSTEM PASSCODE RECOVERY MODAL */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0C0D15] border-2 border-cyan-400 p-6 rounded-xl shadow-[0_0_35px_rgba(0,212,255,0.4)]">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <h3 className="font-hud text-sm font-bold text-white uppercase">
                  Hunter Passcode Recovery
                </h3>
              </div>
              <button
                onClick={() => setShowRecoveryModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="font-tech text-xs text-slate-300 mb-4">
              Provide your registered Comm Link (Email) to transmit a System Passcode Override.
            </p>

            {recoveryStatus && (
              <div className="mb-4 p-2.5 bg-black/60 border border-cyan-500/40 rounded text-cyan-300 font-tech text-xs">
                {recoveryStatus}
              </div>
            )}

            <form onSubmit={handleRecoverySubmit} className="space-y-3">
              <div>
                <label className="block font-hud text-[10px] text-cyan-400 uppercase mb-1">
                  Registered Comm Link
                </label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="hunter@shadow.system"
                  className="w-full px-3 py-2 bg-black border border-slate-700 rounded text-sm text-white font-tech focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-hud text-[10px] text-cyan-400 uppercase mb-1">
                  New Desired Passcode
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 4 characters..."
                  className="w-full px-3 py-2 bg-black border border-slate-700 rounded text-sm text-white font-tech focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-hud text-xs font-bold uppercase rounded shadow-[0_0_10px_rgba(0,212,255,0.4)]"
                >
                  Override & Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-hud text-xs rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
