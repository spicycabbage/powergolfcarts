"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'

export default function RoberaProContent() {
  return (
    <section className="mt-12 space-y-12" data-pdp-rich-content>
      {/* Quick Overview (mosaic of large JPG tiles like competitor) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Overview</h3>
        <QuickOverviewMosaic />
      </div>

      {/* Performance highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ['2.5 m/s', 'Marching speed'],
          ['15 m', 'Response distance'],
          ['18–36 Holes', 'Per charge (usage dependent)'],
          ['~6 Hours', 'Extended battery life']
        ].map(([value, label]) => (
          <div key={label} className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-600 mt-1">{label}</div>
          </div>
        ))}
      </div>


      {/* Video placeholders (you will provide frames manually) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Product Videos</h3>
        <VideoPlaceholders />
      </div>

      {/* Specs snapshot (Robera Pro only) */}
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-gradient-to-br from-gray-50 to-white">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 text-sm font-semibold text-white">Robera Pro Specifications</div>
        <div className="divide-y divide-gray-200 bg-white">
          {[
            ['Max Speed', '2.5 m/s'],
            ['Response Distance', '15 m'],
            ['Slope Capability', '25°'],
            ['Battery Life', '18–36 Holes / ~6 Hours'],
            ['Charging Duration', '~3.5 Hours'],
            ['USB Ports', 'Type A, Type C'],
            ['Weight', '17.5 kg'],
            ['Water Resistance', 'IPX3']
          ].map(([k, v], idx) => (
            <div key={k} className={`grid grid-cols-2 gap-4 px-4 py-3 text-sm ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <div className="text-gray-700 font-medium">{k}</div>
              <div className="text-gray-900 font-semibold">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ preview */}
      <div className="space-y-4" data-faq>
        <h3 className="text-lg font-semibold text-gray-900">FAQs</h3>
        <Faq q="How does Robera Pro perform in deep rough or thick wooded areas?" a="Use off‑road/remote mode for dense terrain. It handles slopes up to ~25° and can navigate tight spaces (~1.2 m wide), depending on surface and traction." />
        <Faq q="Is there a GPS feature with Robera Pro?" a="Not in this version; GPS and expanded navigation are on the roadmap for future updates." />
        <Faq q="Can the wheels move in any direction?" a="Yes. The Pro features omnidirectional front wheels for smooth maneuvering in tight areas and on varied lies." />
        <Faq q="Why aren't the wheels telescopic for stability?" a="The design prioritizes motor power, balance, and intelligent controls for stability—without needing telescopic wheel arms." />
        <Faq q="What is the Robera Pro’s fifth wheel for?" a="The foldable stabilizer (5th wheel) enhances balance on steeper terrain and retracts for normal use with the intelligent balance system." />
        <Faq q="What are the dimensions and folding dimensions?" a="Approx. dimensions: 1124.2 × 1180.97 × 626 mm. Folding: 449.5 × 688.06 × 444 mm." />
      </div>

      <p className="text-xs text-gray-500">
        Notes: Real‑world range and performance vary by course elevation, bag weight, tire traction, wind, and usage. Metrics are approximate and subject to change.
      </p>
    </section>
  )
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-700 mt-2 leading-relaxed">{body}</p>
    </div>
  )
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="rounded-lg border border-gray-300 p-4 bg-gradient-to-br from-blue-50 to-gray-50 shadow-sm hover:shadow-md transition-shadow">
      <summary className="cursor-pointer text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors">{q}</summary>
      <div className="mt-3 text-sm text-gray-700 leading-relaxed pl-1">{a}</div>
    </details>
  )
}

type LocalImageItem = { src: string; alt: string; caption?: string }

// Default manual filenames matching competitor sections. Drop these exact files in public/robera
const featureImages: LocalImageItem[] = [
  { src: '/robera/robera-hero.jpg', alt: 'Robera Pro Overview', caption: 'Overview' },
  { src: '/robera/robera-ai.jpg', alt: 'Robera Pro AI Vision', caption: 'AI Vision' },
  { src: '/robera/robera-follow.jpg', alt: 'Robera Pro Follow Me', caption: 'Follow Me Mode' },
  { src: '/robera/robera-marching.jpg', alt: 'Robera Pro Marching Mode', caption: 'Marching Mode' },
  { src: '/robera/robera-obstacles.jpg', alt: 'Robera Pro Obstacle Avoidance', caption: 'Obstacle Avoidance' },
  { src: '/robera/robera-anti-tip.jpg', alt: 'Robera Pro Anti‑Tipping', caption: 'Anti‑Tipping Stability' },
]

function ImageCard({ item }: { item: LocalImageItem }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return <PlaceholderCard label={`Missing ${item.src}`} />
  }
  return (
    <figure className="rounded-lg overflow-hidden border border-gray-200 bg-white">
      <div className="relative aspect-[4/3]">
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          onError={() => setFailed(true)}
          priority={false}
        />
      </div>
      {item.caption && (
        <figcaption className="px-3 py-2 text-xs text-gray-600 border-t border-gray-100">{item.caption}</figcaption>
      )}
    </figure>
  )
}

type IconFeature = { key: string; label: string; src: string }
const quickTiles: IconFeature[] = [
  { key: 'ai-vision', label: 'AI Vision', src: '/robera/ai-vision.jpg' },
  { key: 'auto-follow', label: 'Auto Follow', src: '/robera/auto-follow.jpg' },
  { key: 'no-go', label: 'No-Go Zones Detection', src: '/robera/no-go.jpg' },
  { key: 'gesture', label: 'Gesture Control', src: '/robera/gesture.jpg' },
  { key: 'obstacles', label: 'Obstacles Avoidance', src: '/robera/obstacles.jpg' },
  { key: 'summon', label: 'Remote Summon', src: '/robera/summon.jpg' },
  { key: 'anti-tipping', label: 'Anti-Tipping', src: '/robera/anti-tipping.jpg' },
  { key: 'remote', label: 'Remote Control', src: '/robera/remote.jpg' },
]

function IconFeatureCard({ item }: { item: IconFeature }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className="rounded-lg border border-gray-200 p-4 bg-white flex items-center space-x-3">
      <div className="relative w-10 h-10 shrink-0">
        {!failed ? (
          <Image src={item.src} alt={item.label} fill className="object-contain" onError={() => setFailed(true)} />
        ) : (
          <div className="w-10 h-10 bg-gray-100 border border-dashed border-gray-300 text-[10px] flex items-center justify-center text-gray-500">
            icon
          </div>
        )}
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-900">{item.label}</div>
      </div>
    </div>
  )
}

function QuickOverviewMosaic() {
  // 2 columns on mobile, 4 on desktop, with responsive aspect ratios
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {quickTiles.map(tile => (
        <figure key={tile.key} className="relative rounded-xl overflow-hidden bg-gray-200 border border-gray-200">
          <div className="relative w-full aspect-[16/10]">
            <Image src={tile.src} alt={tile.label} fill className="object-cover" onError={(e:any)=>{(e.currentTarget as any).style.display='none'}} />
          </div>
          <figcaption className="absolute left-4 top-3 text-white text-lg font-extrabold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{tile.label}</figcaption>
        </figure>
      ))}
    </div>
  )
}

function Gallery() {
  const [items, setItems] = useState<LocalImageItem[] | null>(null)

  useEffect(() => {
    let mounted = true
    fetch('/robera/manifest.json')
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!mounted) return
        const list: LocalImageItem[] | null = json?.images?.length ? json.images : null
        setItems(list)
      })
      .catch(() => setItems(null))
    return () => { mounted = false }
  }, [])

  if (!items || items.length === 0) {
    // Show 6 placeholders with instructions
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureImages.map((img, i) => (
          <PlaceholderCard key={i} label={`Add ${img.src}`} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((img) => (
        <ImageCard key={img.src} item={img} />
      ))}
    </div>
  )
}

function VideoPlaceholders() {
  const videos: LocalImageItem[] = [
    { src: '/robera/video-01.jpg', alt: 'Video frame 1', caption: 'Video 1 – drop a frame at public/robera/video-01.jpg' },
    { src: '/robera/video-02.jpg', alt: 'Video frame 2', caption: 'Video 2 – drop a frame at public/robera/video-02.jpg' },
    { src: '/robera/video-03.jpg', alt: 'Video frame 3', caption: 'Video 3 – drop a frame at public/robera/video-03.jpg' },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {videos.map(v => (
        <ImageCard key={v.src} item={v} />
      ))}
    </div>
  )
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 aspect-[4/3] flex items-center justify-center text-center p-4 text-xs text-gray-500">
      {label}
    </div>
  )
}

function NarrativeSections() {
  const sections: { src: string; title: string; body: string }[] = [
    { src: '/robera/robera-hero.jpg', title: 'Robera Pro Overview', body: 'AI‑powered smart golf caddy designed for hands‑free play with stable handling and long‑lasting battery.' },
    { src: '/robera/robera-ai.jpg', title: 'AI Vision', body: 'RGB + TOF sensors and on‑device learning help recognize and follow the golfer in varied lighting conditions.' },
    { src: '/robera/robera-follow.jpg', title: 'Follow Me Mode', body: 'Tracks at a comfortable distance so clubs are always within reach while you walk naturally.' },
    { src: '/robera/robera-marching.jpg', title: 'Marching Mode', body: 'Lets the caddy lead the way in front—useful for narrow corridors and line‑of‑travel visibility.' },
    { src: '/robera/robera-obstacles.jpg', title: 'Obstacle Avoidance', body: 'On‑device perception steers around golfers, bags, signage, and other course objects for a smoother round.' },
    { src: '/robera/robera-anti-tip.jpg', title: 'Anti‑Tipping Stability', body: 'Balanced drive and stabilizer support help on slopes and damp surfaces; performance varies with conditions.' },
  ]

  return (
    <div className="space-y-12">
      {sections.map(s => (
        <section key={s.src} className="space-y-4">
          <ImageCard item={{ src: s.src, alt: s.title }} />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">{s.title}</h3>
            <p className="text-gray-700 leading-relaxed">{s.body}</p>
          </div>
        </section>
      ))}
    </div>
  )
}


