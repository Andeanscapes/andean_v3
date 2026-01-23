'use client'

import Hero from "@/components/Hero/Hero"
import VideoBanner from "@/components/VideoBanner/VideoBanner"
import InstagramFeed from "@/components/InstagramFeed/InstagramFeed"

export default function LandingSection() {
  return (
    <main className="bg-[#121316]">
      <>
        <Hero />
        <VideoBanner />
        <InstagramFeed />
      </>
    </main>
  )
}
