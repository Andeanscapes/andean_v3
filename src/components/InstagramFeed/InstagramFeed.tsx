'use client'
import { useMemo, memo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import InstagramFeedData from '@/constant/InstagramFeed'
import Link from 'next/link';
import Image from 'next/image';
import { useThemeContext } from '@/contexts/ThemeContext';
import styles from './InstagramFeed.module.css';

const InstagramFeed = () => {
    const { theme } = useThemeContext();

    const breakpoints = useMemo(() => ({
        320: {
            slidesPerView: 2
        },
        480: {
            slidesPerView: 3
        },
        768: {
            slidesPerView: 4
        },
        1200: {
            slidesPerView: 5
        }
    }), []);

    return (
        <div className={styles.instagramFeed} data-theme={theme}>
            <Swiper 
                     slidesPerView={1}
                     spaceBetween={30}
                     loop={false}
                     breakpoints={breakpoints}
                     className='max-w-[1570px] mx-auto px-3 insta-feed-slider'
                >
                    {InstagramFeedData.images?.map((item)=>(
                        <SwiperSlide key={item.id}>
                            <div className={styles.imageContainer}>
                            <Image 
                                src={item.img} 
                                alt="instagram images"
                                height={300}
                                width={300}
                                className="w-full h-full object-cover" />
                            <Link href="https://www.instagram.com/hacienda_el_recuerdo" className={styles.feedIcon}>
                                <i className="bi bi-instagram text-xl" />
                            </Link>
                        </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
        </div>

    );
}

export default memo(InstagramFeed);