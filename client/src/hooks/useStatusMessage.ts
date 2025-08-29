import { useState, useEffect } from 'react';
import { StatusMessageType } from '../types/admin.types';

interface UseStatusMessageReturn {
  statusMessage: StatusMessageType;
  setStatusMessage: (message: StatusMessageType) => void;
  clearStatusMessage: () => void;
}

export const useStatusMessage = (autoClearDelay: number = 5000): UseStatusMessageReturn => {
  const [statusMessage, setStatusMessage] = useState<StatusMessageType>({ text: '', type: '' });

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (statusMessage.text && statusMessage.type !== 'success') {
      timer = setTimeout(() => {
        setStatusMessage({ text: '', type: '' });
      }, autoClearDelay);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [statusMessage, autoClearDelay]);

  const clearStatusMessage = () => {
    setStatusMessage({ text: '', type: '' });
  };

  return {
    statusMessage,
    setStatusMessage,
    clearStatusMessage
  };
};