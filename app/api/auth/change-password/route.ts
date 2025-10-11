// app/api/auth/change-password/route.ts
import { NextRequest } from 'next/server';
import { hash, compare } from 'bcryptjs';

// In a real application, you would store this in a database
let currentPasswordHash = process.env.MONITOR_PASSWORD_HASH || '$2a$10$8K5pL8Pn8p9Z.xJ5Y4pHseN0.bFm9zP6yqJ0y3z1o3z1o3z1o3z1o'; // default 'password' hash

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = await request.json();
    
    // Verify the current password
    const isCurrentPasswordValid = await compare(currentPassword, currentPasswordHash);
    
    if (!isCurrentPasswordValid) {
      return new Response(JSON.stringify({ error: 'Current password is incorrect' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Validate new password
    if (newPassword !== confirmNewPassword) {
      return new Response(JSON.stringify({ error: 'New passwords do not match' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: 'New password must be at least 6 characters' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Hash the new password
    const newHashedPassword = await hash(newPassword, 10);
    
    // In a real application, you would update the password hash in your database
    // For this demo, we'll update the module-level variable
    // NOTE: In production, always use a secure database to persist passwords
    currentPasswordHash = newHashedPassword;
    
    return new Response(JSON.stringify({ success: true, message: 'Password changed successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Password change error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred during password change' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}