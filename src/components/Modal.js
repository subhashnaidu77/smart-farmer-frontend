import React, { useEffect, useRef } from "react";
import { FiCheckCircle, FiXCircle, FiInfo } from "react-icons/fi";
import "./Modal.css";

const ICONS = {
  success: <FiCheckCircle aria-hidden="true" />,
  error: <FiXCircle aria-hidden="true" />,
  info: <FiInfo aria-hidden="true" />,
};

export default function Modal({
  show,
  type = "info",              // 'success' | 'error' | 'info'
  title,                       // optional string
  message,
  primaryActionLabel = "OK",
  onPrimaryAction,
  secondaryActionLabel,        // optional string
  onSecondaryAction,           // optional fn
  onClose,                     // fallback close
  closeOnBackdrop = true,
  closeOnEsc = true,
}) {
  const backdropRef = useRef(null);
  const primaryBtnRef = useRef(null);

  useEffect(() => {
    if (!show) return;

    // Focus primary button on open for accessibility
    const t = setTimeout(() => {
      primaryBtnRef.current?.focus();
    }, 10);

    // Close on Esc
    function handleKey(e) {
      if (closeOnEsc && e.key === "Escape") {
        onClose?.();
      }
    }
    document.addEventListener("keydown", handleKey);

    // Prevent body scroll behind modal
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [show, closeOnEsc, onClose]);

  if (!show) return null;

  const handleBackdrop = (e) => {
    if (closeOnBackdrop && e.target === backdropRef.current) {
      onClose?.();
    }
  };

  const icon = ICONS[type] ?? ICONS.info;
  const safeTitle = title ?? (type.charAt(0).toUpperCase() + type.slice(1));

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop"
      onMouseDown={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
    >
      <div className="modal-content card" role="document">
        <div className={`modal-icon ${type}`}>{icon}</div>
        <h3 id="modal-title" className="modal-title">{safeTitle}</h3>
        <p id="modal-desc" className="modal-message">{message}</p>

        <div className="modal-actions">
          {secondaryActionLabel && onSecondaryAction && (
            <button className="btn btn-ghost" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </button>
          )}

          <button
            ref={primaryBtnRef}
            className="btn btn-primary"
            onClick={onPrimaryAction || onClose}
            autoFocus
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
