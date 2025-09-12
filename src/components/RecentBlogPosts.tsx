'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { OptimizedImage } from './OptimizedImage'
import { LoadingSpinner } from './ui/LoadingSpinner'

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
}

export function RecentBlogPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/posts?limit=3&sortBy=publishedAt')
        if (res.ok) {
          const result = await res.json()
          // Correctly access the nested 'posts' array inside the 'data' object
          setPosts(Array.isArray(result.data.posts) ? result.data.posts : [])
        }
      } catch (error) {
        console.error('Failed to fetch recent blog posts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="py-12 sm:py-16 text-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (posts.length === 0) {
    return null // Don't show the section if there are no posts
  }

  return (
    <div className="bg-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">From the Blog</h2>
        <p className="mt-4 text-lg text-gray-600 mb-10">
          Check out our latest articles, guides, and news.
        </p>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post._id} href={`/blog/${post.slug}`} className="group block">
              <div className="overflow-hidden rounded-lg">
                <OptimizedImage
                  src={post.coverImage || '/placeholder-image.jpg'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  width={400}
                  height={225}
                />
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900 group-hover:text-primary-600">{post.title}</h3>
              <p className="mt-2 text-base text-gray-600 line-clamp-3">{post.excerpt}</p>
              <p className="mt-4 text-sm font-semibold text-primary-600 group-hover:underline">Read more →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
