import BlogOne from '@/components/HomeOne/BlogOne';
import VideoBanner from '@/components/HomeOne/VideoBannerOne';
import ClientsTwo from '@/components/HomeParallax/ClientsTwo';
import DestinationTwo from '@/components/HomeParallax/DestinationTwo';
import Features from '@/components/HomeParallax/Features';
import HeroThree from '@/components/HomeParallax/HeroThree';
import PackageThree from '@/components/HomeParallax/PackageThree';
import TestimonialThree from '@/components/HomeParallax/TestimonialThree';
import InstagramFeed from '@/components/layout/InstagramFeed';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Home Parallax | Arid - Travel & Tourism HTML/Tailwind CSS Template',
  description: 'Welcome, Arid - Travel & Tourism HTML/Tailwind CSS Template',
  keywords: ['tour', 'travel', 'booking', 'rental', 'nextJs', 'tailwind', 'trip', 'beach', 'holidy', 'cruise', 'vacation' ]
}

const HomeParallax = () => {
  return (
    <>
      <HeroThree/>
      <PackageThree/> 
      <DestinationTwo/>
      <Features/>
      <VideoBanner/>
      <ClientsTwo/>
      <TestimonialThree/>
      <BlogOne/>
      <InstagramFeed/>
    </>
  )
}

export default HomeParallax