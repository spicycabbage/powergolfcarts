import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import Category from '@/lib/models/Category'

// GET - Fetch single category
export async function GET(
  request: NextRequest,
  context: { params: Record<string, string | string[]> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { id } = context.params as { id: string }
    const category = await Category.findById(id)
      .populate('children')
      .populate('parent')

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Category fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  context: { params: Record<string, string | string[]> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categoryData = await request.json()

    await connectToDatabase()

    const { id } = context.params as { id: string }
    const category = await Category.findByIdAndUpdate(
      id,
      categoryData,
      { new: true, runValidators: true }
    )

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  context: { params: Record<string, string | string[]> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Check if category has children
    const { id } = context.params as { id: string }
    const category = await Category.findById(id).populate('children')
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category.children && category.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories' },
        { status: 400 }
      )
    }

    // Remove from parent's children array
    if (category.parent) {
      await Category.findByIdAndUpdate(category.parent, {
        $pull: { children: category._id }
      })
    }

    await Category.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Category deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
