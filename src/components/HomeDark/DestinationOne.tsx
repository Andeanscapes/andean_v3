import DestinationDataTwo from "@/constant/Destination/DestinationDataTwo"
import DestinationCardOne from "./ui/DestinationCardOne"
import Link from "next/link"
const DestinationOne = () => {
    return (
        <div className="destination_style__two lg:pt-30 pt-24 z-1 relative">
            <div className="absolute top-[2%] right-[1%] max-w-[14%] z-minus lg:inline-block hidden wow fadeInRight" data-wow-delay="0.3s">
                <img src="./assets/images/illustration/leaf-illustration-2.png" alt="leaf" />
            </div>
            <div className="max-w-[1690px] px-3 mx-auto">
                <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-base">
                    {DestinationDataTwo?.destinations?.map((destination) => (
                        <DestinationCardOne
                            key={destination.id}
                            title={destination.title}
                            place__count={destination.place_count}
                            imgUrl={destination.imgUrl}
                        />
                    ))}
                </div>
                <div className="mt-14 text-center">
                    <Link href="/destinations" className="btn_primary__v1">View All Destiontion</Link>
                </div>
            </div>
        </div>
    )
}

export default DestinationOne