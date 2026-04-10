'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title: string;
  subtitle?: string;
}

export function GalleryModal({ isOpen, onClose, images, title, subtitle }: GalleryModalProps) {
  const t = useTranslations();

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal modal-open bg-black/65 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-box max-w-4xl bg-base-300/90 backdrop-blur-xl">
        <h3 className="text-lg font-bold text-base-content">{title}</h3>

        {subtitle ? (
          <p className="mb-4 mt-1 text-sm text-base-content/70">{subtitle}</p>
        ) : null}

        <div className="max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="aspect-[4/3] overflow-hidden rounded-xl border border-base-200/40"
              >
                <img
                  src={image}
                  alt={`${title} ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="modal-action mt-4">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
          >
            {t('experiences.ui.experienceDetails.closeGalleryLabel')}
          </button>
        </div>
      </div>

      <button
        type="button"
        className="modal-backdrop bg-black/60 backdrop-blur-[2px]"
        aria-label={t('experiences.ui.experienceDetails.closeGalleryLabel')}
        onClick={onClose}
      />
    </div>
  );
}
