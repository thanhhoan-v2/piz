// Middleware to enable Supabase real-time functionality
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Set needed CORS headers for real-time features
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}

// Apply this middleware only to API routes and socket connections
export const config = {
  matcher: ['/api/:path*', '/_next/webpack-hmr', '/socket.io/:path*'],
}
