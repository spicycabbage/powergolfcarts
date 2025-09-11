import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import EmailSubscriber from '@/lib/models/EmailSubscriber'

// POST - Unsubscribe via token
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { token, email } = body
    
    if (!token && !email) {
      return NextResponse.json(
        { success: false, error: 'Token or email is required' },
        { status: 400 }
      )
    }
    
    let query: any = {}
    if (token) {
      query.unsubscribeToken = token
    } else {
      query.email = email.toLowerCase()
    }
    
    const subscriber = await EmailSubscriber.findOne(query)
    
    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Subscriber not found' },
        { status: 404 }
      )
    }
    
    if (!subscriber.isActive) {
      return NextResponse.json(
        { success: false, error: 'Already unsubscribed' },
        { status: 409 }
      )
    }
    
    // Unsubscribe
    subscriber.isActive = false
    subscriber.unsubscribedAt = new Date()
    await subscriber.save()
    
    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed'
    })
    
  } catch (error) {
    console.error('Error unsubscribing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}

// GET - Unsubscribe page via token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }
    
    await connectToDatabase()
    
    const subscriber = await EmailSubscriber.findOne({ unsubscribeToken: token })
    
    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Invalid unsubscribe link' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        email: subscriber.email,
        isActive: subscriber.isActive
      }
    })
    
  } catch (error) {
    console.error('Error fetching unsubscribe info:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch unsubscribe info' },
      { status: 500 }
    )
  }
}
