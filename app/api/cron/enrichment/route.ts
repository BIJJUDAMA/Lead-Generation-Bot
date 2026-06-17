import { NextRequest, NextResponse } from 'next/server';
import { EnrichmentService } from '@/lib/enrichment/service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[CRON] Starting Enrichment...');
    
    // Enrich 5 companies per run to stay within Firecrawl/AI limits
    await EnrichmentService.processPendingEnrichment(5);

    return NextResponse.json({ success: true, message: 'Enrichment complete' });
  } catch (error) {
    console.error('[CRON] Enrichment failed:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
