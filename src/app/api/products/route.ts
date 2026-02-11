import { NextRequest, NextResponse } from 'next/server'
import { sampleProducts, sampleCategories } from '@/data/sample-products'
import type { Product } from '@/types'

// GET /api/products - List all products with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const inStock = searchParams.get('inStock')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const featured = searchParams.get('featured')

    let products = [...sampleProducts]

    // Filter by category
    if (category) {
      products = products.filter((p) => 
        p.categoryId === category || p.category?.slug === category
      )
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter((p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.tags?.some((t) => t.toLowerCase().includes(searchLower))
      )
    }

    // Filter by price range
    products = products.filter((p) => p.price >= minPrice && p.price <= maxPrice)

    // Filter by stock
    if (inStock === 'true') {
      products = products.filter((p) => p.inStock)
    } else if (inStock === 'false') {
      products = products.filter((p) => !p.inStock)
    }

    // Filter by featured
    if (featured === 'true') {
      products = products.filter((p) => p.isFeatured)
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        products.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'popular':
        products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
        break
      case 'newest':
      default:
        products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
    }

    // Pagination
    const total = products.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedProducts = products.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        categories: sampleCategories,
        priceRange: {
          min: Math.min(...sampleProducts.map((p) => p.price)),
          max: Math.max(...sampleProducts.map((p) => p.price)),
        },
      },
    })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'price', 'categoryId']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Create product (in real app, save to database)
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: body.name,
      slug: body.name.toLowerCase().replace(/\s+/g, '-'),
      description: body.description || '',
      price: body.price,
      compareAtPrice: body.compareAtPrice,
      images: body.images || ['/placeholder.jpg'],
      categoryId: body.categoryId,
      inStock: body.inStock ?? true,
      stock: body.stock || 100,
      sku: body.sku || `SKU-${Date.now()}`,
      tags: body.tags || [],
      isNew: body.isNew ?? true,
      isFeatured: body.isFeatured ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // In real app: await db.products.create(newProduct)

    return NextResponse.json({
      success: true,
      product: newProduct,
    }, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
