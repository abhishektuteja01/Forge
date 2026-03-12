"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Render modal into a portal attached to document.body
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop overlay */}
      <div
        className="animate-in fade-in fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className="border-border animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 relative flex max-h-[90vh] w-full max-w-lg min-w-[320px] flex-col rounded-t-3xl border bg-white shadow-xl duration-300 sm:w-auto sm:rounded-2xl"
      >
        {/* Header */}
        <div className="border-border sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b bg-white px-6 py-4 sm:rounded-t-2xl">
          {title && (
            <h2
              id="modal-title"
              className="font-display text-lg font-bold tracking-tight text-gray-900"
            >
              {title}
            </h2>
          )}

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="-mr-2 ml-auto rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content (scrollable if too long) */}
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};
