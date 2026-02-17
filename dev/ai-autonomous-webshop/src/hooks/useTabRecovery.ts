import { useEffect, useCallback, useRef } from 'react';

type RecoveryCallback = () => Promise<void>;

interface TabRecoveryOptions {
  onTabHidden?: () => void;
  onTabVisible?: RecoveryCallback;
  hiddenTitle?: string;
  originalTitle?: string;
  enableNotifications?: boolean;
  notificationTitle?: string;
  notificationBody?: string;
}

interface TabRecoveryState {
  isHidden: boolean;
  wasHidden: boolean;
  lastHiddenAt: number | null;
}

export function useTabRecovery(options: TabRecoveryOptions) {
  const {
    onTabHidden,
    onTabVisible,
    hiddenTitle = "Don't forget your cart! 🛒",
    originalTitle = "NEXUS AI Shop",
    enableNotifications = false,
    notificationTitle = "Your cart is waiting!",
    notificationBody = "Return to complete your purchase",
  } = options;

  const stateRef = useRef<TabRecoveryState>({
    isHidden: false,
    wasHidden: false,
    lastHiddenAt: null,
  });

  const notificationPermissionRef = useRef<NotificationPermission>('default');
  const originalTitleRef = useRef(originalTitle);

  const requestNotificationPermission = useCallback(async () => {
    if (!enableNotifications) return false;
    
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        notificationPermissionRef.current = await Notification.requestPermission();
      } else {
        notificationPermissionRef.current = Notification.permission;
      }
    }
    return notificationPermissionRef.current === 'granted';
  }, [enableNotifications]);

  const showNotification = useCallback(() => {
    if (!enableNotifications || notificationPermissionRef.current !== 'granted') return;
    
    try {
      new Notification(notificationTitle, {
        body: notificationBody,
        icon: '/favicon.ico',
        tag: 'tab-recovery',
        requireInteraction: false,
      });
    } catch { }
  }, [enableNotifications, notificationTitle, notificationBody]);

  const handleVisibilityChange = useCallback(() => {
    const state = stateRef.current;
    const isNowHidden = document.hidden;

    if (isNowHidden && !state.isHidden) {
      state.isHidden = true;
      state.lastHiddenAt = Date.now();
      
      document.title = hiddenTitle;
      onTabHidden?.();
      
      if (enableNotifications && state.lastHiddenAt) {
        showNotification();
      }
    } else if (!isNowHidden && state.isHidden) {
      const wasHidden = state.isHidden;
      state.isHidden = false;
      
      document.title = originalTitleRef.current;
      
      if (wasHidden && onTabVisible) {
        onTabVisible().catch(console.error);
      }
    }
  }, [hiddenTitle, onTabHidden, onTabVisible, enableNotifications, showNotification]);

  useEffect(() => {
    if (enableNotifications) {
      requestNotificationPermission();
    }

    document.title = originalTitleRef.current;

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.title = originalTitleRef.current;
    };
  }, [handleVisibilityChange, enableNotifications, requestNotificationPermission]);

  const setOriginalTitle = useCallback((title: string) => {
    originalTitleRef.current = title;
  }, []);

  const triggerManualRecovery = useCallback(async () => {
    if (onTabVisible) {
      await onTabVisible();
    }
  }, [onTabVisible]);

  return {
    isHidden: stateRef.current.isHidden,
    wasHidden: stateRef.current.wasHidden,
    lastHiddenAt: stateRef.current.lastHiddenAt,
    setOriginalTitle,
    triggerManualRecovery,
  };
}

export type { TabRecoveryOptions, TabRecoveryState };
