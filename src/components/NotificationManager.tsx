import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { NotificationToast } from './NotificationToast';

export function NotificationManager() {
  const { state, removeNotification } = useAdmin();

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {state.notifications.slice(-5).map((notification, index) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
          index={index}
        />
      ))}
    </div>
  );
}