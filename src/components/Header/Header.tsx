'use client'

import Image from "next/image";
import {Link, usePathname} from "@/i18n/navigation";
import {useEffect, useMemo, useState} from "react";
import {createPortal} from "react-dom";
import {useTranslations} from 'next-intl';
import {X} from 'lucide-react';
import LanguageSelector from "@/components/LanguageSelector/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import {useLayoutContext} from "@/contexts/LayoutContext";
import {useThemeContext} from "@/contexts/ThemeContext";
import {BOOKING_LINKS, SITE_INFO} from "@/constant/SiteConfig";
import styles from "./Header.module.css";

interface HeaderProps {
    hideBookingCta?: boolean;
}

const Header = ({ hideBookingCta = false }: HeaderProps = {}) => {
    const {variant, isSticky} = useLayoutContext();
    const {theme} = useThemeContext();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const t = useTranslations('Header');

    const isDarkThemeVariant =
        variant === 'black' || variant === 'transparent' || variant === 'transparent-V2';

    const navTextColorClass =
        isSticky && theme === 'light'
            ? 'text-gray-900'
            : isDarkThemeVariant
                ? 'text-white'
                : 'text-gray-900';

    const navInteractiveClass = 'hover:text-primary-1 transition-colors duration-200';

    const mobileMenuTextColorClass = theme === 'dark' ? 'text-white' : 'text-gray-900';

    const headerClassName = useMemo(() => {
        return `${styles.headerStyle}
           ${isSticky ? styles.sticky : ''} 
            ${isMobileMenuOpen ? styles.menuOpen : ''}
           ${variant === "transparent" ? styles.variantThree : ""}
           ${variant === "transparent-V2" ? styles.variantTwo : ""}
           ${variant === "black" ? styles.variantFour : ""}
           `;
        }, [variant, isSticky, isMobileMenuOpen]);

    const logoSrc = useMemo(() => {
        // Sticky + light mode: header becomes white bg → use logoWhite (dark letters)
        if (isSticky && theme === 'light') return SITE_INFO.logoWhite;
        // All other cases: transparent/dark header → use logo (white letters)
        return SITE_INFO.logo;
    }, [theme, isSticky]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        if (!isMobileMenuOpen || typeof window === 'undefined') {
            return;
        }

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isMobileMenuOpen]);

    return (
        <>
        <header 
        data-theme={theme}
        className={headerClassName}>
            <div className="desktop-menu max-w-[1570px] mx-auto h-16 justify-between items-center xl:flex hidden">

                <div className="main-menu flex items-center ">
                    <Link href="/" className="shrink-0">
                        <Image
                            alt='logo'
                            width={150}
                            height={150}
                            sizes="48px"
                            className="h-[48px] w-[48px] object-contain"
                            src={logoSrc}
                            priority
                        />
                    </Link>
                    <div className="main-menu uppercase ml-4">
                        <ul className={`flex items-center ${styles.navList}`}>
                            <li>
                                <Link href="/experiences" className={`${styles.navLink} ${navTextColorClass} ${navInteractiveClass}`}>
                                    {t('experiences')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {!hideBookingCta && (
                        <Link 
                            href={BOOKING_LINKS.airbnb} 
                            className="btn btn-primary btn-sm text-sm font-medium font-sans"
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            {t('bookNow')}
                        </Link>
                    )}
                    <ThemeToggle />
                    <LanguageSelector />
                </div>
            </div>

            <div className={`${styles.mobileBar}`}>
                <Link href="/" className="shrink-0 max-w-[42px]">
                    <Image
                        alt='logo'
                        width={150}
                        height={150}
                        sizes="42px"
                        className="h-[42px] w-[42px] object-contain"
                        src={logoSrc}
                    />
                </Link>
                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                    aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-header-menu"
                    className={`relative inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-200 ${navTextColorClass} hover:text-primary-1`}
                >
                    <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
                    <span
                        className={`absolute h-[2px] w-5 bg-current transition-transform duration-200 ${
                            isMobileMenuOpen ? 'translate-y-0 rotate-45' : '-translate-y-[6px]'
                        }`}
                    />
                    <span
                        className={`absolute h-[2px] w-5 bg-current transition-opacity duration-200 ${
                            isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                        }`}
                    />
                    <span
                        className={`absolute h-[2px] w-5 bg-current transition-transform duration-200 ${
                            isMobileMenuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-[6px]'
                        }`}
                    />
                </button>
            </div>

        </header>

            {isMounted && createPortal(
                <>
                    <div
                        className={`xl:hidden fixed inset-0 z-[51] bg-black/35 backdrop-blur-[1px] transition-opacity duration-200 ${
                            isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-hidden="true"
                    />

                    <aside
                        id="mobile-header-menu"
                        data-theme={theme}
                        className={`xl:hidden fixed top-0 right-0 z-[52] h-svh w-[88%] max-w-[360px] p-5 shadow-xl transition-transform duration-300 ease-out ${
                            theme === 'dark' ? 'bg-dark-1' : 'bg-white'
                        } ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Mobile navigation"
                    >
                        <div className="flex items-center justify-between border-b border-stock-1 pb-4">
                            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="shrink-0 max-w-[42px]">
                                <Image
                                    alt='logo'
                                    width={150}
                                    height={150}
                                    sizes="42px"
                                    className="h-[42px] w-[42px] object-contain"
                                    src={logoSrc}
                                />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(false)}
                                aria-label="Close menu"
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-200 ${mobileMenuTextColorClass} hover:text-primary-1`}
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>

                        <nav className="mt-5 flex flex-col gap-3" aria-label="Mobile main navigation">
                            <Link
                                href="/experiences"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`text-sm font-semibold uppercase tracking-wide ${mobileMenuTextColorClass} ${navInteractiveClass}`}
                            >
                                {t('experiences')}
                            </Link>

                            {!hideBookingCta && (
                                <Link
                                    href={BOOKING_LINKS.airbnb}
                                    className="btn btn-primary btn-sm w-full text-sm font-medium font-sans"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t('bookNow')}
                                </Link>
                            )}
                        </nav>

                        <div className="mt-5 flex items-center gap-3 border-t border-stock-1 pt-4">
                            <ThemeToggle colorOverride={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
                            <LanguageSelector colorOverride={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
                        </div>
                    </aside>
                </>,
                document.body
            )}
        </>
    );
}

export default Header;
