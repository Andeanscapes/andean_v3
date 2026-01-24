'use client'

import Image from "next/image";
import Link from "next/link";
import {memo, useMemo} from "react";
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
                            src="/assets/images/logo.png"
                            priority
                        />
                    </Link>
                    <div className="main-menu uppercase ml-4">
                        <ul className={`flex items-center ${styles.navList}`}>
                        </ul>
                    </div>
                </div>
                <div className="flex items-center gap-6">
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
                        src="/assets/images/logo.png"
                    />
                </Link>
                <div className="space-x-4 flex items-center">
                    <ThemeToggle />
                    <LanguageSelector />
                </div>
            </div>
        </header>
    );
}

export default memo(Header);