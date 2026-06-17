import { NextRequest, NextResponse } from 'next/server';
import { ScoringService } from '@/lib/scoring/service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[CRON] Starting Scoring...');
    
    // Recalculate scores for all companies
    await ScoringService.processAllScores();

    return NextResponse.json({ success: true, message: 'Scoring complete' });
  } catch (error) {
    console.error('[CRON] Scoring failed:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
