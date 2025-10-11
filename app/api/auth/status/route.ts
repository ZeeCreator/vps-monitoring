// app/api/auth/status/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const isAuthenticated = request.cookies.get('vps_monitor_session')?.value === 'authenticated';
  
  return new Response(JSON.stringify({ authenticated: isAuthenticated }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}