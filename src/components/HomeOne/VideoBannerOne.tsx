// ... existing code ...
'use client'
import { Parallax } from 'react-parallax';
import BannerData from '@/constant/common/BannerData'
import { useState } from 'react';

// REMOVE:
// import 'node_modules/react-modal-video/css/modal-video.css';
// import ModalVideo from 'react-modal-video';

const VideoBanner = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Parallax
        bgImage={BannerData.bgImage}
        strength={-150}
        bgImageAlt='background'
        bgClassName='object-cover'
        className="relative overflow-hidden"
      >
        {/* REPLACE ModalVideo with a lightweight modal */}
        {isOpen && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute right-3 top-3 z-10 rounded-md bg-white/10 px-3 py-1 text-white hover:bg-white/20"
                onClick={() => setOpen(false)}
                aria-label="Close video"
              >
                Close
              </button>

              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube-nocookie.com/embed/6ou7rodBJ1g?rel=0"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        <div className="container relative z-2 lg:py-40 py-30">
          <div className="max-w-[560px] mx-auto text-center text-white">
            <h2 className="lg:text-4xl text-2xl font-bold leading-1.3">{BannerData.title}</h2>
            <p className="lg:text-2md text-md font-medium leading-1.5 mt-4">
              {BannerData.disc_text}
            </p>
            <button
              onClick={() => setOpen(true)}
              className="mt-8 inline-flex relative lg:h-20 lg:w-20 h-16 w-16 justify-center items-center rounded-full bg-primary-1 before:content-[''] before:absolute before:-inset-3 before:border-primary-1 before:border-2 before:rounded-full before:animate-pulse"
            >
              {/* also fix path: use absolute from /public */}
              <img src="/assets/images/icons/video-circle.svg" alt="Play video" />
            </button>
          </div>
        </div>
      </Parallax>
    </>
  );
}

export default VideoBanner;
// ... existing code ...