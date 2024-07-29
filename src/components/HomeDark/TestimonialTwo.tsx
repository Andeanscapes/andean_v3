'use client'
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from 'swiper/react';

import TestimonialDataTwo from '@/constant/HomeDark/TestimonialDataTwo';
import Image from "next/image";


const TestimonialTwo = () => {


  const pagination = {
    el: '.testi-two-pagi',
  }

  return (
    <div className="testimonial_style__two lg:pt-30 pt-24 z-1 relative">
      <div className="absolute top-[7%] left-[2%] max-w-[9%] z-minus lg:inline-block hidden wow fadeInLeft" data-wow-delay="0.3s">
        <img src="./assets/images/illustration/leaf-illustration.png" alt="leaf" />
      </div>
      <div className="max-w-[1570px] mx-auto px-3">
        <div className="text-center lg:pb-[60px] pb-[40px]">
          <h5 className="section-sub-title-v1">{TestimonialDataTwo?.sub_title}</h5>
          <h2 className="section-title-v3">{TestimonialDataTwo?.Title}</h2>
        </div>

        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          loop={true}
          breakpoints={{
            320: {
              slidesPerView: 1
            },
            992: {
              slidesPerView: 2
            },
            1200: {
              slidesPerView: 3
            }
          }}
          pagination={pagination}
          modules={[Pagination]}
        >
          {TestimonialDataTwo?.testimonials?.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <div className="text-center">
                <ul className="flex justify-center items-center rating-group-md">
                  <li><i className="bi bi-star-fill"> </i></li>
                  <li><i className="bi bi-star-fill"> </i></li>
                  <li><i className="bi bi-star-fill"> </i></li>
                  <li><i className="bi bi-star-fill"> </i></li>
                  <li><i className="bi bi-star-half"> </i></li>
                </ul>
                <p className="leading-1.5 mt-5 lg:text-2md text-md text-dark-6">{testimonial.review_desc}</p>
                <h5 className="text-white text-2md leading-1.5 font-semibold mt-5">{testimonial.reviewer}</h5>
                <Image height={100} width={100} src={testimonial.avater} alt="revierer " className="h-[60px] w-[60px] object-cover rounded-full mt-3 mx-auto" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="common-pagination testi-two-pagi" />
      </div>
    </div>
  )
}

export default TestimonialTwo