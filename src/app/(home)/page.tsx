import { Metadata } from "next";
import CategoryOne from "@/components/HomeOne/CategoryOne";
import PackageOne from "@/components/HomeOne/PackageOne";
import VideoBanner from "@/components/HomeOne/VideoBannerOne";
import InstagramFeed from "@/components/layout/InstagramFeed";

import HeroTwo from "@/components/HomeDark/HeroTwo"

export const metadata: Metadata = {
    title: 'Home | Andean Scapes',
    description: 'Experience the ultimate nature adventure and co-living space in the heart of the Andes. Andean Scapes offers breathtaking mountain views, thrilling emerald mine explorations, and comfortable accommodations for digital nomads and travelers.',
    keywords: ['Andean Scapes', 'tour', 'travel', 'booking', 'rental', 'trip', 'adventure', 'nature', 'emerald mines', 'co-living', 'vacation', 'Colombia', 'Boyaca', 'digital nomads']
};

const HomeOne = () => {
    return (
        <>
            <HeroTwo/>
            {/* <CategoryOne />
            <PackageOne />
            <VideoBanner /> */}
            {/* <InstagramFeed /> */}
        </>
    );
}

export default HomeOne;