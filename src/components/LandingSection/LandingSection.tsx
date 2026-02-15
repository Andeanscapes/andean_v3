'use client'

import { useEffect, useState } from 'react'
import Hero from "@/components/Hero/Hero"
import BookingCtas from "@/components/BookingCtas/BookingCtas"
import VideoBanner from "@/components/VideoBanner/VideoBanner"
import InstagramFeed from "@/components/InstagramFeed/InstagramFeed"
import HeroData from "@/constant/Hero"
import { useThemeContext } from "@/contexts/ThemeContext"

export default function LandingSection() {
  const { theme } = useThemeContext()
  const [bookingBgImage, setBookingBgImage] = useState(HeroData.slides[0]?.imgUrl ?? '')

  useEffect(() => {
    if (!HeroData.slides.length) return
    const randomIndex = Math.floor(Math.random() * HeroData.slides.length)
    setBookingBgImage(HeroData.slides[randomIndex]?.imgUrl ?? HeroData.slides[0].imgUrl)
  }, [])

  return (
    <main>
      <>
        <Hero />
        <section id="booking" className="relative scroll-mt-24 overflow-hidden">
          <img
            src={bookingBgImage}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover scale-105 ${
              theme === 'dark'
                ? 'brightness-[0.45] saturate-90 blur-[1px]'
                : 'brightness-[0.9] saturate-75 blur-[2px]'
            }`}
          />
          <div
            aria-hidden="true"
            className={`absolute inset-0 ${
              theme === 'dark' ? 'bg-black/35' : 'bg-white/40'
            }`}
          />
          <div className="relative z-1">
            <BookingCtas enableStickyCta={true} />
          </div>
        </section>
        <VideoBanner />
        <InstagramFeed />
      </>
    </main>
  )
}
