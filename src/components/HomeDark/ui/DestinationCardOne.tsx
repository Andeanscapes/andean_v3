import Image from "next/image"
import Link from "next/link"


const DestinationCardOne = (
    {imgUrl, title, place__count} :
    {
        imgUrl: string,
        title: string,
        place__count: number
    }
) => {
    return (
        <div className="single-destination group wow fadeInUp">
            <div className="overflow-hidden">
                <Image 
                    src={imgUrl} 
                    alt={title} 
                    className="w-full group-hover:scale-105 duration-300" 
                    width={310}
                    height={354}
                />
            </div>
            <div className="bg-white text-dark-1 text-center py-5 px-4">
                <h5 className="lg:text-2md text-md font-bold leading-1.5 group-hover:text-primary-1 duration-300">
                    <Link href="/destination-details">{title}</Link>
                </h5>
                <p className="font-medium text-base mt-1 leading-1.2">{place__count > 9 ? place__count : '0'+place__count} Tours Place</p>
            </div>
        </div>
    )
}

export default DestinationCardOne