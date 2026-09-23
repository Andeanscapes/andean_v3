'use client';

import { useState, useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import {LayoutProvider} from "@/contexts/LayoutContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import { FOOTER_TRUST_GALLERY } from "@/constant/SiteConfig";
import { resolveMediaUrl } from "@/utils/mediaUrl";

// Resolved once at module scope: `resolveMediaUrl` only reads a build-inlined
// env var, so the result is constant for the life of the bundle and does not
// need to be recomputed — or memoized — per render.
const FOOTER_TRUST_GALLERY_URLS = FOOTER_TRUST_GALLERY.map(resolveMediaUrl);

const Layout = ({ children }: { children: React.ReactNode }) => {
    const variant = "transparent-V2" as const;
    const [isSticky, setIsSticky] = useState(false);
    const { theme } = useThemeContext();
    const pathname = usePathname();
    
    const isExperiencesPage = pathname?.includes('/experiences/');
    const mainPaddingClass = isExperiencesPage ? 'pb-0' : 'pb-24 lg:pb-30';

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.pageYOffset > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <LayoutProvider variant={variant} isSticky={isSticky}>
            <Header hideBookingCta={isExperiencesPage} />
            <main className={`${mainPaddingClass} bg-base-100 text-base-content`} data-theme={theme}>
                {children}
            </main>
            <Footer trustGallery={FOOTER_TRUST_GALLERY_URLS} />
        </LayoutProvider>
    );
}

export default Layout;
