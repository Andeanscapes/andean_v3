'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button/Button';

const openDialogs: HTMLElement[] = [];
const originalInert = new Map<globalThis.Element, string | null>();
let originalOverflow: { body: string; root: string } | undefined;

function syncDialogIsolation() {
  const topDialog = openDialogs.at(-1);
  for (const [element, value] of Array.from(originalInert)) {
    if (value === null) element.removeAttribute('inert');
    else element.setAttribute('inert', value);
  }

  if (!topDialog) {
    originalInert.clear();
    return;
  }

  for (const element of Array.from(document.body.children)) {
    if (!originalInert.has(element)) originalInert.set(element, element.getAttribute('inert'));
    if (element === topDialog) element.removeAttribute('inert');
    else element.setAttribute('inert', '');
  }
}

function getFocusableElements(dialog: HTMLElement): HTMLElement[] {
  const selector = 'a[href], button, input, select, textarea, [tabindex]';
  return Array.from(dialog.querySelectorAll<HTMLElement>(selector)).filter((element) => {
    if (element.tabIndex < 0 || element.matches(':disabled') || element.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
    for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
      const style = window.getComputedStyle(ancestor);
      if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return false;
      if (ancestor === dialog) break;
    }
    return true;
  });
}

interface ModalProps {
  open: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
  contentClassName?: string;
}

export function Modal({ open, title, closeLabel, onClose, children, contentClassName }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !mounted) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (openDialogs.length === 0) {
      originalOverflow = { body: document.body.style.overflow, root: document.documentElement.style.overflow };
    }
    openDialogs.push(dialog);
    syncDialogIsolation();
    const observer = new window.MutationObserver(syncDialogIsolation);
    observer.observe(document.body, { childList: true });

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    getFocusableElements(dialog)[0]?.focus();

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (openDialogs.at(-1) !== dialog) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;
      const focusable = getFocusableElements(dialog);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (!focusable.includes(document.activeElement as HTMLElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown);
      const wasTop = openDialogs.at(-1) === dialog;
      openDialogs.splice(openDialogs.indexOf(dialog), 1);
      syncDialogIsolation();
      if (openDialogs.length === 0 && originalOverflow) {
        document.body.style.overflow = originalOverflow.body;
        document.documentElement.style.overflow = originalOverflow.root;
        originalOverflow = undefined;
      }
      if (wasTop && previousFocus?.isConnected && !previousFocus.closest('[inert]')) previousFocus.focus();
    };
  }, [open, mounted]);

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
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
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
          <h3 id={titleId} className="text-lg font-semibold">{title}</h3>
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
