import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Post from '@/lib/models/Post'
import { createSuccessResponse, handleApiError } from '@/utils/apiResponse'

export const dynamic = 'force-dynamic'

// GET /api/posts - Get all posts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const sortBy = searchParams.get('sortBy') || 'publishedAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1

    const skip = (page - 1) * limit
    const filter: any = { isPublished: true }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .select('title slug excerpt coverImage publishedAt')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ])

    const totalPages = Math.ceil(total / limit)

    return createSuccessResponse(
      { posts },
      'Posts fetched successfully',
      {
        page,
        limit,
        total,
        totalPages,
      }
    )
  } catch (error) {
    return handleApiError(error, 'fetching posts')
  }
}
