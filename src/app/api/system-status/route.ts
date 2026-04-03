import { NextResponse } from 'next/server';
import { getSystemStatus, getUpdateLogs } from '@/lib/systemStatus';

export async function GET() {
  try {
    const status = await getSystemStatus();
    const logs = await getUpdateLogs(20);

    return NextResponse.json({
      status,
      logs: logs.reverse(), // Show in chronological order for the terminal
    });
  } catch (error) {
    console.error('[SYSTEM_STATUS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
