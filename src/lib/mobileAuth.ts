import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';

export async function getMobileSession() {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';

  try {
    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      name: string | null;
      role: string;
    };

    return {
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      },
    };
  } catch (error) {
    console.error('Mobile token verification error:', error);
    return null;
  }
}
