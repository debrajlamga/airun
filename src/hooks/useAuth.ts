import { useState, useCallback, useEffect } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  mfaEnabled: boolean;
  lastLogin: number;
  sessionExpiry: number;
}

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaRequired: boolean;
  error: string | null;
  sessionToken: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

// ─── Single Admin Mode ──────────────────────────────────────────────────────
// Only ONE admin account exists. No registration. No other users.
// Admin credentials are generated during setup.sh and shown once.

const AUTH_STORAGE_KEY = 'ai_trading_admin_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Admin credentials (in production, these come from .env / backend)
// For demo: hardcoded. In real deployment, setup.sh generates these.
const ADMIN_EMAIL = 'admin@tradingbot.local';
const ADMIN_PASSWORD = 'Admin@Secure2024!';

function getLoginAttempts(): { count: number; lockedUntil: number } {
  try {
    const data = localStorage.getItem('login_attempts');
    if (data) return JSON.parse(data);
  } catch {}
  return { count: 0, lockedUntil: 0 };
}

function setLoginAttempts(attempts: { count: number; lockedUntil: number }) {
  localStorage.setItem('login_attempts', JSON.stringify(attempts));
}

function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.sessionExpiry > Date.now()) {
          return {
            user: parsed.user,
            isAuthenticated: true,
            isLoading: false,
            mfaRequired: false,
            error: null,
            sessionToken: parsed.sessionToken,
          };
        }
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {}
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      mfaRequired: false,
      error: null,
      sessionToken: null,
    };
  });

  // Session timeout check
  useEffect(() => {
    if (!state.isAuthenticated) return;
    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.sessionExpiry <= Date.now()) {
            logout();
          }
        }
      } catch {}
    }, 60000);
    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  // Activity tracking for session refresh
  useEffect(() => {
    if (!state.isAuthenticated) return;
    const refreshSession = () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.sessionExpiry = Date.now() + SESSION_TIMEOUT;
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
        }
      } catch {}
    };
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, refreshSession, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, refreshSession));
  }, [state.isAuthenticated]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Check lockout
    const attempts = getLoginAttempts();
    if (attempts.lockedUntil > Date.now()) {
      const remaining = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Account locked. Try again in ${remaining} minutes.`,
      }));
      return false;
    }

    // Input validation
    if (!credentials.email || !credentials.password) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Email and password required.' }));
      return false;
    }

    // Simulate API delay (in production, this is a backend call)
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    // ─── Single Admin Authentication ─────────────────────────────────────
    // Only ONE admin account. No other users allowed.
    const isAdmin = credentials.email === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD;

    if (!isAdmin) {
      const newAttempts = { count: attempts.count + 1, lockedUntil: 0 };
      if (newAttempts.count >= MAX_LOGIN_ATTEMPTS) {
        newAttempts.lockedUntil = Date.now() + LOCKOUT_DURATION;
      }
      setLoginAttempts(newAttempts);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: newAttempts.count >= MAX_LOGIN_ATTEMPTS
          ? `Too many failed attempts. Locked for 15 minutes.`
          : `Invalid credentials. ${MAX_LOGIN_ATTEMPTS - newAttempts.count} attempts left.`,
      }));
      return false;
    }

    // Reset login attempts on success
    setLoginAttempts({ count: 0, lockedUntil: 0 });

    // MFA required for admin
    setState(prev => ({
      ...prev,
      isLoading: false,
      mfaRequired: true,
      error: null,
    }));
    sessionStorage.setItem('pending_admin_auth', JSON.stringify({
      email: credentials.email,
      timestamp: Date.now(),
    }));
    return true;
  }, []);

  const verifyMFA = useCallback(async (code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    if (!/^\d{6}$/.test(code)) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Enter valid 6-digit code.' }));
      return false;
    }

    await new Promise(r => setTimeout(r, 400 + Math.random() * 300));

    const pendingStr = sessionStorage.getItem('pending_admin_auth');
    if (!pendingStr) {
      setState(prev => ({ ...prev, isLoading: false, mfaRequired: false, error: 'Session expired. Login again.' }));
      return false;
    }

    const pending = JSON.parse(pendingStr);
    if (Date.now() - pending.timestamp > 300000) {
      sessionStorage.removeItem('pending_admin_auth');
      setState(prev => ({ ...prev, isLoading: false, mfaRequired: false, error: 'MFA expired. Login again.' }));
      return false;
    }

    sessionStorage.removeItem('pending_admin_auth');

    // Create admin session
    const adminUser: AdminUser = {
      id: 'admin-001',
      email: ADMIN_EMAIL,
      name: 'Admin',
      role: 'admin',
      mfaEnabled: true,
      lastLogin: Date.now(),
      sessionExpiry: Date.now() + SESSION_TIMEOUT,
    };
    const sessionToken = generateSessionToken();

    const authData = { user: adminUser, sessionToken, sessionExpiry: Date.now() + SESSION_TIMEOUT };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

    setState({
      user: adminUser,
      isAuthenticated: true,
      isLoading: false,
      mfaRequired: false,
      error: null,
      sessionToken,
    });

    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem('pending_admin_auth');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      mfaRequired: false,
      error: null,
      sessionToken: null,
    });
  }, []);

  const cancelMFA = useCallback(() => {
    sessionStorage.removeItem('pending_admin_auth');
    setState(prev => ({
      ...prev,
      mfaRequired: false,
      isLoading: false,
      error: null,
    }));
  }, []);

  return {
    ...state,
    login,
    logout,
    verifyMFA,
    cancelMFA,
    isAdmin: true, // Single admin system
    adminEmail: ADMIN_EMAIL,
  };
}
