import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { signals, signalAnalysis, intentScores, companies } from "../db/schema";
import { SCORING_CONFIG, RECENCY_MULTIPLIER, CLASSIFICATION_MAP } from "./config";
import { AnalysisService } from "../ai/service";

export interface ScoreBreakdown {
  totalScore: number;
  categories: {
    funding: number;
    hiring: number;
    growth: number;
  };
  signalCount: number;
}

export class ScoringService {
  /**
   * Calculates and saves the buying intent score for a company
   */
  static async calculateCompanyScore(companyId: string): Promise<ScoreBreakdown | null> {
    const company = await db.query.companies.findFirst({
      where: eq(companies.id, companyId),
    });

    if (!company) {
      console.error(`Company not found: ${companyId}`);
      return null;
    }

    // 1. Fetch analyzed signals for the company
    const analyzedSignals = await db
      .select({
        id: signals.id,
        classification: signalAnalysis.classification,
        confidence: signalAnalysis.confidence,
        summary: signalAnalysis.summary,
        createdAt: signals.createdAt,
      })
      .from(signals)
      .innerJoin(signalAnalysis, eq(signals.id, signalAnalysis.signalId))
      .where(eq(signals.companyId, companyId))
      .orderBy(desc(signals.createdAt));

    if (analyzedSignals.length === 0) {
      return {
        totalScore: 0,
        categories: { funding: 0, hiring: 0, growth: 0 },
        signalCount: 0
      };
    }

    // 2. Group signals by category
    const categories: Record<string, any[]> = {
      funding: [],
      hiring: [],
      growth: []
    };

    analyzedSignals.forEach(s => {
      const category = CLASSIFICATION_MAP[s.classification || "Other"] || "growth";
      categories[category].push(s);
    });

    // 3. Calculate scores with step-down logic and recency multipliers
    const breakdown: ScoreBreakdown = {
      totalScore: 0,
      categories: { funding: 0, hiring: 0, growth: 0 },
      signalCount: analyzedSignals.length
    };

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    for (const [catName, config] of Object.entries(SCORING_CONFIG)) {
      const catSignals = categories[catName];
      let catScore = 0;

      catSignals.forEach((signal, index) => {
        // Step-down points: if we have more signals than steps, use the last step value
        const basePoints = config.steps[index] || config.steps[config.steps.length - 1] || 0;
        
        // Recency multiplier
        const isRecent = signal.createdAt >= ninetyDaysAgo;
        const multiplier = isRecent ? RECENCY_MULTIPLIER.recent : RECENCY_MULTIPLIER.stale;
        
        // Incorporate AI confidence
        const confidence = parseFloat(signal.confidence || "0.5");
        
        catScore += (basePoints * confidence) * multiplier;
      });

      // Apply cap
      const finalCatScore = Math.min(Math.round(catScore), config.cap);
      (breakdown.categories as any)[catName] = finalCatScore;
      breakdown.totalScore += finalCatScore;
    }

    // 4. Generate reasoning via AI
    const reasoning = await AnalysisService.generateScoreReasoning(
      breakdown, 
      analyzedSignals.slice(0, 5) // Send top 5 most recent signals for context
    );

    // 5. Upsert into intentScores table
    await db.insert(intentScores).values({
      companyId,
      totalScore: breakdown.totalScore,
      breakdown: breakdown,
      explanation: reasoning,
      reasoning: reasoning, // Explicitly set for dashboard use
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: intentScores.companyId,
      set: {
        totalScore: breakdown.totalScore,
        breakdown: breakdown,
        explanation: reasoning,
        reasoning: reasoning,
        updatedAt: new Date()
      }
    });

    console.log(`Score updated for ${company.name}: ${breakdown.totalScore}`);
    return breakdown;
  }

  /**
   * Batch process scores for all companies with signals
   */
  static async processAllScores() {
    const allCompanies = await db.query.companies.findMany();
    console.log(`Processing scores for ${allCompanies.length} companies...`);

    for (const company of allCompanies) {
      await this.calculateCompanyScore(company.id);
    }
    
    console.log("All scores processed.");
  }
}
