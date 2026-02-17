import { create } from 'zustand';
import { authService } from '../services/authService';

interface AuthState {
  user: unknown | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isBiometricAvailable: boolean;
  biometricType: 'fingerprint' | 'face' | 'iris' | null;
  login: (credentials: unknown) => Promise<void>;
  register: (userData: unknown) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  registerBiometric: () => Promise<void>;
  checkBiometricSupport: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isBiometricAvailable: false,
  biometricType: null,

  checkBiometricSupport: async () => {
    if (!window.PublicKeyCredential) {
      set({ isBiometricAvailable: false, biometricType: null });
      return;
    }

    try {
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticator();
      
      let biometricType: 'fingerprint' | 'face' | 'iris' | null = null;
      if (available) {
        biometricType = 'fingerprint';
      }
      
      set({ isBiometricAvailable: available, biometricType });
    } catch {
      set({ isBiometricAvailable: false, biometricType: null });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login(credentials);
      localStorage.setItem('token', token);
      set({ user, token, isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({ error: err.response?.data?.error || 'Login failed', isLoading: false });
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(userData);
      set({ isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({ error: err.response?.data?.error || 'Registration failed', isLoading: false });
    }
  },

  loginWithBiometric: async () => {
    set({ isLoading: true, error: null });
    try {
      const credential = await authService.biometricLogin();
      
      if (credential) {
        const { user, token } = credential;
        localStorage.setItem('token', token);
        set({ user, token, isLoading: false });
      } else {
        throw new Error('Biometric authentication failed');
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      set({ error: err.message || 'Biometric login failed', isLoading: false });
    }
  },

  registerBiometric: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.registerBiometric();
      set({ isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({ error: err.response?.data?.error || 'Biometric registration failed', isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
