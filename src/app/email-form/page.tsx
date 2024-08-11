import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: 'Email form | Andean Scapes',
    description: 'Experience the ultimate nature adventure and co-living space in the heart of the Andes. Andean Scapes offers breathtaking mountain views, thrilling emerald mine explorations, and comfortable accommodations for digital nomads and travelers.',
    keywords: ['Andean Scapes', 'tour', 'travel', 'booking', 'rental', 'trip', 'adventure', 'nature', 'emerald mines', 'co-living', 'vacation', 'Colombia', 'Boyaca', 'digital nomads']
};

const EmailForm = () => {
    return (
        <main className="bg-[#121316]">
            <div className="flex flex-col justify-center items-center">
                <img src="/assets/images/backgrounds/email-form-banner.webp" className="w-full h-[200px] sm:h-[300px] object-cover" />
                <iframe
                    className="pt-10 w-full sm:w-[800px] h-[1100px] sm:h-[1000px]"
                    src="https://docs.google.com/forms/d/e/1FAIpQLSeXWItiEWgwZr7RjUxhx9tpIXXyPRufrIOpMXf8UAAxOis7rg/viewform?embedded=true"
                >
                    Cargando…
                </iframe>
                <div className="lg:mt-10 mt-7">
                    <Link href="/" className="btn_primary__v1">
                        GO Back
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default EmailForm;
