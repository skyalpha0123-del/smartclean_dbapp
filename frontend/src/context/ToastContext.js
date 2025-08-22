import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Load persistent toasts from localStorage on mount
  useEffect(() => {
    const persistentToasts = localStorage.getItem('persistentToasts');
    if (persistentToasts) {
      try {
        const parsedToasts = JSON.parse(persistentToasts);
        setToasts(parsedToasts);
        
        // Clear from localStorage after loading
        localStorage.removeItem('persistentToasts');
        
        // Set up auto-removal for each persistent toast
        parsedToasts.forEach(toast => {
          const remainingTime = toast.expiresAt - Date.now();
          if (remainingTime > 0) {
            setTimeout(() => {
              removeToast(toast.id);
            }, remainingTime);
          } else {
            // Remove expired toasts immediately
            removeToast(toast.id);
          }
        });
      } catch (error) {
        console.error('Error parsing persistent toasts:', error);
        localStorage.removeItem('persistentToasts');
      }
    }
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 5000, persistent = false) => {
    const id = Date.now() + Math.random();
    const expiresAt = Date.now() + duration;
    const newToast = { id, message, type, duration, expiresAt, persistent };
    
    setToasts(prev => [...prev, newToast]);
    
    // If persistent, save to localStorage
    if (persistent) {
      const persistentToasts = JSON.stringify([newToast]);
      localStorage.setItem('persistentToasts', persistentToasts);
    }
    
    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message, duration) => {
    addToast(message, 'error', duration);
  }, [addToast]);

  const showInfo = useCallback((message, duration) => {
    addToast(message, 'info', duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration) => {
    addToast(message, 'warning', duration);
  }, [addToast]);

  const showPersistentSuccess = useCallback((message, duration = 5000) => {
    addToast(message, 'success', duration, true);
  }, [addToast]);

  const showPersistentError = useCallback((message, duration = 5000) => {
    addToast(message, 'error', duration, true);
  }, [addToast]);

  const showPersistentInfo = useCallback((message, duration = 5000) => {
    addToast(message, 'info', duration, true);
  }, [addToast]);

  const value = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showPersistentSuccess,
    showPersistentError,
    showPersistentInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
