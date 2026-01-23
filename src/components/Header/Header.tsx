'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from 'react'
import LanguageSelector from "@/components/LanguageSelector/LanguageSelector";
import type { HeaderVariant } from "@/types/ui";

type HeaderProps = { variant?: HeaderVariant };

const Header = ({ variant = "default" }: HeaderProps) => {
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
          if (window.pageYOffset > 50) {
            setIsSticky(true);
          } else {
            setIsSticky(false);  
          }
        };
    
        window.addEventListener('scroll', handleScroll);
    
        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
      }, []);

    return (
        <header 
        className={`header-style 
           ${isSticky ? 'sticky' : ''} 
           ${variant === "transparent" ? "herder-variant-three" : ""}
           ${variant === "transparent-V2" ? "herder-variant-two" : ""}
           ${variant === "black" ? "herder-variant-four" : ""}
           `}>
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
                        <ul className="flex items-center nav-list">
                        </ul>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <LanguageSelector variant={variant} isSticky={isSticky} />
                </div>
            </div>

            <div className="mobile-menu xl:hidden flex justify-between items-center relative">
                <Link href="/" className="shrink-0 max-w-[50px]">
                    <Image
                        alt='logo'
                        width='100'
                        height='70'
                        src="/assets/images/logo.png"
                    />
                </Link>
                <div className="space-x-4 flex items-center">
                    <LanguageSelector variant={variant} isSticky={isSticky} />
                </div>
            </div>
        </header>
    );
}

export default Header;