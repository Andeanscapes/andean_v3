import { Metadata } from "next";

import HeroTwo from "@/components/HomeDark/HeroTwo"
import VideoBanner from "@/components/HomeOne/VideoBannerOne"

export const metadata: Metadata = {
    title: 'Home | Andean Scapes',
    description: 'Experience the ultimate nature adventure and co-living space in the heart of the Andes. Andean Scapes offers breathtaking mountain views, thrilling emerald mine explorations, and comfortable accommodations for digital nomads and travelers.',
    keywords: ['Andean Scapes', 'tour', 'travel', 'booking', 'rental', 'trip', 'adventure', 'nature', 'emerald mines', 'co-living', 'vacation', 'Colombia', 'Boyaca', 'digital nomads']
};

const HomeOne = () => {
    return (
        <main className="bg-[#121316]">
            <>
            <HeroTwo/>
            <VideoBanner/>
            </>
        </main>
      )
}

export default HomeOne;