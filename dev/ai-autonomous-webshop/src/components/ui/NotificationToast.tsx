import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../notifications/notificationStore';
import { Bell, CheckCircle, Info, AlertCircle } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="glass p-4 rounded-2xl shadow-2xl flex items-start gap-4 min-w-[320px] border-l-4 border-blue-500"
          >
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-400">{n.type.replace('_', ' ')}</h4>
              <p className="text-gray-300 mt-1">{n.message}</p>
            </div>
            <button onClick={() => removeNotification(n.id)} className="text-gray-600 hover:text-white">
              <CheckCircle size={18} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
