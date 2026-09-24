import { useState } from 'react';
import { Activity, Shield, Lock, Mail, User, Eye, EyeOff, Fingerprint, AlertTriangle, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await auth.login({ email: formData.email, password: formData.password });
  };

  const handleMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    await auth.verifyMFA(mfaCode);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await auth.register(formData);
    if (success) {
      setRegisterSuccess(true);
      setTimeout(() => {
        setRegisterSuccess(false);
        setMode('login');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      }, 3000);
    }
  };

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 10) score++;
    if (password.length >= 14) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'Fair', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  // MFA Verification Screen
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
              <h2 className="text-xl font-bold text-white">Two-Factor Authentication</h2>
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

            <div className="mt-6 pt-4 border-t border-gray-800">
              <p className="text-[10px] text-gray-600 text-center">
                Protected by TOTP-based two-factor authentication.
                <br />Codes expire after 30 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-xs text-gray-500 mt-1">Secure Algorithmic Trading Platform</p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-gray-800 rounded-lg p-0.5 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${mode === 'register' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="trader@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500" />
                  <span className="text-xs text-gray-400">Remember me</span>
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setFormData(p => ({ ...p, email: 'trader@demo.com', password: 'Trading@2024' }))} className="text-xs text-blue-400 hover:text-blue-300">
                    Use Demo
                  </button>
                  <span className="text-gray-700">|</span>
                  <button type="button" onClick={() => setMode('forgot')} className="text-xs text-blue-400 hover:text-blue-300">
                    Forgot?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={auth.isLoading || !formData.email || !formData.password}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {auth.isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Sign In Securely
                  </>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && !registerSuccess && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="trader@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min 10 chars, upper, lower, number, special"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    autoComplete="new-password"
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
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getPasswordStrength(formData.password).color}`}
                          style={{ width: `${(getPasswordStrength(formData.password).score / 6) * 100}%` }}
                        />
                      </div>
                      <span className={`text-[10px] ${
                        getPasswordStrength(formData.password).score <= 2 ? 'text-red-400' :
                        getPasswordStrength(formData.password).score <= 4 ? 'text-yellow-400' : 'text-green-400'
                      }`}>{getPasswordStrength(formData.password).label}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Confirm Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    autoComplete="new-password"
                    required
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-[10px] text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              {auth.error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700/40 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{auth.error}</p>
                </div>
              )}

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 mt-0.5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500" required />
                <span className="text-[10px] text-gray-400">
                  I acknowledge that trading involves substantial risk of loss. Past performance does not guarantee future results. I accept the terms of service and privacy policy.
                </span>
              </label>

              <button
                type="submit"
                disabled={auth.isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {auth.isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Create Secure Account'
                )}
              </button>
            </form>
          )}

          {/* Register Success */}
          {mode === 'register' && registerSuccess && (
            <div className="text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-white">Account Created Successfully</h3>
              <p className="text-xs text-gray-400 mt-2">Redirecting to login...</p>
            </div>
          )}

          {/* Forgot Password */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-sm font-medium text-white">Reset Password</h3>
                <p className="text-xs text-gray-400 mt-1">Enter your email to receive a reset link</p>
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
                Send Reset Link
              </button>
              <button onClick={() => setMode('login')} className="w-full py-2 text-sm text-gray-400 hover:text-gray-200 flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </button>
            </div>
          )}
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-blue-600/30 rounded flex items-center justify-center">
              <span className="text-[10px]">🔑</span>
            </div>
            <h4 className="text-xs font-medium text-blue-300">Demo Credentials</h4>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Email:</span>
              <code className="text-blue-300 bg-gray-800 px-2 py-0.5 rounded">trader@demo.com</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Password:</span>
              <code className="text-blue-300 bg-gray-800 px-2 py-0.5 rounded">Trading@2024</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">MFA Code:</span>
              <code className="text-blue-300 bg-gray-800 px-2 py-0.5 rounded">123456</code>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">
            Ya koi bhi valid email + 8+ char password use karein
          </p>
        </div>

        {/* Security Info */}
        <div className="mt-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-600">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 256-bit TLS</span>
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Argon2 Hashing</span>
            <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3" /> 2FA/TOTP</span>
          </div>
          <p className="text-[10px] text-gray-700">
            Protected against brute-force, CSRF, XSS, and injection attacks.
            <br />All sessions use secure, HTTP-only, SameSite cookies.
          </p>
        </div>
      </div>
    </div>
  );
}
