import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Toast, type ToastMessage, type ToastType } from './Toast';
import './ToastContainer.css';

interface ToastContextType {
  success: (msg: string, duration?: number) => void;
  error:   (msg: string, duration?: number) => void;
  info:    (msg: string, duration?: number) => void;
  warning: (msg: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const add = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message, duration }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{
      success: (m, d) => add('success', m, d),
      error:   (m, d) => add('error',   m, d),
      info:    (m, d) => add('info',    m, d),
      warning: (m, d) => add('warning', m, d),
    }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => <Toast key={t.id} toast={t} onRemove={remove} />)}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};
