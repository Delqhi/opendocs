import { useEffect } from 'react';
import { useAuthStore } from '../../features/auth/hooks/useAuth';
import { useNotificationStore } from './notificationStore';

export const useWebSocket = () => {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(`ws://localhost:8080/ws?user_id=${user.id}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      addNotification({
        type: data.type,
        message: data.message,
        data: data.data,
      });
    };

    ws.onopen = () => console.log('WS Connected');
    ws.onclose = () => console.log('WS Disconnected');

    return () => ws.close();
  }, [user, addNotification]);
};
