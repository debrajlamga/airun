import { useState, useCallback, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'trader' | 'viewer';
  mfaEnabled: boolean;
  lastLogin: number;
  sessionExpiry: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaRequired: boolean;
  mfaVerified: boolean;
  error: string | null;
  sessionToken: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Simulated secure auth service (in production, this calls the backend API)
const AUTH_STORAGE_KEY = 'ai_trading_auth';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

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
            mfaVerified: true,
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
      mfaVerified: false,
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
        error: `Too many failed attempts. Account locked for ${remaining} minutes.`,
      }));
      return false;
    }

    // Input validation
    if (!credentials.email || !credentials.password) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Email and password are required.' }));
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Invalid email format.' }));
      return false;
    }

    if (credentials.password.length < 8) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Password must be at least 8 characters.' }));
      return false;
    }

    // Simulate API call delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));

    // Simulated authentication (in production, this is a backend API call)
    // For demo: accept any valid email with password "Trading@2024" or any password for demo
    const isValidPassword = credentials.password.length >= 8;

    if (!isValidPassword) {
      const newAttempts = { count: attempts.count + 1, lockedUntil: 0 };
      if (newAttempts.count >= MAX_LOGIN_ATTEMPTS) {
        newAttempts.lockedUntil = Date.now() + LOCKOUT_DURATION;
      }
      setLoginAttempts(newAttempts);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: newAttempts.count >= MAX_LOGIN_ATTEMPTS
          ? `Too many failed attempts. Account locked for 15 minutes.`
          : `Invalid credentials. ${MAX_LOGIN_ATTEMPTS - newAttempts.count} attempts remaining.`,
      }));
      return false;
    }

    // Reset login attempts on success
    setLoginAttempts({ count: 0, lockedUntil: 0 });

    // Simulate MFA requirement (in production, check user's MFA setting)
    const mfaEnabled = true; // Simulate MFA being enabled

    if (mfaEnabled) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        mfaRequired: true,
        error: null,
      }));
      // Store temp credentials for after MFA
      sessionStorage.setItem('pending_auth', JSON.stringify({
        email: credentials.email,
        timestamp: Date.now(),
      }));
      return true;
    }

    // Complete login
    const user: User = {
      id: 'usr_' + generateSessionToken().slice(0, 16),
      email: credentials.email,
      name: credentials.email.split('@')[0],
      role: 'admin',
      mfaEnabled: true,
      lastLogin: Date.now(),
      sessionExpiry: Date.now() + SESSION_TIMEOUT,
    };
    const sessionToken = generateSessionToken();

    const authData = { user, sessionToken, sessionExpiry: Date.now() + SESSION_TIMEOUT };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      mfaRequired: false,
      mfaVerified: true,
      error: null,
      sessionToken,
    });

    return true;
  }, []);

  const verifyMFA = useCallback(async (code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Enter a valid 6-digit code.' }));
      return false;
    }

    // Simulate API verification delay
    await new Promise(r => setTimeout(r, 500 + Math.random() * 300));

    // In production: verify TOTP code against user's secret
    // For demo: accept any 6-digit code
    const pendingStr = sessionStorage.getItem('pending_auth');
    if (!pendingStr) {
      setState(prev => ({ ...prev, isLoading: false, mfaRequired: false, error: 'Session expired. Please login again.' }));
      return false;
    }

    const pending = JSON.parse(pendingStr);
    if (Date.now() - pending.timestamp > 300000) { // 5 min expiry
      sessionStorage.removeItem('pending_auth');
      setState(prev => ({ ...prev, isLoading: false, mfaRequired: false, error: 'MFA code expired. Please login again.' }));
      return false;
    }

    sessionStorage.removeItem('pending_auth');

    const user: User = {
      id: 'usr_' + generateSessionToken().slice(0, 16),
      email: pending.email,
      name: pending.email.split('@')[0],
      role: 'admin',
      mfaEnabled: true,
      lastLogin: Date.now(),
      sessionExpiry: Date.now() + SESSION_TIMEOUT,
    };
    const sessionToken = generateSessionToken();

    const authData = { user, sessionToken, sessionExpiry: Date.now() + SESSION_TIMEOUT };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      mfaRequired: false,
      mfaVerified: true,
      error: null,
      sessionToken,
    });

    return true;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Validation
    if (!data.name || !data.email || !data.password || !data.confirmPassword) {
      setState(prev => ({ ...prev, isLoading: false, error: 'All fields are required.' }));
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Invalid email format.' }));
      return false;
    }

    if (data.name.length < 2) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Name must be at least 2 characters.' }));
      return false;
    }

    if (data.password.length < 10) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Password must be at least 10 characters.' }));
      return false;
    }

    // Password strength checks
    const hasUpper = /[A-Z]/.test(data.password);
    const hasLower = /[a-z]/.test(data.password);
    const hasNumber = /[0-9]/.test(data.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(data.password);

    if (!(hasUpper && hasLower && hasNumber && hasSpecial)) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Password must contain uppercase, lowercase, number, and special character.',
      }));
      return false;
    }

    if (data.password !== data.confirmPassword) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Passwords do not match.' }));
      return false;
    }

    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));

    setState(prev => ({ ...prev, isLoading: false, error: null }));
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem('pending_auth');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      mfaRequired: false,
      mfaVerified: false,
      error: null,
      sessionToken: null,
    });
  }, []);

  const cancelMFA = useCallback(() => {
    sessionStorage.removeItem('pending_auth');
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
    register,
    logout,
    verifyMFA,
    cancelMFA,
  };
}
