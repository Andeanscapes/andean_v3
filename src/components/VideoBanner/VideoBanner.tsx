'use client'
import { Parallax } from 'react-parallax';
import VideoBannerData from '@/constant/VideoBanner'
import { useState, useCallback, memo } from 'react';
import {useTranslations} from 'next-intl';
import styles from './VideoBanner.module.css';

const VideoBanner = () => {
  const [isOpen, setOpen] = useState(false);
  const t = useTranslations('VideoBanner');

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleStopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <div className={styles.videoBanner}>
      <Parallax
        bgImage={VideoBannerData.bgImage}
        strength={-150}
        bgImageAlt='background'
        bgClassName='object-cover'
        className={`${styles.parallaxBg} relative overflow-hidden`}
      >
        {isOpen && (
          <div
            className={styles.modalOverlay}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
          >
            <div
              className={styles.modalContent}
              onClick={handleStopPropagation}
            >
              <button
                className={styles.closeButton}
                onClick={handleClose}
                aria-label={t('closeAria')}
              >
                {t('close')}
              </button>

              <div className="aspect-video w-full">
                <iframe
                  className={styles.videoFrame}
                  src="https://www.youtube-nocookie.com/embed/6ou7rodBJ1g?rel=0"
                  title={t('videoTitle')}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        <div className="container relative z-2 lg:py-40 py-30">
          <div className="max-w-[560px] mx-auto text-center text-white">
            <h2 className="lg:text-4xl text-2xl font-bold leading-1_3">{t('title')}</h2>
            <p className="lg:text-2md text-md font-medium leading-1_5 mt-4">
              {t('description')}
            </p>
            <button
              onClick={handleOpen}
              className="mt-8 inline-flex relative lg:h-20 lg:w-20 h-16 w-16 justify-center items-center rounded-full bg-primary-1 before:content-[''] before:absolute before:-inset-3 before:border-primary-1 before:border-2 before:rounded-full before:animate-pulse"
              aria-label={t('playAria')}
            >
              <img src="/assets/images/icons/video-circle.svg" alt={t('playAlt')} />
            </button>
          </div>
        </div>
      </Parallax>
    </div>
  );
}

export default memo(VideoBanner);
