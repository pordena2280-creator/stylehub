import { useEffect, useState } from 'react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const icons: Record<ToastType, string> = {
  success: 'fa-solid fa-circle-check',
  error:   'fa-solid fa-circle-xmark',
  info:    'fa-solid fa-circle-info',
  warning: 'fa-solid fa-triangle-exclamation',
};

export const Toast = ({ toast, onRemove }: ToastProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration ?? 3500);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div className={`toast toast-${toast.type} ${visible ? 'visible' : ''}`}>
      <i className={icons[toast.type]}></i>
      <span>{toast.message}</span>
      <button className="toast-close" onClick={() => onRemove(toast.id)}>
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};
