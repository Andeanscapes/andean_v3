'use client';

import { useState, useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import {LayoutProvider} from "@/contexts/LayoutContext";
import { useThemeContext } from "@/contexts/ThemeContext";

interface PublicLayoutShellProps {
    children: React.ReactNode;
    flagshipExperiencePath: string;
}

const PublicLayoutShell = ({ children, flagshipExperiencePath }: PublicLayoutShellProps) => {
    const variant = "transparent-V2" as const;
    const [isSticky, setIsSticky] = useState(false);
    const { theme } = useThemeContext();
    const pathname = usePathname();
    
    const isExperiencesPage = pathname?.includes('/experiences/');
    // Landing reserves space only for its mobile sticky bar (md:hidden); desktop flows straight into the footer.
    const isLandingPage = pathname === '/';
    const mainPaddingClass = isExperiencesPage ? 'pb-0' : isLandingPage ? 'pb-24 md:pb-0' : 'pb-24 lg:pb-30';

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
            <Footer flagshipExperiencePath={flagshipExperiencePath} />
        </LayoutProvider>
    );
}

export default PublicLayoutShell;
