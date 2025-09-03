import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import Category from '@/lib/models/Category'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const csvText = await file.text()
    const lines = csvText.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ 
        success: false,
        message: 'CSV file must contain at least a header and one data row',
        imported: 0,
        errors: ['Invalid CSV format']
      })
    }

    await connectToDatabase()

    // Get all categories for validation
    const categories = await Category.find({})
    const categoryMap = new Map()
    categories.forEach(cat => {
      categoryMap.set(cat.slug.toLowerCase(), cat._id)
      categoryMap.set(cat.name.toLowerCase(), cat._id)
    })

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase())
    const dataLines = lines.slice(1)

    const errors: string[] = []
    const products: any[] = []
    let imported = 0

    // Validate required headers
    const requiredHeaders = ['name', 'price', 'category']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    
    if (missingHeaders.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing required headers: ${missingHeaders.join(', ')}`,
        imported: 0,
        errors: [`Required headers: ${requiredHeaders.join(', ')}`]
      })
    }

    for (let i = 0; i < dataLines.length; i++) {
      const lineNumber = i + 2 // +2 because we start from line 2 (after header)
      const line = dataLines[i].trim()
      
      if (!line) continue

      try {
        // Parse CSV line (simple implementation - doesn't handle complex CSV edge cases)
        const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim())
        
        if (values.length !== headers.length) {
          errors.push(`Line ${lineNumber}: Column count mismatch`)
          continue
        }

        const rowData: any = {}
        headers.forEach((header, index) => {
          rowData[header] = values[index]
        })

        // Validate required fields
        if (!rowData.name || !rowData.price || !rowData.category) {
          errors.push(`Line ${lineNumber}: Missing required fields (name, price, category)`)
          continue
        }

        // Validate price
        const price = parseFloat(rowData.price)
        if (isNaN(price) || price < 0) {
          errors.push(`Line ${lineNumber}: Invalid price "${rowData.price}"`)
          continue
        }

        // Validate category
        const categoryId = categoryMap.get(rowData.category.toLowerCase())
        if (!categoryId) {
          errors.push(`Line ${lineNumber}: Category "${rowData.category}" not found`)
          continue
        }

        // Generate slug
        const slug = rowData.name
          .toLowerCase()
          .replace(/[^a-zA-Z0-9 ]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-')

        // Parse images
        const images = rowData.images 
          ? rowData.images.split(',').map((img: string) => img.trim()).filter((img: string) => img)
          : []

        // Parse stock
        const stock = rowData.stock ? parseInt(rowData.stock) : 0

        // Parse isActive
        const isActive = rowData.isactive !== undefined 
          ? rowData.isactive.toLowerCase() === 'true' 
          : true

        const productData = {
          name: rowData.name,
          slug,
          description: rowData.description || '',
          price,
          category: categoryId,
          categories: [categoryId],
          sku: rowData.sku || `SKU-${Date.now()}-${i}`,
          stock,
          images,
          isActive,
          isFeatured: false,
          seo: {
            title: rowData.name,
            description: rowData.description || `Buy ${rowData.name} online`,
            keywords: [rowData.name.toLowerCase()]
          }
        }

        products.push(productData)

      } catch (error) {
        errors.push(`Line ${lineNumber}: Error parsing data - ${error}`)
      }
    }

    // Import valid products
    if (products.length > 0) {
      try {
        await Product.insertMany(products)
        imported = products.length
      } catch (error: any) {
        errors.push(`Database error: ${error.message}`)
      }
    }

    const success = imported > 0
    const message = success 
      ? `Successfully imported ${imported} products${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
      : 'No products were imported'

    return NextResponse.json({
      success,
      message,
      imported,
      errors: errors.slice(0, 10) // Limit errors to first 10
    })

  } catch (error) {
    console.error('Product import error:', error)
    return NextResponse.json({
      success: false,
      message: 'Import failed due to server error',
      imported: 0,
      errors: ['Server error occurred']
    }, { status: 500 })
  }
}
