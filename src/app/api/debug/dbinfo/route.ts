import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/mongodb'

function json(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

function getToken(req: NextRequest): string | null {
  const url = new URL(req.url)
  const fromQuery = url.searchParams.get('token')
  const fromHeader = req.headers.get('x-debug-token')
  return fromHeader || fromQuery
}

export async function GET(req: NextRequest) {
  const token = getToken(req)
  const expected = process.env.DEBUG_TOKEN
  const isDev = process.env.NODE_ENV !== 'production'
  if (!isDev && (!expected || token !== expected)) {
    return json({ error: 'forbidden' }, 403)
  }

  await connectToDatabase()
  const conn = mongoose.connection
  const db = conn.db

  const slug = new URL(req.url).searchParams.get('slug') || undefined

  const productsCol = db.collection('products')
  const categoriesCol = db.collection('categories')
  const ordersCol = db.collection('orders')
  const navigationsCol = db.collection('navigations')

  const [
    productsCount,
    categoriesCount,
    ordersCount,
    navigationsCount,
    missingDesc,
    missingImages,
    sample
  ] = await Promise.all([
    productsCol.countDocuments({}),
    categoriesCol.countDocuments({}).catch(() => 0),
    ordersCol.countDocuments({}).catch(() => 0),
    navigationsCol.countDocuments({}).catch(() => 0),
    productsCol.countDocuments({ $or: [ { description: { $exists: false } }, { description: '' } ] }),
    productsCol.countDocuments({ $or: [ { images: { $exists: false } }, { images: { $size: 0 } } ] }),
    slug
      ? productsCol.findOne(
          { slug },
          { projection: { _id: 0, slug: 1, name: 1, description: 1, images: 1 } }
        )
      : null
  ])

  return json({
    database: (db as any)?.databaseName,
    counts: {
      products: productsCount,
      categories: categoriesCount,
      orders: ordersCount,
      navigations: navigationsCount,
      productsMissingDescription: missingDesc,
      productsMissingImages: missingImages
    },
    sample
  })
}


