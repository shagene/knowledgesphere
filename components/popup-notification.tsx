import React, { useState, useEffect } from 'react';

interface PopupNotificationProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
}

export const PopupNotification: React.FC<PopupNotificationProps> = ({ message, type, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50`}>
      {message}
    </div>
  );
};