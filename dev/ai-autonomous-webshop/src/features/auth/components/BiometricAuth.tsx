import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../hooks/useAuth';
import { Button } from '../../../components/ui/Button';

interface BiometricAuthProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const BiometricAuth: React.FC<BiometricAuthProps> = ({ onSuccess, onError }) => {
  const { 
    isBiometricAvailable, 
    biometricType, 
    checkBiometricSupport, 
    loginWithBiometric,
    registerBiometric,
    isLoading,
    error 
  } = useAuthStore();
  
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, [checkBiometricSupport]);

  const handleLogin = async () => {
    try {
      await loginWithBiometric();
      onSuccess?.();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Biometric login failed');
    }
  };

  const handleRegister = async () => {
    try {
      await registerBiometric();
      setIsRegistered(true);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Biometric registration failed');
    }
  };

  if (!isBiometricAvailable) {
    return (
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl" title="Biometric not available">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Warning">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-amber-400 font-medium">Biometric Authentication Unavailable</p>
            <p className="text-amber-400/70 text-sm mt-1">
              Your device doesn't support WebAuthn/Passkeys. Use password login instead.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const biometricLabel = biometricType === 'face' ? 'Face ID' : 
                        biometricType === 'fingerprint' ? 'Touch ID' : 
                        'Biometric';

  const biometricIcon = biometricType === 'face' ? (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Face ID">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ) : (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Touch ID">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
    </svg>
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-transparent text-gray-500">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        onClick={isRegistered ? handleLogin : handleRegister}
        isLoading={isLoading}
        className="w-full flex items-center justify-center gap-3 !bg-gradient-to-r !from-indigo-500 !to-purple-600 hover:!from-indigo-600 !to-purple-700"
      >
        {biometricIcon}
        {isRegistered ? `Sign in with ${biometricLabel}` : `Set up ${biometricLabel}`}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        {isRegistered 
          ? `Use ${biometricLabel} for quick and secure login`
          : `Enable ${biometricLabel} for password-less authentication`}
      </p>

      {isRegistered && (
        <p className="text-xs text-green-400 text-center">
          ✓ {biometricLabel} is set up. Click the button above to sign in.
        </p>
      )}
    </div>
  );
};
