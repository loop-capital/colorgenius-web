import { NextResponse } from 'next/server'

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: { code: string; message: string }
  meta?: { cursor?: string; total?: number; page?: number; pageSize?: number }
}

export function successResponse<T>(data: T, meta?: ApiResponse<T>['meta']): NextResponse <ApiResponse<T>> {
  return NextResponse.json({ success: true, data, meta })
}

export function errorResponse(code: string, message: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: { code, message } }, { status })
}

// Common error helpers
export const Errors = {
  UNAUTHORIZED: (m = 'Authentication required') => errorResponse('UNAUTHORIZED', m, 401),
  FORBIDDEN: (m = 'Permission denied') => errorResponse('FORBIDDEN', m, 403),
  NOT_FOUND: (m = 'Resource not found') => errorResponse('NOT_FOUND', m, 404),
  VALIDATION: (m = 'Invalid input') => errorResponse('VALIDATION_ERROR', m, 422),
  RATE_LIMIT: (m = 'Too many requests') => errorResponse('RATE_LIMIT', m, 429),
  INTERNAL: (m = 'Internal server error') => errorResponse('INTERNAL_ERROR', m, 500),
} as const

// Auth helper (mock for now)
export function getCurrentStylist(req: Request): { id: string; email: string } | null {
  // TODO: Implement real JWT verification
  // For now, extract from Bearer token mock
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  // Mock: accept any non-empty token
  if (!token) return null
  return { id: token, email: 'stylist@pleij.com' }
}

// Trending score algorithm
export function calculateTrendScore(
  likes: number,
  saves: number,
  comments: number,
  ageHours: number
): number {
  const engagement = likes * 1 + saves * 2 + comments * 1.5
  const timeDecay = Math.max(0.1, 1 / (1 + ageHours / 24))
  return Math.round((engagement * timeDecay + likes * 0.5) * 100) / 100
}