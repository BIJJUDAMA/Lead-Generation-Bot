import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testScoring() {
  console.log("Starting Intent Scoring Engine Test...");
  
  try {
    // Dynamic import to ensure DB is initialized after env vars
    const { ScoringService } = await import("./service");
    const { db } = await import("../db");
    const { intentScores, companies } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    // 1. Process all scores
    await ScoringService.processAllScores();

    // 2. Fetch and display results
    const results = await db
      .select({
        companyName: companies.name,
        totalScore: intentScores.totalScore,
        breakdown: intentScores.breakdown,
        explanation: intentScores.explanation
      })
      .from(intentScores)
      .innerJoin(companies, eq(intentScores.companyId, companies.id))
      .orderBy((t) => [t.totalScore]); // desc is usually better for intent

    console.log("\n--- SCORING RESULTS ---");
    results.reverse().forEach(r => {
      console.log(`\nCompany: ${r.companyName}`);
      console.log(`Total Score: ${r.totalScore}`);
      console.log(`Breakdown: ${JSON.stringify(r.breakdown, null, 2)}`);
      console.log(`Reasoning: ${r.explanation}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Scoring test failed:", error);
    process.exit(1);
  }
}

testScoring();
