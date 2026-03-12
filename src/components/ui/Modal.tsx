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
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className="relative flex max-h-[90vh] w-full min-w-[320px] max-w-lg flex-col rounded-t-[2.5rem] border border-black/[0.03] bg-white shadow-premium duration-500 animate-in slide-in-from-bottom-12 sm:w-auto sm:rounded-[2.5rem] sm:slide-in-from-bottom-8"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[2.5rem] border-b border-slate-50 bg-white px-8 py-6 sm:rounded-t-[2.5rem]">
          {title && (
            <h2
              id="modal-title"
              className="font-display text-2xl font-black tracking-tight text-slate-900"
            >
              {title}
            </h2>
          )}

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="group absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 transition-all hover:bg-slate-100"
          >
            <X className="h-5 w-5 text-slate-400 transition-colors group-hover:text-slate-900" />
          </button>
        </div>

        {/* Content (scrollable if too long) */}
        <div className="overflow-y-auto p-8">{children}</div>
      </div>
    </div>,
    document.body
  );
};
