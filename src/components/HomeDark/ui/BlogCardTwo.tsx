import Image from "next/image"
import Link from "next/link"


const BlogCardTwo = (
    {date, img, title, tags} :
    {
        date: string,
        img: string,
        title: string,
        tags: string[]
    }
) => {
    return (
        <div className="text-white group wow fadeInUp">
            <div className="overflow-hidden relative">
                <Link href="/blog-details">
                    <Image src={img} height={433} width={364} alt="blog-thumb" className="group-hover:scale-105 duration-300 w-full" />
                </Link>
                <span className="absolute top-4 left-4  bg-white text-dark-1 text-sm px-4 py-2 inline-block font-medium">{date}</span>
            </div>
            <div className="pt-6">
                <div className="relative text-base pl-[42px] text-white leading-1.5 before:absolute before:content-[''] before:w-8 before:h-[2px] before:bg-white before:left-0 before:top-1/2 before:-translate-y-1/2">
                    {tags?.map((tag)=> <span key={tag}>{tag}</span>)}
                </div>
                <h3 className="card-title-alpha-v2  pt-3 group-hover:text-primary-1">
                    <Link href="/blog-details">
                        {title}
                    </Link>
                </h3>
            </div>
        </div>
    )
}

export default BlogCardTwo