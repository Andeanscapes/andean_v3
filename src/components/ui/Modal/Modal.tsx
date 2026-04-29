'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button/Button';

interface ModalProps {
  open: boolean;
  title?: string;
  closeLabel?: string;
  onClose: () => void;
  children: React.ReactNode;
  contentClassName?: string;
}

export function Modal({ open, title, closeLabel = 'Close', onClose, children, contentClassName }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleOverlayScroll = (e: React.WheelEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:px-4 sm:py-6 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
      onWheel={handleOverlayScroll}
      onTouchMove={handleOverlayScroll}
    >
      <div
        className={`flex flex-col w-full h-[100dvh] sm:h-auto sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl ${contentClassName ?? 'sm:max-w-lg bg-base-100 text-base-content shadow-2xl'}`}
        onClick={handleContentClick}
      >
        {/* Sticky header */}
        <div className="shrink-0 flex items-center justify-between gap-4 px-4 pt-4 pb-3 border-b border-base-200/60">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          <Button variant="ghost" size="sm" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 min-h-0">
          <div className="px-4 pt-4 pb-8">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
