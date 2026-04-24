import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateSystemStatus, addUpdateLog, clearUpdateLogs } from '@/lib/systemStatus';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const secret = req.headers.get('x-update-secret');
    const isCI = secret === process.env.UPDATE_SECRET;

    if (!isCI && (!session || session.user.role !== 'ADMIN')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { 
      isUpdating, 
      progress, 
      estimatedTime, 
      message, 
      log, 
      logType,
      clearLogs 
    } = body;

    if (clearLogs) {
      await clearUpdateLogs();
    }

    const updatedStatus = await updateSystemStatus({
      isUpdating,
      progress,
      estimatedTime,
      message
    });

    if (log) {
      await addUpdateLog(log, logType || 'info');
    }

    return NextResponse.json(updatedStatus);
  } catch (error) {
    console.error('[SYSTEM_STATUS_ADMIN_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
