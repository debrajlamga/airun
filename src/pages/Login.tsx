import { useState } from 'react';
import { Activity, Shield, Lock, Mail, Eye, EyeOff, Fingerprint, AlertTriangle, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await auth.login({ email: formData.email, password: formData.password });
  };

  const handleMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    await auth.verifyMFA(mfaCode);
  };

  // ─── MFA Verification Screen ──────────────────────────────────────────────
  if (auth.mfaRequired) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950" />
        <div className="relative w-full max-w-md">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Fingerprint className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Admin 2FA Verification</h2>
              <p className="text-sm text-gray-400 mt-2">Enter the 6-digit code from your authenticator app</p>
            </div>

            <form onSubmit={handleMFA} className="space-y-4">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {auth.error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700/40 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{auth.error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={mfaCode.length !== 6 || auth.isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {auth.isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4" /> Verify & Continue
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={auth.cancelMFA}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </button>
            </form>

            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/40 rounded-lg">
              <p className="text-[10px] text-blue-300 text-center">
                <strong>Demo:</strong> Koi bhi 6-digit code daalein (e.g. <code className="bg-gray-800 px-1 rounded">123456</code>)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Admin Login Screen ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950" />
      
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">AI Trading Bot</h1>
          <p className="text-xs text-gray-500 mt-1">Admin Access — Single User System</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-5 p-2.5 bg-gray-800/50 rounded-lg border border-gray-700">
            <Shield className="w-4 h-4 text-blue-400 shrink-0" />
            <p className="text-xs text-gray-300">
              <strong>Single Admin Mode</strong> — Only one administrator account exists.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder={auth.adminEmail}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Admin Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {auth.error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700/40 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-400">{auth.error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={auth.isLoading || !formData.email || !formData.password}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {auth.isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Admin Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-5 p-3 bg-blue-900/20 border border-blue-700/40 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              <h4 className="text-xs font-medium text-blue-300">Admin Credentials</h4>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Email:</span>
                <code className="text-blue-300 bg-gray-800 px-2 py-0.5 rounded text-[11px]">admin@tradingbot.local</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Password:</span>
                <code className="text-blue-300 bg-gray-800 px-2 py-0.5 rounded text-[11px]">Admin@Secure2024!</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">MFA Code:</span>
                <code className="text-blue-300 bg-gray-800 px-2 py-0.5 rounded text-[11px]">123456</code>
              </div>
            </div>
            <button
              onClick={() => setFormData({ email: 'admin@tradingbot.local', password: 'Admin@Secure2024!' })}
              className="mt-2 w-full py-1.5 text-[11px] text-blue-400 hover:text-blue-300 bg-blue-900/30 hover:bg-blue-900/50 rounded transition-colors"
            >
              ⚡ Auto-fill Demo Credentials
            </button>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-600">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 256-bit TLS</span>
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Argon2 Hashing</span>
            <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3" /> 2FA/TOTP</span>
          </div>
          <p className="text-[10px] text-gray-700">
            Single admin system. No registration. Brute-force protected.
          </p>
        </div>
      </div>
    </div>
  );
}
