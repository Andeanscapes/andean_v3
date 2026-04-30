'use client';

import { memo, useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

interface Props {
  href: string;
  ariaLabel: string;
  /** Show after the user scrolls past this many pixels. Default: 400. */
  showAfter?: number;
  className?: string;
}

/**
 * Floating WhatsApp button (bottom-right, hidden on small screens until scrolled past hero).
 * Pure presentational + scroll listener. Renders as a plain anchor with target="_blank".
 */
function FloatingWhatsAppComponent({ href, ariaLabel, showAfter = 400, className = '' }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [showAfter]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      data-testid="floating-whatsapp"
      className={`fixed bottom-20 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 md:bottom-6 md:h-14 md:w-14 ${
        visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      } ${className}`.trim()}
    >
      <MessageCircle className="h-6 w-6 md:h-7 md:w-7" aria-hidden="true" />
    </a>
  );
}

FloatingWhatsAppComponent.displayName = 'FloatingWhatsApp';

export default memo(FloatingWhatsAppComponent);
