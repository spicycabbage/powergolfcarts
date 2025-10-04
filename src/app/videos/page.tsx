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
        { title: 'Follow Me Mode on the golf course', url: 'https://www.youtube.com/embed/VIDEO_ID_1' },
        { title: 'Installation Instructions, Part1', url: 'https://www.youtube.com/embed/VIDEO_ID_2' },
        { title: 'Installation Instructions, Part 2', url: 'https://www.youtube.com/embed/VIDEO_ID_3' },
        { title: 'Installation Instructions, Part 3', url: 'https://www.youtube.com/embed/VIDEO_ID_4' },
        { title: 'App Instructions', url: 'https://www.youtube.com/embed/VIDEO_ID_5' },
        { title: 'Winter-time cart performance', url: 'https://www.youtube.com/embed/VIDEO_ID_6' },
      ]
    },
    {
      title: 'Tasmania 360 Swivel Front Wheel E-Cart',
      videos: [
        { title: 'Cart performance on the golf course', url: 'https://www.youtube.com/embed/VIDEO_ID_7' },
        { title: 'Adjust 2 Sides of Motor Speeds', url: 'https://www.youtube.com/embed/VIDEO_ID_8' },
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
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

