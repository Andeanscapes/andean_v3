'use client';

import { useState, useEffect } from 'react';
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import {LayoutProvider} from "@/contexts/LayoutContext";
import { useThemeContext } from "@/contexts/ThemeContext";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const variant = "transparent-V2" as const;
    const [isSticky, setIsSticky] = useState(false);
    const { theme } = useThemeContext();

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.pageYOffset > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <LayoutProvider variant={variant} isSticky={isSticky}>
            <Header />
            <main id="main-content" className="pb-24 lg:pb-30" data-theme={theme}>
                {children}
            </main>
            <Footer />
        </LayoutProvider>
    );
}

export default Layout;