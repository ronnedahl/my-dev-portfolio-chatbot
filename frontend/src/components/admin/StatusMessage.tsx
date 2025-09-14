import React from 'react';
import { StatusMessageType } from '../../types/admin.types';

interface StatusMessageProps {
  statusMessage: StatusMessageType;
}

const getStatusBgColor = (type: StatusMessageType['type']): string => {
  switch (type) {
    case 'success': return 'bg-green-600 text-green-100';
    case 'error': return 'bg-red-600 text-red-100';
    case 'info': return 'bg-blue-600 text-blue-100';
    default: return 'hidden';
  }
};

const StatusMessage: React.FC<StatusMessageProps> = ({ statusMessage }) => {
  if (!statusMessage.text) return null;

  return (
    <div
      className={`mb-6 rounded-md p-4 text-center font-medium ${getStatusBgColor(statusMessage.type)}`}
      role="alert"
      aria-live="polite"
    >
      {statusMessage.text}
    </div>
  );
};

export default StatusMessage;