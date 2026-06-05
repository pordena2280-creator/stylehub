import { useEffect, type ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}

export const Modal = ({ open, onClose, title, children, size = 'md', footer }: ModalProps) => {
  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-box modal-${size}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
