import { Metadata } from "next";
import CategoryOne from "@/components/HomeOne/CategoryOne";
import PackageOne from "@/components/HomeOne/PackageOne";
import VideoBanner from "@/components/HomeOne/VideoBannerOne";
import InstagramFeed from "@/components/layout/InstagramFeed";

import HeroTwo from "@/components/HomeDark/HeroTwo"

export const metadata: Metadata = {
    title: 'Home 01 | Arid - Travel & Tourism HTML/Tailwind CSS Template',
    description: 'Welcome, Arid - Travel & Tourism HTML/Tailwind CSS Template',
    keywords: ['tour', 'travel', 'booking', 'rental', 'nextJs', 'tailwind', 'trip', 'beach', 'holidy', 'cruise', 'vacation' ]
}


const HomeOne = () => {
    return (
        <>
            <HeroTwo/>
            <CategoryOne />
            <PackageOne />
            <VideoBanner />
            <InstagramFeed />
        </>
    );
}

export default HomeOne;