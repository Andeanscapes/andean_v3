'use client';

import { useState, useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import {LayoutProvider} from "@/contexts/LayoutContext";
import dynamic from 'next/dynamic';

// Browser-only (reads navigator.languages); kept out of the server HTML and the initial bundle.
const LocaleSuggestion = dynamic(() => import('@/components/LocaleSuggestion/LocaleSuggestion'), { ssr: false });

interface PublicLayoutShellProps {
    children: React.ReactNode;
    flagshipExperiencePath: string;
}

/**
 * Bottom padding reserved below `<main>`.
 * `usePathname` from `@/i18n/navigation` is locale-free, so `/` matches every locale.
 */
function getMainPaddingClass(pathname: string | null): string {
    if (pathname?.includes('/experiences/') || pathname === '/') return 'pb-0';
    return 'pb-24 lg:pb-30';
}

/**
 * Space after the footer for routes with a fixed bottom bar. Padding on <main>
 * cannot do this: the footer renders after <main>, so its last lines sat under
 * the bar. Heights match each bar plus the home-indicator inset; same breakpoint
 * as the bar it reserves room for.
 */
function getBottomBarSpacerClass(pathname: string | null): string | null {
    if (pathname === '/') return 'h-[calc(4.5rem+env(safe-area-inset-bottom))] md:hidden';
    if (pathname && /^\/experiences\/[^/]+$/.test(pathname)) {
        return 'h-[calc(5rem+env(safe-area-inset-bottom))] lg:hidden';
    }
    // Booking dock: summary row + 48px CTA.
    if (pathname && /^\/experiences\/[^/]+\/booking$/.test(pathname)) {
        return 'h-[calc(9rem+env(safe-area-inset-bottom))] lg:hidden';
    }
    return null;
}

const PublicLayoutShell = ({ children, flagshipExperiencePath }: PublicLayoutShellProps) => {
    const variant = "transparent-V2" as const;
    const [isSticky, setIsSticky] = useState(false);
    const pathname = usePathname();
    
    const isExperiencesPage = pathname?.includes('/experiences/');
    const mainPaddingClass = getMainPaddingClass(pathname);
    const bottomBarSpacerClass = getBottomBarSpacerClass(pathname);

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
            {/* No data-theme here: <html> carries it (set before paint), and a server-rendered
                value would always be 'dark' and override the visitor's light theme. */}
            <main className={`${mainPaddingClass} bg-base-100 text-base-content`}>
                {children}
            </main>
            <Footer flagshipExperiencePath={flagshipExperiencePath} />
            <LocaleSuggestion />
            {bottomBarSpacerClass ? <div aria-hidden="true" className={bottomBarSpacerClass} /> : null}
        </LayoutProvider>
    );
}

export default PublicLayoutShell;
