import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useCatalogStore } from '../features/catalog/hooks/useCatalog';
import { useNotificationStore } from '../lib/notifications/notificationStore';

export const VoiceController: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const { searchProducts } = useCatalogStore();
  const { addNotification } = useNotificationStore();

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addNotification({ type: 'ERROR', message: 'Speech recognition not supported in this browser.' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('Voice Command:', transcript);

      if (transcript.includes('search for')) {
        const query = transcript.replace('search for', '').trim();
        searchProducts(query);
        addNotification({ type: 'VOICE_COMMAND', message: `Searching for: ${query}` });
      } else if (transcript.includes('go to admin')) {
         // Logic to switch view
         addNotification({ type: 'VOICE_COMMAND', message: 'Navigating to Admin Dashboard' });
      } else {
        addNotification({ type: 'VOICE_COMMAND', message: `Command not recognized: ${transcript}` });
      }
    };

    recognition.start();
  };

  return (
    <button
      onClick={startListening}
      className={`p-3 rounded-full transition-all ${
        isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-500'
      } text-white shadow-lg`}
      title="Voice Control"
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
};
