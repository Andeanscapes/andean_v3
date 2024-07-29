import BlogDataTwo from "@/constant/blog/BlogDataTwo";
import BlogCardTwo from "./ui/BlogCardTwo";


const BlogTwo = () => {
    return (
        <div className="blog_style__two lg:pt-30 pt-24">
            <div className="max-w-[1570px] mx-auto px-3">
                <div className="text-center lg:pb-[60px] pb-[40px]">
                    <h5 className="section-sub-title-v1">{BlogDataTwo?.sub_title}</h5>
                    <h2 className="section-title-v3">{BlogDataTwo?.title}</h2>
                </div>
                <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-base">
                    {BlogDataTwo?.blogs?.map((blog) => (
                        <BlogCardTwo
                            key={blog.id}
                            title={blog.title}
                            img={blog.img}
                            tags={blog.tags}
                            date={blog.date}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default BlogTwo