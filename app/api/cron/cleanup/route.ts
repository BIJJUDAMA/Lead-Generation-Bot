import { NextRequest, NextResponse } from 'next/server';
import { runCleanup } from '@/lib/db/cleanup-garbage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[CRON] Starting Cleanup...');
    await runCleanup();
    return NextResponse.json({ success: true, message: 'Cleanup complete' });
  } catch (error) {
    console.error('[CRON] Cleanup failed:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
