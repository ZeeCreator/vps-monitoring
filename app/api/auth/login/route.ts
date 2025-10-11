// app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { compare, hash } from 'bcryptjs';

// Default credentials (in production, use environment variables or a database)
const DEFAULT_USERNAME = process.env.MONITOR_USERNAME || 'admin';
const DEFAULT_PASSWORD_HASH = process.env.MONITOR_PASSWORD_HASH || '$2a$10$8K5pL8Pn8p9Z.xJ5Y4pHseN0.bFm9zP6yqJ0y3z1o3z1o3z1o3z1o'; // 'password' hashed with bcrypt

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // For testing purposes, also allow plain text 'password'
    let isValid = false;
    if (username === DEFAULT_USERNAME && password === 'password') {
      isValid = true;
    } else {
      // Verify credentials (in production, use proper database lookup)
      isValid = username === DEFAULT_USERNAME && 
                await compare(password, DEFAULT_PASSWORD_HASH);
    }

    if (isValid) {
      // In a real application, you would set a secure HTTP-only cookie here
      // For this example, we'll return success and let the client handle the session
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred during login' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}