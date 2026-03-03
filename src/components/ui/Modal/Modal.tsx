'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button/Button';

interface ModalProps {
  open: boolean;
  title?: string;
  closeLabel?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, title, closeLabel = 'Close', onClose, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div 
        className="w-full max-w-lg rounded-2xl bg-base-100 p-4 text-base-content shadow-2xl"
        onClick={handleContentClick}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          <Button variant="ghost" size="sm" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
