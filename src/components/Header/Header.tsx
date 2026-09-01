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
import {BOOKING_LINKS, MOBILE_MENU_CHIPS, SITE_INFO} from "@/constant/SiteConfig";
import { whatsappUrl } from '@/utils/whatsapp';
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
    const tm = useTranslations('MobileMenu');

    const isDarkThemeVariant =
        variant === 'black' || variant === 'transparent' || variant === 'transparent-V2';

    const navTextColorClass =
        isSticky && theme === 'light'
            ? 'text-slate-900'
            : isDarkThemeVariant
                ? 'text-slate-300'
                : 'text-slate-900';

    const navInteractiveClass = 'hover:text-primary-1 transition-colors duration-200';

    const mobileMenuTextColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-900';

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
        if (isSticky && theme === 'light') return SITE_INFO.logoWhite;
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
                            className="btn btn-sm border-0 bg-primary text-primary-content font-extrabold shadow-[0_0_20px_rgba(0,240,143,0.24)] transition-all duration-200 hover:bg-primary/90 hover:brightness-105 active:scale-[0.98] active:brightness-95"
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
                    aria-label={isMobileMenuOpen ? tm('closeMenu') : tm('openMenu')}
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-header-menu"
                    className={`relative inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-200 ${navTextColorClass} hover:text-primary-1`}
                >
                    <span className="sr-only">{isMobileMenuOpen ? tm('closeMenu') : tm('openMenu')}</span>
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
                        className={`xl:hidden fixed top-0 right-0 z-[52] h-svh w-[88%] max-w-[360px] shadow-xl backdrop-blur-md transition-transform duration-300 ease-out overflow-y-auto ${
                            theme === 'dark'
                                ? 'border-l border-white/10 bg-slate-950/96'
                                : 'border-l border-black/10 bg-white/96'
                        } ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                        role="dialog"
                        aria-modal="true"
                        aria-label={tm('dialogLabel')}
                    >
                        <div className={`flex items-start justify-between p-5 pb-3 ${theme === 'dark' ? 'border-b border-white/[0.08]' : 'border-b border-black/5'}`}>
                            <div className="flex items-start gap-3 min-w-0">
                                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="shrink-0">
                                    <Image
                                        alt='logo'
                                        width={150}
                                        height={150}
                                        sizes="40px"
                                        className="h-10 w-10 object-contain"
                                        src={logoSrc}
                                    />
                                </Link>
                                <p className={`text-[11px] leading-tight font-medium max-w-[160px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {tm('brandLine')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(false)}
                                aria-label={tm('closeMenu')}
                                className={`shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-200 ${mobileMenuTextColorClass} hover:text-primary-1`}
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>

                        {!hideBookingCta && (
                            <div className={`px-5 pt-4 pb-3 ${theme === 'dark' ? 'border-b border-white/[0.08]' : 'border-b border-black/5'}`}>
                                <div className="flex flex-col gap-2.5">
                                    <Link
                                        href="/experiences"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="btn btn-md w-full border-0 bg-primary text-primary-content font-extrabold shadow-[0_0_20px_rgba(0,240,143,0.24)] transition-all duration-200 hover:bg-primary/90 hover:brightness-105 active:scale-[0.98] active:brightness-95"
                                    >
                                        {tm('exploreExperiences')}
                                    </Link>
                                    <a
                                        href={whatsappUrl(tm('whatsappMessage'))}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`btn btn-md btn-outline w-full ${theme === 'dark' ? 'border-white/20 text-slate-300 hover:border-white/35 hover:bg-white/5' : 'border-black/15 text-slate-700 hover:border-black/25 hover:bg-black/3'}`}
                                    >
                                        {tm('planOnWhatsApp')}
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className={`px-5 pt-4 pb-3 ${theme === 'dark' ? 'border-b border-white/[0.08]' : 'border-b border-black/5'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2.5">
                                {tm('sectionNavigate')}
                            </p>
                            <nav className="flex flex-col gap-0.5" aria-label={tm('sectionNavigate')}>
                                <Link
                                    href="/experiences"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center h-11 px-3 -mx-3 rounded-lg text-sm font-semibold transition-colors duration-200 ${mobileMenuTextColorClass} hover:bg-primary/10 hover:text-primary`}
                                >
                                    {t('experiences')}
                                </Link>
                                <Link
                                    href="/#landing-howitworks-title"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center h-11 px-3 -mx-3 rounded-lg text-sm font-semibold transition-colors duration-200 ${mobileMenuTextColorClass} hover:bg-primary/10 hover:text-primary`}
                                >
                                    {tm('nav.howItWorks')}
                                </Link>
                                <Link
                                    href="/#landing-reviews"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center h-11 px-3 -mx-3 rounded-lg text-sm font-semibold transition-colors duration-200 ${mobileMenuTextColorClass} hover:bg-primary/10 hover:text-primary`}
                                >
                                    {tm('nav.reviews')}
                                </Link>
                                <Link
                                    href="/#landing-faqs"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center h-11 px-3 -mx-3 rounded-lg text-sm font-semibold transition-colors duration-200 ${mobileMenuTextColorClass} hover:bg-primary/10 hover:text-primary`}
                                >
                                    {tm('nav.faq')}
                                </Link>
                            </nav>
                        </div>

                        <div className={`px-5 pt-4 pb-3 ${theme === 'dark' ? 'border-b border-white/[0.08]' : 'border-b border-black/5'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2.5">
                                {tm('sectionQuickExplore')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {MOBILE_MENU_CHIPS.map((chip) => (
                                    <Link
                                        key={chip.id}
                                        href={chip.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`btn btn-sm rounded-full transition-all duration-200 ${
                                            theme === 'dark'
                                                ? 'border-white/15 bg-white/5 text-slate-300 hover:border-primary/40 hover:bg-primary/10 hover:text-primary'
                                                : 'border-black/10 bg-black/3 text-slate-600 hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
                                        }`}
                                    >
                                        {tm(chip.i18nKey as Parameters<typeof tm>[0])}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className={`px-5 pt-3 pb-3 ${theme === 'dark' ? 'border-b border-white/[0.08]' : 'border-b border-black/5'}`}>
                            <p className={`text-[11px] leading-relaxed ${theme === 'dark' ? 'text-slate-500/80' : 'text-slate-500'}`}>
                                {tm('trustMicroCopy')}
                            </p>
                        </div>

                        <div className="px-5 pt-4 pb-6 flex items-center justify-between">
                            <ThemeToggle colorOverride={theme === 'dark' ? 'text-slate-300' : 'text-slate-900'} />
                            <LanguageSelector colorOverride={theme === 'dark' ? 'text-slate-300' : 'text-slate-900'} />
                        </div>
                    </aside>
                </>,
                document.body
            )}
        </>
    );
}

export default Header;
