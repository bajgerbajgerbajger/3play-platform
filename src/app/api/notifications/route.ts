import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const email = session?.user?.email;

  if (!userId && !email) return null;

  if (userId) {
    return db.user.findUnique({ where: { id: userId } });
  }

  return db.user.findUnique({ where: { email: email! } });
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const items = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, message, type, link } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const created = await db.notification.create({
      data: {
        userId: user.id,
        title,
        message,
        type: type ?? 'info',
        link: link ?? null,
      },
    });

    return NextResponse.json({ item: created });
  } catch (error) {
    console.error('Notifications POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, isRead } = await req.json();
    if (!id || typeof isRead !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const updated = await db.notification.updateMany({
      where: { id, userId: user.id },
      data: { isRead },
    });

    return NextResponse.json({ success: true, updated: updated.count });
  } catch (error) {
    console.error('Notifications PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
