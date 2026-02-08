'use client'

import Image from "next/image";
import Link from "next/link";
import {memo, useMemo} from "react";
import Navigation from "./Navigation";
import MobileMenu from "./MobileMenu";
import LanguageSelector from "@/components/LanguageSelector/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import {useLayoutContext} from "@/contexts/LayoutContext";
import {useThemeContext} from "@/contexts/ThemeContext";
import styles from "./Header.module.css";

const Header = () => {
    const {variant, isSticky} = useLayoutContext();
    const {theme} = useThemeContext();

    const headerClassName = useMemo(() => {
        return `${styles.headerStyle}
           ${isSticky ? styles.sticky : ''} 
           ${variant === "transparent" ? styles.variantThree : ""}
           ${variant === "transparent-V2" ? styles.variantTwo : ""}
           ${variant === "black" ? styles.variantFour : ""}
           `;
    }, [variant, isSticky]);

    return (
        <>
            {/* Skip to main content link for accessibility */}
            <a 
                href="#main-content" 
                className={styles.skipLink}
            >
                Skip to main content
            </a>

            <header 
                data-theme={theme}
                className={headerClassName}
                role="banner"
                aria-label="Site header"
            >
                <div className="desktop-menu max-w-[1570px] mx-auto justify-between items-center xl:flex hidden">
                    {/* Logo and Navigation */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="shrink-0 focus-visible:outline-primary-1 focus-visible:outline-2 focus-visible:outline-offset-4 rounded" aria-label="Andean Scapes Home">
                            <Image
                                alt='Andean Scapes logo'
                                width='100'
                                height='70'
                                className="max-w-[58px]"
                                src="/assets/images/logo.png"
                                priority
                            />
                        </Link>
                        <Navigation />
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <LanguageSelector />
                        <div className={styles.divider} aria-hidden="true" />
                        <Link 
                            href="/booking"
                            className="bg-primary-1 hover:bg-primary-2 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 focus-visible:outline-primary-1 focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            Book
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Bar */}
                <div className={`${styles.mobileBar}`}>
                    <Link href="/" className="shrink-0 max-w-[50px] focus-visible:outline-primary-1 focus-visible:outline-2 focus-visible:outline-offset-4 rounded" aria-label="Andean Scapes Home">
                        <Image
                            alt='Andean Scapes logo'
                            width='100'
                            height='70'
                            src="/assets/images/logo.png"
                        />
                    </Link>
                    <div className="flex items-center gap-2">
                        <MobileMenu />
                    </div>
                </div>
            </header>
        </>
    );
}

export default memo(Header);