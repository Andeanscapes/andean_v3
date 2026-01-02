'use client'

import dynamic from 'next/dynamic'

type Props = {
  position: number[]
}

const PackageMap = dynamic(() => import('./PackageMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 text-dark-2">
      Loading map…
    </div>
  ),
})

export default function PackageMapNoSSR({ position }: Props) {
  return <PackageMap position={position} />
}


