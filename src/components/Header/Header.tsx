'use client'

import Image from "next/image";
import Link from "next/link";
import {memo, useCallback, useMemo} from "react";
import {useTranslations} from 'next-intl';
import LanguageSelector from "@/components/LanguageSelector/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import {useLayoutContext} from "@/contexts/LayoutContext";
import {useThemeContext} from "@/contexts/ThemeContext";
import {BOOKING_LINKS, SITE_INFO} from "@/constant/SiteConfig";
import {trackLandingActionToBook, trackMetaCustomEvent} from "@/lib/meta-pixel";
import styles from "./Header.module.css";

const Header = () => {
    const {variant, isSticky} = useLayoutContext();
    const {theme} = useThemeContext();
    const t = useTranslations('Header');

    const headerClassName = useMemo(() => {
        return `${styles.headerStyle}
           ${isSticky ? styles.sticky : ''} 
           ${variant === "transparent" ? styles.variantThree : ""}
           ${variant === "transparent-V2" ? styles.variantTwo : ""}
           ${variant === "black" ? styles.variantFour : ""}
           `;
    }, [variant, isSticky]);

    const logoSrc = useMemo(() => {
        return theme === 'light' ? SITE_INFO.logoWhite : SITE_INFO.logo;
    }, [theme]);

    const handleDesktopBookNowClick = useCallback(() => {
        trackMetaCustomEvent('AirbnbClick', { placement: 'header_desktop' });
        trackLandingActionToBook('airbnb', 'header_desktop');
    }, []);

    const handleMobileBookNowClick = useCallback(() => {
        trackMetaCustomEvent('AirbnbClick', { placement: 'header_mobile' });
        trackLandingActionToBook('airbnb', 'header_mobile');
    }, []);

    return (
        <header 
        data-theme={theme}
        className={headerClassName}>
            <div className="desktop-menu max-w-[1570px] mx-auto justify-between items-center xl:flex hidden">

                <div className="main-menu flex items-center ">
                    <Link href="/" className="shrink-0">
                        <Image
                            alt='logo'
                            width='100'
                            height='70'
                            // layout="responsive"
                            className="max-w-[58px]"
                            src={logoSrc}
                            priority
                        />
                    </Link>
                    <div className="main-menu uppercase ml-4">
                        <ul className={`flex items-center ${styles.navList}`}>
                        </ul>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <Link 
                        href={BOOKING_LINKS.airbnb} 
                        className="btn btn-primary btn-sm text-sm font-medium font-sans"
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={handleDesktopBookNowClick}
                    >
                        {t('bookNow')}
                    </Link>
                    <ThemeToggle />
                    <LanguageSelector />
                </div>
            </div>

            <div className={`${styles.mobileBar}`}>
                <Link href="/" className="shrink-0 max-w-[50px]">
                    <Image
                        alt='logo'
                        width='100'
                        height='70'
                        src={logoSrc}
                    />
                </Link>
                <div className="space-x-4 flex items-center">
                    <Link 
                        href={BOOKING_LINKS.airbnb} 
                        className="btn btn-primary btn-sm text-xs font-medium font-sans"
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={handleMobileBookNowClick}
                    >
                        {t('bookNow')}
                    </Link>
                    <ThemeToggle />
                    <LanguageSelector />
                </div>
            </div>
        </header>
    );
}

export default memo(Header);
