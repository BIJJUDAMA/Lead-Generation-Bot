import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function verifyScoringLogic() {
  console.log("Starting Rigorous Scoring Logic Verification...");
  
  try {
    const { ScoringService } = await import("./service");
    const { db } = await import("../db");
    const { companies, signals, signalAnalysis, intentScores } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    // 1. Setup Test Data
    console.log("Creating mock company 'Logic Test Corp'...");
    const [testCompany] = await db.insert(companies).values({
      name: "Logic Test Corp",
      industry: "Testing",
      website: "https://logic-test.bot"
    }).returning();

    const now = new Date();
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 100); // 100 days ago (> 90)

    console.log("Injecting 5 Hiring signals (3 recent, 2 stale)...");
    // Hiring steps: [30, 15, 10, 5], Cap: 60
    // Math: (30*1.0) + (15*1.0) + (10*1.0) + (5*0.5) + (5*0.5) = 30 + 15 + 10 + 2.5 + 2.5 = 60
    const hiringSignals = [
      { content: "Hiring Signal 1", createdAt: now },
      { content: "Hiring Signal 2", createdAt: now },
      { content: "Hiring Signal 3", createdAt: now },
      { content: "Hiring Signal 4", createdAt: staleDate },
      { content: "Hiring Signal 5", createdAt: staleDate },
    ];

    for (const s of hiringSignals) {
      const [sig] = await db.insert(signals).values({
        companyId: testCompany.id,
        type: "Hiring",
        content: s.content,
        createdAt: s.createdAt
      }).returning();
      
      await db.insert(signalAnalysis).values({
        signalId: sig.id,
        classification: "Hiring",
        summary: s.content
      });
    }

    console.log("Injecting 4 Funding signals (all recent)...");
    // Funding steps: [35, 15, 5], Cap: 55
    // Math: 35 + 15 + 5 + 5 = 60. Should be capped at 55.
    for (let i = 1; i <= 4; i++) {
      const [sig] = await db.insert(signals).values({
        companyId: testCompany.id,
        type: "Funding",
        content: `Funding Signal ${i}`,
        createdAt: now
      }).returning();
      
      await db.insert(signalAnalysis).values({
        signalId: sig.id,
        classification: "Funding",
        summary: `Funding Signal ${i}`
      });
    }

    // 2. Run Scoring
    console.log("\nCalculating score for Logic Test Corp...");
    const breakdown = await ScoringService.calculateCompanyScore(testCompany.id);

    // 3. Verify Math
    console.log("\n--- VERIFICATION RESULTS ---");
    console.log(`Company: ${testCompany.name}`);
    console.log(`Total Score: ${breakdown?.totalScore}`);
    console.log(`Breakdown: ${JSON.stringify(breakdown?.categories, null, 2)}`);

    const hiringScore = breakdown?.categories.hiring;
    const fundingScore = breakdown?.categories.funding;

    console.log("\nChecking Hiring (Expected 60):", hiringScore === 60 ? "✅ PASS" : "❌ FAIL");
    console.log("Checking Funding (Expected 55 - Capped):", fundingScore === 55 ? "✅ PASS" : "❌ FAIL");
    console.log("Checking Total (Expected 115):", breakdown?.totalScore === 115 ? "✅ PASS" : "❌ FAIL");

    // 4. Cleanup
    console.log("\nCleaning up test data...");
    await db.delete(companies).where(eq(companies.id, testCompany.id));
    console.log("Cleanup complete.");

    if (hiringScore === 60 && fundingScore === 55 && breakdown?.totalScore === 115) {
      console.log("\nALL LOGIC TESTS PASSED.");
      process.exit(0);
    } else {
      console.log("\nLOGIC TESTS FAILED.");
      process.exit(1);
    }

  } catch (error) {
    console.error("Verification failed:", error);
    process.exit(1);
  }
}

verifyScoringLogic();
