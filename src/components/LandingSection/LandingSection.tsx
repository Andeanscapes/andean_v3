'use client'

import Hero from "@/components/Hero/Hero"
import VideoBanner from "@/components/VideoBanner/VideoBanner"
import InstagramFeed from "@/components/InstagramFeed/InstagramFeed"
import { Button } from "@/components/ui/Button/Button"

export default function LandingSection() {
  return (
    <main className="bg-[#121316]">
      <>
        <Hero />
        <div className="px-4 py-6">
          <Button variant="primary" size="md">Test Button</Button>
        </div>
        <VideoBanner />
        <InstagramFeed />
      </>
    </main>
  )
}
