import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  if (session.user.role !== 'ADMIN') return null;
  return session;
}

export async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });
  if (session.user.role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });
  return null;
}

