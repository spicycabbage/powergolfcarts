import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import EmailSubscriber from '@/lib/models/EmailSubscriber'

// GET - Fetch single subscriber
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    
    const { id } = await params
    const subscriber = await EmailSubscriber.findById(id)
    
    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Subscriber not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: subscriber
    })
    
  } catch (error) {
    console.error('Error fetching subscriber:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriber' },
      { status: 500 }
    )
  }
}

// PUT - Update subscriber
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    
    const { id } = await params
    const body = await request.json()
    
    const subscriber = await EmailSubscriber.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    
    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Subscriber not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: subscriber
    })
    
  } catch (error) {
    console.error('Error updating subscriber:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update subscriber' },
      { status: 500 }
    )
  }
}

// DELETE - Delete subscriber
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    
    const { id } = await params
    const subscriber = await EmailSubscriber.findByIdAndDelete(id)
    
    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Subscriber not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Subscriber deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting subscriber:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscriber' },
      { status: 500 }
    )
  }
}
