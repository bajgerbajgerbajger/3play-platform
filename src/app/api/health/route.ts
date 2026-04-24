import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
// import { redis } from '@/lib/redis';

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    services: {
      database: false,
      // redis: false,
      application: true,
    },
    details: {} as Record<string, string>,
  };

  // Check Database
  try {
    await db.user.findFirst({ take: 1 });
    checks.services.database = true;
    checks.details.database = 'Connected';
  } catch (error) {
    checks.services.database = false;
    checks.details.database = `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    checks.status = 'degraded';
  }

  /*
  // Check Redis
  try {
    if (redis) {
      await redis.ping();
      checks.services.redis = true;
      checks.details.redis = 'Connected';
    } else {
      checks.services.redis = false;
      checks.details.redis = 'Not configured';
    }
  } catch (error) {
    checks.services.redis = false;
    checks.details.redis = `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    checks.status = 'degraded';
  }
  */

  // Overall status
  const allHealthy = Object.values(checks.services).every((v) => v === true);
  if (!allHealthy) {
    checks.status = 'degraded';
  }

  const statusCode = allHealthy ? 200 : 503;
  return NextResponse.json(checks, { status: statusCode });
}
