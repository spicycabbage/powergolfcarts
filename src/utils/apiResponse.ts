import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  pagination?: ApiResponse['pagination'],
  status?: number
): NextResponse<ApiResponse<T>> {
  // Serialize data to handle MongoDB ObjectIds
  const serializedData = JSON.parse(JSON.stringify(data))
  
  return NextResponse.json({
    success: true,
    data: serializedData,
    message,
    pagination
  }, { status: status || 200 })
}

export function createErrorResponse(
  error: string,
  status: number = 500,
  message?: string
): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error,
    message
  }, { status })
}

export function handleApiError(error: any, operation: string): NextResponse<ApiResponse> {
  console.error(`Error ${operation}:`, error)

  // Handle specific error types
  if (error?.code === 11000) {
    return createErrorResponse('Duplicate entry found', 400)
  }

  if (error?.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err: any) => err.message)
    return createErrorResponse(messages.join(', '), 400)
  }

  if (error?.name === 'CastError') {
    return createErrorResponse('Invalid data format', 400)
  }

  // Generic error handling
  return createErrorResponse(
    `Failed to ${operation}`,
    500,
    process.env.NODE_ENV === 'development' ? error.message : undefined
  )
}

export async function validateRequiredFields(body: any, fields: string[]): Promise<string | null> {
  for (const field of fields) {
    if (!body[field] && body[field] !== 0) {
      return `${field} is required`
    }
  }
  return null
}

export async function parseRequestBody<T = any>(request: Request): Promise<T> {
  try {
    return await request.json()
  } catch (error) {
    throw new Error('Invalid JSON in request body')
  }
}
