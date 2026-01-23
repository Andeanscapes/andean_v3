'use client'

import Hero from "@/components/Hero"
import VideoBanner from "@/components/VideoBanner"
import InstagramFeed from "@/components/InstagramFeed"

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
