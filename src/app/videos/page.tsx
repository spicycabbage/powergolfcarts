import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Insanity Golf Videos | Power Golf Carts',
  description: 'Watch instructional videos and product demonstrations for our electric golf carts including Egocaddy, Tasmania, and InsanitEcart.',
}

export default function VideosPage() {
  const videoSections = [
    {
      title: 'Egocaddy Follow Me E-Cart',
      videos: [
        { title: 'Follow Me Mode on the golf course', url: 'https://www.youtube.com/embed/Cyr3cg7PRSo' },
        { title: 'Installation Instructions, Part 1', url: 'https://video.wixstatic.com/video/6df5bf_a68d1be0f8274244a12a3a5311a36d8c/360p/mp4/file.mp4' },
        { title: 'Installation Instructions, Part 2', url: 'https://video.wixstatic.com/video/6df5bf_3468aa0ee37d41eda72c81aaeb261f10/360p/mp4/file.mp4' },
        { title: 'Installation Instructions, Part 3', url: 'https://video.wixstatic.com/video/6df5bf_6b0a1f2802434875a18af5f755150696/1080p/mp4/file.mp4' },
        { title: 'App Instructions', url: 'https://video.wixstatic.com/video/6df5bf_ca52a9ca77c94cbd86423aa84c03917d/1080p/mp4/file.mp4' },
        { title: 'Winter-time cart performance', url: 'https://www.youtube.com/embed/uBsV2qbIbts' },
      ]
    },
    {
      title: 'Tasmania 360 Swivel Front Wheel E-Cart',
      videos: [
        { title: 'Cart performance on the golf course', url: 'https://www.youtube.com/embed/mMYQsYxs5Ic' },
        { title: 'Adjust 2 Sides of Motor Speeds', url: 'https://video.wixstatic.com/video/6df5bf_7a0a3420ab8e4650859e4096dd44975f/1080p/mp4/file.mp4' },
      ]
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Insanity Golf Videos</h1>
          <p className="text-xl text-green-100">
            Watch instructional videos and product demonstrations for our electric golf carts
          </p>
        </div>
      </section>

      {/* Video Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-16">
          {videoSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{section.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.videos.map((video, videoIdx) => (
                  <div key={videoIdx} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="relative aspect-video bg-gray-200">
                      <iframe
                        src={video.url}
                        title={video.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">{video.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Copyright Notice */}
        <div className="mt-16 text-center text-sm text-gray-600">
          <p>Insanity Golf has copyright for all the photos and videos.</p>
        </div>
      </div>
    </div>
  )
}

