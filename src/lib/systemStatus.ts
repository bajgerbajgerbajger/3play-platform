import { db } from '@/lib/db';

// Triggers diagnostic update

export async function getSystemStatus() {
  let status = await db.systemStatus.findUnique({
    where: { id: 'current' },
  });

  if (!status) {
    status = await db.systemStatus.create({
      data: {
        id: 'current',
        isUpdating: false,
        progress: 0,
        message: 'Všechny systémy jsou v pořádku',
      },
    });
  }

  return status;
}

export async function updateSystemStatus(data: {
  isUpdating?: boolean;
  progress?: number;
  estimatedTime?: string | null;
  message?: string;
}) {
  return await db.systemStatus.upsert({
    where: { id: 'current' },
    update: data,
    create: {
      id: 'current',
      ...data,
    },
  });
}

export async function addUpdateLog(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
  return await db.updateLog.create({
    data: {
      message,
      type,
    },
  });
}

export async function getUpdateLogs(limit = 50) {
  return await db.updateLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}

export async function clearUpdateLogs() {
  return await db.updateLog.deleteMany({});
}
