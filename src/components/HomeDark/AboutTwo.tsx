import AboutDataTwo from '@/constant/HomeDark/AboutDataTwo'
import Link from 'next/link'

const AboutTwo = () => {
    return (
        <div className="about_style__two lg:pt-30 pt-24 relative z-1">
            <div className="absolute top-[5%] left-[1%] max-w-[9%] z-minus lg:inline-block hidden">
                <img src="./assets/images/illustration/bird-illustration.png" alt="leaf" />
            </div>
            <div className="container">
                <div className="grid lg:grid-cols-12 gap-base items-center">
                    <div className="lg:col-span-6">
                        <div className="inline-block p-base border-dark-2 border wow fadeIn" data-wow-delay="0.2s">
                            <img src="./assets/images/about/about2-1.webp" alt="about-image" />
                        </div>
                    </div>
                    <div className="lg:col-span-6 text-white">
                        <h5 className="font-cursive text-2md leading-1.5">{AboutDataTwo.sub_title}</h5>
                        <h2 className="section-title-v2">{AboutDataTwo.title}</h2>
                        <p className="text-md leading-1.7 mt-5">{AboutDataTwo.disc_text}</p>
                        <div className="mt-12">
                            <Link href="/about" className="btn_primary__v1">More About</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default AboutTwo