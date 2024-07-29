'use client'

import PackageDataTwo from '@/constant/HomeDark/PackageDataTwo';
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from 'swiper/react';
import PackageCardTwo from './ui/PackageCardTwo';

const PackageTwo = () => {


    const pagination = {
        el: '.pack-two-pagi',
    }


    return (
        <div className="package_style__two lg:pt-30 pt-24 pb-24 lg:pb-30 z-1 relative">
            <div className="absolute top-[3%] left-[2%] max-w-[9%] z-minus lg:inline-block hidden wow fadeInLeft" data-wow-delay="0.3s">
                <img src="./assets/images/illustration/leaf-illustration.png" alt="leaf" />
            </div>
            <div className="absolute top-[2%] right-[1%] max-w-[14%] z-minus lg:inline-block hidden wow fadeInRight" data-wow-delay="0.3s">
                <img src="./assets/images/illustration/leaf-illustration-2.png" alt="leaf" />
            </div>
            <div className="max-w-[1570px] mx-auto px-3">
                <div className="text-center">
                    <h5 className="section-sub-title-v1">{PackageDataTwo?.sub_title}</h5>
                    <h2 className="section-title-v3">{PackageDataTwo?.title}</h2>
                </div>

                <Swiper
                    slidesPerView={1.2}
                    spaceBetween={30}
                    loop={true}
                    breakpoints={{
                        320: {
                            slidesPerView: 1.2
                        },
                        567: {
                            slidesPerView: 2
                        },
                        992: {
                            slidesPerView: 3
                        },
                        1200: {
                            slidesPerView: 4
                        }
                    }}

                    pagination={pagination}
                    modules={[Pagination]}

                    className='package-two-slider mt-17'>
                    {PackageDataTwo?.packages?.map((pack) => (
                        <SwiperSlide className='swiper-slide package-slide' key={pack.id}>
                            <PackageCardTwo

                                price={pack.price}
                                discountedPrice={pack.discountedPrice}
                                title={pack.title}
                                disc={pack.disc}
                                img={pack.img}
                            />
                        </SwiperSlide>

                    ))}
                </Swiper>

                <div className="common-pagination pack-two-pagi" />
            </div>
        </div>
    )
}

export default PackageTwo