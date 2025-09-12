import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import EmailSubscriber from '@/lib/models/EmailSubscriber'

// GET - Fetch email subscribers (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const source = searchParams.get('source') || ''
    const isActive = searchParams.get('isActive')
    
    const skip = (page - 1) * limit
    
    // Build query
    const query: any = {}
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (source) {
      query.source = source
    }
    
    if (isActive !== null && isActive !== '') {
      query.isActive = isActive === 'true'
    }
    
    // Get subscribers with pagination
    const [subscribers, total] = await Promise.all([
      EmailSubscriber.find(query)
        .sort({ subscribedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EmailSubscriber.countDocuments(query)
    ])
    
    // Get stats
    const stats = await EmailSubscriber.aggregate([
      {
        $group: {
          _id: null,
          totalSubscribers: { $sum: 1 },
          activeSubscribers: { 
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } 
          },
          inactiveSubscribers: { 
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } 
          },
          totalEmailsSent: { $sum: '$emailsSent' },
          totalOpens: { $sum: '$opens' },
          totalClicks: { $sum: '$clicks' }
        }
      }
    ])
    
    const sourceStats = await EmailSubscriber.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0] || {
          totalSubscribers: 0,
          activeSubscribers: 0,
          inactiveSubscribers: 0,
          totalEmailsSent: 0,
          totalOpens: 0,
          totalClicks: 0
        },
        sourceStats
      }
    })
    
  } catch (error) {
    console.error('Error fetching email subscribers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}

// POST - Add new email subscriber
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { email, source = 'newsletter', firstName, lastName, preferences } = body
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Check if subscriber already exists
    const existingSubscriber = await EmailSubscriber.findOne({ email: email.toLowerCase() })
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { success: false, error: 'Email already subscribed' },
          { status: 409 }
        )
      } else {
        // Reactivate existing subscriber
        existingSubscriber.isActive = true
        existingSubscriber.subscribedAt = new Date()
        existingSubscriber.unsubscribedAt = undefined
        existingSubscriber.source = source
        
        if (firstName) existingSubscriber.firstName = firstName
        if (lastName) existingSubscriber.lastName = lastName
        if (preferences) existingSubscriber.preferences = { ...existingSubscriber.preferences, ...preferences }
        
        await existingSubscriber.save()
        
        return NextResponse.json({
          success: true,
          message: 'Successfully resubscribed!',
          data: existingSubscriber
        })
      }
    }
    
    // Generate unsubscribe token
    const crypto = require('crypto')
    const unsubscribeToken = crypto.randomBytes(32).toString('hex')
    
    // Create new subscriber
    const subscriber = new EmailSubscriber({
      email: email.toLowerCase(),
      source,
      firstName,
      lastName,
      preferences: preferences || {},
      unsubscribeToken
    })
    
    await subscriber.save()
    
    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!',
      data: subscriber
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating email subscriber:', error)
    
    // More specific error handling
    let errorMessage = 'Failed to subscribe'
    
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        errorMessage = 'Email already exists in our system'
      } else if (error.message.includes('validation')) {
        errorMessage = 'Invalid email format'
      } else if (error.message.includes('unsubscribeToken')) {
        errorMessage = 'Token generation error'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage, details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
