import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ open, title, onClose, children, footer = null, wide = false }) {
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose?.();
    }
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-panel ${wide ? 'modal-panel--wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          {onClose && (
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
