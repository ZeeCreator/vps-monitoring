// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Define protected routes
  const protectedPaths = ['/dashboard'];
  
  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  // If it's a protected path, check for authentication
  if (isProtectedPath) {
    const isAuthenticated = request.cookies.get('vps_monitor_session')?.value === 'authenticated';
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // If user is authenticated and tries to access login page, redirect to dashboard
  if (request.nextUrl.pathname === '/login') {
    const isAuthenticated = request.cookies.get('vps_monitor_session')?.value === 'authenticated';
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

// Apply middleware to specific paths
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};