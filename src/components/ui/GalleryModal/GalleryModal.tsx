'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal/Modal';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title: string;
  subtitle?: string;
}

export function GalleryModal({ isOpen, onClose, images, title, subtitle }: GalleryModalProps) {
  const t = useTranslations();

  return (
    <Modal
      open={isOpen}
      title={title}
      closeLabel={t('experiences.ui.experienceDetails.closeGalleryLabel')}
      onClose={onClose}
      contentClassName="w-full max-w-4xl sm:rounded-2xl bg-base-100 text-base-content shadow-2xl"
    >
      {subtitle ? (
        <p className="mb-4 -mt-2 text-sm text-base-content/70">{subtitle}</p>
      ) : null}

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
    </Modal>
  );
}
