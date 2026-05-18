import React, { useEffect, useRef } from 'react';
import './Modal.css';

/**
 * Accessible modal:
 * - role="dialog" + aria-modal + aria-labelledby
 * - ESC closes
 * - Focus moves into the modal on open and is trapped via Tab/Shift+Tab
 * - Body scroll is locked while open
 * - Returns focus to the previously focused element on close
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll(FOCUSABLE);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    /* Focus first focusable inside the modal */
    setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const first = panel.querySelector(FOCUSABLE);
      (first || panel).focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = `modal-${size}`;
  const titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={panelRef}
        className={`modal-panel ${sizeClass}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            type="button"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
