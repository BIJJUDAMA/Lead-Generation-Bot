import { NextRequest, NextResponse } from 'next/server';
import { discoveryService } from '@/lib/discovery/service';
import { AnalysisService } from '@/lib/ai/service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[CRON] Starting Discovery & Analysis...');
    
    // 1. Run Discovery Providers
    await discoveryService.runDiscovery();
    
    // 2. Process Pending Signals (Analyze raw text) - Reduced to 5 to avoid serverless timeout
    await AnalysisService.processPendingSignals(5);

    return NextResponse.json({ success: true, message: 'Discovery and Analysis complete' });
  } catch (error) {
    console.error('[CRON] Discovery failed:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
