import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle, Bell } from 'lucide-react';
import type { Notification } from '../context/AdminContext';

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
  index: number;
}

export function NotificationToast({ notification, onClose, index }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100 + index * 100);
    
    // Auto dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [index]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-300';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-300';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-pink-500 border-red-300';
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-300';
    }
  };

  return (
    <div
      className={`fixed right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      }`}
      style={{ 
        top: `${80 + index * 90}px`,
        zIndex: 9999 - index 
      }}
    >
      <div className={`${getBackgroundColor()} text-white rounded-2xl shadow-2xl border-2 backdrop-blur-sm overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 bg-white/20 p-2 rounded-full">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-white truncate">
                  {notification.title}
                </h4>
                <button
                  onClick={handleClose}
                  className="flex-shrink-0 ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              <p className="text-sm text-white/90 mb-2 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center justify-between text-xs text-white/70">
                <span className="bg-white/20 px-2 py-1 rounded-full">
                  {notification.section}
                </span>
                <span>
                  {new Date(notification.timestamp).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <div 
            className="h-full bg-white/40 animate-[shrink_5s_linear_forwards]"
            style={{
              animation: 'shrink 5s linear forwards'
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(style);